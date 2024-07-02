import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import { auth, firestore } from '../firebase';
import error1 from '../images/error1.png';
import './SuperadminLogin.css';

function SuperadminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState(''); // State to hold modal message
    const navigate = useNavigate(); // Initialize useNavigate

    const handleEmailChange = (e) => setEmail(e.target.value);
    const handlePasswordChange = (e) => setPassword(e.target.value);

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission

        try {
            // Sign in with email and password
            const { user } = await auth.signInWithEmailAndPassword(email, password);

            // Fetch additional details from Firestore
            const superadminRef = firestore.collection('superadmins').doc(user.uid);
            const superadminSnapshot = await superadminRef.get();

            if (superadminSnapshot.exists) {
                const superadminData = superadminSnapshot.data();
                if (superadminData.role === 'admin') {
                    // Navigate to superadmin page on successful login
                    console.log('Admin logged in');
                    navigate('/superadmin');
                } else {
                    // User is not authorized as an admin, show modal and log out
                    setModalMessage('You are not authorized as an admin');
                    setShowModal(true);
                    await auth.signOut(); // Log out the user
                }
            } else {
                // User does not exist in the 'superadmins' collection
                setModalMessage('You are not authorized as an admin');
                setShowModal(true);
                await auth.signOut(); // Log out the user
            }
        } catch (error) {
            setError(error.message);
        }
    };

    const closeModal = () => setShowModal(false);

    return (
        <div className="custom-login-container">
            <div className="custom-login-wrapper">
                <h2 className="custom-login-heading">Admin Login</h2>
                <form onSubmit={handleSubmit} className="custom-login-form">
                    <div className="custom-form-group">
                        <input
                            type="email"
                            value={email}
                            onChange={handleEmailChange}
                            required
                            className="custom-form-input"
                            placeholder="Email"
                        />
                    </div>
                    <div className="custom-form-group">
                        <input
                            type="password"
                            value={password}
                            onChange={handlePasswordChange}
                            required
                            className="custom-form-input"
                            placeholder="Password"
                        />
                    </div>
                    <button type="submit" className="bg-black text-white font-bold py-3 px-3 rounded-lg focus:outline-none focus:shadow-outline hover:bg-gray-900 mt-1">Login</button>
                    {error && <div className="custom-error">{error}</div>}
                </form>
                <p className="text-center mt-4">
                    Don't have an account? <a href="/superadmin-registration" className="text-blue-500 hover:underline">Register here</a>
                </p>
            </div>
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                        <button 
                            className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
                            onClick={closeModal}
                        >
                            &times;
                        </button>
                        <div className="flex items-center justify-center">
                            
                                <img src={error1} alt="Error Icon" className="h-14 w-14" />
                            
                        </div>
                        <p className="text-center text-lg font-semibold mt-4">{modalMessage}</p>
                    </div>
                </div>
            )}



        </div>
    );
}

export default SuperadminLogin;
