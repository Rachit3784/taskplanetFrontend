import { useContext, useEffect, useState } from "react";

import { mycontext } from "./store/MyContext"; 
import Router from "./Router";
import userStore from "./store/MyStore";
import Loading from "./Loading/Loading";


 // Needed for nested routes

function App() {
  const [isLoading ,setIsLoading] = useState(false)
   const {loginWithToken} = userStore();
  const { isLoggedIn ,  setIsLoggedIn} = useContext(mycontext);
   
  const logWithCookie = async ()=>{
    setIsLoading(true);
    try{
    

      const res = await loginWithToken();

      if(res.success){
      setIsLoggedIn(true);
      }else{
             setIsLoggedIn(false);
      }
      

    }catch(error){
      console.log(error)
    }finally{
      setIsLoading(false)
    }
  }
  useEffect(()=>{
  logWithCookie();
  },[]);
  
  return (
   <div>
     {
      isLoading ? (<div>
        <Loading/>
      </div> ) : (
        <Router/>
      )
     }
   </div>
  );
}

export default App;
