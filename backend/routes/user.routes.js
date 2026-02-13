import express from 'express'
import { upload } from '../middleware/multer.middleware.js'
import { userLogin, userLogout, userRegistration, userVerification, forgotUserPassword, verifyUserOtp, superAdminRegistration } from '../controllers/user.controller.js'
import { isAuthenticated } from '../middleware/auth.middleware.js'


const userRouter = express.Router()

userRouter.post('/user-registration', upload.fields([
  {
    name: "avatar",
      maxCount: 1,
  }
]), userRegistration)
userRouter.post('/user-verification', userVerification);
userRouter.post('/user-login', userLogin);
userRouter.delete('/user-logout', isAuthenticated, userLogout);
userRouter.post('/forgot-user-password', forgotUserPassword);
userRouter.post('/verify-user-otp/:email', verifyUserOtp)
userRouter.post(
  "/super-admin-registration",
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  superAdminRegistration
);


export { userRouter }