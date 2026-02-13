import express from 'express'
import { isAuthenticated, authorize } from '../middleware/auth.middleware.js';
import { approveAdmin, createAdminRegistration } from '../controllers/user.controller.js';

const adminRouter = express.Router();

adminRouter.post("/admin-registration", isAuthenticated, authorize("super_admin"),createAdminRegistration);
adminRouter.patch("/approve-admin/:adminId", isAuthenticated, authorize("super_admin"), approveAdmin
);

export { adminRouter }