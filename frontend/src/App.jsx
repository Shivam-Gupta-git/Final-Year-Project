import "./App.css";
// import Header from './components/Header'
import Register from "./pages/auth/Register";
import { Routes, Route } from "react-router-dom";
import About from "./pages/localPages/About";
import VerifyEmail from "./pages/localPages/VerifyEmail";
import Verify from "./pages/localPages/Verify";
import Login from "./pages/auth/Login";
import LandingPage from "./pages/auth/landingPage";
import Navbar from "./components/Navbar";
import ForgotPassword from "./pages/auth/ForgotPassword";
import VerifyOTP from "./pages/auth/VerifyOTP";
import ChangePassword from "./pages/auth/ChangePassword";
import UserProfile from "./pages/localPages/UserProfile";
import UserProtectedRouter from "./components/protectedRouter/UserProtectedRouter";
import SuperAdminRegister from "./pages/superAdmin/SuperAdminRegister";
import SuperAdminLogin from "./pages/superAdmin/SuperAdminLogin";
import SuperAdminDashboard from "./pages/superAdmin/SuperAdminDashboard";
import SuperAdminProtectedRouter from "./components/protectedRouter/SuperAdminProtectedRouter";
import SuperAdminProfile from "./pages/superAdmin/SuperAdminProfile";
import AdminApprovalPage from "./pages/admin/AdminApprovalPage";
import AdminLogin from "./pages/admin/AdminLogin";
import LoginPage from "./pages/localPages/LoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminProtectedRouter from "./components/protectedRouter/AdminProtectedRouter";
import AddCityDetails from "./pages/superAdmin/city/AddCityDetails";
import CityDashboard from "./pages/superAdmin/city/CityDashboard";
import UpdateCityDetails from "./pages/superAdmin/city/UpdateCityDetails";
// import SuperAdminCityList from './pages/superAdmin/city/SuperAdminApprovealCityList'
import GetCityById from "./pages/superAdmin/city/GetCityById";
import GetAllCities from "./pages/superAdmin/city/GetAllCities";
import CityDetails from "./pages/auth/CityPage";
import GetAllInactiveCities from "./pages/superAdmin/city/GetAllInactiveCities";
import AddHotelDetails from "./pages/admin/hotel/AddHotelDetails";
import SuperAdminApprovealHoteList from "./pages/superAdmin/Hotel/SuperAdminApprovealHoteList";
import HotelDashboard from "./pages/superAdmin/Hotel/HotelDashboard";
import GetAllHotels from "./pages/superAdmin/Hotel/GetAllHotels";
import GetAllActiveHotels from "./pages/superAdmin/Hotel/GetAllActiveHotels";
import GetAllRejectedHotels from "./pages/superAdmin/Hotel/GetAllRejectedHotels";
import UpdateHotelDetails from "./pages/admin/hotel/UpdateHotelDetails";
import GetAllInactiveHotels from "./pages/superAdmin/Hotel/GetAllInactiveHotels";
import HotelPage from "./pages/auth/HotelPage";
import HotelDetailPage from "./pages/auth/HotelDetailPage ";
import SuperAdminApprovealCityList from "./pages/superAdmin/city/SuperAdminApprovealCityList";
import GetAllActiveCities from "./pages/superAdmin/city/GetAllActiveCities";
import AdminHotelDashBoard from "./pages/admin/hotel/AdminHotelDashBoard";
import ShowHotelStatus from "./pages/admin/hotel/ShowHotelStatus";
import CreateRoom from "./pages/admin/rooms/CreateRoom";
import GetAllRooms from "./pages/admin/rooms/GetAllRooms";
import UpdateRoom from "./pages/admin/rooms/UpdateRoom";
import AdminsDetails from "./pages/superAdmin/AdminsDetails";
import AdminItemsDetailsByAdminId from "./pages/superAdmin/AdminItemsDetailsByAdminId";
import HotelBookingDashboard from "./pages/admin/HotelBooking/HotelBookingDashboard";
import BookedHotels from "./pages/admin/HotelBooking/BookedHotels";
import Booking from "./pages/auth/Booking";
import PlaceDashboard from "./pages/superAdmin/place/PlaceDashboard";
import AddPlaceDetails from "./pages/superAdmin/place/AddPlaceDetails";
import SuperAdminApprovealPlaceList from "./pages/superAdmin/place/SuperAdminApprovealPlaceList";
import GetPlaceCityWise from "./pages/superAdmin/place/GetPlaceCityWise";
import GetAllActivePlaceCityWise from "./pages/superAdmin/place/GetAllActivePlaceCityWise";
import GetInactivePlaceCityWise from "./pages/superAdmin/place/GetInactivePlaceCityWise";
import UpdatePlaceDetails from "./pages/superAdmin/place/UpdatePlaceDetails";
import AiPlanner from "./pages/AIPlanner/AiPlanner";
import AiPlannerDetails from "./pages/AIPlanner/AiPlannerDetails";


