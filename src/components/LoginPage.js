import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; // Import motion from Framer Motion
import logo from '../images/WhereHouseLogo.png';
import googleIcon from '../images/google.png';
import { auth, GoogleAuthProvider } from '../firebase';
import backIcon from '../images/back.png'; // Import the back icon image
import './LoginPage.css';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
function LoginPage() {
    const navigate = useNavigate(); // Initialize useNavigate

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showErrorMessage, setShowErrorMessage] = useState(false);
    const [loading, setLoading] = useState(false); // State for loading animation

    useEffect(() => {
        // Check if the user is already logged in (persist authentication)
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                // If user is logged in and email is verified, redirect to homepage
                if (user.emailVerified) {
                    navigate('/home');
                }
            }
        });
    
        // Cleanup function to unsubscribe from the listener when component unmounts
        return () => unsubscribe();
    }, [navigate]);
    
    const handleLoginWithEmailPassword = async () => {
        try {
            setLoading(true); // Start loading animation
    
            // Check if the password field is empty
            if (!password.trim()) {
                setErrorMessage('Please enter your password.');
                setShowErrorMessage(true);
                setLoading(false); // Stop loading animation
                return; // Return to prevent further execution
            }
    
            // Sign in with email and password
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            
            // Check if the user's email is verified
            if (!userCredential.user.emailVerified) {
                // If email is not verified, display an error notification
                setErrorMessage('Please verify your email before logging in.');
                setShowErrorMessage(true);
                setLoading(false); // Stop loading animation
                return; // Return to prevent further execution
            }
    
            // Redirect to HomePage upon successful login
            navigate('/home');
        } catch (error) {
            // Handle login errors
            if (error.code === 'auth/wrong-password') {
                // Display custom error message for wrong password
                setErrorMessage('The password you entered is incorrect.');
                setShowErrorMessage(true);
            } else if (error.code === 'auth/user-not-found') {
                // Display custom error message for non-registered email
                setErrorMessage('The email you entered is not registered.');
                setShowErrorMessage(true);
            } else {
                // For other errors, display the error message returned by Firebase
                setErrorMessage('The password or email you entered is incorrect.');
                setShowErrorMessage(true);
            }
        } finally {
            setLoading(false); // Stop loading animation
        }
    };
    
    
    const handleLoginWithGoogle = async () => {
        try {
            // Sign in with Google
            await auth.signInWithRedirect(GoogleAuthProvider);
        } catch (error) {
            // Handle login errors
            setErrorMessage(error.message);
            setShowErrorMessage(true);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen" style={{ backgroundColor: '#eeeeee' }}>
            <div className="logo-container mb-20">
                <img src={logo} alt="Logo" className="logo" style={{ width: '200px' }} />
            </div>
            <button 
                onClick={() => navigate('/')} 
                className="back-button">
                <img src={backIcon} alt="Back"/>
                <span className="button-text font-semibold">Homepage</span>
            </button>

            <motion.form 
                id="login-form" 
                className="w-full max-w-md bg-white p-8 rounded-lg shadow-md mb-48" 
                style={{width: '95vw',marginTop: '-3rem' }}
                initial={{ opacity: 0, y: -50 }} // Initial motion values
                animate={{ opacity: 1, y: 0 }} // Animation motion values
                transition={{ duration: 0.5 }} // Animation duration
            >
                <h2 className="text-4xl font-bold mb-6 text-left">Log in</h2>

                {showErrorMessage && (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-2xl shadow-lg max-w-sm w-full transition-transform duration-300 ease-in-out">
            {/* Close Button */}
            <button
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-2xl"
                onClick={() => setShowErrorMessage(false)}
            >
                &times;
            </button>

            {/* Icon and Message */}
            <div className="flex flex-col items-center">
                <HiOutlineExclamationCircle className="text-red-500 w-14 h-14 mb-4" />
                <p className="text-center text-gray-800 text-lg font-semibold">
                    <strong className="font-bold"></strong> {errorMessage}
                </p>
            </div>

            {/* OK Button */}
            <div className="flex justify-center mt-6">
                <button
                    className="w-28 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition-all duration-300"
                    onClick={() => setShowErrorMessage(false)}
                >
                    OK
                </button>
            </div>
        </div>
    </div>
)}

                <div className="mb-2">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">Email</label>
                    <input 
                        className="rounded-lg shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-custom-input" 
                        id="email" 
                        type="email" 
                        placeholder="Email address" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                    />
                </div>
                <div className="mb-2">
                    <label className="block text-gray-700 text-sm font-bold mb-2 mt-4" htmlFor="password">Password</label>
                    <input 
                        className="rounded-lg shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline bg-custom-input" 
                        id="password" 
                        type="password" 
                        placeholder="Password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                    />
                </div>
                <p className="text-xs text-custom-color hover:text-gray-800 text-right mb-2">
                    <Link to="/forgot-password" className="underline">Forgot password?</Link>
                </p>
                <div className="mb-2">
                    <button 
                        className="bg-black text-white font-bold py-2 px-3 rounded-lg focus:outline-none focus:shadow-outline hover:bg-gray-900 mt-1" 
                        type="button" 
                        style={{ width: '100%' }}
                        onClick={handleLoginWithEmailPassword}
                    >
                        {loading ? 'Logging in...' : 'Log in'}
                    </button>
                  
                    <hr className="my-6 border-gray-400" style={{ width: '100%' }} />
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-bigger">Don't have an account yet?</span>
                    <Link to="/signup" className="border-2 border-custom-color text-custom-color font-relative-pro py-1.5 px-4 rounded-lg focus:outline-none focus:shadow-outline bg-transparent-hover  hover:bg-gray-200 hover:text-gray-900">Sign up</Link>
                </div>
            </motion.form>
        </div>
    );
}

export default LoginPage;
