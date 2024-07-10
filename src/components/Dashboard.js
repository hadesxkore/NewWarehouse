import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { motion, AnimatePresence } from 'framer-motion';
import { auth, firestore, storage, db } from '../firebase'; // Assuming you have Firebase storage
import firebase from 'firebase/compat/app'; // Import firebase itself
import * as THREE from 'three';
import  Panorama  from 'panolens';
import * as PANOLENS from 'panolens';
import { doc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import placeholderIcon from '../images/placeholder.png'; // Import report icon

import error1 from '../images/error1.png';
import approve from '../images/approve.png';
import priceTagIcon from '../images/price-tag.png';
import infoIcon from '../images/info.png';
import location from '../images/location.png';
import rentIcon from '../images/deal.png';
import Navbar from './Navbar';
import viewIcon from '../images/view.png';
import chatIcon from '../images/chat.png';
import dashboardIcon from '../images/dashboard.png';
import uploadIcon from '../images/upload.png';
import billIcon from '../images/bill.png'; // Import bill icon
import leaseIcon from '../images/lease.png'; // Import lease icon
import reportIcon from '../images/problem.png'; // Import report icon
import checkMark from '../images/check-mark.png'; // Import report icon
import warnIcon from '../images/warn.png'; // Import report icon


import warehouseIcon from '../images/warehouse.png';
import userProfileIcon from '../images/user.png';
import logoutIcon from '../images/logout1.png';
import defaultProfileImage from '../images/default-profile-image.png';
import receptionBellIcon from '../images/reception-bell.png';
import emergencyExitIcon from '../images/emergency-exit.png';
import rampIcon from '../images/ramp.png';
import availabilityIcon from '../images/availability.png';
import wifiIcon from '../images/wifi.png';
import airConditionerIcon from '../images/air-conditioner.png';
import terminalIcon from '../images/terminal.png';
import fireAlarmIcon from '../images/fire-alarm.png';
import elevatorIcon from '../images/elevator.png';
import fenceIcon from '../images/fence.png';
import forkliftIcon from '../images/forklift.png';
import carIcon from '../images/car.png';
import policemanIcon from '../images/policeman.png';
import restRoom from '../images/toilet.png';
import meetingRoomIcon from '../images/meeting-room.png';
import securityCameraIcon from '../images/security-camera.png';
import keyIcon from '../images/key.png';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents  } from 'react-leaflet';

import axios from 'axios';
import L from 'leaflet';    

import './Dashboard.css';


function Dashboard() {
    // State variables
    
    const [showMapModal, setShowMapModal] = useState(false);
    const [center, setCenter] = useState([51.505, -0.09]);
    const [mapKey, setMapKey] = useState(0); // Key for forcing remount of MapContainer

    // Inside your component
const [searchText, setSearchText] = useState('');
const [suggestions, setSuggestions] = useState([]);

    const [rentedWarehouses, setRentedWarehouses] = useState([]);
    const [showRentedWarehousesModal, setShowRentedWarehousesModal] = useState(false);
    const [userName, setUserName] = useState('');
    const [currentUserId, setCurrentUserId] = useState(null); // Add state for current user ID
// Format the current date as "June 01, 2024"
const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: '2-digit'
});
const [show360ImageModal, setShow360ImageModal] = useState(false);
const [current360ImageUrl, setCurrent360ImageUrl] = useState('');
const [isValidUrl, setIsValidUrl] = useState(true);

    const [rentalWarehouses, setRentalWarehouses] = useState([]);
    const [showRentalWarehousesModal, setShowRentalWarehousesModal] = useState(false);
  // State for managing confirmation modal visibility
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  // State for storing the warehouse ID to be rented
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showRejectModal2, setShowRejectModal2] = useState(false);
const [rejectReason, setRejectReason] = useState('');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);
  const [showLeaseModal, setShowLeaseModal] = useState(false);
const [selectedWarehouse, setSelectedWarehouse] = useState(null);
const [formData, setFormData] = useState({
    lessorName: '',
    lesseeName: '',
    warehouseName: '',
    rentAmount: ''
});
  const [showTooltip, setShowTooltip] = useState(false);
  const [newRentals, setNewRentals] = useState(0);
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const [userAddress, setUserAddress] = useState('');
    const [slideDirection, setSlideDirection] = useState(null);
    const [carouselImages, setCarouselImages] = useState([]);
    const [showCarousel, setShowCarousel] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [loggedInUserId, setLoggedInUserId] = useState(null); // Define and initialize loggedInUserI
    const [profileImage, setProfileImage] = useState(defaultProfileImage);
    const [showModal2, setShowModal2] = useState(false); // State for displaying modal
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [filterStatus, setFilterStatus] = useState('All'); // New state for filtering warehouses
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [fileNames, setFileNames] = useState({});
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentWarehouse, setCurrentWarehouse] = useState(null);
    const [showErrorModal, setShowErrorModal] = useState(false); // State for showing error modal
    const [showRentingApprovedModal, setShowRentingApprovedModal] = useState(false);
    const [selectedWarehouseName, setSelectedWarehouseName] = useState('');

    const [showLeaseAgreementModal, setShowLeaseAgreementModal] = useState(false);
    const [currentView, setCurrentView] = useState('uploaded'); // <-- Define setCurrentView here
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [filterCounts, setFilterCounts] = useState({
        All: 0,
        Pending: 0,
        Verified: 0,
        Rejected: 0
    });

    const [warehouseData, setWarehouseData] = useState({
        name: '',
        address: '',
        description: '',
        price: '',
        images: [],
        videos: [],
        status: 'pending', // Add status field
        uploadDate: null, // Add uploadDate field
        identificationProof: null,
        addressProof: null,
        ownershipDocuments: null,
        previousTenancyDetails: null,
        businessPermit: null,
        buildingPermit: null,
        maintenanceRecords: null,
    });
    
    const [warehouseLocation, setWarehouseLocation] = useState({ lat: 0, lng: 0 });
    // Define state variables for modal image URL and modal visibility
    const [modalImageUrl, setModalImageUrl] = useState('');
    const [showModal, setShowModal] = useState(false);
        const [uploading, setUploading] = useState(false);
        const [showUploadModal, setShowUploadModal] = useState(false);
        const [userWarehouses, setUserWarehouses] = useState([]);
        const [isRejectReasonModalOpen, setIsRejectReasonModalOpen] = useState(false);
        const [rejectionReason, setRejectionReason] = useState('');
        const [loadingWarehouses, setLoadingWarehouses] = useState(true);
        const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

        const [successMessage, setSuccessMessage] = useState('');
        const [newAddress, setNewAddress] = useState('');
        // Function to handle warehouse data change
        const handleWarehouseDataChange = (e) => {
            const { name, value } = e.target;
            setWarehouseData({ ...warehouseData, [name]: value });
        };
        const amenitiesList = [
            { name: 'CCTV', icon: securityCameraIcon },
            { name: "Comfort Room", icon: restRoom }, 
            { name: 'Function Room', icon: meetingRoomIcon },
            { name: 'Fire Exit', icon: emergencyExitIcon },
            { name: 'Reception Room', icon: receptionBellIcon },
            { name: 'Ramp', icon: rampIcon },
            { name: 'Availability', icon: availabilityIcon },
            { name: 'WiFi', icon: wifiIcon },
            { name: 'Air Conditioner', icon: airConditionerIcon },
            { name: 'Terminal', icon: terminalIcon },
            { name: 'Fire Alarm', icon: fireAlarmIcon },
            { name: 'Elevator', icon: elevatorIcon },
            { name: 'Fence', icon: fenceIcon },
            { name: 'Forklift', icon: forkliftIcon },
            { name: 'Car', icon: carIcon },
            { name: 'Security Guard', icon: policemanIcon },
        ];
     
    // Function to handle file upload for different document types
    const handleFileUpload = async (e) => {
        setUploading(true);
        const file = e.target.files[0];
        const { name } = e.target;
        const storageRef = storage.ref();
        const fileRef = storageRef.child(file.name);
        await fileRef.put(file);
        const url = await fileRef.getDownloadURL();
        setWarehouseData((prevData) => ({ ...prevData, [name]: url }));
        setFileNames((prevFileNames) => ({ ...prevFileNames, [name]: file.name }));
        setUploading(false);
    };

      // Assuming amenitiesList is the object causing the error
