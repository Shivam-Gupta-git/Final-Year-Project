import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/mongoDB.config.js";
import connectCloudinary from "./config/cloudinary.config.js";
import { userRouter } from "./routes/user.routes.js";
import { adminRouter } from "./routes/admin.routes.js";
import cityRouter from "./routes/city.routes.js";
import hotelRouter from "./routes/hotel.routes.js";
import placeRouter from "./routes/place.routes.js";
import travelOptionRouter from "./routes/travelOption.routes.js";
import restaurantRouter from "./routes/restaurant.routes.js";

const app = express();

dotenv.config();
const PORT = process.env.PORT || 3002;
connectDB({
  path: "./.env",
});
connectCloudinary();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter)
app.use("/api/city", cityRouter);
app.use("/api/hotel" , hotelRouter)
app.use("/api/place", placeRouter)
app.use("/api/travelOption", travelOptionRouter)
app.use("/api/resturant", restaurantRouter)

app.get("/", (req, res) => {
  res.send("backend server will be start");
});

app.listen(PORT, () => {
  console.log(`Server running at: http://localhost:${PORT}`);
});
