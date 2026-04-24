import "./App.css";
// import Header from './components/Header'
import { Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
const Register = lazy(() => import("./pages/auth/Register"))
const About = lazy(() => import("./pages/localPages/About"))
const VerifyEmail = lazy(() => import("./pages/localPages/VerifyEmail"))
const Verify = lazy(() => import("./pages/localPages/Verify"))
const Login = lazy(() => import("./pages/auth/Login"))
const LandingPage = lazy(() => import("./pages/auth/landingPage"))
const Navbar = lazy(() => import("./components/Navbar"))
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"))
const VerifyOTP = lazy(()=> import("./pages/auth/VerifyOTP"))
const ChangePassword = lazy(()=> import("./pages/auth/ChangePassword"))
const UserProfile = lazy(() => import("./pages/localPages/UserProfile"))
import UserProtectedRouter from "./components/protectedRouter/UserProtectedRouter";
const SuperAdminRegister = lazy(() => import("./pages/superAdmin/SuperAdminRegister"))
const SuperAdminLogin = lazy(() => import("./pages/superAdmin/SuperAdminLogin"))
const SuperAdminDashboard = lazy(() => import("./pages/superAdmin/SuperAdminDashboard"))
import SuperAdminProtectedRouter from "./components/protectedRouter/SuperAdminProtectedRouter";
const SuperAdminProfile = lazy(() => import("./pages/superAdmin/SuperAdminProfile"))
const AdminApprovalPage = lazy(() => import("./pages/admin/AdminApprovalPage"))
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"))
const LoginPage = lazy(() => import("./pages/localPages/LoginPage"))
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"))
const AdminProfile = lazy(() => import("./pages/admin/AdminProfile"))
import AdminProtectedRouter from "./components/protectedRouter/AdminProtectedRouter";
const AddCityDetails = lazy(() => import("./pages/superAdmin/city/AddCityDetails"))
const CityDashboard = lazy(() => import("./pages/superAdmin/city/CityDashboard"))
const UpdateCityDetails = lazy(() => import("./pages/superAdmin/city/UpdateCityDetails"))
// import SuperAdminCityList from './pages/superAdmin/city/SuperAdminApprovealCityList'
const GetCityById = lazy(() => import("./pages/superAdmin/city/GetCityById"))
const GetAllCities = lazy(() => import("./pages/superAdmin/city/GetAllCities"))
const CityDetails = lazy(() => import("./pages/auth/CityPage"))
const GetAllInactiveCities = lazy(() => import("./pages/superAdmin/city/GetAllInactiveCities"))
const AddHotelDetails = lazy(() => import("./pages/admin/hotel/AddHotelDetails"))
const SuperAdminApprovealHoteList = lazy(() => import("./pages/superAdmin/Hotel/SuperAdminApprovealHoteList"))
const HotelDashboard = lazy(() => import("./pages/superAdmin/Hotel/HotelDashboard"))
const GetAllHotels = lazy(() => import("./pages/superAdmin/Hotel/GetAllHotels"))
const GetAllActiveHotels = lazy(() => import("./pages/superAdmin/Hotel/GetAllActiveHotels"))
const GetAllRejectedHotels = lazy(() => import("./pages/superAdmin/Hotel/GetAllRejectedHotels"))
const UpdateHotelDetails = lazy(() => import("./pages/admin/hotel/UpdateHotelDetails"))
const GetAllInactiveHotels = lazy(() => import("./pages/superAdmin/Hotel/GetAllInactiveHotels"))
const HotelPage = lazy(() => import("./pages/auth/HotelPage"))
const HotelDetailPage = lazy(() => import("./pages/auth/HotelDetailPage "))
const SuperAdminApprovealCityList = lazy(() => import("./pages/superAdmin/city/SuperAdminApprovealCityList"))
const GetAllActiveCities = lazy(() => import("./pages/superAdmin/city/GetAllActiveCities"))
const AdminHotelDashBoard = lazy(() => import("./pages/admin/hotel/AdminHotelDashBoard"))
const ShowHotelStatus = lazy(() => import("./pages/admin/hotel/ShowHotelStatus"))
const CreateRoom = lazy(() => import("./pages/admin/rooms/CreateRoom"))
const GetAllRooms = lazy(() => import("./pages/admin/rooms/GetAllRooms"))
const UpdateRoom = lazy(() => import("./pages/admin/rooms/UpdateRoom"))
const AdminsDetails = lazy(() => import("./pages/superAdmin/AdminsDetails"))
const AdminItemsDetailsByAdminId = lazy(() => import("./pages/superAdmin/AdminItemsDetailsByAdminId"))
const HotelBookingDashboard = lazy(() => import("./pages/admin/HotelBooking/HotelBookingDashboard"))
const BookedHotels = lazy(() => import("./pages/admin/HotelBooking/BookedHotels"))
const Booking = lazy(() => import("./pages/auth/Booking"))
const PlaceDashboard = lazy(() => import("./pages/superAdmin/place/PlaceDashboard"))
const AddPlaceDetails = lazy(() => import("./pages/superAdmin/place/AddPlaceDetails"))
const SuperAdminApprovealPlaceList = lazy(() => import("./pages/superAdmin/place/SuperAdminApprovealPlaceList"))
const GetPlaceCityWise = lazy(() => import("./pages/superAdmin/place/GetPlaceCityWise"))
const GetAllActivePlaceCityWise = lazy(() => import("./pages/superAdmin/place/GetAllActivePlaceCityWise"))
const GetInactivePlaceCityWise = lazy(() => import("./pages/superAdmin/place/GetInactivePlaceCityWise"))
const UpdatePlaceDetails = lazy(() => import("./pages/superAdmin/place/UpdatePlaceDetails"))
const AiPlanner = lazy(() => import("./pages/AIPlanner/AiPlanner"))
const AiPlannerDetails = lazy(() => import("./pages/AIPlanner/AiPlannerDetails"))
const RestaurantDashboard = lazy(() => import("./pages/admin/restaurant/RestaurantDashboard"))
const AddRestaurantDetails = lazy(() => import("./pages/admin/restaurant/AddRestaurantDetails"))
const AdminActiveRestaurant = lazy(() => import("./pages/admin/restaurant/AdminActiveRestaurant"))
const ShowRestaurantStatus = lazy(() => import("./pages/admin/restaurant/ShowRestaurantStatus"))
const UpdateRestaurantDetails = lazy(() => import("./pages/admin/restaurant/UpdateRestaurantDetails"))
const SuperAdminRestaurantDashboard = lazy(() => import("./pages/superAdmin/restaurant/SuperAdminRestaurantDashboard"))
const SuperAdminApprovealRestaurant = lazy(() => import("./pages/superAdmin/restaurant/SuperAdminApprovealRestaurant"))
const GetAllRestaurantCityWise = lazy(() => import("./pages/superAdmin/restaurant/GetAllRestaurantCityWise"))
const GetAllActiveRestaurantCityWise = lazy(() => import("./pages/superAdmin/restaurant/GetAllActiveRestaurantCityWise"))
const GetAllInactiveRestaurantCityWise = lazy(() => import("./pages/superAdmin/restaurant/GetAllInactiveRestaurantCityWise"))
const GetAllRejectedRestaurantCityWise = lazy(() => import("./pages/superAdmin/restaurant/GetAllRejectedRestaurantCityWise"))
const CreateFood = lazy(() => import("./pages/admin/food/CreateFood"))
const GetAllFood = lazy(() => import("./pages/admin/food/GetAllFood"))
const UpdateFood = lazy(()=> import("./pages/admin/food/UpdateFood"))
const RestaurantLandingPage = lazy(() => import("./components/Restaurant/RestaurantLandingPage"))
const RestaurantDetailPage = lazy(() => import("./components/Restaurant/RestaurantDetailPage"))
const RestaurantMenuPage = lazy(() => import("./components/Restaurant/RestaurantMenuPage"))
const FoodDetailPage = lazy(() => import("./components/Restaurant/FoodDetailPage"))
const CartPage = lazy(() => import("./components/Restaurant/CartPage"))
const CheckoutPage = lazy(() => import("./components/Restaurant/CheckoutPage"))
const MyOrdersPage = lazy(() => import("./components/Restaurant/MyOrdersPage"))
const OrderDetailsPage = lazy(() => import("./components/Restaurant/OrderDetailsPage"))
const OrdersDashboard = lazy(() => import("./pages/admin/restaurant/OrdersDashboard"))
const ManageOrder = lazy(() => import("./pages/admin/restaurant/ManageOrder"))
const AdminOrderDetails = lazy(() => import("./pages/admin/restaurant/AdminOrderDetails"))
const ViewUsers = lazy(() => import("./pages/admin/restaurant/ViewUsers"))
const WorldMapPage = lazy(() => import("./pages/explore/WorldMapPage"))
const CountryPage = lazy(() => import("./pages/explore/CountryPage"))
const ExploreCityPage = lazy(() => import("./pages/explore/CityPage"))
const FloatingAIButton = lazy(() => import("./pages/auth/AiPlanner"))
import PlacePage from "./pages/auth/PlacePage";
import Page404 from "./components/Page404";
import DelayedFallback from "./components/DelayedFallback";
const AdminRegisterForm = lazy(() => import("./pages/admin/AdminRegisterForm"))
const DeliveryBoyDeshboard = lazy(() => import("./pages/admin/deliverBoy/DeliveryBoyDeshboard"))
const LiveLocationUpdate = lazy(() => import("./pages/admin/deliverBoy/LiveLocationUpdate"))
const PendingOrders = lazy(() => import("./pages/admin/deliverBoy/PendingOrders"))
const AdminAssignDeliveryBoy = lazy(() => import("./pages/admin/deliverBoy/AdminAssignDeliveryBoy"))
const AssistantChat = lazy(() => import("./pages/assistantChat/AssistantChat"))
const AssistantRecommendations = lazy(() => import("./pages/assistantChat/AssistantRecommendations"))
const UpdateUserLocation = lazy(() => import("./components/UpdateUserLocation"))
const GlobalMap = lazy(() => import("./components/globalMap/GlobalMap"))
import PayoutDashboard from "./pages/admin/finance/PayoutDashboard";


function App() {
  const location = useLocation();
  const hiddenRoutes  = ["/AiPlanner" , "/AiPlanner-details" ]
  const hideAibutton = hiddenRoutes.includes(location.pathname)

  return (
    <>
    <Suspense fallback={<DelayedFallback/>}>
    <Navbar />
      {!hideAibutton && <FloatingAIButton />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/explore" element={<WorldMapPage />} />
        <Route path="/country/:name" element={<CountryPage />} />
        <Route path="/city/:id/places" element={<ExploreCityPage />} />
        <Route path="/hotels" element={<HotelPage />} />
        <Route path="/hotels/:id" element={<HotelDetailPage />}/>
        <Route path="/places" element={<PlacePage />} />
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
            <AdminProtectedRouter allowedHosts={["hotel"]}>
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
            <AdminProtectedRouter allowedHosts={["hotel"]}>
              <UpdateHotelDetails />
            </AdminProtectedRouter>
          }
        />
        <Route
          path="/admin/hotel-dashboard"
          element={
            <AdminProtectedRouter allowedHosts={["hotel"]}>
              <AdminHotelDashBoard />
            </AdminProtectedRouter>
          }
        />
        <Route
          path="/admin/show-hotel-status"
          element={
            <AdminProtectedRouter allowedHosts={["hotel"]}>
              <ShowHotelStatus />
            </AdminProtectedRouter>
          }
        />
        <Route
          path="/admin/create-room"
          element={
            <AdminProtectedRouter allowedHosts={["hotel"]}>
              <CreateRoom />
            </AdminProtectedRouter>
          }
        />
        <Route
          path="/admin/rooms/:id"
          element={
            <AdminProtectedRouter allowedHosts={["hotel"]}>
              <GetAllRooms />
            </AdminProtectedRouter>
          }
        />
        <Route
          path="/admin/update-room/:hotelId"
          element={
            <AdminProtectedRouter allowedHosts={["hotel"]}>
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
            <AdminProtectedRouter allowedHosts={["hotel"]}>
              <HotelBookingDashboard />
            </AdminProtectedRouter>
          }
        />
        <Route
          path="/admin/booked-hotels/:hotelId"
          element={
            <AdminProtectedRouter allowedHosts={["hotel"]}>
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
        <Route path="/AiPlanner" element={<AiPlanner />} />
        <Route path="/AiPlanner-details" element={<AiPlannerDetails />} />
        <Route
          path="/admin/restaurantDashboard"
          element={
            <AdminProtectedRouter allowedHosts={["restaurant"]}>
              <RestaurantDashboard/>
            </AdminProtectedRouter>
          }
        />
        <Route
          path="/admin/add-restaurant"
          element={
            <AdminProtectedRouter  allowedHosts={["restaurant"]}>
              <AddRestaurantDetails />
            </AdminProtectedRouter>
          }
        />
        <Route
          path="/admin/admin-active-restaurant"
          element={
            <AdminProtectedRouter allowedHosts={["restaurant"]}>
              <AdminActiveRestaurant />
            </AdminProtectedRouter>
          }
        />
        <Route
          path="/admin/show-restaurant-status"
          element={
            <AdminProtectedRouter allowedHosts={["restaurant"]}>
              <ShowRestaurantStatus />
            </AdminProtectedRouter>
          }
        />
        <Route
          path="/admin/update-restaurant/:id"
          element={
            <AdminProtectedRouter allowedHosts={["restaurant"]}>
              <UpdateRestaurantDetails />
            </AdminProtectedRouter>
          }
        />
        <Route
          path="/superAdmin/restaurant-dashboard"
          element={
            <SuperAdminProtectedRouter>
              <SuperAdminRestaurantDashboard />
            </SuperAdminProtectedRouter>
          }
        />
        <Route
          path="/superAdmin/approval-restaurant"
          element={
            <SuperAdminProtectedRouter>
              <SuperAdminApprovealRestaurant />
            </SuperAdminProtectedRouter>
          }
        />
        <Route
          path="/superAdmin/all-restaurant"
          element={
            <SuperAdminProtectedRouter>
              <GetAllRestaurantCityWise />
            </SuperAdminProtectedRouter>
          }
        />
        <Route
          path="/superAdmin/all-active-restaurant"
          element={<GetAllActiveRestaurantCityWise />}
        />
        <Route
          path="/superAdmin/all-inactive-restaurant"
          element={
            <SuperAdminProtectedRouter>
              <GetAllInactiveRestaurantCityWise />
            </SuperAdminProtectedRouter>
          }
        />
        <Route
          path="/superAdmin/all-rejected-restaurant"
          element={
            <SuperAdminProtectedRouter>
              <GetAllRejectedRestaurantCityWise />
            </SuperAdminProtectedRouter>
          }
        />
        <Route
          path="/admin/create-food"
          element={
            <AdminProtectedRouter allowedHosts={["restaurant"]}>
              <CreateFood />
            </AdminProtectedRouter>
          }
        />
        <Route
          path="/admin/get-All-Food/:id"
          element={
            <AdminProtectedRouter allowedHosts={["restaurant"]}>
              <GetAllFood />
            </AdminProtectedRouter>
          }
        />
        <Route
          path="/admin/update-food/:id"
          element={
            <AdminProtectedRouter allowedHosts={["restaurant"]}>
              <UpdateFood />
            </AdminProtectedRouter>
          }
        />
        <Route
          path="/restaurant/:restaurantId/menu"
          element={<RestaurantMenuPage />}
        />
        <Route
          path="/restaurant/:restaurantId"
          element={<RestaurantDetailPage />}
        />
        <Route path="/food/:foodId" element={<FoodDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route
          path="/RestaurantLandingPage"
          element={<RestaurantLandingPage />}
        />

        <Route
          path="/CheckoutPage"
          element={
            <UserProtectedRouter>
              <CheckoutPage />
            </UserProtectedRouter>
          }
        />
        <Route
          path="/My-Food-orders"
          element={
            <UserProtectedRouter>
              <MyOrdersPage />
            </UserProtectedRouter>
          }
        />
        <Route
          path="/OrderDetailsPage/:orderId"
          element={
            <UserProtectedRouter>
              <OrderDetailsPage />
            </UserProtectedRouter>
          }
        />
        <Route
          path="/admin/ordersDashboard"
          element={
            <AdminProtectedRouter allowedHosts={["restaurant"]}>
              <OrdersDashboard />
            </AdminProtectedRouter>
          }
        />
        <Route
          path="/admin/manage-orders"
          element={
            <AdminProtectedRouter allowedHosts={["restaurant"]}>
              <ManageOrder />
            </AdminProtectedRouter>
          }
        />
        <Route
          path="/admin/AdminOrderDetails/:orderId"
          element={
            <AdminProtectedRouter allowedHosts={["restaurant"]}>
              <AdminOrderDetails />
            </AdminProtectedRouter>
          }
        />
        <Route
          path="/admin/ViewUsers"
          element={
            <AdminProtectedRouter allowedHosts={["restaurant"]}>
              <ViewUsers />
            </AdminProtectedRouter>
          }
        />
        <Route
          path="/superAdmin/admin-registration"
          element={
            <SuperAdminProtectedRouter>
              <AdminRegisterForm />
            </SuperAdminProtectedRouter>
          }
        />
        <Route
          path="/admin/deliveryBoy-dashboard"
          element={
            <AdminProtectedRouter allowedHosts={["delivery_boy"]}>
              <DeliveryBoyDeshboard />
            </AdminProtectedRouter>
          }
        />
        <Route
          path="/admin/livelocation-update"
          element={
            <AdminProtectedRouter allowedHosts={["delivery_boy"]}>
              <LiveLocationUpdate />
            </AdminProtectedRouter>
          }
        />
        <Route
          path="/admin/pending-orders"
          element={
            <AdminProtectedRouter allowedHosts={["delivery_boy"]}>
              <PendingOrders />
            </AdminProtectedRouter>
          }
        />
        <Route
          path="/admin/AdminAssignDeliveryBoy/:id"
          element={
            <AdminProtectedRouter>
              <AdminAssignDeliveryBoy />
            </AdminProtectedRouter>
          }
        />
        <Route
          path="/assistantChat"
          element={
            <UserProtectedRouter>
              <AssistantChat />
            </UserProtectedRouter>
          }
        />
        <Route
          path="/assistantChat/recommendations"
          element={
            <UserProtectedRouter>
              <AssistantRecommendations />
            </UserProtectedRouter>
          }
        />
        {/* payouts */}
        <Route
          path="/superadmin/payout-dashboard"
          element={
            <SuperAdminProtectedRouter>
              <PayoutDashboard />
            </SuperAdminProtectedRouter>
          }
        />
        <Route path="/updateUserLocation" element={<UpdateUserLocation/>}/>
        <Route path="/globalMap" element={<GlobalMap/>}/>
        <Route path="*" element={<Page404 type="404"/>}/>
      </Routes>

    </Suspense>
    </>
  );
}

export default App;
