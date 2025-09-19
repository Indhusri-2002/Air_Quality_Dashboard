import Navbar from "./Navbar"; 
import "../assets/css/Layout.css";

const Layout = ({ children }) => {
  return (
    <div className="app-layout">
      <header className="app-header">
        <Navbar />
      </header>
      <main className="app-main">{children}</main>
    </div>
  );
};

export default Layout;