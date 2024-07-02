import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, firestore } from '../firebase'; // Import auth and firestore from your firebase.js file
import firebase from 'firebase/compat/app'; // Import firebase itself
import 'firebase/compat/auth'; // Import auth module
import 'firebase/compat/firestore'; // Import firestore module
import { motion } from 'framer-motion';
import error1 from '../images/error1.png';

import defaultProfileImage from '../images/default-profile-image.png';
// Import CSS file for animations
import './profile-page.css';
import logo from '../images/logo.png';
import userIcon from '../images/userwhite.png';
import userProfileIcon from '../images/user.png';
import logoutIcon from '../images/logout1.png';
import dashboardIcon from '../images/dashboard.png';
import locationIcon from '../images/location.png';
import searchIcon from '../images/search.png';
import { getAuth, EmailAuthProvider } from 'firebase/auth'; // Make sure to import these

import checkedIcon from '../images/checked.png';
import errorIcon from '../images/mark.png';
import Navbar from './Navbar';

const ProfilePage = () => { 
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
   
    const [isVerified, setIsVerified] = useState(false); // Track verification status

    const [fieldBorderColors, setFieldBorderColors] = useState({
        // Define initial border colors for each field
        first_name: 'gray-300',
        last_name: 'gray-300',
        birthdate: 'gray-300',
        address: 'gray-300',
        contact_number: 'gray-300',
        email: 'gray-300'
    });
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [showDeleteSuccessPopup, setShowDeleteSuccessPopup] = useState(false)
    const [showVerificationPopup, setShowVerificationPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [invalidEmailError, setInvalidEmailError] = useState(false);
    const [showPasswordMatchErrorPopup, setShowPasswordMatchErrorPopup] = useState(false);
    const [showDeleteNotAllowedPopup, setShowDeleteNotAllowedPopup] = useState(false);

    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [showDontMatchPopup, setShowDontMatchPopup] = useState(false);
// Define state variables for error popups
const [showDeleteErrorPopup, setShowDeleteErrorPopup] = useState(false);
const [showReauthenticationErrorPopup, setShowReauthenticationErrorPopup] = useState(false);
const [documents, setDocuments] = useState([]);

    const [showAuthProviderPopup, setShowAuthProviderPopup] = useState(false);
    const [profileImageOpacity, setProfileImageOpacity] = useState(1);  
    const [profileImage, setProfileImage] = useState(defaultProfileImage);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [email, setEmail] = useState('');
    
    const [password, setPassword] = useState('');


    const handleDocumentsButtonClick = () => {
        setIsModalOpen(true); // Open modal for verification
    };

    const handleVerifyUser = () => {
        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                setIsVerified(true);
                fetchDocuments(); // Fetch documents after successful verification
            })
            .catch((error) => {
                setErrorMessage(error.message);
            });
    };
 const fetchDocuments = () => {
        const user = auth.currentUser;
        if (user) {
            firestore.collection('warehouses')
                .where('userUid', '==', user.uid) // Query documents where userUid matches current user's UID
                .get()
                .then((querySnapshot) => {
                    if (!querySnapshot.empty) {
                        querySnapshot.forEach((doc) => {
                            const userData = doc.data();
                            setDocuments(userData); // Set fetched documents to state
                        });
                    } else {
                        console.log('No documents found for the current user.');
                        setDocuments(null); // Reset documents state if no documents found
                    }
                })
                .catch((error) => {
                    console.error('Error getting documents:', error);
                });
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEmail('');
        setPassword('');
        setIsVerified(false);
    };

    const handleDeleteConfirmation = () => {
        setShowDeleteConfirmation(true);
    };

    const handleCloseDeleteConfirmation = () => {
        setShowDeleteConfirmation(false);
    };
    const handleOkButtonClick = () => {
        setShowDeleteSuccessPopup(false);
        // Navigate to another page to trigger a full refresh of the ProfilePage component
        navigate('/');
    };

    const handleVerificationPopup = () => {
        // Close the delete confirmation popup
        setShowDeleteConfirmation(false);
        // Show the verification popup
        setShowVerificationPopup(true);
    };
    
    const handleCloseVerificationPopup = () => {
        setShowVerificationPopup(false);
    };
    const handleDeleteAccount = async () => {
        const user = auth.currentUser;
        const userEmail = formData.email; // Get the user's email from the form data
        const enteredEmail = email; // Get the entered email from the input field
        const enteredPassword = password; // Get the entered password from the input field
        const enteredConfirmPassword = confirmPassword; // Get the entered confirm password from the input field

        // Check if the entered email matches the user's email
        if (enteredEmail !== userEmail) {
            setErrorMessage('Invalid email.'); // Set an error message
            setInvalidEmailError(true); // Set the invalid email error flag
            return;
        }

        if (enteredPassword !== enteredConfirmPassword) {
            setErrorMessage('Passwords do not match.'); // Set an error message
            setShowPasswordMatchErrorPopup(true); // Show error popup
            return;
        }

        // Check if the user has lease agreements
        const hasLease = await hasLeaseAgreement();

        // Check if the user has uploaded warehouses
        const hasWarehouses = await hasUploadedWarehouses();

        // If user has lease agreements or uploaded warehouses, show popup and exit
        if (hasLease || hasWarehouses) {
            setShowDeleteNotAllowedPopup(true);
            setShowVerificationPopup(false);
            return;
        }

        // Reauthenticate the user before deleting the account
        const credential = firebase.auth.EmailAuthProvider.credential(userEmail, enteredPassword);

        user.reauthenticateWithCredential(credential)
            .then(() => {
                // Reauthentication successful, proceed with account deletion
                console.log("User reauthenticated successfully.");
                // Delete the user account
                return user.delete();
            })
            .then(() => {
                // Account deleted successfully
                console.log("Account deleted successfully.");
                // Delete the user document from Firestore
                firestore.collection('users').doc(user.uid).delete()
                    .then(() => {
                        console.log("User document deleted successfully.");
                        // Set success message or show success popup
                        setShowDeleteSuccessPopup(true);
                    })
                    .catch((error) => {
                        // Handle errors during user document deletion
                        console.error("Error deleting user document:", error.message);
                        // Set error message or show error popup
                        setShowErrorPopup(true);
                    });
            })
            .catch((error) => {
                // Handle errors during account deletion
                console.error("Error deleting account:", error.message);
                // Set error message or show error popup
                setShowErrorPopup(true);
            });
    };
    const hasLeaseAgreement = async () => {
        const userUid = auth.currentUser.uid; // Get current user's UID from Firebase Auth
        try {
            const leaseAgreementsRef = firestore.collection('rentalAgreement');
            const snapshot = await leaseAgreementsRef.where('userUid', '==', userUid).get();
            return !snapshot.empty; // Return true if there are lease agreements, false otherwise
        } catch (error) {
            console.error('Error checking lease agreements:', error.message);
            return false; // Return false on error or if no lease agreements found
        }
    };

    const hasUploadedWarehouses = async () => {
        const userUid = auth.currentUser.uid; // Get current user's UID from Firebase Auth
        try {
            const warehousesRef = firestore.collection('warehouses');
            const snapshot = await warehousesRef.where('userUid', '==', userUid).get();
            return !snapshot.empty; // Return true if there are uploaded warehouses, false otherwise
        } catch (error) {
            console.error('Error checking uploaded warehouses:', error.message);
            return false; // Return false on error or if no warehouses found
        }
    };
    
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        birthdate: '',
        address: '',
        contact_number: '',
        email: ''
    });
    const [successMessage, setSuccessMessage] = useState('');
    const [editMode, setEditMode] = useState({
        first_name: false,
        last_name: false,
        birthdate: false,
        address: false,
        contact_number: false,
        email: false
    });
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordStrength, setPasswordStrength] = useState('');
    const [initialFormData, setInitialFormData] = useState({});
    const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
    const [confirmSave, setConfirmSave] = useState(false);

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
    const openDocument = (url) => {
        window.open(url, '_blank');
    };
    const isPasswordValid = () => {
        const specialCharRegex = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;
        const numberRegex = /[0-9]/;
        const uppercaseRegex = /[A-Z]/;

        const hasSpecialChar = specialCharRegex.test(newPassword);
        const hasNumber = numberRegex.test(newPassword);
        const hasUppercase = uppercaseRegex.test(newPassword);

        return newPassword.length >= 8 && hasSpecialChar && hasNumber && hasUppercase;
    };

    const showErrorMessage = () => {
        if (newPassword && !isPasswordValid()) {
            return 'Please follow the password instructions.';
        }
        return errorMessage;
    };

    const handleChangePassword = () => {
        // Check if the new password and confirm password match
        if (newPassword !== confirmPassword) {
            setErrorMessage('Passwords do not match.');
            return;
        }
        if (!currentPassword || !newPassword || !confirmPassword) {
            setErrorMessage('Please fill in all fields.');
            return;
        }

        // Check if the user is authenticated using email/password
   const user = auth.currentUser;
   if (user.providerData[0].providerId !== 'password') {
       setShowAuthProviderPopup(true);
       return;
   }
        // Reauthenticate the user with their current password before changing the password
        const credential = firebase.auth.EmailAuthProvider.credential(
            user.email,
            currentPassword
        );
    
        user.reauthenticateWithCredential(credential)
            .then(() => {
                // If reauthentication is successful, update the password
                return user.updatePassword(newPassword);
            })
            .then(() => {
                // Password updated successfully
                setShowSuccessPopup(true);
              
                // Clear the input fields
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            })
            
            .catch((error) => {
                // Handle errors
                console.error("Error updating password:", error.message);
                setShowErrorPopup(true); // Show the error popup
            });
            
    };
    
    
    
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                setIsLoggedIn(true);
                const userRef = firestore.collection('users').doc(user.uid);
                const userData = await userRef.get();
                if (userData.exists) {
                    const userDataObj = userData.data();
                    setFormData(userDataObj);
                    setInitialFormData(userDataObj);
                    setProfileImage(userDataObj.profileImage || defaultProfileImage); // Update profileImage state with URL from Firestore, or use defaultProfileImage if not available
                } else {
                    await userRef.set({
                        first_name: '',
                        last_name: '',
                        birthdate: '',
                        address: '',
                        contact_number: '',
                        email: user.email
                    });
                }
            } else {
                setIsLoggedIn(false);
            }
        });
        return () => unsubscribe();
    }, []);
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                setIsLoggedIn(true);
                const userRef = firestore.collection('users').doc(user.uid);
                const userData = await userRef.get();
                if (userData.exists) {
                    const userDataObj = userData.data();
                    setProfileImage(userDataObj.profileImage || defaultProfileImage);
                } else {
                    await userRef.set({
                        first_name: '',
                        last_name: '',
                        birthdate: '',
                        address: '',
                        contact_number: '',
                        email: user.email
                    });
                }
            } else {
                setIsLoggedIn(false);
            }
        });
        return () => unsubscribe();
    }, []);
    

    const confirmAndLogout = () => {
        auth.signOut()
            .then(() => {
                navigate('/');
            })
            .catch(error => {
                console.error('Error signing out:', error);
            });
    };

    const handleLogout = () => {
        setShowConfirmation(true);
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleEdit = (field, e) => {
        e.preventDefault();
        if (editMode[field]) {
            setFormData({ ...formData, [field]: initialFormData[field] });
        }
        setEditMode({ ...editMode, [field]: !editMode[field] });
    
        // Animate border color change
        setFieldBorderColor(field, editMode[field] ? 'gray-300' : 'blue-500');
    };
        const setFieldBorderColor = (field, color) => {
        setFieldBorderColors({ ...fieldBorderColors, [field]: color });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormData({
            first_name: e.target.first_name.value,
            last_name: e.target.last_name.value,
            birthdate: e.target.birthdate.value,
            address: e.target.address.value,
            contact_number: e.target.contact_number.value,
            email: e.target.email.value,
            profileImage: profileImage
        });
        setShowSaveConfirmation(true);
    };

    const handleSaveConfirmation = () => {
        setConfirmSave(true);
        setShowSaveConfirmation(false);
    };

  // Inside handleProfileImageChange function

const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            const imageURL = reader.result;
            // Fade out the old image
            setProfileImageOpacity(0);
            setTimeout(() => {
                setProfileImage(imageURL);
                localStorage.setItem('profileImage', imageURL);
                // Fade in the new image
                setProfileImageOpacity(1);
            }, 300); // Adjust timing as needed
        };
        reader.readAsDataURL(file);
    }
};


    useEffect(() => {
        if (confirmSave) {
            const user = auth.currentUser;
            const userRef = firestore.collection('users').doc(user.uid);
            userRef.update({
                ...formData,
                profileImage: profileImage
            })
            .then(() => {
                setSuccessMessage('Profile updated successfully');
                setEditMode({
                    first_name: false,
                    last_name: false,
                    birthdate: false,
                    address: false,
                    contact_number: false,
                    email: false,
                    profileImage:false
                });
                setConfirmSave(false);
            })
            .catch(error => {
                console.error('Error updating profile:', error);
            });
        }
    }, [confirmSave, formData, profileImage]);
    return (

        <div>
           <Navbar />
            <div style={{ backgroundColor: '#eeeeee', minHeight: '100vh' }}>
            
            <div className="flex-grow container mx-auto mt-8 flex justify-center">
                <div className="w-full p-5 md:w-1/4">
                <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.1}}
        >
            <div className="bg-white rounded-lg shadow-lg p-6 profile-card">
                {/* Profile text */}
                <h1 className="text-xl font-bold text-center mb-4 ">Profile</h1>
                <div className="mb-4">
                    <img src={profileImage} alt="Profile" className="w-full h-auto mb-4 rounded-lg" style={{ maxWidth: '220px', maxHeight: '210px', margin: 'auto', display: 'block' }} />
                    <div className="mb-4 text-center mt-4">
                        <label htmlFor="profileImage" className="block text-gray-700 cursor-pointer mb-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-block">
                            Upload Profile 
                        </label>
                        <input
                            type="file"
                            id="profileImage"
                            className="hidden"
                            onChange={handleProfileImageChange} // Add an onChange event handler to handle file selection
                        />
                    </div>
                </div>
                <p className="text-gray-700 text-center">{formData.email}</p>
                {/* Thin line */}