function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="hotels" element={<HotelPage />} />
        <Route path="/hotels/:id" element={<HotelDetailPage />} />
        <Route path="/my-booking" element={<Booking />} />
        <Route path="/city/:id" element={<CityDetails />} />
        <Route path="/signUp" element={<Register />} />
        <Route path="/verifyEmail" element={<VerifyEmail />} />
        <Route path="/verify/:token" element={<Verify />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp/:email" element={<VerifyOTP />} />
        <Route path="/change-password/:email" element={<ChangePassword />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/user-profile"
          element={
            <UserProtectedRouter>
              <UserProfile />
            </UserProtectedRouter>
          }
        />
        <Route path="/superAdmin/signUp" element={<SuperAdminRegister />} />
        <Route path="/superAdmin/login" element={<SuperAdminLogin />} />
        <Route
          path="/superAdmin/superAdminDashboard"
          element={
            <SuperAdminProtectedRouter>
              <SuperAdminDashboard />
            </SuperAdminProtectedRouter>
          }
        />
        <Route
          path="/superAdmin/superAdminProfile"
          element={
            <SuperAdminProtectedRouter>
              <SuperAdminProfile />
            </SuperAdminProtectedRouter>
          }
        />
        <Route
          path="/superadmin/adminApprovel"
          element={
            <SuperAdminProtectedRouter>
              <AdminApprovalPage />
            </SuperAdminProtectedRouter>
          }
        />
        <Route path="/about" element={<About />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/loginPage" element={<LoginPage />} />
        <Route
          path="/admin/adminDashboard"
          element={
            <AdminProtectedRouter>
              <AdminDashboard />
            </AdminProtectedRouter>
          }
        />
        <Route
          path="/admin/adminProfile"
          element={
            <AdminProtectedRouter>
              <AdminProfile />
            </AdminProtectedRouter>
          }
        />
        <Route
          path="/superAdmin/cityDashboard"
          element={
            <SuperAdminProtectedRouter>
              <CityDashboard />
            </SuperAdminProtectedRouter>
          }
        />
        <Route
          path="/superAdmin/createCity"
          element={
            <SuperAdminProtectedRouter>
              <AddCityDetails />
            </SuperAdminProtectedRouter>
          }
        />
        <Route
          path="/superAdmin/updateCityDetails/:id"
          element={
            <SuperAdminProtectedRouter>
              <UpdateCityDetails />
            </SuperAdminProtectedRouter>
          }
        />
        <Route
          path="/superAdmin/SuperAdminApprovealCityList"
          element={
            <SuperAdminProtectedRouter>
              <SuperAdminApprovealCityList />
            </SuperAdminProtectedRouter>
          }
        />
        <Route
          path="/superAdmin/getCityById/:id"
          element={
            <SuperAdminProtectedRouter>
              <GetCityById />
            </SuperAdminProtectedRouter>
          }
        />
        <Route
          path="/superAdmin/get-all-cities"
          element={
            <SuperAdminProtectedRouter>
              <GetAllCities />
            </SuperAdminProtectedRouter>
          }
        />
        <Route
          path="/superAdmin/get-all-active-cities"
          element={
            <SuperAdminProtectedRouter>
              <GetAllActiveCities />
            </SuperAdminProtectedRouter>
          }
        />
        <Route
          path="/superAdmin/get-all-inactive-cities"
          element={
            <SuperAdminProtectedRouter>
              <GetAllInactiveCities />
            </SuperAdminProtectedRouter>
          }
        />
        <Route
          path="/admin/create-hotel"
          element={
            <AdminProtectedRouter>
              <AddHotelDetails />
            </AdminProtectedRouter>
          }
        />
        <Route
          path="/superAdmin/hotelDashboard"
          element={
            <SuperAdminProtectedRouter>
              <HotelDashboard />
            </SuperAdminProtectedRouter>
          }
        />
        <Route
          path="/superAdmin/SuperAdminApprovealHotelList"
          element={
            <SuperAdminProtectedRouter>
              <SuperAdminApprovealHoteList />
            </SuperAdminProtectedRouter>
          }
        />
        <Route
          path="/superadmin/get-all-hotels"
          element={
            <SuperAdminProtectedRouter>
              <GetAllHotels />
            </SuperAdminProtectedRouter>
          }
        />
        <Route
          path="/superAdmin/get-all-active-hotels"
          element={
            <SuperAdminProtectedRouter>
              <GetAllActiveHotels />
            </SuperAdminProtectedRouter>
          }
        />
        <Route
          path="/superAdmin/get-all-Inactive-hotels"
          element={
            <SuperAdminProtectedRouter>
              <GetAllInactiveHotels />
            </SuperAdminProtectedRouter>
          }
        />
        <Route
          path="/superAdmin/get-all-rejected-hotels"
          element={
            <SuperAdminProtectedRouter>
              <GetAllRejectedHotels />
            </SuperAdminProtectedRouter>
          }
        />
        <Route
          path="/admin/update-hotel-details/:id"
          element={
            <AdminProtectedRouter>
              <UpdateHotelDetails />
            </AdminProtectedRouter>
          }
        />
        <Route
          path="/admin/hotel-dashboard"
          element={
            <AdminProtectedRouter>
              <AdminHotelDashBoard />
            </AdminProtectedRouter>
          }
        />
        <Route
          path="/admin/show-hotel-status"
          element={
            <AdminProtectedRouter>
              <ShowHotelStatus />
            </AdminProtectedRouter>
          }
        />
        <Route
          path="/admin/create-room"
          element={
            <AdminProtectedRouter>
              <CreateRoom />
            </AdminProtectedRouter>
          }
        />
        <Route
          path="/admin/rooms/:id"
          element={
            <AdminProtectedRouter>
              <GetAllRooms />
            </AdminProtectedRouter>
          }
        />
        <Route
          path="/admin/update-room/:hotelId"
          element={
            <AdminProtectedRouter>
              <UpdateRoom />
            </AdminProtectedRouter>
          }
        />
        <Route
          path="/superAdmin/admin-details"
          element={
            <SuperAdminProtectedRouter>
              <AdminsDetails />
            </SuperAdminProtectedRouter>
          }
        />
        <Route
          path="/superAdmin/admin-products/:adminId"
          element={
            <SuperAdminProtectedRouter>
              <AdminItemsDetailsByAdminId />
            </SuperAdminProtectedRouter>
          }
        />
        <Route
          path="/admin/hotel-booking-dashboard"
          element={
            <AdminProtectedRouter>
              <HotelBookingDashboard />
            </AdminProtectedRouter>
          }
        />
        <Route
          path="/admin/booked-hotels/:hotelId"
          element={
            <AdminProtectedRouter>
              <BookedHotels />
            </AdminProtectedRouter>
          }
        />
        <Route
          path="/superAdmin/place-dashboard"
          element={
            <SuperAdminProtectedRouter>
              <PlaceDashboard />
            </SuperAdminProtectedRouter>
          }
        />
        <Route
          path="/superAdmin/add-place-details"
          element={
            <SuperAdminProtectedRouter>
              <AddPlaceDetails />
            </SuperAdminProtectedRouter>
          }
        />
        <Route
          path="/superAdmin/SuperAdminApprovealPlaceList"
          element={
            <SuperAdminProtectedRouter>
              <SuperAdminApprovealPlaceList />
            </SuperAdminProtectedRouter>
          }
        />
        <Route
          path="/superAdmin/get-placeCityWise"
          element={
            <SuperAdminProtectedRouter>
              <GetPlaceCityWise />
            </SuperAdminProtectedRouter>
          }
        />
        <Route
          path="/superAdmin/get-all-active-placeCityWise"
          element={
            <SuperAdminProtectedRouter>
              <GetAllActivePlaceCityWise />
            </SuperAdminProtectedRouter>
          }
        />
        <Route
          path="/superAdmin/get-inactive-pLaceCityWise"
          element={
            <SuperAdminProtectedRouter>
              <GetInactivePlaceCityWise />
            </SuperAdminProtectedRouter>
          }
        />
        <Route
          path="/superAdmin/update-place-Details/:id"
          element={
            <SuperAdminProtectedRouter>
              <UpdatePlaceDetails />
            </SuperAdminProtectedRouter>
          }
        />
        <Route path="/AiPlanner" element={<AiPlanner/>}/>
        <Route path="/AiPlanner-details" element={<AiPlannerDetails/>}/>

      </Routes>
    </>
  );
}

export default App;
