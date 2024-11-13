import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, firestore } from '../firebase';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import './SuperadminLogin.css';

function SuperadminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const navigate = useNavigate();

    const handleEmailChange = (e) => setEmail(e.target.value);
    const handlePasswordChange = (e) => setPassword(e.target.value);

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
            const { user } = await auth.signInWithEmailAndPassword(email, password);
            const superadminRef = firestore.collection('superadmins').doc(user.uid);
            const superadminSnapshot = await superadminRef.get();
    
            if (superadminSnapshot.exists) {
                const superadminData = superadminSnapshot.data();
                if (superadminData.role === 'admin') {
                    navigate('/superadmin');
                } else {
                    setModalMessage('You are not authorized as an admin.');
                    setShowModal(true);
                    await auth.signOut();
                }
            } else {
                setModalMessage('You are not authorized as an admin.');
                setShowModal(true);
                await auth.signOut();
            }
        } catch (error) {
            console.log('Firebase Error Code:', error.code); // Debug log
    
            // Handle common Firebase authentication errors
            if (error.code === 'auth/wrong-password') {
                setModalMessage('Incorrect password. Please try again.');
            } else if (error.code === 'auth/user-not-found') {
                setModalMessage('No account found with this email. Please check your email.');
            } else if (error.code === 'auth/invalid-email') {
                setModalMessage('Invalid email format. Please enter a valid email.');
            } else if (error.code === 'auth/network-request-failed') {
                setModalMessage('Network error. Please check your connection and try again.');
            } else {
                setModalMessage('Incorrect password or email. Please try again.');
            }
    
            setShowModal(true);
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
                    <button
                        type="submit"
                        className="bg-black text-white font-bold py-3 px-3 rounded-lg focus:outline-none focus:shadow-outline hover:bg-gray-900 mt-1"
                    >
                        Login
                    </button>
                </form>
                <p className="text-center mt-4">
                    Don't have an account?{' '}
                    <a href="/superadmin-registration" className="text-blue-500 hover:underline">
                        Register here
                    </a>
                </p>
            </div>

            {/* Error Modal */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-2xl shadow-lg max-w-sm w-full transition-transform duration-300 ease-in-out">
                        {/* Close Button */}
                        <button
                            className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-2xl"
                            onClick={closeModal}
                        >
                            &times;
                        </button>

                        {/* Icon and Message */}
                        <div className="flex flex-col items-center">
                            <HiOutlineExclamationCircle className="text-red-500 w-14 h-14 mb-4" />
                            <p className="text-center text-gray-800 text-lg font-semibold">
                                {modalMessage}
                            </p>
                        </div>

                        {/* OK Button */}
                        <div className="flex justify-center mt-6">
                            <button
                                className="w-28 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition-all duration-300"
                                onClick={closeModal}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SuperadminLogin;