<div className="inline-block border-b-2 border-gray-400 h-1 w-full mt-6"></div>
{/* Close Account button */}
<div className="flex justify-center mt-4">
    <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onClick={handleDeleteConfirmation}>Close Account</button>
</div>
            </div>
            
        </motion.div>
                   {/* Your Documents Card */}
                   <div className="w-full md:w-3/3 mt-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.1}}
                >
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-bold text-center mb-4">Your Documents</h2>
                        <div className="flex justify-center">
                            <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded" onClick={handleDocumentsButtonClick}>
                                Documents
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>     
            </div>
           {/* Modal for Document Verification and Document Viewing */}
{isModalOpen && (
    <div className="modal fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.1 }}
            className="modal-content bg-white p-4 max-w-3xl max-h-3/4 overflow-y-auto relative"
        >
            <button className="absolute top-2 right-2 text-gray-700 hover:text-gray-900" onClick={handleModalClose}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            {isVerified ? ( // Render document view if verified
                <div>
                    <div className="modal-header flex justify-center items-center mb-4">
                        <h2 className="text-xl font-bold">Uploaded Documents</h2>
                    </div>
                    <div className="modal-body">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out"
            onClick={() => openDocument(documents.identificationProof)}
        >
            Identification Proof
        </button>
        <button
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out"
            onClick={() => openDocument(documents.addressProof)}
        >
            Address Proof
        </button>
        <button
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out"
            onClick={() => openDocument(documents.ownershipDocuments)}
        >
            Ownership Documents
        </button>
        <button
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out"
            onClick={() => openDocument(documents.previousTenancyDetails)}
        >
            Previous Tenancy Details
        </button>
        <button
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out"
            onClick={() => openDocument(documents.businessPermit)}
        >
            Business Permit
        </button>
        <button
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out"
            onClick={() => openDocument(documents.buildingPermit)}
        >
            Building Permit
        </button>
        <button
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out"
            onClick={() => openDocument(documents.maintenanceRecords)}
        >
            Maintenance Records
        </button>
    </div>
</div>

                    <div className="modal-footer mt-4">
                        <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onClick={handleModalClose}>
                            Close
                        </button>
                    </div>
                </div>
            ) : (
                <div>
                    <h2 className="text-xl font-bold text-center mb-4">Verification Required</h2>
                    <input
                        type="email"
                        placeholder="Email"
                        className="block w-full px-4 py-2 mb-4 border border-gray-300 rounded"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="block w-full px-4 py-2 mb-4 border border-gray-300 rounded"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded" onClick={handleVerifyUser}>
                        Verify
                    </button>
                    {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
                </div>
            )}
        </motion.div>
    </div>
)}


       
    

                <div className="flex-grow max-w-4xl bg-white rounded-lg shadow-lg p-6 md:w-2/3 ml-28 personal-info-card">

                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.4 }}
                    >

        <h2 className="text-2xl font-bold mb-4 text-center">Profile Information</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <h4 className=" mb-4 block text-red-500">*All fields are required to be filled</h4>
                            <label htmlFor="first_name" className="block text-gray-700 mb-1" >First Name:</label>
                            <div className="relative">
                                <input type="text" id="first_name" name="first_name" value={formData.first_name} onChange={handleInputChange} className={`form-input pl-3 py-2   rounded-md w-full ${editMode.first_name ? 'bg-gray-100' : 'bg-gray-300'}`} disabled={!editMode.first_name} />
                                {!editMode.first_name ? (
                                  <button className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-700" onClick={(e) => handleEdit('first_name', e)}>
                                  Edit
                              </button>
                              
                                ) : (
                                    <button className="absolute right-4 top-1/2 transform -translate-y-1/2 text-red-500 hover:text-red-700" onClick={(e) => handleEdit('first_name', e)}>
                                    Cancel
                                </button>
                                
                                )}
                            </div>
                        </div>
                        <div className="mb-6">
                            <label htmlFor="last_name" className="block text-gray-700 mb-1">Last Name:</label>
                            <div className="relative">
                                <input type="text" id="last_name" name="last_name" value={formData.last_name} onChange={handleInputChange} className={`form-input pl-3 py-2 rounded-md w-full ${editMode.last_name ? 'bg-gray-100' : 'bg-gray-300'}`} disabled={!editMode.last_name} />
                                {!editMode.last_name ? (
                                  <button className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-700" onClick={(e) => handleEdit('last_name', e)}>
                                  Edit
                              </button>
                              
                                ) : (
                                    <button className="absolute right-4 top-1/2 transform -translate-y-1/2 text-red-500 hover:text-red-700" onClick={(e) => handleEdit('last_name', e)}>
                                    Cancel
                                </button>
                                
                                )}
                            </div>
                        </div>
                        <div className="mb-6">
                            <label htmlFor="birthdate" className="block text-gray-700 mb-1">Birthdate:</label>
                            <div className="relative">
                                <input type="date" id="birthdate" name="birthdate" value={formData.birthdate} onChange={handleInputChange} className={`form-input pl-3 py-2 rounded-md w-full ${editMode.birthdate ? 'bg-gray-100' : 'bg-gray-300'}`} disabled={!editMode.birthdate} />
                                {!editMode.birthdate ? (
                                  <button className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-700" onClick={(e) => handleEdit('birthdate', e)}>
                                  Edit
                              </button>
                              
                                ) : (
                                    <button className="absolute right-4 top-1/2 transform -translate-y-1/2 text-red-500 hover:text-red-700" onClick={(e) => handleEdit('birthdate', e)}>
                                    Cancel
                                </button>
                                
                                )}
                            </div>
                        </div>
                        <div className="mb-6">
                            <label htmlFor="address" className="block text-gray-700 mb-1">Address:</label>
                            <div className="relative">
                                <input type="text" id="address" name="address" value={formData.address} onChange={handleInputChange} className={`form-input pl-3 py-2 rounded-md w-full ${editMode.address ? 'bg-gray-100' : 'bg-gray-300'}`} disabled={!editMode.address} />
                                {!editMode.address ? (
                                  <button className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-700" onClick={(e) => handleEdit('address', e)}>
                                  Edit
                              </button>
                              
                                ) : (
                                    <button className="absolute right-4 top-1/2 transform -translate-y-1/2 text-red-500 hover:text-red-700" onClick={(e) => handleEdit('address', e)}>
                                    Cancel
                                </button>
                                
                                )}
                            </div>
                        </div>
                        <div className="mb-6">
                            <label htmlFor="contact_number" className="block text-gray-700 mb-1">Contact Number:</label>
                            <div className="relative">
                                <input type="text" id="contact_number" name="contact_number" value={formData.contact_number} onChange={handleInputChange} className={`form-input pl-3 py-2 rounded-md w-full ${editMode.contact_number ? 'bg-gray-100' : 'bg-gray-300'}`} disabled={!editMode.contact_number} />
                                {!editMode.contact_number ? (
                                  <button className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-700" onClick={(e) => handleEdit('contact_number', e)}>
                                  Edit
                              </button>
                              
                                ) : (
                                    <button className="absolute right-4 top-1/2 transform -translate-y-1/2 text-red-500 hover:text-red-700" onClick={(e) => handleEdit('contact_number', e)}>
                                    Cancel
                                </button>
                                
                                )}
                            </div>
                        </div>
                        <div className="mb-6">
    <label htmlFor="email" className="block text-gray-700 mb-1">Email:</label>
    <input type="email" id="email" name="email" value={auth.currentUser ? auth.currentUser.email : ''} className="form-input pl-3 py-2 rounded-md w-full bg-gray-300" readOnly />
