import express from 'express'
import { upload } from '../middleware/multer.middleware.js'
import { adminLogin, adminLogout, adminRegistration, adminVerification, forgotAdminPassword } from '../controllers/admin.controller.js'
import { isAuthenticated } from '../middleware/auth.middleware.js'

const adminRouter = express.Router()

adminRouter.post('/admin-registration', upload.fields([
  {
    name: "avatar",
      maxCount: 1,
  }
]), adminRegistration)
adminRouter.post('/admin-verification', adminVerification);
adminRouter.post('/admin-login', adminLogin);
adminRouter.delete('/admin-logout', isAuthenticated, adminLogout);
adminRouter.post('/forgot-admin-password', forgotAdminPassword)

export { adminRouter }