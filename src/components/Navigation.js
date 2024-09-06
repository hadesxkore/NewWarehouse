import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import notificationIcon from '../images/notification.png';
import { auth, firestore } from '../firebase';
import CustomPopup from './CustomPopUp';
import './Navigation.css';

function Navigation() {
    const [showPopup, setShowPopup] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);

    const handleLogout = () => {
        setShowPopup(true);
    };

    const confirmLogout = () => {
        auth.signOut().then(() => {
            // Sign-out successful.
        }).catch((error) => {
            // An error happened.
            console.error("Error logging out:", error);
        });
        setShowPopup(false);
    };

    const cancelLogout = () => {
        setShowPopup(false);
    };

    useEffect(() => {
        // Set up real-time listener for pending warehouses
        const unsubscribe = firestore.collection('warehouses').where('status', '==', 'pending').onSnapshot(snapshot => {
            // Update the notification count based on the number of pending warehouses
            setPendingCount(snapshot.size);
        });

        // Clean up the listener when the component unmounts
        return () => unsubscribe();
    }, []);

    return (
        <nav className="bg-gray-800 text-white p-4 md:p-6">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex space-x-6">
                    <NavLink to="/superadmin" className="flex items-center nav-link" activeClassName="active">
                        <div className="relative">
                            <img src={notificationIcon} alt="Notification" className="h-6 mr-2" />
                            {pendingCount > 0 && (
                                <span className="notification-badge">{pendingCount}</span>
                            )}
                        </div>
                        <span className="text-lg font-semibold">Notifications</span>
                    </NavLink>
                </div>
                <div className="flex space-x-6">
                    <NavLink to="/superadmin" className="text-lg font-semibold nav-link" activeClassName="active">Main</NavLink>
                    <NavLink to="/warehouses" className="text-lg font-semibold nav-link" activeClassName="active">Warehouses</NavLink> {/* Add Warehouses Link */}
                    <NavLink to="/users" className="text-lg font-semibold nav-link" activeClassName="active">Users</NavLink>
                    <NavLink to="/analytics" className="text-lg font-semibold nav-link" activeClassName="active">Charts</NavLink>
                    <button onClick={handleLogout} className="text-lg font-semibold nav-link">Logout</button>
                </div>
            </div>
            {showPopup && (
                <CustomPopup
                    message="Are you sure you want to logout?"
                    onCancel={cancelLogout}
                    onConfirm={confirmLogout}
                />
            )}
        </nav>
    );
}

export default Navigation;
