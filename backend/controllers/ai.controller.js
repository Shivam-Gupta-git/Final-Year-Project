import { Place } from "../model/place.model.js";
import { Restaurant } from "../model/restaurant.model.js";
import { Room } from "../model/room.model.js";
import { FoodOrder } from "../model/foodOrder.model.js"
import { Hotel } from "../model/hotel.model.js";

const detectIntent = (message = "") => {
  const text = message.toLowerCase().trim();

  const intents = {
    nearby_places: [
      "near me",
      "nearby",
      "near place",
      "near places",
      "best places",
      "tourist place",
      "places to visit",
      "visit nearby",
      "famous place",
      "show places",
      "good place",
      "where should i go",
      "travel nearby",
      "around me",
      "near here",
    ],

    cheapest_hotel: [
      "cheap hotel",
      "cheapest hotel",
      "budget hotel",
      "hotel near me",
      "find hotel",
      "stay near me",
      "room near me",
      "best hotel",
      "hotel under",
      "low price hotel",
      "hotel nearby",
    ],

    food_suggestion: [
      "food",
      "restaurant",
      "restaurants",
      "cafe",
      "coffee",
      "breakfast",
      "lunch",
      "dinner",
      "veg food",
      "non veg",
      "eat near me",
      "where to eat",
      "best food",
      "street food",
      "food nearby",
    ],

    delivery_status: [
      "delivery boy",
      "where is my order",
      "where is my delivery",
      "track order",
      "track my order",
      "order status",
      "delivery status",
      "my order",
      "delivery partner",
    ],

    travel_plan: [
      "trip",
      "travel plan",
      "honeymoon",
      "family trip",
      "vacation",
      "tour plan",
      "friends trip",
      "plan my trip",
      "trip for",
      "travel itinerary",
    ],
  };

  for (const [intent, keywords] of Object.entries(intents)) {
    if (keywords.some((keyword) => text.includes(keyword))) {
      return intent;
    }
  }

  return "general";
};

const getRadiusFromMessage = (message) => {
  const text = message.toLowerCase();

  if (
    text.includes("nearest") ||
    text.includes("very near") ||
    text.includes("within 2 km") ||
    text.includes("2 km")
  ) {
    return 2000;
  }

  if (
    text.includes("within 10 km") ||
    text.includes("10 km") ||
    text.includes("far")
  ) {
    return 10000;
  }

  return 5000;
};

const getBudgetFromMessage = (message) => {
  const text = message.toLowerCase();

  const budgetMatch = text.match(
    /(under|below|less than)\s*₹?\s*(\d+)/i
  );

  if (budgetMatch) {
    return Number(budgetMatch[2]);
  }

  if (text.includes("cheap") || text.includes("budget")) {
    return 1000;
  }

  return null;
};