<div className="amenities-container">
    {Object.keys(amenitiesList).map((key, index) => (
        <div key={index} className="amenity-item">
            <img src={amenitiesList[key].icon} alt={amenitiesList[key].name} className="w-6 h-6" />
            {amenitiesList[key].name}
        </div>
    ))}
</div>
const handleNotificationClick = (warehouse) => {
    setSelectedWarehouse(warehouse);
    setShowRentingApprovedModal(true);
};

   // Function to handle opening the edit modal
   const handleEditWarehouse = (warehouse) => {
    setCurrentWarehouse(warehouse);
    setIsEditModalOpen(true);
};
   // Function to handle closing the edit modal
   const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentWarehouse(null);
};
const handleRejectModal = (warehouse) => {
    if (!warehouse) {
        console.error('Warehouse object is null or undefined');
        return;
    }
    console.log('Warehouse clicked:', warehouse); // Debug log
    setSelectedWarehouse(warehouse);
    setShowRejectModal2(true);
};
const handleCloseRejectModal = () => {
    setShowRejectModal2(false);
    setSelectedWarehouse(null);
};

useEffect(() => {
    if (selectedWarehouseId && showRejectModal2) {
        console.log('Fetching rejectReason for warehouse:', selectedWarehouseId); // Debug log
        const warehouseRef = firestore.collection('rentedWarehouses').doc(selectedWarehouseId);
        warehouseRef.get().then((doc) => {
            if (doc.exists) {
                const data = doc.data();
                console.log('Fetched rejectReason:', data.rejectReason); // Debug log
                setRejectReason(data.rejectReason); // Update state with the fetched rejectReason
            } else {
                console.error('No such document!');
                setRejectReason('No reason found'); // Set default message if no document
            }
        }).catch((error) => {
            console.error('Error getting document:', error);
            setRejectReason('Error fetching reason'); // Set error message
        });
    }
}, [selectedWarehouseId, showRejectModal2]);
const handleCloseLeaseAgreementModal = () => {
    setShowLeaseAgreementModal(false);
};
const handleSaveChanges = async () => {
    // Update the Firestore document
    const warehouseRef = doc(db, 'warehouses', currentWarehouse.id);
    try {
        await updateDoc(warehouseRef, currentWarehouse);
        // Update the state
        setUserWarehouses((prevWarehouses) => {
            return prevWarehouses.map((warehouse) =>
                warehouse.id === currentWarehouse.id ? currentWarehouse : warehouse
            );
        });
        setIsEditModalOpen(false);
        setCurrentWarehouse(null);
        setIsSuccessModalOpen(true); // Show success modal
    } catch (error) {
        console.error("Error updating document: ", error);
        // Handle error (optional)
    }
};

// Define a custom icon for the marker
const locationIcon = new L.Icon({
    iconUrl: placeholderIcon,
    iconSize: [30, 30], // Set to the size of your custom icon
    iconAnchor: [15, 30], // Adjust this to position the icon correctly
    popupAnchor: [0, -30], // Adjust this to position the popup correctly
    shadowUrl:placeholderIcon,
    shadowSize: [30, 30], // Adjust to fit better with the icon size
    shadowAnchor: [15, 30] // Adjust this to position the shadow correctly
});
const openRejectReasonModal = (reason) => {
    setRejectionReason(reason);
    setIsRejectReasonModalOpen(true);
};

const closeRejectReasonModal = () => {
    setIsRejectReasonModalOpen(false);
    setRejectionReason('');
};

 // Location marker component
 const LocationMarker = ({ position, setCenter, setSearchText }) => {
    const map = useMapEvents({
        click: async (e) => {
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;
            setCenter([lat, lng]);

            // Reverse geocode to get address
            const address = await reverseGeocode(lat, lng);
            setSearchText(address);
        },
    });

   
    return (
        <>
            <Marker position={position} icon={locationIcon} />
            <Circle center={position} radius={200} />
        </>
    );
};
 // Function to handle rejection
 const handleReject = (warehouse) => {
    setSelectedWarehouseId(warehouse.warehouseId);
    setShowRejectModal(true);
};
// Function to confirm rejection
const confirmReject = async () => {
    try {
        if (!selectedWarehouseId) {
            throw new Error('Warehouse ID is undefined.');
        }

        const warehouseRef = firestore.collection('rentedWarehouses').doc(selectedWarehouseId);

        await warehouseRef.update({
            status: 'Rejected',
            rejectReason: rejectReason // Assuming you have a field for reject reason in your Firestore schema
        });

        console.log('Warehouse marked as rejected successfully.');

        // Close the reject modal
        setShowRejectModal(false);

        // Optionally, you can perform additional actions after rejection

    } catch (error) {
        console.error('Error marking warehouse as rejected:', error);
        // Handle error
        // You can show an error message or log it
    }
};


const handleShowMap = () => {
    setShowMapModal(true);
};

