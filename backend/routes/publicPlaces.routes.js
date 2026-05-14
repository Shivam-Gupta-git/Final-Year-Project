import express from "express";
import {
  getNearbyPlaces,
  getPlaceCategoriesByCityId,
  getPlacePublicById,
  getPlacesByCityId,
  searchPlaces,
} from "../controllers/place.controller.js";

const publicPlacesRouter = express.Router();

// 1) Get places by city (optional: category, q, sort)
// GET /api/places?cityId=ID&category=hotel&q=temple&sort=rating
publicPlacesRouter.get("/", getPlacesByCityId);

// 2) Get nearby places (distance in KM; optional: cityId, category, q, popular, relaxCity)
// relaxCity=true → ignore cityId filter (still returns distance-sorted results around lat/lng)
// GET /api/places/nearby?lat=LAT&lng=LNG&distance=20&cityId=optional&q=keyword
publicPlacesRouter.get("/nearby", getNearbyPlaces);

// 3) Search places
// GET /api/places/search?q=keyword
publicPlacesRouter.get("/search", searchPlaces);

// 4) Distinct categories for a city (must be before /:id)
// GET /api/places/categories?cityId=ID
publicPlacesRouter.get("/categories", getPlaceCategoriesByCityId);

// 5) Get single place
// GET /api/places/:id
publicPlacesRouter.get("/:id", getPlacePublicById);

export default publicPlacesRouter;

