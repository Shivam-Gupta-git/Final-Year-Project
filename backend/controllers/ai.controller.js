import { Place } from "../model/place.model.js";
import { Restaurant } from "../model/restaurant.model.js";
import { Room } from "../model/room.model.js";
import { FoodOrder } from "../model/foodOrder.model.js";
import { Hotel } from "../model/hotel.model.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv"
dotenv.config();

// Gemini Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// INTENT DETECTION  (scored matching)
const INTENTS = {
  nearby_places: [
    "near me", "nearby", "near place", "near places", "best places",
    "tourist place", "places to visit", "visit nearby", "famous place",
    "show places", "good place", "where should i go", "travel nearby",
    "around me", "near here", "sightseeing", "attractions",
  ],
  cheapest_hotel: [
    "cheap hotel", "cheapest hotel", "budget hotel", "hotel near me",
    "find hotel", "stay near me", "room near me", "best hotel",
    "hotel under", "low price hotel", "hotel nearby", "accommodation",
    "where to stay", "book hotel", "affordable hotel",
  ],
  food_suggestion: [
    "food", "restaurant", "restaurants", "cafe", "coffee", "breakfast",
    "lunch", "dinner", "veg food", "non veg", "eat near me", "where to eat",
    "best food", "street food", "food nearby", "hungry", "cuisine",
    "dine", "snack", "biryani", "pizza", "burger",
  ],
  delivery_status: [
    "delivery boy", "where is my order", "where is my delivery",
    "track order", "track my order", "order status", "delivery status",
    "my order", "delivery partner", "when will my order", "order update",
  ],
  travel_plan: [
    "trip", "travel plan", "honeymoon", "family trip", "vacation",
    "tour plan", "friends trip", "plan my trip", "trip for",
    "travel itinerary", "weekend trip", "day trip", "getaway",
  ],
};

const detectIntent = (message = "") => {
  const text = message.toLowerCase().trim();

  let bestIntent = "general";
  let bestScore = 0;

  for (const [intent, keywords] of Object.entries(INTENTS)) {
    const score = keywords.reduce(
      (acc, keyword) => (text.includes(keyword) ? acc + 1 : acc),
      0
    );
    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent;
    }
  }

  return bestIntent;
};


// ENTITY EXTRACTION
const extractEntities = (message = "") => {
  const text = message.toLowerCase().trim();

  // Radius
  let radius = 5000;
  if (text.includes("nearest") || text.includes("very near") || text.includes("2 km")) radius = 2000;
  else if (text.includes("10 km") || text.includes("far")) radius = 10000;

  // Budget
  let maxBudget = null;
  const budgetMatch = text.match(/(under|below|less than)\s*₹?\s*(\d+)/i);
  if (budgetMatch) maxBudget = Number(budgetMatch[2]);
  else if (text.includes("cheap") || text.includes("budget")) maxBudget = 1000;

  // Food type
  let foodType = null;
  if (text.includes("non veg") || text.includes("nonveg")) foodType = "nonveg";
  else if (text.includes("veg")) foodType = "veg";

  // Time of day
  let timeOfDay = null;
  if (text.includes("breakfast")) timeOfDay = "breakfast";
  else if (text.includes("lunch")) timeOfDay = "lunch";
  else if (text.includes("dinner")) timeOfDay = "dinner";

  // Trip type
  let tripType = null;
  if (text.includes("honeymoon")) tripType = "honeymoon";
  else if (text.includes("family")) tripType = "family";
  else if (text.includes("solo")) tripType = "solo";
  else if (text.includes("friends")) tripType = "friends";

  // People count
  const peopleMatch = text.match(/(\d+)\s*(people|persons|members|adults)/);
  const people = peopleMatch ? Number(peopleMatch[1]) : null;

  // Days
  const daysMatch = text.match(/(\d+)\s*day/);
  const days = daysMatch ? Number(daysMatch[1]) : null;

  // City (for travel plan)
  const cityMatch = message.trim().match(/^([a-zA-Z\s]+),/);
  const city = cityMatch ? cityMatch[1].trim() : null;

  return { radius, maxBudget, foodType, timeOfDay, tripType, people, days, city };
};


