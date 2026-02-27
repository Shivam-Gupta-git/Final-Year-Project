import mongoose from "mongoose";

export const createReview = async (req, res) => {
  try {
    const { targetType, targetId, rating, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid target ID",
      });
    }

    

    if (!targetType || !targetId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "required all fields",
      });
    }



    
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
