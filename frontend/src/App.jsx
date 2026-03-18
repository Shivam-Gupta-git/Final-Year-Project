import './App.css'
// import Header from './components/Header'
import Register from './pages/auth/Register'
import { Routes, Route } from 'react-router-dom'
import About from './pages/localPages/About'
import VerifyEmail from './pages/localPages/VerifyEmail'
import Verify from './pages/localPages/Verify'
import Login from './pages/auth/Login'
import LandingPage from './pages/auth/landingPage'
import Navbar from './components/Navbar'
import ForgotPassword from './pages/auth/ForgotPassword'
import VerifyOTP from './pages/auth/VerifyOTP'
import ChangePassword from './pages/auth/ChangePassword'
import UserProfile from './pages/localPages/UserProfile'
import UserProtectedRouter from './components/protectedRouter/UserProtectedRouter'
import SuperAdminRegister from './pages/superAdmin/SuperAdminRegister'
import SuperAdminLogin from './pages/superAdmin/SuperAdminLogin'
import SuperAdminDashboard from './pages/superAdmin/SuperAdminDashboard'
import SuperAdminProtectedRouter from './components/protectedRouter/SuperAdminProtectedRouter'
import SuperAdminProfile from './pages/superAdmin/SuperAdminProfile'
import AdminApprovalPage from './pages/admin/AdminApprovalPage'
import AdminLogin from './pages/admin/AdminLogin'
import LoginPage from './pages/localPages/LoginPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProfile from './pages/admin/AdminProfile'
import AdminProtectedRouter from './components/protectedRouter/AdminProtectedRouter'
import AddCityDetails from './pages/superAdmin/city/AddCityDetails'
import CityDashboard from './pages/superAdmin/city/CityDashboard'
import UpdateCityDetails from './pages/superAdmin/city/UpdateCityDetails'
// import SuperAdminCityList from './pages/superAdmin/city/SuperAdminApprovealCityList'
import GetCityById from './pages/superAdmin/city/GetCityById'
import SuperAdminApprovealCityList from './pages/superAdmin/city/SuperAdminApprovealCityList'
import GetAllCities from './pages/superAdmin/city/GetAllCities'
import GetAllActiveCities from './pages/superAdmin/city/GetAllActiveCities'
import CityDetails from './pages/auth/CityPage'
import GetAllInactiveCities from './pages/superAdmin/city/GetAllInactiveCities'
import AddHotelDetails from './pages/admin/hotel/AddHotelDetails'
import SuperAdminApprovealHoteList from './pages/superAdmin/Hotel/SuperAdminApprovealHoteList'
import HotelDashboard from './pages/superAdmin/Hotel/HotelDashboard'
import GetAllHotels from './pages/superAdmin/Hotel/GetAllHotels'
import GetAllActiveHotels from './pages/superAdmin/Hotel/GetAllActiveHotels'
import GetAllRejectedHotels from './pages/superAdmin/Hotel/GetAllRejectedHotels'
import UpdateHotelDetails from './pages/admin/hotel/UpdateHotelDetails'
import HotelPage from './pages/auth/HotelPage'
import GetAllInactiveHotels from './pages/superAdmin/Hotel/GetAllInactiveHotels'







