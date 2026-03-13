import express from "express";
import { upload } from "../middleware/multer.middleware.js";
import {
  userLogin,
  userLogout,
  userRegistration,
  userVerification,
  forgotUserPassword,
  verifyUserOtp,
  changePassword,
  userChangePassword,
  updateUserProfile,
  updateUserLocation,
  findNearbyAdmins,
  smartSearch,
  getUserProfile,
} from "../controllers/user.controller.js";
import { isAuthenticated, authorize } from "../middleware/auth.middleware.js";

const userRouter = express.Router();

// app.use((req, res, next) => {
//   res.set("Cache-Control", "no-store");
//   next();
// });

userRouter.post(
  "/user-registration",
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  userRegistration
);
userRouter.post("/user-login", userLogin);
userRouter.delete("/user-logout", isAuthenticated, userLogout);
userRouter.post("/user-verification", userVerification);
userRouter.post("/forgot-user-password", forgotUserPassword);
userRouter.post("/verify-user-otp/:email", verifyUserOtp);
userRouter.post("/change-password/:email", changePassword);
userRouter.post("/user-change-password",isAuthenticated, userChangePassword)
userRouter.put('/update-user-profile', isAuthenticated, upload.fields([
  {
    name: "avatar",
    maxCount:1
  }
]), updateUserProfile)
userRouter.get("/user-profile", isAuthenticated, getUserProfile)
userRouter.post('/update-location', isAuthenticated, updateUserLocation)
userRouter.get("/nearby-admins", findNearbyAdmins);
userRouter.get('/smart-Search', smartSearch)

export { userRouter };
