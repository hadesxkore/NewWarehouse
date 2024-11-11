import React, { useState } from 'react';
import { auth, firestore } from '../firebase'; // Import Firebase authentication and Firestore
import { Navigate } from 'react-router-dom'; // Import Navigate from react-router-dom
import emailjs from 'emailjs-com'; // Import EmailJS
import { HiKey, HiMail  } from 'react-icons/hi'
function SuperadminRegistration() {
    const [email, setEmail] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [password, setPassword] = useState('');
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const [isPasscodeVerified, setIsPasscodeVerified] = useState(false);
    const [passcode, setPasscode] = useState('');
    const [showPasscodeModal, setShowPasscodeModal] = useState(true);
    const [showPasscodeSentModal, setShowPasscodeSentModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [generatedPasscode, setGeneratedPasscode] = useState('');  // Store generated passcode

    // Generate a random passcode for demonstration purposes
    const generatePasscode = () => {
        const generatedPasscode = Math.floor(100000 + Math.random() * 900000); // 6-digit passcode
        setGeneratedPasscode(generatedPasscode); // Store the generated passcode
        sendPasscodeEmail(generatedPasscode);
    };

    // Send the passcode to the superadmin's email
    const sendPasscodeEmail = (generatedPasscode) => {
        const templateParams = {
            passcode: generatedPasscode,
            recipient_email: 'kobievillanueva23@gmail.com',
        };

        emailjs
            .send('service_287nkdg', 'template_kidurrh', templateParams, 'SCsg9WSjncPID55No')
            .then((response) => {
                console.log('Passcode sent successfully:', response);
                setShowPasscodeModal(false);
                setShowPasscodeSentModal(true);
            })
            .catch((error) => {
                console.error('Error sending passcode email:', error);
            });
    };

    // Handle passcode verification
    const handleVerifyPasscode = () => {
        if (passcode === generatedPasscode.toString()) {  // Compare with dynamically generated passcode
            setIsPasscodeVerified(true);
            setShowPasscodeSentModal(false);
        } else {
            setErrorMessage('Invalid passcode. Please try again.');
        }
    };

    // Handle registration
    const handleRegistration = async (e) => {
        e.preventDefault();
        try {
            const { user } = await auth.createUserWithEmailAndPassword(email, password);

            await firestore.collection('superadmins').doc(user.uid).set({
                email,
                displayName,
                role: 'admin',
                createdTimestamp: new Date(),
                lastLoginTimestamp: null,
                profilePicture: '',
                additionalPermissions: {},
            });

            // Send welcome email after successful registration
            sendWelcomeEmail(user.uid, email, displayName);

            setRegistrationSuccess(true);
        } catch (error) {
            console.error('Error registering superadmin:', error);
        }
    };

    // Send welcome email function using EmailJS
    const sendWelcomeEmail = (userId, userEmail, userDisplayName) => {
        const templateParams = {
            admin: userDisplayName,
            superadmin: 'Superadmin', // Or you can dynamically pass this if needed
            message: `Welcome, ${userDisplayName}! You have been successfully registered as a Superadmin.`,
        };

        emailjs
            .send('service_287nkdg', 'template_kidurrh', templateParams, 'SCsg9WSjncPID55No')
            .then((response) => {
                console.log('Email sent successfully:', response);
            })
            .catch((error) => {
                console.error('Error sending email:', error);
            });
    };

    if (registrationSuccess) {
        return <Navigate to="/superadmin" />;
    }

    return (
        <div className="flex justify-center items-center h-screen">
           {/* Passcode Modal for generating the passcode */}
           {showPasscodeModal && (
    <div className="fixed inset-0 flex justify-center items-center bg-white bg-opacity-50">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            {/* Icon Section */}
            <div className="text-center mb-6">
                <HiKey className="text-6xl text-yellow-500 mx-auto" />
            </div>

            {/* Title Section */}
            <h2 className="text-3xl font-semibold text-center text-gray-900 mb-4">
                Generate Passcode
            </h2>

            {/* Message Section */}
            <p className="text-gray-600 text-lg text-center mb-6">
                To proceed with the superadmin registration, please generate a secure one-time passcode.
                <br />
                Click the button below to get your passcode.
            </p>

            {/* Button Section */}
            <button
                onClick={generatePasscode}
                className="bg-black text-white font-semibold py-3 px-6 rounded-lg focus:outline-none hover:bg-gray-800 w-full transition duration-200"
            >
                Generate Passcode
            </button>

            {/* Additional Instructions */}
            <p className="text-center text-sm text-gray-500 mt-4">
                If you did not request this, please close this modal.
            </p>
        </div>
    </div>
)}

{showPasscodeSentModal && (
    <div className="fixed inset-0 flex justify-center items-center bg-white bg-opacity-50">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            {/* Icon Section */}
            <div className="text-center mb-6">
                <HiMail className="text-6xl text-blue-600 mx-auto" />
            </div>

            {/* Title Section */}
            <h2 className="text-3xl font-semibold text-center text-gray-900 mb-4">
                Passcode Sent
            </h2>

            {/* Message Section */}
            <p className="text-gray-600 text-lg text-center mb-6">
                A passcode has been sent to the superadmin's email. Please check your inbox for the next steps.
            </p>

            {/* Button Section */}
            <button
                onClick={() => setShowPasscodeSentModal(false)}
                className="bg-black text-white font-semibold py-3 px-6 rounded-lg focus:outline-none hover:bg-gray-800 w-full transition duration-200"
            >
                Proceed to Passcode Verification
            </button>
        </div>
    </div>
)}

{!showPasscodeModal && !showPasscodeSentModal && !isPasscodeVerified && (
    <div className="fixed inset-0 flex justify-center items-center bg-white bg-opacity-50">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            {/* Title Section */}
            <h2 className="text-3xl font-semibold text-center text-gray-900 mb-6">
                Enter Passcode
            </h2>

            {/* Input Section */}
            <input
                type="text"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-lg text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                placeholder="Enter your one-time passcode"
            />

            {/* Error Message */}
            {errorMessage && (
                <p className="text-red-500 text-sm text-center mb-4">
                    {errorMessage}
                </p>
            )}

            {/* Button Section */}
            <button
                onClick={handleVerifyPasscode}
                className="bg-black text-white font-semibold py-3 px-6 rounded-lg focus:outline-none hover:bg-gray-800 w-full transition duration-200"
            >
                Verify Passcode
            </button>
        </div>
    </div>
)}


            {/* Registration Form (only shown after passcode verification) */}
            {!showPasscodeModal && !showPasscodeSentModal && isPasscodeVerified && (
                <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 w-full max-w-md">
                    <h2 className="text-2xl font-bold mb-4 text-center">Superadmin Registration</h2>
                    <form onSubmit={handleRegistration}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-l font-bold mb-2" htmlFor="email">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="example@example.com"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-l font-bold mb-2" htmlFor="displayName">
                                Display Name
                            </label>
                            <input
                                type="text"
                                id="displayName"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                required
                                className="appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="Admin"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-l font-bold mb-2" htmlFor="password">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="Password"
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-black text-white font-bold py-2 px-4 rounded-lg focus:outline-none hover:bg-gray-900 w-full"
                        >
                            Register
                        </button>
                    </form>

            {/* Login Link */}
            <p className="text-center text-sm text-gray-500 mt-6">
                Already have an account?{' '}
                <a
                    href="/superadmin"
                    className="text-blue-600 font-semibold hover:underline"
                >
                    Login here
                </a>
            </p>
                </div>
            )}
        </div>
    );
}

export default SuperadminRegistration;