// REPLY TEMPLATES  (friendly + varied)
const REPLY_OPENERS = {
  nearby_places: [
    "✨ Here are some amazing spots near you!",
    "🗺️ Found some great places around you:",
    "📍 Top picks near your location:",
    "🌟 Explore these places close by:",
  ],
  cheapest_hotel: [
    "🏨 Great news! Here are budget-friendly hotels:",
    "💰 Found some affordable stays for you:",
    "🛎️ These hotels fit your budget perfectly:",
  ],
  food_suggestion: [
    "🍽️ Hungry? Here are the best spots nearby:",
    "😋 Found some delicious options close to you:",
    "🍜 These restaurants are worth visiting:",
  ],
  no_location: [
    "📡 Location access is off. Showing top picks overall:",
    "🌐 Can't detect your location. Here are some great options:",
  ],
};

const randomOpener = (intent, noLocation = false) => {
  const list = noLocation
    ? REPLY_OPENERS.no_location
    : REPLY_OPENERS[intent] || ["Here's what I found:"];
  return list[Math.floor(Math.random() * list.length)];
};

const noResultsReply = (intent, radius, maxBudget) => {
  const suggestions = {
    nearby_places: `😔 No places found within ${radius / 1000}km.\n\nTry asking:\n• "Show places within 10km"\n• "Best tourist spots near me"\n• "Famous places overall"`,
    cheapest_hotel: maxBudget
      ? `😔 No hotel found under ₹${maxBudget}.\n\nTry asking:\n• "Budget hotel near me"\n• "Hotels under ₹2000"\n• "Cheapest stay nearby"`
      : `😔 No nearby hotels found.\n\nTry asking:\n• "Cheap hotels near me"\n• "Hotels under ₹1500"`,
    food_suggestion: `😔 No restaurants found nearby.\n\nTry asking:\n• "Best veg food near me"\n• "Restaurants within 10km"\n• "Street food nearby"`,
  };
  return suggestions[intent] || "😔 Nothing found. Try rephrasing your request.";
};

// ─────────────────────────────────────────────
// GEMINI AI FALLBACK
// ─────────────────────────────────────────────

const callGeminiFallback = async (message, context = {}) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
    });

    const prompt = `
You are a smart, friendly travel and lifestyle assistant embedded inside a travel app.

Help users with travel, hotels, places, food, and trip planning.
Keep the reply short and friendly.

${context.lastIntent ? `Previous topic: ${context.lastIntent}` : ""}

User: ${message}
`;

    const result = await model.generateContent(prompt);

    const text = result.response.text();

    // console.log("Gemini reply:", text);

    return text;
  } catch (err) {
    console.error("Gemini fallback error:", err);

    return "Sorry, I couldn't answer that right now.";
  }
};

// ─────────────────────────────────────────────
// FOLLOW-UP RESOLVER
// ─────────────────────────────────────────────
const resolveFollowUp = (message, context) => {
  const text = message.toLowerCase();
  const results = context?.lastResults || [];

  if (!results.length) return null;

  if (text.includes("first") || text.includes("1st") || text.match(/\bno\.?\s*1\b/)) return results[0];
  if (text.includes("second") || text.includes("2nd") || text.match(/\bno\.?\s*2\b/)) return results[1];
  if (text.includes("third") || text.includes("3rd") || text.match(/\bno\.?\s*3\b/)) return results[2];
  if (text.includes("last")) return results[results.length - 1];

  return null;
};

// ─────────────────────────────────────────────
// FORMAT HELPERS
// ─────────────────────────────────────────────
const formatPlace = (place, index) =>
  `${index + 1}. ${place.name}\n   📍 ${place.address}\n   ⭐ ${place.averageRating || 0}${place.distance != null ? ` • ${place.distance} km away` : ""}`;

