import mongoose from "mongoose";
import { City } from "../model/city.model";
import { Place } from "../model/place.model";
import { Hotel } from "../model/hotel.model";
import { Restaurant } from "../model/restaurant.model";
import { Review } from "../model/review.model";

export const createReview = async (req, res) => {
  try {
    const { targetType, targetId, rating, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid target ID",
      });
    }

    //search all models
    const modelMap = {
      city: City,
      place: Place,
      hotel: Hotel,
      resturant: Restaurant,
    };
    console.log(modelMap);

    //target all models
    const TargetModel = modelMap[targetType];
    if (!TargetModel) {
      return res.status(404).json({
        success: false,
        message: "Invalid target type ",
      });
    }

    const targetExists = await TargetModel.findById(targetId);
    if (!targetExists) {
      return res.status(404).json({
        success: false,
        message: `${targetId} not found`,
      });
    }

    //if already reviewed
    const exitingReview = await Review.findOne({
      user: req.user?.id,
      targetType,
      targetId,
    });
    if (!exitingReview) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this item",
      });
    }

    //create review
    const review = await Review.create({
      user: req.user?.id,
      targetType,
      targetId,
      rating,
      comment,
    });
    return res.status(200).json({
      success: true,
      data: review,
      message: "Review submitted and waiting for approval",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getReviewsByTarget = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;

    const reviews = await Review.find({
      targetType,
      targetId,
      status: "approved",
    })
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .lean();

      return res.status(200).json({
        success : true,
        data : reviews
      })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