</div>


                        <div className="flex justify-end mb-6">
                        <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ">SAVE</button>
                        </div>
                        <div className="inline-block border-b-2 border-gray-400 h-1 w-full mt-6"></div> {/* Thin line */}

                        <div className="mb-6">
    <h2 className="text-2xl font-bold mb-4 text-center">Change Password</h2>
    {/* Current Password */}
    <div className="mb-6">
                <label htmlFor="current_password" className="block text-gray-700 mb-1">Current Password:</label>
                <div className="relative">
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Current Password"
                        className="form-input pl-3 py-2 rounded-md w-full bg-gray-300"
                    />
                </div>
            </div>
{/* New Password */}
<div className="mb-6">
                <label htmlFor="new_password" className="block text-gray-700 mb-1">New Password:</label>
                <div className="relative">
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => {
                            setNewPassword(e.target.value);
                            calculatePasswordStrength(e.target.value);
                        }}
                        placeholder="New Password"
                        className="form-input pl-3 py-2 rounded-md w-full bg-gray-300"
                    />
                </div>
                <div className={`text-${passwordStrength === 'Strong' ? 'green' : passwordStrength === 'Moderate' ? 'yellow' : 'red'}-500`}>
                    Password Strength: {passwordStrength}
                </div>
                <div className="text-gray-600">
                    Password must contain at least 8 characters, including one special character, one number, and one uppercase letter.
                </div>
            </div>
{/* Confirm Password */}
   {/* Confirm Password */}
   <div className="mb-6">
                <label htmlFor="confirm_password" className="block text-gray-700 mb-1">Confirm Password:</label>
                <div className="relative">
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm Password"
                        className="form-input pl-3 py-2 rounded-md w-full bg-gray-300"
                    />
                </div>
            </div>
  {/* CHANGE PASSWORD button */}
  <div className="flex justify-end mb-6">
                <button
                    type="button"
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                      disabled={!isPasswordValid()} 
                    onClick={handleChangePassword}
                >
                    Change Password
                </button>
            </div>
            {showErrorMessage() && <p className="text-red-600 mb-2 sm:mb-4">{showErrorMessage()}</p>}
        </div>
    
                    </form>
                    {successMessage && (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 success-popup">
        <div className="bg-white p-8 rounded-lg justify-center">
            <img src={checkedIcon} alt="Checked" className="h-10 mx-auto mb-4" />
            <p className="text-green-500 text-lg justify-center">{successMessage}</p>
            <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-8 rounded mt-5 ml-16" onClick={() => setSuccessMessage('')}>OK</button>
        </div>
    </div>
)}

                    {showSaveConfirmation && (
                        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                            <div className="bg-white p-8 rounded-lg">
                                <p className="text-gray-700 text-lg">Are you sure you want to save this?</p>
                                <div className="flex justify-center mt-4 ">
                                    <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-4" onClick={handleSaveConfirmation}>Yes</button>
                                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => setShowSaveConfirmation(false)}>No</button>
                                </div>
                            </div>
                        </div>
                    )}
                    
                     
                     {showConfirmation && (
                <motion.div
                    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.div
                        className="bg-white p-6 rounded-lg shadow-lg text-center"
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0.5 }}
                        transition={{ duration: 0.3 }}
                    >
                        <p className="text-lg font-semibold mb-4">Are you sure you want to log out?</p>
                        <div className="flex justify-center">
                        <button onClick={confirmAndLogout} className="bg-red-600 text-white px-4 py-2 rounded-lg mr-4 hover:bg-red-500 transition duration-300">Yes, Logout</button>
                            <button onClick={() => setShowConfirmation(false)} className="bg-gray-400 text-black px-4 py-2 rounded-lg hover:bg-gray-300 transition duration-300">Cancel</button>
                        </div>
                    </motion.div>
                </motion.div>
)} </motion.div>
  {showPopup && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white p-8 rounded-lg ">
                        <p className="text-red-500 text-lg ">{errorMessage}</p>
                        <button
                            onClick={() => setShowPopup(false)}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4 ml-10"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
      {showAuthProviderPopup && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white p-8 rounded-lg">
                        <p className="text-red-500 text-lg">Changing password is only available for users who signed up using email/password.</p>
                        <button
                            onClick={() => setShowAuthProviderPopup(false)}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4 block mx-auto"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
           {showSuccessPopup && (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 success-popup">
        <div className="bg-white p-8 rounded-lg">
            <img src={checkedIcon} alt="Checked" className="h-10 mx-auto mb-4" />
            <p className="text-green-500 text-lg">Password updated successfully</p>
            <button
                onClick={() => setShowSuccessPopup(false)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4 block mx-auto"
            >
                Confirm
            </button>
        </div>
    </div>
)}
{/* Password Change Error Popup */}
{showErrorPopup && (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 error-popup">
        <div className="bg-white p-8 rounded-lg">
            <img src={errorIcon} alt="Error" className="h-10 mx-auto mb-4" />
            <p className="text-red-500 text-lg">Please check your current password.</p>
            <button
                onClick={() => setShowErrorPopup(false)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4 block mx-auto"
            >
                OK
            </button>
        </div>
    </div>
)}
{/* Password Change Error Popup */}
{showDontMatchPopup && (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 error-popup">
        <div className="bg-white p-8 rounded-lg">
            <img src={errorIcon} alt="Error" className="h-10 mx-auto mb-4" />
            <p className="text-red-500 text-lg">Password doesn't match</p>
            <button
                onClick={() => setShowDontMatchPopup(false)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4 block mx-auto"
            >
                OK
            </button>
        </div>
    </div>
)}



             {/* Delete Confirmation Popup */}
             {showDeleteConfirmation && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white p-8 rounded-lg">
                        <p className="text-lg font-semibold mb-4">Are you sure you want to delete your account?</p>
                        <div className="flex justify-center">
                            <button
                                onClick={handleVerificationPopup}
                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-4"
                            >
                                Yes
                            </button>
                            <button
                                onClick={handleCloseDeleteConfirmation}
                                className="bg-gray-400 text-black font-bold py-2 px-4 rounded"
                            >
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}

  {/* Verification Popup */}
  {showVerificationPopup && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white p-8 rounded-lg max-w-lg"> {/* Adjust max-width here */}
                        <p className="text-lg font-semibold mb-4">Verification Required</p>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            className="form-input pl-3 py-2 rounded-md w-full mb-3 bg-gray-100" // Added background color
                        />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="form-input pl-3 py-2 rounded-md w-full mb-3 bg-gray-100" // Added background color
                        />
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm Password"
                            className="form-input pl-3 py-2 rounded-md w-full mb-3 bg-gray-100" // Added background color
                        />
                        <p className="text-sm text-gray-600 mb-4">By clicking 'Delete Account,' you acknowledge that this action is irreversible. The website and its developers will not be held responsible for any loss of data or access once your account is deleted. Are you sure you want to proceed?</p>
                        <div className="flex justify-end">
                            <button
                                onClick={handleDeleteAccount}
                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-4"
                            >
                                Delete Account
                            </button>
                            <button
                                onClick={handleCloseVerificationPopup}
                                className="bg-gray-400 text-black font-bold py-2 px-4 rounded"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
{showDeleteNotAllowedPopup && (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <div className="bg-white p-8 rounded-lg max-w-lg">
            <div className="flex items-center justify-center mb-4">
                <img src={error1} alt="Error Icon" className="w-14 h-14" />
            </div>
            <p className="text-lg font-semibold mb-4 text-center">Cannot Close Account</p>
            <p className="text-base text-gray-600 mb-4 text-center">
                You cannot delete your account because you have active lease agreements or warehouse records.
            </p>
            <div className="flex justify-center">
                <button
                    onClick={() => setShowDeleteNotAllowedPopup(false)}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                >
                    Close
                </button>
            </div>
        </div>
    </div>
)}


        {/* Success Popup */}
        {showDeleteSuccessPopup && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white p-8 rounded-lg">
                        <p className="text-green-400 text-lg">Your account has been successfully deleted.</p>
                        <button
                            onClick={handleOkButtonClick}
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-8 rounded mt-4 block mx-auto"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
            {/* Reauthentication Error Popup */}
{showReauthenticationErrorPopup && (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <div className="bg-white p-8 rounded-lg">
            <p className="text-lg font-semibold mb-4">Please check your current password.</p>
            <button
                onClick={() => setShowReauthenticationErrorPopup(false)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4 block mx-auto"
            >
                OK
            </button>
        </div>
    </div>
)}
{/* Invalid Email Error Popup */}
{invalidEmailError && (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <div className="bg-white p-8 rounded-lg">
            <p className="text-lg font-semibold mb-4">Invalid Email</p>
            <p className="text-sm text-gray-600 mb-4">The entered email does not match your account's email address.</p>
            <div className="flex justify-center">
                <button
                    onClick={() => setInvalidEmailError(false)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    OK
                </button>
            </div>
        </div>
    </div>
)}

{showPasswordMatchErrorPopup && (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 error-popup">
        <div className="bg-white p-8 rounded-lg">
            <img src={errorIcon} alt="Error" className="h-10 mx-auto mb-4" />
            <p className="text-red-500 text-lg">Passwords do not match. Please try again.</p>
            <button
                onClick={() => setShowPasswordMatchErrorPopup(false)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4 block mx-auto"
            >
                OK
            </button>
        </div>
    </div>
)}


                </div>
            </div>
            </div>
        </div>
    );
};

export default ProfilePage;
