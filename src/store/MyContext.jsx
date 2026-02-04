import { createContext, useState } from "react";

export const mycontext = createContext();

export const MyContextProvider = ({children})=>{
    const [isLoggedIn , setIsLoggedIn] = useState(false);

     const contextObj = {isLoggedIn,setIsLoggedIn}

    return (
        <mycontext.Provider value={contextObj}>
            {children}
        </mycontext.Provider>
    )
}