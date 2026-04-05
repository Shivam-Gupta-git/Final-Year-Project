import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/mongoDB.config.js";
import connectCloudinary from "./config/cloudinary.config.js";
import { userRouter } from "./routes/user.routes.js";
import { adminRouter } from "./routes/admin.routes.js";
import cityRouter from "./routes/city.routes.js";
import hotelRouter from "./routes/hotel.routes.js";
import placeRouter from "./routes/place.routes.js";
import publicPlacesRouter from "./routes/publicPlaces.routes.js";
import adminPlaceRouter from "./routes/adminPlace.routes.js";
import travelOptionRouter from "./routes/travelOption.routes.js";
import restaurantRouter from "./routes/restaurant.routes.js";
import reviewRouter from "./routes/review.routes.js";
import { driverRouter } from "./routes/driver.routes.js";
import  cors  from 'cors'
import roomRouter from "./routes/room.routes.js";
import hotelBookingRouter from "./routes/hotelBooking.routes.js";
import foodRouter from "./routes/food.routes.js";
import foodOrderRouter from "./routes/foodOrder.routes.js";
import BookingRouter from "./routes/Booking.routes.js";
import deliveryBoyRouter from "./routes/deliveryBoy.routes.js";
import aiRouter from "./routes/ai.routes.js";


const app = express();

dotenv.config();
const PORT = process.env.PORT || 3002;
connectDB({
  path: "./.env",
});
connectCloudinary();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
 origin: "http://localhost:5173", // 👈 frontend URL ONLY
    credentials: true,           // 👈 must be true
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
}))


app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter)
app.use("/api/city", cityRouter);
app.use("/api/hotel" , hotelRouter)
app.use("/api/room", roomRouter)
app.use("/api/place", placeRouter)
app.use("/api/places", publicPlacesRouter)
app.use("/api/admin/place", adminPlaceRouter)
app.use("/api/travelOption", travelOptionRouter)
app.use("/api/resturant", restaurantRouter)
app.use("/api/hotelBooking", hotelBookingRouter)
app.use("/api/review" , reviewRouter)
app.use("/api/driver", driverRouter)
app.use("/api/food", foodRouter)
app.use("/api/foodOrder", foodOrderRouter)
app.use("/api/booking" , BookingRouter)
app.use("/api/deliveryBoy", deliveryBoyRouter)
app.use("/api/ai", aiRouter)


app.get("/", (req, res) => {
  res.send("backend server will be start");
});

app.listen(PORT, () => {
  console.log(`Server running at: http://localhost:${PORT}`);
});
