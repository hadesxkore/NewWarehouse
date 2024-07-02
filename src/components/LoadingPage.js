import React, { useEffect } from 'react';
import logo from '../images/WhereHouseLogo.png';
import './loading-page.css'; // Import the CSS file

function LoadingPage() {
  useEffect(() => {
    const redirectTimeout = setTimeout(() => {
      window.location.href = '/home'; // Redirect to signup page after 3 seconds
    }, 3000);

    return () => clearTimeout(redirectTimeout);
  }, []);

  return (
    <div className="loading-container" >
      {/* Company logo animation */}
      <img src={logo} alt="WhereHouse" className="logo-animation -mb-32 -ml-12" />

      {/* Text animation */}
      <p className="text-xl text-gray-600 mb-8 text-animation">Online Warehouse Rental Management System</p>

      {/* Loading dots */}
      <div className="loading-dots">
        {[...Array(10)].map((_, index) => (
          <div key={index} className="loading-dot"></div>
        ))}
      </div>
    </div>
  );
}

export default LoadingPage;
