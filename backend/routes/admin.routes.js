import express from 'express'
import { upload } from '../middleware/multer.middleware.js'
import { adminRegistration } from '../controllers/admin.controller.js'

const adminRouter = express.Router()

adminRouter.post('/admin-registration', upload.fields([
  {
    name: "avatar",
      maxCount: 1,
  }
]), adminRegistration)

export { adminRouter }