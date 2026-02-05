import React, { useContext } from 'react'
import { Routes, Route, Navigate, Outlet } from "react-router-dom"; 

import Home from "./components/Home/Home";
import Login from "./components/Login/Login";
import Signup from "./components/Signup/Signup";
import Otp from "./components/Otp/Otp";
import { mycontext } from './store/MyContext';
import CreatePost from './components/CreatePost/CreatePost';
import ProfileManagement from './components/Profilemanagement/ProfileManagement';



const AuthLayout = () => <Outlet />;
const MainLayout = ()=><Outlet/>;

function Router() {

    
    const { isLoggedIn ,  setIsLoggedIn} = useContext(mycontext);


  return (
   
    
     <Routes>
      

      
      {!isLoggedIn && (
        <Route path="/auth" element={<AuthLayout />}>
          <Route index element={<Navigate to="login" />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="otp" element={<Otp />} />
        </Route>
      )}

      {/* Main App Routes only if logged in */}
      {isLoggedIn && (
        <Route path="/" element={<MainLayout />} >
        <Route index element={<Navigate to="home" />} />
        <Route path="/home" element={<Home />} />
        <Route path='/createPost' element = {<CreatePost/>} />
        <Route path='/manageProfile' element = {<ProfileManagement/>}/>
        </Route>
      )}

      {/* Fallback */}
      <Route path="*" element={<Navigate to={isLoggedIn ? "/home" : "/auth/login"} />} />
    </Routes>

  )
}

export default Router