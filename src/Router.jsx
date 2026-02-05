import { useContext } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { mycontext } from "./store/MyContext";

import Home from "./components/Home/Home";
import Login from "./components/Login/Login";
import Signup from "./components/Signup/Signup";
import Otp from "./components/Otp/Otp";
import CreatePost from "./components/CreatePost/CreatePost";
import ProfileManagement from "./components/Profilemanagement/ProfileManagement";

const AuthLayout = () => <Outlet />;
const MainLayout = () => <Outlet />;

function Router() {
  const { isLoggedIn } = useContext(mycontext);

  return (
    <Routes>
      {isLoggedIn ? (
        <>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="" />} />
        
            <Route path="createPost" element={<CreatePost />} />
            <Route path="manageProfile" element={<ProfileManagement />} />
                <Route path="home" element={<Home />} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </>
      ) : (
        <>
          <Route path="/auth" element={<AuthLayout />}>
            <Route index element={<Navigate to="login" />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route path="otp" element={<Otp />} />
          </Route>
          <Route path="*" element={<Navigate to="/auth/login" />} />
        </>
      )}
    </Routes>
  );
}

export default Router;
