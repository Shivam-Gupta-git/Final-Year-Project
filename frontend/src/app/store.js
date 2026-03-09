import { configureStore } from "@reduxjs/toolkit";
import authReducer from '../features/auth/authSlice'
import userReducer from '../features/user/userSlice'
import superAdminAuthReducer from "../features/auth/superAdminAuthSlice";
import searchReducer from '../features/user/searchSlice'


export const store = configureStore({
  reducer:{
    auth: authReducer,
    user: userReducer,
    superAdminAuth: superAdminAuthReducer,
    search : searchReducer

  }
})