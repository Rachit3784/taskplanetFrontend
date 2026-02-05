import { useContext, useEffect } from "react";
import { mycontext } from "./store/MyContext";
import Router from "./Router";
import userStore from "./store/MyStore";
import Loading from "./Loading/Loading";

function App() {
  const { loginWithToken } = userStore();
  const { setIsLoggedIn, isAuthChecking, setIsAuthChecking } = useContext(mycontext);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await loginWithToken();

        if (res.success) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (err) {
        setIsLoggedIn(false);
      } finally {
        setIsAuthChecking(false); // ⭐ AUTH CHECK DONE
      }
    };

    checkAuth();
  }, []);

  if (isAuthChecking) return <Loading />;

  return <Router />;
}

export default App;
