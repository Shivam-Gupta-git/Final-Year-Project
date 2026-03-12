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
import HotelPage from './pages/auth/HotelPage'



function App() {

  return (
    <>
    <Navbar/>
    <Routes>
      <Route path='/' element={<LandingPage/>}/>
      <Route path='/hotels' element={<HotelPage />}/>
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
      <Route path='/superAdmin/superAdminDashboard' element={<SuperAdminDashboard/>}/>
      <Route path='/about' element={<About/>}/>
    </Routes> 
    </>
  
  )
}

export default App
