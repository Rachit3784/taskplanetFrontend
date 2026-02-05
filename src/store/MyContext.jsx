import { createContext, useState } from "react";

export const mycontext = createContext();

export const MyContextProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true); // ⭐ NEW

  return (
    <mycontext.Provider value={{ isLoggedIn, setIsLoggedIn, isAuthChecking, setIsAuthChecking }}>
      {children}
    </mycontext.Provider>
  );
};