function App() {

  return (
    <>
    <Navbar/>
    <Routes>
      <Route path='/' element={<LandingPage/>}/>
      <Route path='hotels' element={<HotelPage />}/>
      <Route path='/city/:id' element={<CityDetails />}/>
      <Route path='/signUp' element={<Register/>}/>
      <Route path='/verifyEmail' element={<VerifyEmail/>}/>
      <Route path='/verify/:token' element={<Verify/>}/>
      <Route path='/forgot-password' element={<ForgotPassword/>}/>
      <Route path='/verify-otp/:email' element={<VerifyOTP/>}/>
      <Route path='/change-password/:email' element={<ChangePassword/>}/>
      <Route path='/login' element={<Login/>}/>
      <Route path='/user-profile' element={<UserProtectedRouter><UserProfile/></UserProtectedRouter>} />
      <Route path='/superAdmin/signUp' element={<SuperAdminRegister/>}/>
      <Route path='/superAdmin/login' element={<SuperAdminLogin/>}/>
      <Route path='/superAdmin/superAdminDashboard' element={<SuperAdminProtectedRouter><SuperAdminDashboard/></SuperAdminProtectedRouter>}/>
      <Route path='/superAdmin/superAdminProfile' element={<SuperAdminProtectedRouter><SuperAdminProfile/></SuperAdminProtectedRouter>}/>
      <Route path='/superadmin/adminApprovel' element={<SuperAdminProtectedRouter><AdminApprovalPage/></SuperAdminProtectedRouter>}/>
      <Route path='/about' element={<About/>}/>
      <Route path='/admin/login' element={<AdminLogin/>}/>
      <Route path='/loginPage' element={<LoginPage/>}/>
      <Route path='/admin/adminDashboard' element={<AdminProtectedRouter><AdminDashboard/></AdminProtectedRouter>}/>
      <Route path='/admin/adminProfile' element={<AdminProtectedRouter><AdminProfile/></AdminProtectedRouter>}/>
      <Route path='/superAdmin/cityDashboard' element={<SuperAdminProtectedRouter><CityDashboard/></SuperAdminProtectedRouter>}/>
      <Route path='/superAdmin/createCity' element={<SuperAdminProtectedRouter><AddCityDetails/></SuperAdminProtectedRouter>}/>
      <Route path='/superAdmin/updateCityDetails/:id' element={<SuperAdminProtectedRouter><UpdateCityDetails/></SuperAdminProtectedRouter>}/>
      <Route path='/superAdmin/SuperAdminApprovealCityList' element={<SuperAdminProtectedRouter><SuperAdminApprovealCityList/></SuperAdminProtectedRouter>}/>
      <Route path='/superAdmin/getCityById/:id' element={<SuperAdminProtectedRouter><GetCityById/></SuperAdminProtectedRouter>}/>
      <Route path='/superAdmin/get-all-cities' element={<SuperAdminProtectedRouter><GetAllCities/></SuperAdminProtectedRouter>}/>
      <Route path='/superAdmin/get-all-active-cities' element={<SuperAdminProtectedRouter><GetAllActiveCities/></SuperAdminProtectedRouter>}/>
      <Route path='/superAdmin/get-all-inactive-cities' element={<SuperAdminProtectedRouter><GetAllInactiveCities/></SuperAdminProtectedRouter>} />
      <Route path='/admin/create-hotel' element={<AdminProtectedRouter><AddHotelDetails/></AdminProtectedRouter>}/>
      <Route path='/superAdmin/hotelDashboard' element={<SuperAdminProtectedRouter><HotelDashboard/></SuperAdminProtectedRouter>}/>
      <Route path='/superAdmin/SuperAdminApprovealHotelList' element={<SuperAdminProtectedRouter><SuperAdminApprovealHoteList/></SuperAdminProtectedRouter>}/>
      <Route path='/superadmin/get-all-hotels' element={<SuperAdminProtectedRouter><GetAllHotels/></SuperAdminProtectedRouter>}/>
      <Route path='/superAdmin/get-all-active-hotels' element={<SuperAdminProtectedRouter><GetAllActiveHotels/></SuperAdminProtectedRouter>}/>
      <Route path='/superAdmin/get-all-Inactive-hotels' element={<SuperAdminProtectedRouter><GetAllInactiveHotels/></SuperAdminProtectedRouter>}/>
      <Route path='/superAdmin/get-all-rejected-hotels' element={<SuperAdminProtectedRouter><GetAllRejectedHotels/></SuperAdminProtectedRouter>}/>
      <Route path='/admin/update-hotel-details/:id' element={<AdminProtectedRouter><UpdateHotelDetails/></AdminProtectedRouter>}/>

    </Routes> 
    </>
  
  )
}

export default App
