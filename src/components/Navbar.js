import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, firestore } from '../firebase';
import userProfileIcon from '../images/user.png';
import logoutIcon from '../images/logout1.png';
import chatIcon from '../images/chat.png';
import logo from '../images/WhereHouseLogo.png';
import dashboardIcon from '../images/dashboard.png';
import billIcon from '../images/bill.png';
import leaseIcon from '../images/lease.png';
import reportIcon from '../images/problem.png';
import defaultProfileImage from '../images/default-profile-image.png';
import { motion, AnimatePresence } from 'framer-motion';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const [profileImage, setProfileImage] = useState(defaultProfileImage);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState('');
    const [lastName, setUserLast] = useState('');
    const [loggedInUserId, setLoggedInUserId] = useState(null); // Define and initialize loggedInUserId
    const [currentUserId, setCurrentUserId] = useState(null); // Add state for current user ID

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false); // Confirmation modal state

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                setIsLoggedIn(true);
                const userRef = firestore.collection('users').doc(user.uid);
                const userData = await userRef.get();
                if (userData.exists) {
                    const userDataObj = userData.data();
                    setProfileImage(userDataObj.profileImage || defaultProfileImage);
                }
            } else {
                setIsLoggedIn(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const handleLogout = () => {
        setShowConfirmation(true); // Show confirmation modal
    };
      // Effect to set loggedInUserId and fetch user data when user logs in
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
            setLoggedInUserId(user.uid);
            setCurrentUserId(user.uid);
            // Fetch the user's name from Firestore
            const userRef = firestore.collection('users').doc(user.uid);
            const userData = await userRef.get();
            if (userData.exists) {
                const userDataObj = userData.data();
                setUserName(userDataObj.first_name); // Adjust based on your Firestore user data structure
                setUserLast(userDataObj.last_name); // Adjust based on your Firestore user data structure
            }
        } else {
            setLoggedInUserId(null);
            setCurrentUserId(null);
            setUserName('');
            setUserLast('');
        }
    });
    return () => unsubscribe();
}, []);

    const confirmLogout = () => {
        auth.signOut()
            .then(() => {
                setIsLoggedIn(false);
                setIsDropdownOpen(false);
                setShowConfirmation(false); // Hide confirmation modal after logout
                navigate('/login'); // Redirect to login page
            })
            .catch(error => {
                console.error('Error signing out:', error);
            });
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };



    return (
        <nav className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4 md:p-6 relative" style={{ backgroundColor: '#eeeeee' }}>
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-col md:flex-row items-center justify-start space-y-4 md:space-y-0 md:space-x-6">
    <img src={logo} alt="Logo" className="h-20" />
    <div className="flex">
        <Link to="/" className="text-lg font-semibold hover:text-gray-300 transition duration-300">Home</Link>
        <Link to="/products" className="text-lg font-semibold hover:text-gray-300 transition duration-300 ml-4">Company</Link>
        <Link to="/about" className="text-lg font-semibold hover:text-gray-300 transition duration-300 ml-4">About Us</Link>
    </div>
</div>

                <div className="flex items-center space-x-6 pt-2" >
                <h2 className="text-1xl font-bold">
                        {userName || 'Guest'}     {lastName || 'Guest'}
                </h2>

                    {!isLoggedIn ? (
                        <>
                            <Link to="/signup" className="text-lg font-semibold bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white px-4 py-2 rounded-lg hover:text-gray-300 transition duration-300">Sign Up</Link>
                            <Link to="/login" className="text-lg font-semibold bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white px-4 py-2 rounded-lg hover:text-gray-300 transition duration-300">Log In</Link>
                        </>
                    ) : (
                        <div className="relative">
                            <motion.img
                                src={profileImage}
                                alt="User"
                                className="h-12 w-12 cursor-pointer rounded-full"
                                onClick={toggleDropdown}
                                whileHover={{ scale: 1.1 }}
                            />
                            <AnimatePresence>
                                {isDropdownOpen && (
                                    <motion.div
                                        className={`absolute transform -translate-x-1/2 top-12 mr-5 mt-2 w-48 bg-white rounded-lg shadow-lg overflow-hidden dropdown-menu`}
                                        style={{ right: '-200%', zIndex: '999' }}
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Link to="/profile" className="block px-4 py-2 flex items-center hover:bg-gray-200 transition duration-300 text-black">
                                            <img src={userProfileIcon} alt="Profile" className="h-6 mr-2 text-black" />
                                            Profile
                                        </Link>
                                        <Link to="/dashboard" className="block px-4 py-2 flex items-center hover:bg-gray-200 transition duration-300 text-black">
                                        <img src={dashboardIcon} alt="Dashboard" className="h-6 mr-2 text-black" />
                                            Dashboard
                                        </Link>
                                      
                                        <Link to="/rental-agreements" className="block px-4 py-2 flex items-center hover:bg-gray-200 transition duration-300 text-black">
                                            <img src={leaseIcon} alt="Lease" className="h-6 mr-2 text-black" />
                                            Lease Agreement
                                        </Link>
                                      
                                        <Link to="/chat" className="block px-4 py-2 flex items-center hover:bg-gray-200 transition duration-300 text-black">
                                            <img src={chatIcon} alt="Chat" className="h-6 mr-2 text-black" />
                                            Chat
                                        </Link>
                                        <div className="border-t border-gray-300"></div>
                                        <button className="block w-full text-left px-4 py-2 flex items-center hover:bg-gray-200 transition duration-300 text-black" onClick={handleLogout}>
                                            <img src={logoutIcon} alt="Logout" className="h-6 mr-2 text-black" />
                                            Logout
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
         
                </div>
            </div>
            
            {/* Confirmation Modal */}
            {showConfirmation && (
                <div className="confirmation-modal-container">
                    <div className="confirmation-modal">
                        <p className="text-lg font-semibold mb-4 text-black">Are you sure you want to log out?</p>
<div className="confirmation-modal-buttons">
<button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600" onClick={confirmLogout}>Logout</button>
<button className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover
" onClick={() => setShowConfirmation(false)}>Cancel</button>
</div>
</div>
</div>
)}
</nav>
);
}

export default Navbar;
 