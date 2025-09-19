import Link from "next/link";
import { useRouter } from "next/router";
import "../assets/css/Navbar.css";
import Image from "next/image";
import { isLoggedIn, removeToken } from "@/utils/auth";
import { useState, useEffect } from "react";

function Navbar() {
  const router = useRouter();
  const loggedIn = isLoggedIn();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function handleLogout() {
    removeToken();
    router.push("/login");
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  if (!loggedIn) return null;

  return (
    <>
      <nav className={`modern-navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          {/* Brand Section */}
          <Link href="/home" className="navbar-brand" onClick={closeMobileMenu}>
            <div className="brand-icon">
              <Image
                src="/Clouds.png"
                alt="weather icon"
                width={45}
                height={45}
                className="brand-image"
              />
            </div>
            <div className="brand-text">
              <span className="brand-title">AirWatch</span>
              <span className="brand-subtitle">Weather & Air Quality</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="desktop-nav">
            <div className="navbar-nav">
              <Link
                href="/home"
                className={`nav-link ${router.pathname === "/home" ? "active" : ""}`}
              >
                <span>Home</span>
              </Link>

              <Link
                href="/map"
                className={`nav-link ${router.pathname === "/map" ? "active" : ""}`}
              >
                <span>Air Quality</span>
              </Link>

              <Link
                href="/history"
                className={`nav-link ${router.pathname === "/history" ? "active" : ""}`}
              >
                <span>History</span>
              </Link>

              <Link
                href="/threshold"
                className={`nav-link ${router.pathname === "/threshold" ? "active" : ""}`}
              >
                <span>Threshold</span>
              </Link>

              <button onClick={handleLogout} className="logout-btn">
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className={`mobile-toggle ${isMobileMenuOpen ? 'active' : ''}`}
            type="button"
            onClick={toggleMobileMenu}
            aria-controls="mobileMenu"
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle navigation"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>

          {/* Mobile Navigation Menu */}
          <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`} id="mobileMenu">
            <div className="mobile-menu-overlay" onClick={closeMobileMenu}></div>
            <div className="mobile-menu-content">
              <div className="mobile-menu-header">
                <div className="mobile-brand">
                  <div className="brand-icon">
                    <Image
                      src="/Clouds.png"
                      alt="weather icon"
                      width={35}
                      height={35}
                      className="brand-image"
                    />
                  </div>
                  <span className="mobile-brand-title">AirWatch</span>
                </div>
                <button className="close-btn" onClick={closeMobileMenu}>
                  <span>✕</span>
                </button>
              </div>
              
              <div className="mobile-nav-links">
                <Link
                  href="/home"
                  className={`mobile-nav-link ${router.pathname === "/home" ? "active" : ""}`}
                  onClick={closeMobileMenu}
                >

                  <span>Home</span>
                  <i className="arrow-icon">→</i>
                </Link>

                <Link
                  href="/map"
                  className={`mobile-nav-link ${router.pathname === "/map" ? "active" : ""}`}
                  onClick={closeMobileMenu}
                >

                  <span>Air Quality</span>
                  <i className="arrow-icon">→</i>
                </Link>

                <Link
                  href="/history"
                  className={`mobile-nav-link ${router.pathname === "/history" ? "active" : ""}`}
                  onClick={closeMobileMenu}
                >

                  <span>History</span>
                  <i className="arrow-icon">→</i>
                </Link>

                <Link
                  href="/threshold"
                  className={`mobile-nav-link ${router.pathname === "/threshold" ? "active" : ""}`}
                  onClick={closeMobileMenu}
                >

                  <span>Threshold</span>
                  <i className="arrow-icon">→</i>
                </Link>

                <button 
                  onClick={() => {
                    handleLogout();
                    closeMobileMenu();
                  }} 
                  className="mobile-logout-btn"
                >
                  <span>Sign Out</span>
                  <i className="arrow-icon">→</i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
