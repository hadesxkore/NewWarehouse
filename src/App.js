import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './styles/tailwind.css';
import LoadingPage from './components/LoadingPage';
import SignUpPage from './components/SignUpPage';
import LoginPage from './components/LoginPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import VerifyPage from './components/VerifyPage';
import HomePage from './components/HomePage';
import ProfilePage from './components/ProfilePage';
import Dashboard from './components/Dashboard';
import Superadmin from './components/superadmin';
import SuperadminRegistration from './components/SuperadminRegistration';
import WarehouseCard from './components/WarehouseCard';
import Users from './components/users';
import Reports from './components/reports';
import Analytics from './components/Analytics';
import SuperadminLogin from './components/SuperadminLogin';
import ChatPage from './components/ChatPage';
import DetailedView from './components/DetailedView';
import Warehouses from './components/Warehouses'; // Import the Warehouses component
import Footer from './components/Footer';
import AboutUs from './components/AboutUs'; // Import the AboutUs component

import { auth, firestore } from './firebase';
import Navigation from './components/Navigation';
import RentalAgreements from './components/RentalAgreements';
import CreateAgreement from './components/CreateAgreement';
import Navbar from './components/Navbar';
import Conversation from './components/Conversation'; // Import the Conversation component
import ArchiveWarehouse from './components/ArchiveWarehouse'; // Import the Conversation component


function App() {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                // Fetch user data
                const userRef = firestore.collection('superadmins').doc(user.uid);
                const userSnapshot = await userRef.get();
                if (userSnapshot.exists) {
                    const userData = userSnapshot.data();
                    setUser({ ...user, userData });
                } else {
                    setUser(user);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return <LoadingPage />;
    }

    return (
        <Router>
            <div style={{ backgroundColor: '#eeeeee', minHeight: '100vh' }}>
                <main className="flex-grow">
                    <Routes>
                        <Route exact path="/" element={<LoadingPage />} />
                        <Route path="/signup" element={<SignUpPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/verify" element={<VerifyPage />} />
                        <Route path="/home" element={<HomePage />} />
                        <Route path="/about" element={<AboutUs />} />

                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/users" element={<Users />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/Analytics" element={<Analytics />} />
                        <Route path="/ArchiveWarehouse" element={<ArchiveWarehouse />} />
                        
                         {/* Add the Warehouses component route */}
                         <Route path="/warehouses" element={<Warehouses />} />
                        
                        <Route path="/superadmin-registration" element={<SuperadminRegistration />} />
                        <Route path="/WarehouseCard" element={<WarehouseCard />} />
                        {user && user.userData && user.userData.role === 'admin' ? (
                            <Route path="/superadmin" element={<Superadmin />} />
                        ) : (
                            <Route path="/superadmin" element={<SuperadminLogin />} />
                        )}
                        <Route path="/chat/:userId" element={<ChatPage />} />
                        <Route path="/details" element={<DetailedView />} />
                        <Route path="/rental-agreements" element={<RentalAgreements />} />
                        <Route path="/create-agreement" element={<CreateAgreement />} />
                        {/* Add the Conversation component route */}
                        <Route path="/conversation/:conversationId" element={<Conversation />} />
                        {/* Add the ChatPage component route */}
                        <Route path="/chat" element={<ChatPage />} />
                        
                    </Routes>
                </main>
             
            </div>
        </Router>
    );
}

export default App;
