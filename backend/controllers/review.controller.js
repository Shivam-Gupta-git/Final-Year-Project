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
      restaurant: Restaurant,
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
    if (exitingReview) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this item",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
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

    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({
        success : false ,
        message : "Invalid target ID"
      })
    }

    const reviews = await Review.find({
      targetType,
      targetId,
      status: "active",
    })
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateTargetRating = async (targetId , targetType) => {
  const modelMap = {
      place : Place,
      hotel : Hotel,
      restaurant : Restaurant
  }
  const TargetModel = modelMap[targetType];

  const stats = await Review.aggregate([
    {
      $match : {
        targetId : new mongoose.Types.ObjectId(targetId),
        status : "approved"
      },
    },
    {
      $group : {
        _id : null,
        avgRating : { $avg : "$rating"},
        total : {$sum  : 1}
      },
    },
  ]);

  const avgRating = stats[0]?.avgRating || 0;
  const totalReviews  = stats[0]?.total || 0;

  await TargetModel.findByIdAndUpdate(targetId , {
    averagerating : avgRating,
    totalReviews
  })
}

export const approveReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: "Invalid ID",
      });
    }

    if (req.user?.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(400).json({
        success: false,
        message: "Not found id",
      });
    }

    if (review.status === "active") {
      return res.status(400).json({
        success: false,
        message: "Review already approved",
      });
    }

    review.status = "active";
    review.approvedBy = req.user?._id;
    await review.save();

    await updateTargetRating(targetId , targetType)

    return res.status(200).json({
      success: true,
      data: review,
      message: "Review Approved",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const rejectReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: "Invalid ID",
      });
    }

    if (req.user?.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const review = await Review.findByIdAndUpdate(
      {
        _id: id,
        status: { $ne: "rejected" },
      },
      {
        status: "rejected",
        approvedBy: null,
      },
      {
        new: true,
      },
    );

    await updateTargetRating(targetId , targetType)

    if (!review) {
      return res.status(400).json({
        success: false,
        message: "review not found or already rejected",
      });
    }

    return res.status(200).json({
      success: true,
      message: "rejected Review",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