const handleCloseMap = () => {
        setShowMapModal(false);
    };

    useEffect(() => {
        const currentUser = auth.currentUser;
        if (currentUser) {
            const unsubscribe = db.collection('warehouses')
                .where('userId', '==', currentUser.uid)
                .onSnapshot((querySnapshot) => {
                    const warehouses = [];
                    querySnapshot.forEach((doc) => {
                        warehouses.push({ id: doc.id, ...doc.data() });
                    });
                    setUserWarehouses(warehouses);
                });

            return () => unsubscribe();
        }
    }, []);

   
    const handleSearch = async () => {
        if (searchText.length > 2) {
            try {
                const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${searchText}&key=87f39a31f9164bd281efd37f917e402b`);
                const results = response.data.results.map(item => item.formatted);
                setSuggestions(results);
                if (response.data.results.length > 0) {
                    const { lat, lng } = response.data.results[0].geometry;
                    setCenter([lat, lng]);
                    setMapKey(prevKey => prevKey + 1);
                }
            } catch (error) {
                console.error('Error fetching suggestions:', error);
            }
        } else {
            setSuggestions([]);
        }
    };
    const handleSearchChange = (event) => {
        const text = event.target.value;
        setSearchText(text);
    };

    const handleSuggestionClick = async (suggestion) => {
        setSearchText(suggestion);
        setSuggestions([]);
        try {
            const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${suggestion}&key=87f39a31f9164bd281efd37f917e402b`);
            if (response.data.results.length > 0) {
                const { lat, lng } = response.data.results[0].geometry;
                setCenter([lat, lng]);
                setMapKey(prevKey => prevKey + 1);
            }
        } catch (error) {
            console.error('Error fetching location:', error);
        }
    };
    const reverseGeocode = async (lat, lng) => {
        try {
            const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=87f39a31f9164bd281efd37f917e402b`);
            if (response.data.results.length > 0) {
                return response.data.results[0].formatted;
            }
        } catch (error) {
            console.error('Error during reverse geocoding:', error);
        }
        return '';
    };
    const handleConfirmLocation = () => {
        setWarehouseData({ ...warehouseData, address: searchText });
        handleCloseMap();
    };

// Function to handle click event on "Uploaded Warehouses" button
const handleUploadedWarehousesClick = () => {
    setCurrentView('uploaded'); // Set the current view to 'uploaded'
};
const handleAmenitySelection = (amenityName) => {
    // Check if the amenity is already selected
    const index = selectedAmenities.indexOf(amenityName);
    if (index !== -1) {
        // If it's selected, remove it from the selected amenities array
        const updatedSelection = [...selectedAmenities];
        updatedSelection.splice(index, 1);
        setSelectedAmenities(updatedSelection);
    } else {
        // If it's not selected, add it to the selected amenities array
        setSelectedAmenities([...selectedAmenities, amenityName]);
    }
};

 // Effect to set loggedInUserId when user logs in
 useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
        if (user) {
            setLoggedInUserId(user.uid); // Set loggedInUserId to the current user's ID
        } else {
            setLoggedInUserId(null); // Reset loggedInUserId if not authenticated
        }
    });
    return () => unsubscribe();
}, []);

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
            }
        } else {
            setLoggedInUserId(null);
            setCurrentUserId(null);
            setUserName('');
        }
    });
    return () => unsubscribe();
}, []);
const handleRentedWarehousesClick = async () => {
    console.log("Fetching rented warehouses...");
    setCurrentView('rented'); // Set the current view to 'rented'
    try {
        const rentedWarehousesSnapshot = await firestore.collection('rentedWarehouses').where('userUid', '==', currentUserId).get();
        const rentedWarehousesData = rentedWarehousesSnapshot.docs.map(doc => doc.data());
        console.log(rentedWarehousesData); // Check the fetched data in the console
        setRentedWarehouses(rentedWarehousesData); // Update state with fetched data
        setShowRentedWarehousesModal(true); // Show the modal after fetching data
    } catch (error) {
        console.error('Error fetching rented warehouses:', error);
        // Handle error appropriately
    }
};


    // Fetch rented warehouses from Firestore when component mounts
    useEffect(() => {
        handleRentedWarehousesClick();
    }, []);
const handleRentalWarehousesClick = async () => {
    console.log("Fetching rented warehouses...");
    setCurrentView('rentals'); // Set the current view to 'rented'
    try {
        const user = auth.currentUser;
        if (!user) {
            console.error('User not logged in.');
            return;
        }

        const rentedWarehousesSnapshot = await firestore.collection('rentedWarehouses')
            .where('ownerUid', '==', user.uid) // Filter by ownerUid
            .get();

        const rentedWarehousesData = rentedWarehousesSnapshot.docs.map(doc => doc.data());
        console.log(rentedWarehousesData); // Check the fetched data in the console
        setRentedWarehouses(rentedWarehousesData); // Update state with fetched data
        setShowRentedWarehousesModal(true); // Show the modal after fetching data
    } catch (error) {
        console.error('Error fetching rented warehouses:', error);
        // Handle error appropriately
    }
};
const handleShow360Tour = (image360Url) => {
    setModalImageUrl(image360Url);
    setShowModal(true);
};
useEffect(() => {
    if (showModal && modalImageUrl) {
        initPanoramaViewer(modalImageUrl);
    }
}, [showModal, modalImageUrl]);



const handleFullscreen = () => {
    const viewerContainer = document.getElementById('panolens-container');
    if (viewerContainer) {
        if (viewerContainer.requestFullscreen) {
            viewerContainer.requestFullscreen();
        } else if (viewerContainer.mozRequestFullScreen) { // Firefox
            viewerContainer.mozRequestFullScreen();
        } else if (viewerContainer.webkitRequestFullscreen) { // Chrome, Safari and Opera
            viewerContainer.webkitRequestFullscreen();
        } else if (viewerContainer.msRequestFullscreen) { // IE/Edge
            viewerContainer.msRequestFullscreen();
        }
    }
};


    const initPanoramaViewer = (imageUrl) => {
        const viewerContainer = document.getElementById('panolens-container');

        if (!viewerContainer) {
            console.error("Panolens container not found");
            return;
        }

        viewerContainer.innerHTML = ''; // Clear existing content

        const viewer = new PANOLENS.Viewer({ container: viewerContainer });
        const panorama = new PANOLENS.ImagePanorama(imageUrl);
        viewer.add(panorama);

        // Enable controls directly
        viewer.enableControl(PANOLENS.CONTROLS.ORBIT);
        viewer.enableControl(PANOLENS.CONTROLS.ZOOM);

        // Dispose the viewer when closing
        viewer.addEventListener('panolens-viewer-handler', () => {
            viewer.dispose();
        });
    };


    const handleCloseModal = () => {
        setShowModal(false);
        setModalImageUrl('');
    };

    
     // Fetch rented warehouses from Firestore when component mounts
     useEffect(() => {
        handleRentalWarehousesClick();
    }, []);
   // Function to handle image upload
   const handleImageUpload = async (e) => {
    setUploading(true);
    const file = e.target.files[0];
    const storageRef = storage.ref();
    const fileRef = storageRef.child(file.name);
    await fileRef.put(file);
    const url = await fileRef.getDownloadURL();
    setWarehouseData((prevData) => ({ ...prevData, images: [...prevData.images, url] }));
    setUploading(false);
};




    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setCurrentUserId(user.uid); // Set the current user's ID in state
            } else {
                setCurrentUserId(null); // Reset current user's ID if not authenticated
            }
        });
        return () => unsubscribe();
    }, []);
    
        // Function to handle video upload
        const handleVideoUpload = async (e) => {
            setUploading(true);
            const file = e.target.files[0];
            const storageRef = storage.ref();
            const fileRef = storageRef.child(file.name);
            await fileRef.put(file);
            const url = await fileRef.getDownloadURL();
            setWarehouseData({ ...warehouseData, videos: [...warehouseData.videos, url] });
            setUploading(false);
        };

   
    const handleAddressChange = (e) => {
        setUserAddress(e.target.value);
    };

    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
    
        try {
            const warehouseRef = firestore.collection('warehouses').doc();
            await warehouseRef.set({
                ...warehouseData,
                amenities: selectedAmenities,
                uploadDate: new Date(),
                userUid: auth.currentUser.uid, // Set the userUid field
                status: 'pending',
            });
    
            setSuccessMessage('Warehouse uploaded successfully!');
            setShowUploadModal(false);
            setWarehouseData({
                name: '',
                address: '',
                description: '',
                price: '',
                images: [],
                videos: [],
                status: 'pending',
                uploadDate: null,
                identificationProof: '',
                addressProof: '',
                ownershipDocuments: '',
                previousTenancyDetails: '',
                businessPermit: '',
                buildingPermit: '',
                maintenanceRecords: '',
            });
            setSelectedAmenities([]);
        } catch (error) {
            console.error('Error uploading warehouse:', error);
        } finally {
            setUploading(false);
        }
    };
    
     // Function to fetch rented warehouses
     const fetchRentedWarehouses = async () => {
        try {
            const rentedWarehousesSnapshot = await firestore.collection('rentedWarehouses').where('ownerUid', '==', loggedInUserId).get();
            const rentedWarehousesData = rentedWarehousesSnapshot.docs.map(doc => doc.data());
            setRentedWarehouses(rentedWarehousesData);
        } catch (error) {
            console.error('Error fetching rented warehouses:', error);
        }
    };
      // Function to listen for real-time updates to rented warehouses
      const listenForUpdates = () => {
        const unsubscribe = firestore.collection('rentedWarehouses').where('ownerUid', '==', loggedInUserId)
            .onSnapshot((snapshot) => {
                const rentedWarehousesData = snapshot.docs.map(doc => doc.data());
                setRentedWarehouses(rentedWarehousesData);
            });
        
        // Clean up the listener when component unmounts
        return unsubscribe;
    };

    useEffect(() => {
        // Fetch rented warehouses when component mounts
        fetchRentedWarehouses();

        // Listen for real-time updates
        const unsubscribe = listenForUpdates();

        return () => unsubscribe(); // Clean up listener on unmount
    }, []);

    // Calculate the count of new rentals
    useEffect(() => {
        const processingRentalsCount = rentedWarehouses.filter(warehouse => warehouse.status === 'Processing').length;
        setNewRentals(processingRentalsCount);
    }, [rentedWarehouses]);

    
// Function to handle marking a warehouse as rented
const markAsRented = async (warehouseId) => {
    setSelectedWarehouseId(warehouseId);

    try {
        const hasLeaseAgreement = await checkLeaseAgreement(warehouseId);

        if (hasLeaseAgreement) {
            setShowConfirmationModal(true); // Show confirmation modal if lease agreement exists
        } else {
            setShowErrorModal(true); // Show error modal if no lease agreement exists
        }
    } catch (error) {
        console.error('Error marking warehouse as rented:', error);
        setShowErrorModal(true); // Show error modal in case of any error
    }
};

const handleLeaseAgreement = (warehouse) => {
    setSelectedWarehouse(warehouse);
    setShowLeaseModal(true);
    handleLeaseAgreementCheck(warehouse.warehouseId);
};

const handleLeaseAgreementCheck = async (warehouseId) => {
    try {
        const hasLeaseAgreement = await checkLeaseAgreement(warehouseId);

        if (hasLeaseAgreement) {
            setShowLeaseAgreementModal(true);
        } else {
            setShowLeaseAgreementModal(false);
        }
    } catch (error) {
        console.error('Error checking lease agreement:', error);
        setShowLeaseAgreementModal(false);
    }
};



// Example function to check if there's a lease agreement for a warehouse
const checkLeaseAgreement = async (warehouseId) => {
    try {
        const rentalAgreementRef = firestore.collection('rentalAgreement').where('warehouseId', '==', warehouseId);
        const snapshot = await rentalAgreementRef.get();
        
        return !snapshot.empty; // Return true if there are any lease agreements found
    } catch (error) {
        console.error('Error checking lease agreement:', error);
        return false; // Return false in case of error
    }
};
const transferToLeaseAgreement = async () => {
    if (selectedWarehouse) {
        try {
            const hasLeaseAgreement = await checkLeaseAgreement(selectedWarehouse.warehouseId);

            if (!hasLeaseAgreement) {
                setFormData({
                    lessorName: `${selectedWarehouse.ownerFirstName} ${selectedWarehouse.ownerLastName}`,
                    lesseeName: `${selectedWarehouse.rentedBy.firstName} ${selectedWarehouse.rentedBy.lastName}`,
                    warehouseName: selectedWarehouse.name,
                    rentAmount: selectedWarehouse.price
                });
                setShowLeaseModal(false);
                navigate('/create-agreement', { state: { warehouse: selectedWarehouse } });
            } else {
                setShowLeaseAgreementModal(true);
            }
        } catch (error) {
            console.error('Error transferring to lease agreement:', error);
        }
    }
};
   // Function to confirm marking a warehouse as rented
   const confirmMarkAsRented = async () => {
    try {
        console.log('Warehouse ID in markAsRented:', selectedWarehouseId); // Debug log

        if (!selectedWarehouseId) {
            throw new Error('Warehouse ID is undefined.');
        }

        const warehouseRef = firestore.collection('rentedWarehouses').doc(selectedWarehouseId);

        await warehouseRef.update({
            status: 'Rented'
        });

        console.log('Warehouse marked as rented successfully.');

        // Close the confirmation modal
        setShowConfirmationModal(false);

        // Show success message or navigate to another page
    } catch (error) {
        console.error('Error marking warehouse as rented:', error);
        // Handle error
        // You can show an error message or log it
    }
};
useEffect(() => {
    const checkNewRentals = async () => {
        try {
            const rentalsSnapshot = await firestore.collection('rentedWarehouses').get();
            const rentalsData = rentalsSnapshot.docs.map(doc => doc.data());

            // Check if there are more rentals in the data than currently displayed
            const newRentalsCount = rentalsData.length - rentedWarehouses.length;
            if (newRentalsCount > 0) {
                setNewRentals(newRentalsCount);
            }
        } catch (error) {
            console.error('Error checking for new rentals:', error);
        }
    };

    checkNewRentals();
}, [rentedWarehouses.length]);
  // Function to check if the user has warehouses
  const checkIfUserHasWarehouses = () => {
    return userWarehouses.length > 0; // Check if the user has any warehouses
};

   // Function to handle viewing rentals
   const handleViewRentals = () => {
    const hasWarehouses = checkIfUserHasWarehouses();
    
    if (!hasWarehouses) {
        setShowModal2(true); // Display modal if user doesn't have warehouses
    } else {
        // User has warehouses, proceed with your logic
        handleRentalWarehousesClick(); // Example function call
        fetchRentedWarehouses(); // Example function call
    }
};


// Function to fetch user's uploaded warehouses and filter counts
const fetchUserWarehouses = async () => {
    const user = auth.currentUser;
    if (user) {
        const userUid = user.uid;
        const warehousesRef = firestore.collection('warehouses');
        let query = warehousesRef.where('userUid', '==', userUid);
        // Filter warehouses based on status if it's not 'All'
        if (filterStatus !== 'All') {
            query = query.where('status', '==', filterStatus.toLowerCase());
        }
        const snapshot = await query.get();
        const userWarehousesData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setUserWarehouses(userWarehousesData);
        
        // Calculate filter counts based on the filtered data
        const counts = {
            All: userWarehousesData.length,
            Pending: filterStatus === 'Pending' ? userWarehousesData.length : userWarehousesData.filter(warehouse => warehouse.status === 'pending').length,
            Verified: filterStatus === 'Verified' ? userWarehousesData.length : userWarehousesData.filter(warehouse => warehouse.status === 'verified').length,
            Rejected: filterStatus === 'Rejected' ? userWarehousesData.length : userWarehousesData.filter(warehouse => warehouse.status === 'rejected').length
        };
        setFilterCounts(counts);
    }
};

// Effect to fetch user's uploaded warehouses and filter counts
useEffect(() => {
    fetchUserWarehouses();
}, [filterStatus]);


         // Effect to check if user is already logged in and fetch user's warehouses
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                setIsLoggedIn(true);
                const userRef = firestore.collection('users').doc(user.uid);
                const userData = await userRef.get();
                if (userData.exists) {
                    const userDataObj = userData.data();
                    setProfileImage(userDataObj.profileImage || defaultProfileImage);
                    fetchUserWarehouses();
                }
            } else {
                setIsLoggedIn(false);
            }
        });
        return () => unsubscribe();
    }, [filterStatus]); // Refetch warehouses when filter status changes []);
     // Function to handle filter change
     const handleFilterChange = (status) => {
        setFilterStatus(status);
    };
        const handleLogout = () => {
            setShowConfirmation(false);
            auth.signOut()
                .then(() => {
                    setIsLoggedIn(false);
                    setIsDropdownOpen(false);
                })
                .catch(error => {
                    console.error('Error signing out:', error);
                });
        };
    
        // Function to toggle dropdown menu
        const toggleDropdown = () => {
            setIsDropdownOpen(!isDropdownOpen);
        };

        const closeSuccessMessage = () => {
            setSuccessMessage('');
        };
        // Function to open carousel pop-up with selected images
        const openCarousel = (images) => {
            setCarouselImages(images);
            setSelectedImageIndex(0); // Reset to the first image when opening carousel
            setShowCarousel(true);
        };
        // Define state variables for selected image index
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    // Function to handle next image
    const handleNext = () => {
        setSelectedImageIndex((prevIndex) => {
            setSlideDirection('left');
            return (prevIndex + 1) % carouselImages.length;
        });
    };
    // Function to handle previous image
    const handlePrev = () => {
        setSelectedImageIndex((prevIndex) => {
            setSlideDirection('right');
            return (prevIndex - 1 + carouselImages.length) % carouselImages.length;
        });
    };
    // Function to close the carousel
    const handleClose = () => { // Define handleClose function
        setShowCarousel(false);
    };
// Function to handle deletion of warehouse data
const handleDeleteWarehouse = async (warehouse) => {
    // Confirm deletion
    if (window.confirm("Are you sure you want to delete this warehouse?")) {
        try {
            // Delete warehouse data from Firestore
            await firestore.collection("warehouses").doc(warehouse.id).delete();

            // Delete images associated with the warehouse from Firebase Storage
            for (const imageUrl of warehouse.images) {
                const imageRef = storage.refFromURL(imageUrl);
                await imageRef.delete();
            }

            // Delete videos associated with the warehouse from Firebase Storage
            for (const videoUrl of warehouse.videos) {
                const videoRef = storage.refFromURL(videoUrl);
                await videoRef.delete();
            }

            // Remove the deleted warehouse from the state
            setUserWarehouses((prevWarehouses) => prevWarehouses.filter((w) => w.id !== warehouse.id));

            // Show success message
            setSuccessMessage("Warehouse deleted successfully.");
        } catch (error) {
            console.error("Error deleting warehouse:", error);
            // Show error message
            alert("An error occurred while deleting the warehouse.");
        }
    }
};

return (
    <div>
           <Navbar />
           <div className="bg-gray-800 text-white text-left py-6">
           <h2 className="text-2xl font-bold ml-22 textUser ">
                    Welcome back, {userName || 'Guest'}!
                </h2>
        </div>
    <div style={{ backgroundColor: '#eeeeee', minHeight: '100vh' }}>
       
    <div className="flex justify-center items-center h-full mt-8 space-x-6 card-container">
      {/* Card Template */}
      <div className="bg-white p-6 border border-gray-300 rounded-xl shadow-lg w-80 card ">
                    <div className="flex items-center p-4 cursor-pointer hover:bg-gray-100 rounded-t-lg" onClick={() => setShowUploadModal(true)}>
                        <div className="flex-shrink-0 bg-gray-200 p-3 rounded-xl">
                            <img src={uploadIcon} alt="Upload Icon" className="h-8 w-8" />
                        </div>
                        <div className="ml-4 text-lg font-semibold">Create Warehouse</div>
                    </div>
                    <p className="bottom-2 left-4 text-m text-white text-end">For Lessor</p>
                    <hr className="my-4 border-gray-300" />
                    <div className="text-left text-sm text-gray-500">{currentDate}</div>
                </div>

              {/* View Uploaded Warehouses Card */}
<div className="bg-white p-6 border border-gray-300 rounded-lg shadow-lg w-80 relative card ">
    <div className="flex items-center p-4 cursor-pointer hover:bg-gray-100 rounded-t-lg" onClick={handleUploadedWarehousesClick}>
        <div className="flex-shrink-0 bg-gray-200 p-3 rounded-xl">
            <img src={warehouseIcon} alt="Uploaded Warehouse Icon" className="h-8 w-8" />
        </div>
        <div className="ml-4 text-lg font-semibold">Created Warehouses</div>
    </div>
    <p className="bottom-2 left-4 text-m text-white  text-end">For Lessor</p>
    <hr className="my-4 border-gray-300" />
    <div className="text-left text-sm text-gray-500">{currentDate}</div>
    <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full px-2 py-1 text-xs">
        {userWarehouses.length}
    </div>
</div>

{/* View Rented Warehouses Card */}
<div className="bg-white p-6 border border-gray-300 rounded-lg shadow-lg w-80 relative card">
    <div className="flex items-center p-4 cursor-pointer hover:bg-gray-100 rounded-t-lg" onClick={handleRentedWarehousesClick}>
        
        <div className="flex-shrink-0 bg-gray-200 p-3 rounded-xl">
            <img src={rentIcon} alt="Rented Warehouse Icon" className="h-8 w-8" />
        </div>
       
        <div className="ml-4 text-lg font-semibold">Rented Warehouses</div>
      
    </div>
    <p className="bottom-2 left-4 text-m text-gray-500 text-end">For Lessee</p>
    <hr className="my-4 border-gray-300" />
    <div className="text-left text-sm text-gray-500">{currentDate}</div>
    <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full px-2 py-1 text-xs">
        {rentedWarehouses.length}
    </div>
    {/* Subtext for Lessee */}
 
</div>


{/* View Rentals Warehouses Card */}
<div className="bg-white p-6 border border-gray-300 rounded-lg shadow-lg w-80 relative card">
            <div className="relative flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100 rounded-t-lg" onClick={handleViewRentals}>
                <div className="flex items-center">
                    <div className="flex-shrink-0 bg-gray-200 p-3 rounded-xl">
                        <img src={keyIcon} alt="Rented Warehouse Icon" className="h-8 w-8" />
                    </div>
                    <div className="ml-4 text-lg font-semibold">View Rentals</div>
                </div>
              
            </div>
            <p className="bottom-2 left-4 text-m text-gray-500 text-end">For Lessor</p>
         
    <hr className="my-4 border-gray-300" />
    <div className="text-left text-sm text-gray-500">{currentDate}</div>
          {/* Count value at the top right corner */}
        
          <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full px-2 py-1 text-xs">
                    {rentedWarehouses.length}
                </div>
</div>

</div>
{/* Inline pop-up modal for encouraging becoming a lessor */}
{showModal2 && (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-800 bg-opacity-75 z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
            <h2 className="text-xl font-bold mb-4">For Lessors Only</h2>
            <p>This module is for lessor only. If you'd like to become a lessor and start renting out your warehouses, begin by creating your warehouse listings.</p>
            <div className="flex justify-end mt-4">
                <button
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg mr-2"
                    onClick={() => setShowModal2(false)}
                >
                    Close
                </button>
            </div>
        </div>
    </div>
)}



{showUploadModal && (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-900 bg-opacity-75 z-50">
        <div className="bg-white rounded-lg shadow-md max-w-7xl w-full p-4 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Upload Warehouse Details</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {/* Warehouse Name */}
                    <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="name">Warehouse Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={warehouseData.name}
                            onChange={handleWarehouseDataChange}
                            className="input-field"
                            required
                        />
                    </div>
                    {/* Address */}
                    <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="address">Address</label>
                        <input
                            type="text"
                            id="address"
                            name="address"
                            value={warehouseData.address}
                            onChange={handleWarehouseDataChange}
                            className="input-field"
                            required
                        />
                    </div>
                    {/* Price */}
                    <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="price">Price</label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            value={warehouseData.price}
                            onChange={handleWarehouseDataChange}
                            className="input-field"
                            required
                        />
                    </div>
                    {/* 360 Image Link */}
                    <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="image360Url">360 Image Link</label>
                        <input
                            type="url"
                            id="image360Url"
                            name="image360Url"
                            value={warehouseData.image360Url}
                            onChange={handleWarehouseDataChange}
                            className="input-field"
                            placeholder="Paste your 360 image link here (jpeg, jpg, or png format)"
                            required
                        />
                    </div>
                    {/* Description */}
                    <div className="col-span-2 lg:col-span-4">
                        <label className="block text-sm font-medium mb-1" htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={warehouseData.description}
                            onChange={handleWarehouseDataChange}
                            rows="3"
                            className="textarea-field"
                            required
                        ></textarea>
                    </div>
                </div>
 {/* Upload Images and Videos */}
<div className="flex items-center justify-start mb-2">
    {/* Upload Images */}
    <div className="flex items-center mr-4">
        <label className="block text-sm font-medium mr-2">Upload Images</label>
        <label htmlFor="image-upload" className="upload-btn">Upload</label>
        <input id="image-upload" type="file" onChange={handleImageUpload} accept="image/*" className="hidden" />
    </div>
    {/* Upload Videos */}
    <div className="flex items-center">
        <label className="block text-sm font-medium mr-2">Upload Videos</label>
        <label htmlFor="video-upload" className="upload-btn">Upload</label>
        <input id="video-upload" type="file" onChange={handleVideoUpload} accept="video/*" className="hidden" />
    </div>
    {uploading && <p className="text-sm text-gray-500 ml-4">Uploading...</p>}
</div>

                {/* Amenities */}
                <div>
                    <label className="block text-sm font-medium mb-1">Amenities</label>
                    <div className="amenities-container flex flex-wrap">
                        {amenitiesList.map((amenity, index) => (
                            <label key={index} className="amenity-item flex items-center mr-2 mb-1">
                                <input
                                    type="checkbox"
                                    name={amenity.name}
                                    checked={selectedAmenities.some(item => item.name === amenity.name)}
                                    onChange={() => handleAmenitySelection(amenity)}
                                />
                                <img src={amenity.icon} alt={amenity.name} className="w-5 h-5 ml-2" />
                                {amenity.name}
                            </label>
                        ))}
                    </div>
                </div>
              {/* File Uploads */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
                { id: "identificationProof", label: "Identification Proof/Valid ID" },
                { id: "addressProof", label: "Address Proof" },
                { id: "ownershipDocuments", label: "Ownership Documents" },
                { id: "previousTenancyDetails", label: "Previous Tenancy Details (if applicable)" },
                { id: "businessPermit", label: "Business Permit" },
                { id: "buildingPermit", label: "Building Permit" },
                { id: "maintenanceRecords", label: "Maintenance Records" },
            ].map((field) => (
                <div key={field.id}>
                    <label className="block text-sm font-medium mb-1" htmlFor={field.id}>{field.label}</label>
                    <div className="relative border border-gray-300 rounded-lg overflow-hidden transition-shadow hover:shadow-lg">
                        <input
                            type="file"
                            id={field.id}
                            name={field.id}
                            onChange={handleFileUpload}
                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                            required={field.id !== "previousTenancyDetails" && field.id !== "businessRegistration" && field.id !== "insuranceDocuments" && field.id !== "maintenanceRecords"}
                        />
                        <div className="flex items-center justify-center h-10 bg-gray-100 hover:bg-blue-100 transition-colors">
                            <span className="text-gray-700 hover:text-blue-700">{fileNames[field.id] || "Choose File"}</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1" id={`${field.id}-file-name`}>{fileNames[field.id]}</p>
                </div>
            ))}
</div>

              {/* Buttons */}
<div className="flex justify-end mt-4 space-x-2">
    <button
        type="button"
        className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
        onClick={() => setShowUploadModal(false)}
    >
        Cancel
    </button>
    <button
        type="submit"
        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
    >
        Submit
    </button>
    <button
        type="button"
        className="px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition-colors"
        onClick={handleShowMap}
    >
        Show Map
    </button>
</div>

            </form>
        </div>
    </div>
)}




    {showMapModal && (
            <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-900 bg-opacity-75 z-50">
                <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-4xl">
                    <div className="flex justify-between mb-4">
                    <h2 className="text-2xl font-bold">Show Map</h2>
                            <button onClick={handleCloseMap} className="text-gray-500 hover:text-gray-700 focus:outline-none">
                                <svg className="w-6 h-6 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M14.293 5.293a1 1 0 0 0-1.414 1.414L16.586 10l-3.707 3.293a1 1 0 1 0 1.414 1.414l4-4a1 1 0 0 0 0-1.414l-4-4a1 1 0 0 0-1.414 0z" />
                                </svg>
                            </button>
                        </div>
                        <div className="mb-4 flex">
                            <input
                                type="text"
                                value={searchText}
                                onChange={handleSearchChange}
                                placeholder="Search for a location..."
                                className="border p-2 rounded-l w-full focus:outline-none"
                            />
                            <button onClick={handleSearch} className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 focus:outline-none">
                                Search
                            </button>
                        </div>
                        {suggestions.length > 0 && (
                            <ul className="border border-gray-200 rounded-lg overflow-hidden shadow-md">
                                {suggestions.map((suggestion, index) => (
                                    <li key={index} onClick={() => handleSuggestionClick(suggestion)} className="cursor-pointer hover:bg-gray-100 px-4 py-2">{suggestion}</li>
                                ))}
                            </ul>
                        )}
                        
                    <div style={{ height: '400px' }}>
                            <MapContainer key={mapKey} center={center} zoom={15} scrollWheelZoom={false} style={{ width: '100%', height: '100%' }}>
                                    <TileLayer
                                        url="https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=aer2dxkMUVJORhqFpZiS"
                                    />
                                <LocationMarker position={center} setCenter={setCenter} setSearchText={setSearchText} />
                                
                            </MapContainer>
                            
                        
            </div>
            <div className="flex justify-end mt-4">
                            <button onClick={handleConfirmLocation} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none">
                                Confirm
                            </button>
                        </div>
        </div>
    </div>
)}




{currentView === 'uploaded' && (
    <div className="container mx-auto px-8 py-10 rounded-lg">
     {/* Filter buttons */}
<div className="flex justify-center mb-8 space-x-2">
    <button
        onClick={() => handleFilterChange('All')}
        className={`px-4 py-2 rounded-lg mr-2 ${
            filterStatus === 'All' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
        }`}
    >
        All ({filterCounts && filterCounts.All})
    </button>
    <button
        onClick={() => handleFilterChange('Pending')}
        className={`px-4 py-2 rounded-lg mr-2 ${
            filterStatus === 'Pending' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
        }`}
    >
        Pending ({filterCounts && filterCounts.Pending})
    </button>
    <button
        onClick={() => handleFilterChange('Verified')}
        className={`px-4 py-2 rounded-lg mr-2 ${
            filterStatus === 'Verified' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
        }`}
    >
        Verified ({filterCounts && filterCounts.Verified})
    </button>
    <button
        onClick={() => handleFilterChange('Rejected')}
        className={`px-4 py-2 rounded-lg mr-2 ${
            filterStatus === 'Rejected' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
        }`}
    >
        Rejected ({filterCounts && filterCounts.Rejected})
    </button>
</div>
  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userWarehouses.map(warehouse => (
                <div key={warehouse.id} className="bg-white p-4 rounded-lg shadow-md relative ">
                    <div className="flex justify-between mb-2">
                    <h3 className="text-lg font-semibold">{warehouse.name}</h3>
                {warehouse.status === 'rejected' && (
                    <span className="relative">
                        <span 
                            className="absolute top-0 right-0 mr-2 flex items-center justify-center cursor-pointer "
                            style={{ width: '28px', height: '28px' }}
                            onClick={() => openRejectReasonModal(warehouse.rejectionReason)}
                            title="Click to see reason"
                        >
                            <img src={error1} alt="Error Icon" className="h-6 w-6 pumping-icon" />
                        </span>
                    </span>
                )}
            </div>
                    <p className="text-gray-600 mb-2">
                        <img src={location} alt="Location Icon" className="inline-block h-4 mr-2" /> {/* Location Icon */}
                        <span className="font-bold">Address:</span> {warehouse.address}
                    </p>
                    <p className="text-gray-600 mb-2">
                        <img src={infoIcon} alt="Info Icon" className="inline-block h-4 mr-2" /> {/* Info Icon */}
                        <span className="font-bold">Description:</span> {warehouse.description}
                    </p>
                    <p className="text-gray-600 mb-2">
                        <img src={priceTagIcon} alt="Price Tag Icon" className="inline-block h-4 mr-2" /> {/* Price Tag Icon */}
                        <span className="font-bold">Price:</span> ₱{warehouse.price}
                    </p>
                    <p>Status:
                        {warehouse.status === 'pending' && <span className="status-text" style={{ color: 'orange' }}>Pending</span>}
                        {warehouse.status === 'verified' && <span className="status-text" style={{ color: 'green' }}>Verified</span>}
                        {warehouse.status === 'rejected' && (
                            <span className="status-text" style={{ color: 'red' }}>
                                Rejected
                               
                            </span>
                        )}
                    </p>
                    <div className="flex flex-wrap mt-2">
                        {warehouse.images.map((imageUrl, index) => (
                            <img key={index} src={imageUrl} alt={`Image ${index + 1}`} className="h-16 w-16 object-cover rounded-md mr-2 mb-2" />
                        ))}
                    </div>
                    <div className="flex flex-wrap mt-2">
                        {warehouse.videos.map((videoUrl, index) => (
                            <video key={index} src={videoUrl} controls className="h-16 w-16 rounded-md mr-2 mb-2"></video>
                        ))}
                    </div>
                    <span className="font-bold">Upload Date:</span> {warehouse.uploadDate ? new Date(warehouse.uploadDate.toDate()).toLocaleString() : 'Unknown'}
                    <div className="flex justify-end mt-4 space-x-4">
                        <button className="bg-blue-500 text-white font-semibold py-2 px-4 rounded hover:bg-blue-600 transition duration-300 shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-1" onClick={() => openCarousel(warehouse.images)}>View</button>
                        <button className="bg-red-500 text-white font-semibold py-2 px-4 rounded hover:bg-red-600 transition duration-300 shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-1" onClick={() => handleDeleteWarehouse(warehouse)}>Delete</button>
                        <button className="bg-green-500 text-white font-semibold py-2 px-4 rounded hover:bg-green-600 transition duration-300 shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-1" onClick={() => handleEditWarehouse(warehouse)}>Edit</button>

                        <button
                            type="button"
                            className="bg-gradient-to-r from-blue-500 to-purple-600 shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-1 text-white font-semibold py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
                            onClick={() => handleShow360Tour(warehouse.image360Url)}
                        >
                            Show 360 Tour
                        </button>
                    </div>
                </div>
            ))}
            
             {isEditModalOpen && currentWarehouse && (
                <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-900 bg-opacity-75 z-50">
                    <div className="relative bg-white p-6 rounded-lg shadow-md w-full max-w-2xl">
                        <span className="absolute top-2 right-2 text-2xl cursor-pointer" onClick={handleCloseEditModal}>&times;</span>
                        <h2 className="text-2xl font-bold mb-4">Edit Warehouse</h2>
                        <form>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input
                                    type="text"
                                    value={currentWarehouse.name}
                                    onChange={(e) => setCurrentWarehouse({ ...currentWarehouse, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Address</label>
                                <input
                                    type="text"
                                    value={currentWarehouse.address}
                                    onChange={(e) => setCurrentWarehouse({ ...currentWarehouse, address: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    value={currentWarehouse.description}
                                    onChange={(e) => setCurrentWarehouse({ ...currentWarehouse, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Price</label>
                                <input
                                    type="number"
                                    value={currentWarehouse.price}
                                    onChange={(e) => setCurrentWarehouse({ ...currentWarehouse, price: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button type="button" className="bg-gray-500 text-white font-semibold py-2 px-4 rounded hover:bg-gray-600 transition duration-300" onClick={handleCloseEditModal}>Cancel</button>
                                <button type="button" className="bg-blue-500 text-white font-semibold py-2 px-4 rounded hover:bg-blue-600 transition duration-300" onClick={handleSaveChanges}>Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {isSuccessModalOpen && (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-900 bg-opacity-75 z-50">
        <div className="relative bg-white p-6 rounded-lg shadow-md w-full max-w-sm text-center">
            <span className="absolute top-2 right-2 text-2xl cursor-pointer" onClick={() => setIsSuccessModalOpen(false)}>&times;</span>
            <h2 className="text-2xl font-bold mb-4">Success</h2>
            <p>Your changes have been saved successfully!</p>
            <button 
                type="button" 
                className="mt-4 bg-blue-500 text-white font-semibold py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
                onClick={() => setIsSuccessModalOpen(false)}
            >
                OK
            </button>
        </div>
    </div>
)}

             {/* Modal for Rejection Reason */}
             {isRejectReasonModalOpen && (
                <div className="modal fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-800 bg-opacity-75">
                    <div className="modal-content bg-white p-4 max-w-lg max-h-3/4 overflow-y-auto relative">
                        <button className="absolute top-2 right-2 text-gray-700 hover:text-gray-900" onClick={closeRejectReasonModal}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="modal-header flex justify-center items-center mb-4">
                            <h2 className="text-xl font-bold">Rejection Reason</h2>
                        </div>
                        <div className="modal-body">
                            <p>{rejectionReason}</p>
                        </div>
                        <div className="flex justify-end mt-4">
                            <button className="bg-red-500 text-white font-semibold py-2 px-4 rounded hover:bg-red-600 transition duration-300" onClick={closeRejectReasonModal}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
    
)}

{showModal && (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-900 bg-opacity-75 z-50">
        <div className="relative bg-white p-4 rounded-lg shadow-md w-full max-w-6xl">
            <span className="absolute top-2 right-2 text-2xl cursor-pointer" onClick={handleCloseModal}>&times;</span>
            <div id="panolens-container" style={{ width: '100%', height: '600px' }}></div>
            <div className="flex justify-center mt-4">
            </div>
        </div>
    </div>
)}
{currentView === 'rented' && (
    <div className={`${showRentedWarehousesModal ? 'block' : 'hidden'}`}>
        <div className="container mx-auto px-4 mt-10">
            <h2 className="text-3xl font-bold mb-6 textUser">Your Rented Warehouses</h2>
            {rentedWarehouses.length === 0 ? (
                <div className="flex justify-center items-center mt-24">
                    <div className="bg-gray-300 rounded-lg p-6 shadow-md">
                        <p className="text-lg text-gray-900">No rented warehouses found.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {rentedWarehouses.map(warehouse => (
                        <div key={warehouse.warehouseId} className="bg-white rounded-lg shadow-md p-6 relative">
                           {/* Approve Icon */}
{warehouse.status === 'Rented' && (
    <img
        src={approve}
        alt="Approve"
        className="absolute top-0 right-0 cursor-pointer h-12 w-12 mt-3 mr-3 hover:opacity-75 pumping-animation"
        onClick={() => handleNotificationClick(warehouse)} // Pass the entire warehouse object
    />
)}

                            {/* Reject Icon and Modal */}
                           {warehouse.status === 'Rejected' && (
                            <div className="absolute top-0 right-0 cursor-pointer h-10 w-10 mt-3 mr-3 pumping-animation">
                                <img
                                    src={error1}
                                    alt="Reject"
                                    onClick={() => handleRejectModal(warehouse)}
                                />
                            </div>
                        )}


                            <h3 className="text-xl font-semibold mb-4">{warehouse.name}</h3>
                            <div className="text-gray-700 mb-4">
                                <p><strong>Address:</strong> {warehouse.address}</p>
                                <p><strong>Description:</strong> {warehouse.description}</p>
                                <p><strong>Owner:</strong> {warehouse.ownerFirstName} {warehouse.ownerLastName}</p>
                            </div>
                            <p className="text-gray-700 mb-4"><strong>Price:</strong> ₱{warehouse.price}</p>
                            <p className="text-gray-700 mb-4"><strong>Status:</strong> <span style={{ color: warehouse.status === 'Rented' ? 'green' : 'red' }}>{warehouse.status}</span></p>

                            <p className="text-gray-800 font-semibold mb-2">Amenities:</p>
                            <div className="flex flex-wrap mb-4">
                                {warehouse.amenities.map((amenity, index) => (
                                    <div key={index} className="flex items-center mr-4 mb-2">
                                        <img src={amenity.icon} alt={amenity.name} className="w-4 h-4 mr-2" />
                                        <span>{amenity.name}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                {warehouse.images.map((image, index) => (
                                    <img key={index} src={image} alt={`Image ${index + 1}`} className="w-full h-auto rounded-md mb-2" />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
)}
 {/* Rejection Reason Modal */}
 {showRejectModal2 && selectedWarehouse && (
                <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-900 bg-opacity-75 z-50">
                    <div className="bg-white rounded-lg shadow-md p-6 max-w-md">
                        <div className="text-gray-800 text-center mb-4">
                            <h2 className="text-lg font-semibold">Reason of Rejection</h2>
                            <p className="text-base"><strong>{selectedWarehouse.name}</strong></p>
                        </div>
                        <div className="border-t border-gray-300 pt-4">
                            <p className="text-gray-700 px-4 py-2 border border-gray-300 rounded-md">
                                {selectedWarehouse.rejectReason || 'No reason provided'}
                            </p>
                            <div className="flex justify-center mt-4">
                                <button
                                    className="bg-red-600 text-white font-semibold py-2 px-4 rounded hover:bg-red-500 transition duration-300"
                                    onClick={handleCloseRejectModal}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

{/* Renting Approved Modal */}
{showRentingApprovedModal && selectedWarehouse && (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-900 bg-opacity-75 z-50">
        <div className="absolute opacity-75"></div>
        <div className="bg-white rounded-lg shadow-md max-w-md">
            <div className="p-6 flex flex-col items-center">
                <img src={checkMark} alt="Check Mark" className="w-16 h-16 mb-4" />
                <p className="text-gray-700 text-center mb-4">
                    The renting of <strong>{selectedWarehouse.name}</strong> has been approved successfully.
                </p>
                <div className="flex justify-center">
                    <button
                        className="bg-red-500 text-white font-semibold py-2 px-4 rounded hover:bg-red-600 transition duration-300"
                        onClick={() => setShowRentingApprovedModal(false)}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    </div>
)}

{currentView === 'rentals' && (
    <div className={`${showRentedWarehousesModal ? 'block' : 'hidden'}`}>
        <div className="container mx-auto px-4 mt-10">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold textUser">Your Rentals Warehouses</h2>
            </div>
            {rentedWarehouses.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                    <div className="bg-gray-300 rounded-lg p-6 shadow-md">
                        <p className="text-lg text-gray-900">No rentals found.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {rentedWarehouses.map(warehouse => (
                        <div key={warehouse.warehouseId} className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-2xl font-semibold mb-4">{warehouse.name}</h3>
                            <div className="text-gray-700 mb-4 text-xl ">
                                <p><strong>Address:</strong> {warehouse.address}</p>
                                <p><strong>Description:</strong> {warehouse.description}</p>
                                <p><strong>Lessor:</strong> {warehouse.ownerFirstName} {warehouse.ownerLastName}</p>
                            </div>
                            <p className="text-gray-700 mb-4 text-xl"><strong>Price:</strong> ₱{warehouse.price}</p>
                            <p className="text-gray-700 mb-4 text-xl"><strong>Status:</strong> <span style={{ color: warehouse.status === 'Rented' ? 'green' : 'red' }}>{warehouse.status}</span></p>
                            <p className="text-gray-700 mb-4 text-xl"><strong>Lessee:</strong> {warehouse.rentedBy?.firstName} {warehouse.rentedBy?.lastName}</p>
                            <p className="text-gray-800 font-semibold mb-2 text-xl">Amenities:</p>
                            <div className="flex flex-wrap mb-4">
                                {warehouse.amenities.map((amenity, index) => (
                                    <div key={index} className="flex items-center mr-4 mb-2">
                                        <img src={amenity.icon} alt={amenity.name} className="w-4 h-4 mr-2" />
                                        <span>{amenity.name}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                {warehouse.images.map((image, index) => (
                                    <img key={index} src={image} alt={`Image ${index + 1}`} className="w-full h-auto rounded-md mb-2" />
                                ))}
                            </div>
                            <div className="flex space-x-4 mt-4">
                                <button
                                    className="bg-green-500 text-white font-semibold py-2 px-12 rounded hover:bg-green-600 transition duration-300"
                                    onClick={() => markAsRented(warehouse.warehouseId)}
                                >
                                    Approve
                                </button>
                                <button
                                    className="bg-blue-500 text-white font-semibold py-2 px-12 rounded hover:bg-blue-600 transition duration-300"
                                    onClick={() => handleLeaseAgreement(warehouse)}
                                >
                                    Lease Agreement
                                </button>
                                <button
                                    className="bg-red-500 text-white font-semibold py-2 px-12 rounded hover:bg-red-600 transition duration-300"
                                    onClick={() => handleReject(warehouse)}
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
)}



{/* Rejection Reason Modal */}
{showRejectModal && (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-50">
        <div className="absolute inset-0 bg-gray-800 opacity-75"></div>
        <div className="bg-white rounded-lg shadow-md p-6 max-w-xl w-full relative">
            <p className="text-gray-800 text-center mb-4">Reason for Rejecting <strong>{selectedWarehouseName}</strong>:</p>
            <textarea
                className="border border-gray-300 rounded-md p-2 w-full mb-4"
                rows="4"
                placeholder="Enter reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
            ></textarea>
            <div className="flex justify-center">
                <button
                    className="bg-red-500 text-white font-semibold py-2 px-6 rounded hover:bg-red-600 transition duration-300 mr-2"
                    onClick={confirmReject}
                >
                    Submit
                </button>
                <button
                    className="bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded hover:bg-gray-400 transition duration-300"
                    onClick={() => setShowRejectModal(false)}
                >
                    Cancel
                </button>
            </div>
        </div>
    </div>
)}

{showLeaseModal && selectedWarehouse && (
                <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-800 bg-opacity-75 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
                        <h2 className="text-xl font-bold mb-4">Lease Agreement Details</h2>
                        <p><strong>Warehouse Name:</strong> {selectedWarehouse.name}</p>
                        <p><strong>Price:</strong> ₱{selectedWarehouse.price}</p>
                        <p><strong>Lessor:</strong> {selectedWarehouse.ownerFirstName} {selectedWarehouse.ownerLastName}</p>
                        <p><strong>Lessee:</strong> {selectedWarehouse.rentedBy?.firstName} {selectedWarehouse.rentedBy?.lastName}</p>
                        <div className="flex justify-end mt-4">
                            <button
                                className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg mr-2"
                                onClick={transferToLeaseAgreement}
                            >
                                Proceed to Lease Agreement
                            </button>
                            <button
                                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg mr-2"
                                onClick={() => setShowLeaseModal(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
{showLeaseAgreementModal && (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-800 bg-opacity-75 z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md text-center">
            <div className="flex flex-col items-center">
                <img src={warnIcon} alt="Warning Icon" className="h-12 w-12 mr-2" />
                <p className="text-xl font-semibold mt-4 mb-4">You already have a lease agreement for this warehouse.</p>
            </div>
            <div className="flex justify-center">
                <button
                    className="bg-red-500 text-white font-semibold py-2 px-4 rounded hover:bg-red-600 transition duration-300"
                    onClick={handleCloseLeaseAgreementModal}
                >
                    Close
                </button>
            </div>
        </div>
    </div>
)}


<div className="relative">
            {/* Your existing content */}
            <div className={`fixed top-0 left-0 w-full h-full bg-black opacity-50 ${showConfirmationModal || showSuccessMessage ? 'block' : 'hidden'}`}></div>
            {showConfirmationModal && (
                <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-md">
                        <div className="bg-green-500 px-4 py-2 flex justify-between items-center">
                            <h2 className="text-white text-lg font-semibold">Confirm Action</h2>
                            <button
                                className="text-white hover:text-gray-200 focus:outline-none"
                                onClick={() => setShowConfirmationModal(false)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-800 mb-4">Are you sure you want to mark this warehouse as rented?</p>
                            <div className="flex justify-end">
                                <button
                                    className="bg-green-600 text-white font-semibold py-2 px-4 rounded hover:bg-green-500 transition duration-300 mr-2 focus:outline-none"
                                    onClick={confirmMarkAsRented}
                                >
                                    Confirm
                                </button>
                                <button
                                    className="bg-red-600 text-white font-semibold py-2 px-4 rounded hover:bg-red-500 transition duration-300 focus:outline-none"
                                    onClick={() => setShowConfirmationModal(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
{/* Error Modal for No Lease Agreement */}
{showErrorModal && (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-50">
        <div className="absolute bg-gray-800 opacity-75 inset-0"></div> {/* Dim background */}
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md relative z-10">
            <div className="flex flex-col items-center">
                <img src={error1} alt="Error Icon" className="w-16 h-16 mb-4" />
                <p className="font-semibold mb-4 text-center text-xl">You cannot approve without a lease agreement.</p>
                <button
                    className="bg-red-600 text-white font-semibold py-2 px-4 rounded hover:bg-red-500 transition duration-300"
                    onClick={() => setShowErrorModal(false)}
                >
                    Close
                </button>
            </div>
        </div>
    </div>
)}


            {showSuccessMessage && (
                <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-md">
                        <div className="bg-green-500 px-4 py-2 flex justify-between items-center">
                            <h2 className="text-white text-lg font-semibold">Success</h2>
                            <button
                                className="text-white hover:text-gray-200 focus:outline-none"
                                onClick={() => setShowSuccessMessage(false)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-800 mb-4">The warehouse has been marked as rented successfully.</p>
                            <div className="flex justify-end">
                                <button
                                    className="bg-green-500 text-white font-semibold py-2 px-4 rounded hover:bg-green-600 transition duration-300 focus:outline-none"
                                    onClick={() => setShowSuccessMessage(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
        {/* Success Message */}
        {successMessage && (
            <div className="success-message">
                <p>{successMessage}</p>
                <button onClick={closeSuccessMessage} className="absolute top-0 right-0 mr-2 mt-2 text-white">&times;</button>
            </div>
        )}

        {/* Logout Confirmation Modal */}
        {showConfirmation && (
            <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-900 bg-opacity-75 z-50">
                <div className="bg-white p-8 rounded-lg shadow-md w-full md:max-w-lg">
                    <h2 className="text-2xl font-bold mb-4">Are you sure you want to log out?</h2>
                    <div className="flex justify-end">
                        <button className="bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded hover:bg-gray-400 transition duration-300 mr-4" onClick={() => setShowConfirmation(false)}>Cancel</button>
                        <button className="bg-red-500 text-white font-semibold py-2 px-4 rounded hover:bg-red-600 transition duration-300" onClick={handleLogout}>Logout</button>
                    </div>
                </div>
            </div>
        )}

        {showCarousel && (
            <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-900 bg-opacity-75 z-50">
                <div className="bg-white p-8 rounded-lg shadow-md relative">
                    <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={handleClose}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                    <div className="relative overflow-hidden rounded-lg" style={{ maxWidth: '100%', maxHeight: '80vh' }}>
                        <motion.img
                            key={selectedImageIndex}
                            src={carouselImages[selectedImageIndex]}
                            alt={`Image ${selectedImageIndex + 1}`}
                            style={{ width: '100%', height: 'auto' }}
                            initial={{ opacity: 0, x: slideDirection === 'left' ? '100%' : '-100%' }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: slideDirection === 'left' ? '-100%' : '100%' }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                        <button className="bg-gray-200 rounded-full p-2" onClick={handlePrev}>
                            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                            </svg>
                        </button>
                        <button className="bg-gray-200 rounded-full p-2 mx-4" onClick={handleNext}>
                            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5 l7 18l7 7-7 7"></path>
                        </svg>
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
    </div>
);
}
export default Dashboard;


