import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion'; // Import motion from Framer Motion
import logo from '../images/WhereHouseLogo.png';
import googleIcon from '../images/google.png';
import backIcon from '../images/back.png';
import { auth, firestore } from '../firebase'; // Import auth and firestore from Firebase
import firebase from 'firebase/compat/app'; // Import firebase from Firebase (ensure it's properly imported)

import './LoginPage.css';

function SignUpPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        if (!user.emailVerified) {
          setErrorMessage('Please verify your email before logging in.');
          auth.signOut(); // Sign out the user if email is not verified
        } else {
          navigate('/');
        }
      }
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signUpWithEmailPassword = async (email, password) => {
    try {
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }

      setLoading(true);
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);

      // Send email verification
      await userCredential.user.sendEmailVerification();

      // Get the current date
      const currentDate = new Date();

      // Create a user profile document with the registration date and userRole
      await firestore.collection('users').doc(userCredential.user.uid).set({
        email: email,
        registrationDate: currentDate, // Include the registration date
        userRole: 'user' // Set userRole to 'user' for new registrations
      });

      // Navigate to the verification page
      navigate(`/verify?email=${email}`);
    } catch (error) {
      console.error(error.message);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      await auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    } catch (error) {
      console.error(error.message);
      setErrorMessage(error.message);
    }
  };
  const handleSignUp = (e) => {
    e.preventDefault();
    signUpWithEmailPassword(email, password);
  };

  const calculatePasswordStrength = (password) => {
    const specialCharRegex = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;
    const numberRegex = /[0-9]/;
    const uppercaseRegex = /[A-Z]/;

    const hasSpecialChar = specialCharRegex.test(password);
    const hasNumber = numberRegex.test(password);
    const hasUppercase = uppercaseRegex.test(password);

    if (password.length >= 8 && hasSpecialChar && hasNumber && hasUppercase) {
      setPasswordStrength('Strong');
    } else if (password.length >= 6 && (hasSpecialChar || hasNumber || hasUppercase)) {
      setPasswordStrength('Moderate');
    } else {
      setPasswordStrength('Weak');
    }
  };

  const isPasswordValid = () => {
    const specialCharRegex = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;
    const numberRegex = /[0-9]/;
    const uppercaseRegex = /[A-Z]/;

    const hasSpecialChar = specialCharRegex.test(password);
    const hasNumber = numberRegex.test(password);
    const hasUppercase = uppercaseRegex.test(password);

    return password.length >= 8 && hasSpecialChar && hasNumber && hasUppercase;
  };

  const showErrorMessage = () => {
    if (password && !isPasswordValid()) {
      return 'Please follow the password instructions.';
    }
    return errorMessage;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen" style={{ backgroundColor: '#eeeeee' }}>
      <div className="logo-container text-center mb-44">
        <img src={logo} alt="Logo" className="logo" style={{ width: '200px', margin: '0 auto'}} />
      </div>
      <button 
        onClick={() => navigate('/')} 
        className="back-button"
      >
        <img src={backIcon} alt="Back" />
        <span className="button-text font-semibold">Homepage</span>
      </button>
      <motion.div 
        className="signup-form-container" 
        style={{ maxWidth: '450px', marginTop: '-11rem', width: '95vw' }}
        initial={{ opacity: 0, y: -50 }} // Initial motion values
        animate={{ opacity: 1, y: 0 }} // Animation motion values
        transition={{ duration: 0.5 }} // Animation duration
      >
        <form id="signup-form" className="bg-white p-6 sm:p-8 rounded-lg shadow-md mx-auto" onSubmit={handleSignUp}>
          <h2 className="text-3xl sm:text-3xl font-bold mb-4 sm:mb-6 text-LEFT">Sign Up</h2>
          {showErrorMessage() && <p className="text-red-600 mb-2 sm:mb-4">{showErrorMessage()}</p>}
          <div className="mb-3 sm:mb-4">
            <label className="block text-gray-700 text-l font-bold mb-1 sm:mb-2" htmlFor="email">Email</label>
            <input 
              className="rounded-lg shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-custom-input" 
              id="email" 
              type="email" 
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          <div className="mb-3 sm:mb-2">
            <label className="block text-gray-700 text-l font-bold mb-1 sm:mb-2" htmlFor="password">Password</label>
            <input 
              className="rounded-lg shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-1 sm:mb-3 leading-tight focus:outline-none focus:shadow-outline bg-custom-input" 
              id="password" 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                calculatePasswordStrength(e.target.value);
              }} 
            />
            {password && (
              <p className={`text-xs mb-1 ${passwordStrength === 'Weak' ? 'text-red-500' : passwordStrength === 'Moderate' ? 'text-orange-500' : 'text-green-500'}`}>
                Password Strength: {passwordStrength}
              </p>
            )}
            <p className="text-xs mb-1 text-gray-600">
              Password must contain at least 8 characters, including one special character, one number, and one uppercase letter.
            </p>
          </div>
          <div className="mb-1 sm:mb-2">
            <label className="block text-gray-700 text-l font-bold mb-1 sm:mb-2" htmlFor="confirmPassword">Confirm Password</label>
            <input 
              className="rounded-lg shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-1 sm:mb-3 leading-tight focus:outline-none focus:shadow-outline bg-custom-input" 
              id="confirmPassword" 
              type="password" 
              placeholder="Confirm Password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} 
            />
          </div>
          <button 
            className="bg-black text-white font-bold py-2 px-3 rounded-lg focus:outline-none focus:shadow-outline hover:bg-gray-900 mt-1 w-full" 
            type="submit"
            disabled={!isPasswordValid()} 
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
         
          
          <p className="text-xs text-gray-700 mt-4 sm:mb-4">
            By clicking "Create account" above, you acknowledge that you will receive updates from the WhereHouse team and that you have read, understood            By clicking "Create account" above, you acknowledge that you will receive updates from the WhereHouse team and that you have read, understood, and agreed to WhereHouse Library's Terms & Conditions, Licensing Agreement and Privacy Policy.
          </p>
          <hr className="line" />
          <div className="cta-container flex justify-between items-center mb-1 sm:mb-2 pt-2 sm:pt-4">
            <span className="text-gray-900 text-sm sm:text-bigger">Already have an account?</span>
            <Link to="/login" className="bg-transparent border-2 border-custom-color text-custom-color font-relative-pro py-1.5 px-4 rounded-lg focus:outline-none focus:shadow-outline login-button hover:bg-gray-200 hover:text-gray-900">Login</Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default SignUpPage;

