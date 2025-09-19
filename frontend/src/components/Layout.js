import { useRouter } from "next/router";
import Navbar from "./Navbar"; 

const Layout = ({ children }) => {
  const router = useRouter();

  // Pages where you don’t want navbar
  const hideNavbarRoutes = ["/login","/signup"];
 
  const shouldShowNavbar = !hideNavbarRoutes.includes(router.pathname);
  return (
    <div className="app-layout">
      <header className="app-header">
        {shouldShowNavbar && <Navbar />}
      </header>
      <main className="app-main" style={{ paddingTop: shouldShowNavbar? "80px" : 0 }}>{children}</main>
    </div>
  );
};

export default Layout;