const formatHotel = (hotel, index) =>
  `${index + 1}. ${hotel.name}\n   📍 ${hotel.address}\n   💰 ₹${hotel.cheapestRoom ?? "N/A"}/night${hotel.distance != null ? ` • ${hotel.distance} km away` : ""}${hotel.averageRating ? ` • ⭐ ${hotel.averageRating}` : ""}`;

const formatRestaurant = (r, index) =>
  `${index + 1}. ${r.name}\n   📍 ${r.address}\n   💰 ₹${r.avgCostForOne || 0} for one • ⭐ ${r.averageRating || 0}${r.distance != null ? ` • ${r.distance} km away` : ""}`;

// ─────────────────────────────────────────────
// MAIN CONTROLLER
// ─────────────────────────────────────────────
export const assistantChat = async (req, res) => {
  try {
    // ── Input validation ──────────────────────
    const { message = "", latitude, longitude } = req.body;

    if (!message || typeof message !== "string" || message.trim().length < 2) {
      return res.status(400).json({
        success: false,
        reply: "Please type a message to continue. 😊",
      });
    }

    if (message.length > 500) {
      return res.status(400).json({
        success: false,
        reply: "Message is too long. Please keep it under 500 characters.",
      });
    }

    const lowerMessage = message.toLowerCase().trim();

    // ── Session setup ─────────────────────────
    if (!req.session) req.session = {};
    if (!req.session.assistantContext) req.session.assistantContext = {};

    const ctx = req.session.assistantContext;

    const hasLocation =
      latitude !== undefined && longitude !== undefined &&
      latitude !== null && longitude !== null;

    // ── Detect intent + entities ──────────────
    const intent = detectIntent(lowerMessage);
    const { radius, maxBudget, foodType, tripType, days, city } = extractEntities(lowerMessage);

    let reply = "";
    let data = null;

    // ═══════════════════════════════════════════
    // 1. NEARBY PLACES
    // ═══════════════════════════════════════════
    if (intent === "nearby_places") {
      if (!hasLocation) {
        const places = await Place.find({ status: "active" })
          .select("name address averageRating images location category totalReviews")
          .sort({ averageRating: -1, createdAt: -1 })
          .limit(5)
          .lean();

        if (!places.length) {
          reply = noResultsReply(intent, radius, maxBudget);
        } else {
          reply = `${randomOpener(intent, true)}\n\n${places.map(formatPlace).join("\n\n")}`;
          data = { type: "nearby_places", count: places.length, places, scope: "overall" };
        }
      } else {
        const places = await Place.aggregate([
          {
            $geoNear: {
              near: { type: "Point", coordinates: [Number(longitude), Number(latitude)] },
              distanceField: "distance",
              maxDistance: radius,
              spherical: true,
              query: { status: "active" },
            },
          },
          {
            $project: {
              name: 1, address: 1, averageRating: 1, totalReviews: 1,
              images: { $slice: ["$images", 1] }, location: 1, category: 1,
              distance: { $round: [{ $divide: ["$distance", 1000] }, 1] },
            },
          },
          { $sort: { averageRating: -1, distance: 1 } },
          { $limit: 5 },
        ]);

        if (!places.length) {
          reply = noResultsReply(intent, radius, maxBudget);
        } else {
          reply = `${randomOpener(intent)}\n\n${places.map(formatPlace).join("\n\n")}`;
          data = { type: "nearby_places", radius: radius / 1000, count: places.length, places };

          req.session.assistantContext = {
            ...ctx, type: "place", latitude, longitude,
            selectedPlace: places[0], lastResults: places,
            lastIntent: intent, lastMessage: message, updatedAt: new Date(),
          };
        }
      }
    }

    // ═══════════════════════════════════════════
    // 2. CHEAPEST HOTEL
    // ═══════════════════════════════════════════
    else if (intent === "cheapest_hotel") {
      const budgetStage = maxBudget ? [{ $match: { cheapestRoom: { $lte: maxBudget } } }] : [];
      const commonPipeline = [
        {
          $lookup: {
            from: "rooms", localField: "_id",
            foreignField: "hotelId", as: "rooms",
          },
        },
        { $addFields: { cheapestRoom: { $min: "$rooms.pricePerNight" } } },
        ...budgetStage,
        {
          $project: {
            name: 1, address: 1, cheapestRoom: 1,
            averageRating: 1, images: { $slice: ["$images", 1] }, location: 1,
          },
        },
      ];

      if (!hasLocation) {
        const hotels = await Hotel.aggregate([
          { $match: { status: "active" } },
          ...commonPipeline,
          { $sort: { cheapestRoom: 1, averageRating: -1 } },
          { $limit: 5 },
        ]);

        if (!hotels.length) {
          reply = noResultsReply(intent, radius, maxBudget);
        } else {
          reply = `${randomOpener(intent, true)}\n\n${hotels.map(formatHotel).join("\n\n")}`;
          data = { type: "cheapest_hotel", count: hotels.length, hotels, scope: "overall" };
        }
      } else {
        const hotels = await Hotel.aggregate([
          {
            $geoNear: {
              near: { type: "Point", coordinates: [Number(longitude), Number(latitude)] },
              distanceField: "distance", maxDistance: 10000,
              spherical: true, query: { status: "active" },
            },
          },
          ...commonPipeline,
          {
            $addFields: {
              distance: { $round: [{ $divide: ["$distance", 1000] }, 1] },
            },
          },
          { $sort: { cheapestRoom: 1, distance: 1 } },
          { $limit: 5 },
        ]);

        if (!hotels.length) {
          reply = noResultsReply(intent, radius, maxBudget);
        } else {
          reply = `${randomOpener(intent)}\n\n${hotels.map(formatHotel).join("\n\n")}`;
          data = { type: "cheapest_hotel", count: hotels.length, hotels };

          req.session.assistantContext = {
            ...ctx, type: "hotel",
            latitude: hotels[0]?.location?.coordinates?.[1],
            longitude: hotels[0]?.location?.coordinates?.[0],
            selectedHotel: hotels[0], lastResults: hotels,
            lastIntent: intent, lastMessage: message, updatedAt: new Date(),
          };
        }
      }
    }

    // ═══════════════════════════════════════════
    // 3. FOOD SUGGESTION
    // ═══════════════════════════════════════════
    else if (intent === "food_suggestion") {
      // Use previous context location if user says "there"
      let searchLat = latitude;
      let searchLng = longitude;

      if (lowerMessage.includes("there") && ctx.latitude && ctx.longitude) {
        searchLat = ctx.latitude;
        searchLng = ctx.longitude;
      }

      const restaurantFilter = { status: "active" };
      if (foodType) restaurantFilter.foodType = foodType;

      if (!searchLat || !searchLng) {
        const restaurants = await Restaurant.find(restaurantFilter)
          .select("name address averageRating avgCostForOne images location")
          .sort({ averageRating: -1, createdAt: -1 })
          .limit(5)
          .lean();

        const filtered = maxBudget
          ? restaurants.filter((r) => Number(r.avgCostForOne || 0) <= maxBudget)
          : restaurants;

        if (!filtered.length) {
          reply = noResultsReply(intent, radius, maxBudget);
        } else {
          reply = `${randomOpener(intent, true)}\n\n${filtered.map(formatRestaurant).join("\n\n")}`;
          data = { type: "food_suggestion", count: filtered.length, restaurants: filtered, scope: "overall" };
        }
      } else {
        const matchBudget = maxBudget ? [{ $match: { avgCostForOne: { $lte: maxBudget } } }] : [];

        const restaurants = await Restaurant.aggregate([
          {
            $geoNear: {
              near: { type: "Point", coordinates: [Number(searchLng), Number(searchLat)] },
              distanceField: "distance", maxDistance: radius,
              spherical: true, query: restaurantFilter,
            },
          },
          ...matchBudget,
          {
            $project: {
              name: 1, address: 1, averageRating: 1, avgCostForOne: 1,
              images: { $slice: ["$images", 1] }, location: 1,
              distance: { $round: [{ $divide: ["$distance", 1000] }, 1] },
            },
          },
          { $sort: { averageRating: -1, distance: 1 } },
          { $limit: 5 },
        ]);

        if (!restaurants.length) {
          reply = noResultsReply(intent, radius, maxBudget);
        } else {
          reply = `${randomOpener(intent)}\n\n${restaurants.map(formatRestaurant).join("\n\n")}`;
          data = { type: "food_suggestion", count: restaurants.length, restaurants };

          req.session.assistantContext = {
            ...ctx, type: "restaurant",
            latitude: searchLat, longitude: searchLng,
            selectedRestaurant: restaurants[0], lastResults: restaurants,
            lastIntent: intent, lastMessage: message, updatedAt: new Date(),
          };
        }
      }
    }

    // ═══════════════════════════════════════════
    // 4. DELIVERY STATUS
    // ═══════════════════════════════════════════
    else if (intent === "delivery_status") {
      const currentOrder = await FoodOrder.findOne({
        user: req.user._id,
        status: { $in: ["confirmed", "preparing", "out_for_delivery"] },
      })
        .populate({
          path: "deliveryBoy",
          populate: { path: "user", select: "userName contactNumber" },
        })
        .sort({ createdAt: -1 });

      if (!currentOrder) {
        reply = "📦 You don't have any active order right now.\n\nWant to explore restaurants nearby? Just ask! 🍽️";
      } else if (!currentOrder.deliveryBoy) {
        reply = "👨‍🍳 Your order is being prepared. A delivery partner will be assigned shortly!";
      } else {
        const boy = currentOrder.deliveryBoy;
        reply = `🛵 Your delivery partner is on the way!\n\nName: ${boy.user.userName}\nContact: ${boy.user.contactNumber}`;

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

    // ═══════════════════════════════════════════
    // 5. TRAVEL PLAN
    // ═══════════════════════════════════════════
    else if (intent === "travel_plan") {
      const budgetMatch2 = lowerMessage.match(/₹?\s*(\d+)/);
      const budget = budgetMatch2 ? Number(budgetMatch2[1]) : null;

      if (!city || !budget || !days) {
        reply = `🗺️ I'd love to plan your trip! Please share a few details:\n\n• Destination city\n• Your budget (₹)\n• Number of days\n• Trip type (honeymoon / family / solo / friends)\n\nExample:\nGoa, ₹15000, 3 days, honeymoon`;
        data = { type: "travel_plan", requiredFields: ["city", "budget", "days", "tripType"] };
      } else {
        reply = `✈️ Planning your ${days}-day ${tripType || ""} trip to ${city} with a budget of ₹${budget}!\n\nHang tight while I put together the best itinerary for you... 🌴`;
        data = { type: "travel_plan", city, budget, days, tripType };
      }
    }

    // ═══════════════════════════════════════════
    // 6. GENERAL → GEMINI FALLBACK
    // ═══════════════════════════════════════════
    else {
      // Check for follow-up first
      const followUpItem = resolveFollowUp(lowerMessage, ctx);

      if (followUpItem) {
        reply = `Here are more details about ${followUpItem.name}:\n📍 ${followUpItem.address}\n⭐ ${followUpItem.averageRating || "N/A"}`;
        data = { type: "follow_up", item: followUpItem };
      } else {
        // Gemini AI handles everything else
        reply = await callGeminiFallback(message, ctx);
        data = { type: "general", handledByAI: true };
      }
    }

    // ── Final session update ──────────────────
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
      reply: "⚠️ Something went wrong. Please try again in a moment.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};