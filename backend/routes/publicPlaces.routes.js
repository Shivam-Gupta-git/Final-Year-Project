import express from "express";
import {
  getNearbyPlaces,
  getPlacePublicById,
  getPlacesByCityId,
  searchPlaces,
} from "../controllers/place.controller.js";

const publicPlacesRouter = express.Router();

// 1) Get places by city
// GET /api/places?cityId=ID
publicPlacesRouter.get("/", getPlacesByCityId);

// 2) Get nearby places (distance in KM)
// GET /api/places/nearby?lat=LAT&lng=LNG&distance=20&cityId=optional
publicPlacesRouter.get("/nearby", getNearbyPlaces);

// 3) Search places
// GET /api/places/search?q=keyword
publicPlacesRouter.get("/search", searchPlaces);

// 4) Get single place
// GET /api/places/:id
publicPlacesRouter.get("/:id", getPlacePublicById);

export default publicPlacesRouter;