// ASSISTANT CHAT
export const assistantChat = async (req, res) => {
  try {
    const { message = "", latitude, longitude } = req.body;

    const lowerMessage = message.toLowerCase().trim();

    // -------------------------------------------------
    // Session Safety
    // -------------------------------------------------
    if (!req.session) req.session = {};
    if (!req.session.assistantContext) {
      req.session.assistantContext = {};
    }

    const previousContext = req.session.assistantContext;

    const hasLocation =
      latitude !== undefined &&
      longitude !== undefined &&
      latitude !== null &&
      longitude !== null;

    const intent = detectIntent(lowerMessage);
    const radius = getRadiusFromMessage(lowerMessage);
    const maxBudget = getBudgetFromMessage(lowerMessage);

    let reply = "Sorry, I couldn't understand. Please try another message.";
    let data = null;

    // =================================================
    // 1. Nearby Places
    // =================================================
    if (intent === "nearby_places") {
      if (!hasLocation) {
        const places = await Place.find({ status: "active" })
          .select("name address averageRating images location category")
          .sort({ averageRating: -1, createdAt: -1 })
          .limit(5)
          .lean();

        if (!places.length) {
          reply = "No places found right now.";
        } else {
          reply = `Location is off. Showing top places overall:\n\n${places
            .map(
              (place, index) =>
                `${index + 1}. ${place.name}\n${place.address}\n⭐ ${
                  place.averageRating || 0
                }`
            )
            .join("\n\n")}`;

          data = {
            type: "nearby_places",
            radius: null,
            count: places.length,
            places,
            scope: "overall",
          };
        }
      } else {
        const places = await Place.aggregate([
          {
            $geoNear: {
              near: {
                type: "Point",
                coordinates: [Number(longitude), Number(latitude)],
              },
              distanceField: "distance",
              maxDistance: radius,
              spherical: true,
              query: { status: "active" },
            },
          },
          {
            $project: {
              name: 1,
              address: 1,
              averageRating: 1,
              images: 1,
              location: 1,
              category: 1,
              distance: {
                $round: [{ $divide: ["$distance", 1000] }, 1],
              },
            },
          },
          { $sort: { averageRating: -1, distance: 1 } },
          { $limit: 5 },
        ]);

        if (!places.length) {
          reply = "No nearby places found within your selected area.";
        } else {
          reply = `Best places near you:\n\n${places
            .map(
              (place, index) =>
                `${index + 1}. ${place.name}\n${place.address}\n⭐ ${
                  place.averageRating || 0
                } • ${place.distance} km away`
            )
            .join("\n\n")}`;

          data = {
            type: "nearby_places",
            radius: radius / 1000,
            count: places.length,
            places,
          };

          req.session.assistantContext = {
            ...previousContext,
            type: "place",
            latitude,
            longitude,
            selectedPlace: places[0],
            lastIntent: intent,
            lastMessage: message,
            updatedAt: new Date(),
          };
        }
      }
    }

    // =================================================
    // 2. Cheapest Hotel
    // =================================================
    else if (intent === "cheapest_hotel") {
      if (!hasLocation) {
        const hotels = await Hotel.aggregate([
          {
            $match: { status: "active" },
          },
          {
            $lookup: {
              from: "rooms",
              localField: "_id",
              foreignField: "hotelId",
              as: "rooms",
            },
          },
          {
            $addFields: {
              cheapestRoom: { $min: "$rooms.pricePerNight" },
            },
          },
          ...(maxBudget
            ? [
                {
                  $match: {
                    cheapestRoom: { $lte: maxBudget },
                  },
                },
              ]
            : []),
          {
            $project: {
              name: 1,
              address: 1,
              cheapestRoom: 1,
              averageRating: 1,
              images: 1,
              location: 1,
            },
          },
          { $sort: { cheapestRoom: 1, averageRating: -1 } },
          { $limit: 5 },
        ]);

        if (!hotels.length) {
          reply = maxBudget
            ? `No hotel found under ₹${maxBudget}.`
            : "No hotels found right now.";
        } else {
          reply = `Location is off. Showing top hotel options overall:\n\n${hotels
            .map(
              (hotel, index) =>
                `${index + 1}. ${hotel.name}\n${hotel.address}\n₹${
                  hotel.cheapestRoom
                } per night`
            )
            .join("\n\n")}`;

          data = {
            type: "cheapest_hotel",
            count: hotels.length,
            hotels,
            scope: "overall",
          };
        }
      } else {
        const hotels = await Hotel.aggregate([
          {
            $geoNear: {
              near: {
                type: "Point",
                coordinates: [Number(longitude), Number(latitude)],
              },
              distanceField: "distance",
              maxDistance: 10000,
              spherical: true,
              query: { status: "active" },
            },
          },
          {
            $lookup: {
              from: "rooms",
              localField: "_id",
              foreignField: "hotelId",
              as: "rooms",
            },
          },
          {
            $addFields: {
              cheapestRoom: { $min: "$rooms.pricePerNight" },
            },
          },
          ...(maxBudget
            ? [
                {
                  $match: {
                    cheapestRoom: { $lte: maxBudget },
                  },
                },
              ]
            : []),
          {
            $project: {
              name: 1,
              address: 1,
              cheapestRoom: 1,
              averageRating: 1,
              images: 1,
              location: 1,
              distance: {
                $round: [{ $divide: ["$distance", 1000] }, 1],
              },
            },
          },
          { $sort: { cheapestRoom: 1, distance: 1 } },
          { $limit: 5 },
        ]);

        if (!hotels.length) {
          reply = maxBudget
            ? `No hotel found under ₹${maxBudget}.`
            : "No nearby hotels found.";
        } else {
          reply = `Best hotel options:\n\n${hotels
            .map(
              (hotel, index) =>
                `${index + 1}. ${hotel.name}\n${hotel.address}\n₹${
                  hotel.cheapestRoom
                } per night • ${hotel.distance} km away`
            )
            .join("\n\n")}`;

          data = {
            type: "cheapest_hotel",
            count: hotels.length,
            hotels,
          };

          req.session.assistantContext = {
            ...previousContext,
            type: "hotel",
            latitude: hotels[0]?.location?.coordinates?.[1],
            longitude: hotels[0]?.location?.coordinates?.[0],
            selectedHotel: hotels[0],
            lastIntent: intent,
            lastMessage: message,
            updatedAt: new Date(),
          };
        }
      }
    }

    // =================================================
    // 3. Food Suggestion
    // =================================================
    else if (intent === "food_suggestion") {
      let searchLatitude = latitude;
      let searchLongitude = longitude;

      if (
        lowerMessage.includes("there") &&
        previousContext.latitude &&
        previousContext.longitude
      ) {
        searchLatitude = previousContext.latitude;
        searchLongitude = previousContext.longitude;
      }

      if (!searchLatitude || !searchLongitude) {
        const restaurantFilter = { status: "active" };

        if (lowerMessage.includes("veg")) {
          restaurantFilter.foodType = "veg";
        }

        if (lowerMessage.includes("non veg")) {
          restaurantFilter.foodType = "nonveg";
        }

        const restaurants = await Restaurant.find(restaurantFilter)
          .select("name address averageRating avgCostForOne images location")
          .sort({ averageRating: -1, createdAt: -1 })
          .limit(5)
          .lean();

        const filteredByBudget = maxBudget
          ? restaurants.filter((restaurant) => {
              const cost = Number(restaurant?.avgCostForOne || 0);
              return cost <= maxBudget;
            })
          : restaurants;

        if (!filteredByBudget.length) {
          reply = "No restaurants found matching your request.";
        } else {
          reply = `Location is off. Showing top food places overall:\n\n${filteredByBudget
            .map(
              (restaurant, index) =>
                `${index + 1}. ${restaurant.name}\n${restaurant.address}\n₹${
                  restaurant.avgCostForOne || 0
                } for one • ⭐ ${restaurant.averageRating || 0}`
            )
            .join("\n\n")}`;

          data = {
            type: "food_suggestion",
            count: filteredByBudget.length,
            restaurants: filteredByBudget,
            scope: "overall",
          };
        }
      } else {
        const restaurantFilter = { status: "active" };

        if (lowerMessage.includes("veg")) {
          restaurantFilter.foodType = "veg";
        }

        if (lowerMessage.includes("non veg")) {
          restaurantFilter.foodType = "nonveg";
        }

        const restaurants = await Restaurant.aggregate([
          {
            $geoNear: {
              near: {
                type: "Point",
                coordinates: [
                  Number(searchLongitude),
                  Number(searchLatitude),
                ],
              },
              distanceField: "distance",
              maxDistance: radius,
              spherical: true,
              query: restaurantFilter,
            },
          },
          ...(maxBudget
            ? [
                {
                  $match: {
                    avgCostForOne: { $lte: maxBudget },
                  },
                },
              ]
            : []),
          {
            $project: {
              name: 1,
              address: 1,
              averageRating: 1,
              avgCostForOne: 1,
              images: 1,
              location: 1,
              distance: {
                $round: [{ $divide: ["$distance", 1000] }, 1],
              },
            },
          },
          { $sort: { averageRating: -1, distance: 1 } },
          { $limit: 5 },
        ]);

        if (!restaurants.length) {
          reply = "No restaurants found matching your request.";
        } else {
          reply = `Best food places:\n\n${restaurants
            .map(
              (restaurant, index) =>
                `${index + 1}. ${restaurant.name}\n${restaurant.address}\n₹${
                  restaurant.avgCostForOne || 0
                } for one • ⭐ ${restaurant.averageRating || 0}\n${
                  restaurant.distance
                } km away`
            )
            .join("\n\n")}`;

          data = {
            type: "food_suggestion",
            count: restaurants.length,
            restaurants,
          };

          req.session.assistantContext = {
            ...previousContext,
            type: "restaurant",
            latitude: searchLatitude,
            longitude: searchLongitude,
            selectedRestaurant: restaurants[0],
            lastIntent: intent,
            lastMessage: message,
            updatedAt: new Date(),
          };
        }
      }
    }

    // =================================================
    // 4. Delivery Status
    // =================================================
    else if (intent === "delivery_status") {
      const currentOrder = await FoodOrder.findOne({
        user: req.user._id,
        status: {
          $in: ["confirmed", "preparing", "out_for_delivery"],
        },
      })
        .populate({
          path: "deliveryBoy",
          populate: {
            path: "user",
            select: "userName contactNumber",
          },
        })
        .sort({ createdAt: -1 });

      if (!currentOrder) {
        reply = "You do not have any active order right now.";
      } else if (!currentOrder.deliveryBoy) {
        reply = "Your order is being prepared. Delivery boy not assigned yet.";
      } else {
        const boy = currentOrder.deliveryBoy;

        reply = `Your delivery boy is ${boy.user.userName}.\nContact: ${boy.user.contactNumber}`;

        data = {
          type: "delivery_status",
          deliveryBoy: {
            name: boy.user.userName,
            contact: boy.user.contactNumber,
            location: boy.location || null,
          },
        };
      }
    }

    // =================================================
    // 5. Travel Plan
    // =================================================
    else if (intent === "travel_plan") {
      const cityMatch = lowerMessage.match(/^([a-zA-Z\s]+),/);
      const budgetMatch = lowerMessage.match(/₹?\s*(\d+)/);
      const daysMatch = lowerMessage.match(/(\d+)\s*day/);

      if (!cityMatch || !budgetMatch || !daysMatch) {
        reply = `Please send details like:\n\n• City\n• Budget\n• Number of days\n• Trip type\n\nExample:\nGoa, ₹15000, 3 days, honeymoon`;

        data = {
          type: "travel_plan",
          requiredFields: ["city", "budget", "days", "tripType"],
        };
      } else {
        const city = cityMatch[1].trim();
        const budget = Number(budgetMatch[1]);
        const days = Number(daysMatch[1]);

        reply = `Your ${days} day trip plan for ${city} with budget ₹${budget} is being prepared.`;

        data = {
          type: "travel_plan",
          city,
          budget,
          days,
        };
      }
    }

    // =================================================
    // Final Session Update
    // =================================================
    req.session.assistantContext = {
      ...(req.session.assistantContext || {}),
      lastIntent: intent,
      lastMessage: message,
      updatedAt: new Date(),
    };

    return res.status(200).json({
      success: true,
      intent,
      reply,
      data,
      context: req.session.assistantContext,
    });
  } catch (error) {
    console.error("assistantChat error:", error);

    return res.status(500).json({
      success: false,
      reply: "Something went wrong. Please try again later.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};



