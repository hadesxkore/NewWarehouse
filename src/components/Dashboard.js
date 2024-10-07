import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import placeholderIcon from '../images/placeholder.png'; // Import report icon

import { motion, AnimatePresence } from 'framer-motion';
import { auth, firestore, storage, db } from '../firebase'; // Assuming you have Firebase storage
import firebase from 'firebase/compat/app'; // Import firebase itself
import * as THREE from 'three';
import  Panorama  from 'panolens';
import * as PANOLENS from 'panolens';
import { doc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';


import error1 from '../images/error1.png';
import Mark from '../images/mark.png';
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
import successGif from "../images/Success.gif"; // Ensure the path is correct

import axios from 'axios';
import L from 'leaflet';    

import './Dashboard.css';


function Dashboard() {
    // State variables
    
    const [showMapModal, setShowMapModal] = useState(false);
    const [center, setCenter] = useState([51.505, -0.09]);
    const [mapKey, setMapKey] = useState(0); // Key for forcing remount of MapContainer
    const [showSuccessGif, setShowSuccessGif] = useState(false);

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
  // Define state for handling the documents modal and selected documents
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [selectedWarehouseDocuments, setSelectedWarehouseDocuments] = useState([]);
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
const [isStatusSaved, setIsStatusSaved] = useState(false);

const [showDeleteModal, setShowDeleteModal] = useState(false);
const [warehouseToDelete, setWarehouseToDelete] = useState(null);
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
    const [uploadProgress, setUploadProgress] = useState(0);
    const [fileLabels, setFileLabels] = useState({});
    const [currentWarehouse, setCurrentWarehouse] = useState(null);
    const [showErrorModal, setShowErrorModal] = useState(false); // State for showing error modal
    const [showRentingApprovedModal, setShowRentingApprovedModal] = useState(false);
    const [selectedWarehouseName, setSelectedWarehouseName] = useState('');
    const [isIdOptionsModalOpen, setIsIdOptionsModalOpen] = useState(false);
    const [alreadyUploadedModalVisible, setAlreadyUploadedModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false); // Control modal visibility
    const [showDocumentStatusModal, setShowDocumentStatusModal] = useState(false);
    const [rejectReasonModalOpen, setRejectReasonModalOpen] = useState(false);
    const [currentRejectIndex, setCurrentRejectIndex] = useState(null); // Track which document's rejection reason is being entered
    const [rejectionReasons, setRejectionReasons] = useState({}); // Store rejection reasons for each document

    const [tooltipVisibleIndex, setTooltipVisibleIndex] = useState(null); // State to track the hovered document

// Add these state variables and handlers to your Dashboard component
const [isSubmitDocumentsModalOpen, setIsSubmitDocumentsModalOpen] = useState(false);

 
const [documents, setDocuments] = useState({
    taxIdentificationNumber: { file: null, fileName: 'Choose File' },
    birRegistration: { file: null, fileName: 'Choose File' },
    barangayClearance: { file: null, fileName: 'Choose File' },
    letterOfIntent: { file: null, fileName: 'Choose File' },
    governmentIssuedId: { file: null, fileName: 'Choose File' },
    financialCapabilityProof: { file: null, fileName: 'Choose File' },

  });
  
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
    
 
// Function to check if documents are already uploaded and open the respective modal
const openSubmitDocumentsModal = async (warehouse) => {
    // Fetch the warehouse document from Firestore
    const warehouseRef = firestore.collection('rentedWarehouses').doc(warehouse.warehouseId);
    const warehouseDoc = await warehouseRef.get();
  
    if (warehouseDoc.exists && warehouseDoc.data().documents) {
      // If documents exist, show the "Already Uploaded" modal
      setAlreadyUploadedModalVisible(true);
    } else {
      // If no documents exist, proceed to open the "Submit Documents" modal
      setSelectedWarehouse(warehouse);
      setIsSubmitDocumentsModalOpen(true);
    }
  };
  
  
  // Closes the modal for submitting documents
  const closeSubmitDocumentsModal = () => {
    setIsSubmitDocumentsModalOpen(false);
    setSelectedWarehouse(null);
  };
  
  
  // Handle file changes
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setDocuments(prevDocuments => ({
        ...prevDocuments,
        [type]: file,
      }));
      setFileLabels(prevFileLabels => ({
        ...prevFileLabels,
        [type]: file.name
      }));
    } else {
      setDocuments(prevDocuments => ({
        ...prevDocuments,
        [type]: null,
      }));
      setFileLabels(prevFileLabels => ({
        ...prevFileLabels,
        [type]: ''
      }));
    }
  };

  const openIdOptionsModal = () => {
    setIsIdOptionsModalOpen(true);
  };

  const closeIdOptionsModal = () => {
    setIsIdOptionsModalOpen(false);
  };
  
  const handleDocumentSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedWarehouse) {
      setIsLoading(true); // Show loading state
      setUploadProgress(0); // Reset upload progress
  
      try {
        const documentUrls = {};
        const uploadTasks = [];
  
        for (const [key, file] of Object.entries(documents)) {
          if (file) {
            const storageRef = storage.ref(`documents/${selectedWarehouse.warehouseId}/${key}/${file.name}`);
            
            const uploadTask = storageRef.put(file);
            
            uploadTask.on('state_changed', 
              (snapshot) => {
                // Calculate and update upload progress
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
              },
              (error) => {
                // Handle errors
                console.error('Upload error: ', error);
                alert('Failed to upload some documents. Please try again.');
              },
              async () => {
                // Get the file URL and save it
                const fileUrl = await uploadTask.snapshot.ref.getDownloadURL();
                documentUrls[key] = fileUrl;
              }
            );
  
            uploadTasks.push(uploadTask);
          }
        }
  
        // Wait for all upload tasks to complete
        await Promise.all(uploadTasks);
  
        // Update Firestore with document URLs
        const warehouseRef = firestore.collection('rentedWarehouses').doc(selectedWarehouse.warehouseId);
        await warehouseRef.update({ documents: documentUrls });
    
        setSubmissionSuccessModalVisible(true); // Show success modal
      } catch (error) {
        console.error('Error submitting documents: ', error);
        alert('Failed to submit documents. Please try again.');
      } finally {
        setIsLoading(false); // Hide loading state
      }
    }
  };
  
 
  const handleViewDocuments = async (warehouse) => {
    console.log("Warehouse Object:", warehouse);
    console.log("Warehouse ID:", warehouse.warehouseId);

    if (!warehouse.warehouseId) {
        alert("Invalid warehouse ID.");
        return;
    }


    
    // Fetch the latest data from Firestore
    const warehouseData = await firestore.collection('rentedWarehouses').doc(warehouse.warehouseId).get();
    const data = warehouseData.data();

    // Ensure data is valid
    if (!data) {
        console.error("No data found for the specified warehouse ID.");
        return;
    }

    const documents = [
        { 
            name: 'Tax Identification Number', 
            url: data.documents?.taxIdentificationNumber, 
            status: data.documents?.taxidentificationnumberStatus, 
            rejectionReason: '', // Initialize the rejection reason
        },
        { 
            name: 'BIR Registration', 
            url: data.documents?.birRegistration, 
            status: data.documents?.birregistrationStatus,
            rejectionReason: '', // Initialize the rejection reason
        },
        { 
            name: 'Barangay Clearance', 
            url: data.documents?.barangayClearance, 
            status: data.documents?.barangayclearanceStatus,
            rejectionReason: '', // Initialize the rejection reason
        },
        { 
            name: 'Letter of Intent', 
            url: data.documents?.letterOfIntent, 
            status: data.documents?.letterofintentStatus,
            rejectionReason: '', // Initialize the rejection reason
        },
        { 
            name: 'Financial Capability Proof', 
            url: data.documents?.financialCapabilityProof, 
            status: data.documents?.financialcapabilityproofStatus,
            rejectionReason: '', // Initialize the rejection reason
        },
        { 
            name: 'Government Issued ID', 
            url: data.documents?.governmentIssuedId, 
            status: data.documents?.governmentissuedidStatus,
            rejectionReason: '', // Initialize the rejection reason
        },
    ].filter(doc => doc.url); // Filter out undefined documents
    
    // Set documents state
    setSelectedWarehouseDocuments(documents);
    setSelectedWarehouse(warehouse);

    // Check if any documents have statuses
    setIsStatusSaved(documents.some(doc => doc.status));

    // Check if current user is the lessee or lessor
    const currentUser = firebase.auth().currentUser; // Assuming you're using Firebase Auth
    console.log("Current User ID:", currentUser.uid); // Log current user's ID

    const isLessor = data.ownerUid && data.ownerUid === currentUser.uid; // Check if the current user is the lessor
    const isLessee = data.userUid && data.userUid === currentUser.uid; // Check if the current user is the lessee

    console.log("Is Lessor:", isLessor); // Log the result of lessor check
    console.log("Is Lessee:", isLessee); // Log the result of lessee check

    if (isLessor) {
        // Open the documents modal for the lessor
        setShowDocumentsModal(true);
    } else if (isLessee) {
        // Open the document status modal for the lessee
        setShowDocumentStatusModal(true);
    } else {
        alert("You are not authorized to view the documents for this warehouse.");
    }
};


// Function to show the rejection reason modal
const handleViewRejectionReason = (reason) => {
    setRejectionReason(reason); // Set the rejection reason
    setShowRejectionReasonModal(true); // Show the modal
};
// Function to open the rejection reason modal
const handleRejectClick = (index) => {
    setCurrentRejectIndex(index); // Set the index of the document being rejected
    setRejectReasonModalOpen(true); // Open the rejection reason modal
};
// Update the handleDocumentStatusChange function to open the modal for rejection
const handleDocumentStatusChange = (index, status) => {
    if (status === 'rejected') {
        handleRejectClick(index); // Open rejection reason modal
    } else {
        setSelectedWarehouseDocuments(prevDocuments => {
            const updatedDocuments = [...prevDocuments];
            updatedDocuments[index].status = status; // Update the status (approved/rejected)
            return updatedDocuments;
        });
    }
};
const handleSaveRejectionReason = () => {
    setSelectedWarehouseDocuments(prevDocuments => {
        const updatedDocuments = [...prevDocuments];
        if (currentRejectIndex !== null) {
            updatedDocuments[currentRejectIndex].rejectionReason = rejectionReason; // Store the rejection reason directly from the input
            updatedDocuments[currentRejectIndex].status = 'rejected'; // Ensure status is set to rejected
        }
        return updatedDocuments;
    });

    setRejectReasonModalOpen(false); // Close the modal
    setRejectionReason(''); // Reset the reason for the next time
};


const handleSaveDocumentStatus = async () => {
    const warehouseId = selectedWarehouse?.warehouseId;

    if (!warehouseId) {
        alert("Invalid warehouse ID.");
        return;
    }

    // Prepare the updated document statuses and rejection reasons
    const updatedDocumentStatuses = selectedWarehouseDocuments.reduce((acc, doc) => {
        acc[`${doc.name.replace(/\s+/g, '').toLowerCase()}Status`] = doc.status;
        
        // Add rejection reason if available
        if (doc.rejectionReason) {
            acc[`${doc.name.replace(/\s+/g, '').toLowerCase()}RejectionReason`] = doc.rejectionReason;
        }
        
        return acc;
    }, {});

    try {
        await firestore.collection('rentedWarehouses').doc(warehouseId).update({
            documents: {
                ...selectedWarehouse.documents, // Keep original URLs
                ...updatedDocumentStatuses // Save updated statuses and rejection reasons
            }
        });

        // Update local state after saving
        setSelectedWarehouseDocuments(prevDocuments => 
            prevDocuments.map(doc => ({
                ...doc,
                status: doc.status // Ensure status is set
            }))
        );

        setIsStatusSaved(true); // Set the status as saved

        // Show success modal instead of alert
        setModalMessage('Document statuses updated successfully.');
        setIsModalOpen(true);
        setShowDocumentsModal(false);

        // Refresh the document list after saving
        handleViewDocuments(selectedWarehouse); // Refresh documents to get updated status
    } catch (error) {
        console.error("Error updating document:", error);
        alert("Failed to update document.");
    }
};


  
  // Function to handle document approval/rejection
  const handleDocumentApproval = (documentName, status) => {
    setSelectedWarehouseDocuments(prevDocs => 
      prevDocs.map(doc => 
        doc.name === documentName ? { ...doc, status } : doc
      )
    );
  };
  
    // Function to close the "View Documents" modal
    const closeDocumentsModal = () => {
        setShowDocumentsModal(false);
        setSelectedWarehouseDocuments([]); // Clear the selected documents
      };
    
     // Function to handle downloading a document
  const handleDownloadDocument = (url, name) => {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', name);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };
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
        const [errorMessage, setErrorMessage] = useState('');
        const [isSubmissionSuccessModalVisible, setSubmissionSuccessModalVisible] = useState(false);
        const [isLoading, setIsLoading] = useState(false);
        const [showRejectionReasonModal, setShowRejectionReasonModal] = useState(false);

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
const confirmMarkAsRented = async () => {
    try {
        console.log('Warehouse ID in markAsRented:', selectedWarehouseId); // Debug log

        if (!selectedWarehouseId) {
            throw new Error('Warehouse ID is undefined.');
        }

        // Get the rented warehouse details to find the ownerUid and userId
        const rentedWarehouseRef = firestore.collection('rentedWarehouses').doc(selectedWarehouseId);
        const rentedWarehouseDoc = await rentedWarehouseRef.get();

        if (!rentedWarehouseDoc.exists) {
            throw new Error('Rented warehouse document does not exist.');
        }

        const rentedWarehouseData = rentedWarehouseDoc.data();
        const ownerUid = rentedWarehouseData.ownerUid;
        const warehouseId = rentedWarehouseData.warehouseId; // Make sure this field exists
        const lesseeUserId = rentedWarehouseData.rentedBy?.userId; // Fetch lessee userId

        if (!lesseeUserId) {
            throw new Error('Lessee userId is undefined.');
        }

        // Update the status of the rented warehouse to 'Rented'
        await rentedWarehouseRef.update({
            status: 'Rented'
        });

        console.log('Rented warehouse marked as rented successfully.');

        // Find the corresponding warehouse document using ownerUid
        const warehousesRef = firestore.collection('warehouses');
        const querySnapshot = await warehousesRef.where('userUid', '==', ownerUid).get();

        if (querySnapshot.empty) {
            throw new Error('No matching warehouse found for the given ownerUid.');
        }

        // Assuming there's only one warehouse per ownerUid
        const warehouseDoc = querySnapshot.docs[0];

        // Update the status of the warehouse to 'Rented', add lesseeUserId, and add warehouseId
        await warehouseDoc.ref.update({
            rentStatus: 'Rented',
            userId: lesseeUserId, // Add lessee's userId to the warehouse document
            warehouseId: selectedWarehouseId // Add the warehouseId to the warehouse document
        });

        console.log('Warehouse marked as rented, lesseeUserId added, and warehouseId updated successfully.');

        // Close the confirmation modal
        setShowConfirmationModal(false);

        // Show success GIF
        setShowSuccessGif(true); // Trigger success GIF

        // Automatically close the success GIF after 1 second
        setTimeout(() => {
            setShowSuccessGif(false);
        }, 1400); // 1000 milliseconds = 1 second

    } catch (error) {
        console.error('Error updating warehouse status:', error);
        // Handle error: Show an error message or log it
    }
};

const handleCloseSuccessGif = () => {
    setShowSuccessGif(false);
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

    const handleDeleteWarehouse = (warehouse) => {
        setWarehouseToDelete(warehouse);
        setShowDeleteModal(true);
    };
    

    const confirmDelete = async () => {
        if (warehouseToDelete) {
            try {
                // Delete warehouse data from Firestore
                await firestore.collection("warehouses").doc(warehouseToDelete.id).delete();
    
                // Delete images associated with the warehouse from Firebase Storage
                for (const imageUrl of warehouseToDelete.images) {
                    const imageRef = storage.refFromURL(imageUrl);
                    await imageRef.delete();
                }
    
                // Delete videos associated with the warehouse from Firebase Storage
                for (const videoUrl of warehouseToDelete.videos) {
                    const videoRef = storage.refFromURL(videoUrl);
                    await videoRef.delete();
                }
    
                // Remove the deleted warehouse from the state
                setUserWarehouses((prevWarehouses) => prevWarehouses.filter((w) => w.id !== warehouseToDelete.id));
    
                // Show success message
                setSuccessMessage("Warehouse deleted successfully.");
            } catch (error) {
                console.error("Error deleting warehouse:", error);
                // Show error message
                setErrorMessage("An error occurred while deleting the warehouse.");
            } finally {
                setShowDeleteModal(false);
                setWarehouseToDelete(null);
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
                { id: "buildingPermit", label: "Sanitary Permit" },
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
{/* Confirmation Modal */}
{showDeleteModal && (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full relative overflow-hidden flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </div>
            <p className="text-lg font-semibold text-red-800 mb-4 text-center">Are you sure you want to delete this warehouse?</p>
            <div className="flex space-x-4">
                <button 
                    onClick={confirmDelete}
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 ease-in-out"
                >
                    Delete
                </button>
                <button 
                    onClick={() => setShowDeleteModal(false)}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 ease-in-out"
                >
                    Cancel
                </button>
            </div>
        </div>
    </div>
)}


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
                            <p className="text-gray-700 mb-4">
                                <strong>Status:</strong>
                                <span style={{ color: warehouse.status === 'Rented' ? 'green' : 'red' }}>
                                    {warehouse.status}
                                </span>
                            </p>

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

                            {/* Submit Documents Button */}
                            <button
                                className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-500"
                                onClick={() => openSubmitDocumentsModal(warehouse)}
                            >
                                Submit Documents
                            </button>
                              {/* Document Status Button */}
                              <button
                                className="mt-4 ml-2 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-500"
                                onClick={() => handleViewDocuments(warehouse)}
                            >
                                Document Status
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
)}

{showDocumentStatusModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl"> {/* Wider card */}
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Document Status</h2>
            {/* Documents List */}
            {selectedWarehouseDocuments.length > 0 ? (
                <ul className="space-y-4">
                    {selectedWarehouseDocuments.map((document, index) => (
                        <li key={index} className="flex justify-between items-center p-4 bg-gray-100 rounded-lg">
                            <span className="text-lg">{document.name}</span>
                            <div className="flex items-center space-x-4">
                                {/* View Button */}
                                <button
                                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500 transition duration-300"
                                    onClick={() => window.open(document.url, '_blank')}
                                >
                                    View
                                </button>

                              
                                        {/* Document Status */}
                                        <div className="relative"> {/* Added relative positioning */}
                                            <div className="flex items-center justify-center p-2 bg-white rounded-lg shadow-md border border-gray-200 w-full max-w-xs">
                                                <div
                                                    className={`flex items-center justify-center text-sm font-semibold w-32 ${document.status === 'approved' ? 'text-green-600' : document.status === 'rejected' ? 'text-red-600 cursor-pointer hover:underline' : 'text-orange-600'}`}
                                                    onClick={() => {
                                                        if (document.status === 'rejected') {
                                                            // Determine the rejection reason based on document name
                                                            const rejectionReasonField = `${document.name.replace(/\s+/g, '').toLowerCase()}RejectionReason`;
                                                            const rejectionReason = selectedWarehouse.documents[rejectionReasonField];
                                                            handleViewRejectionReason(rejectionReason);
                                                        }
                                                    }}
                                                    onMouseEnter={() => setTooltipVisibleIndex(index)} // Show tooltip for the hovered document
                                                    onMouseLeave={() => setTooltipVisibleIndex(null)} // Hide tooltip when not hovering
                                                >
                                                    <span>
                                                        {document.status === 'approved' ? '✅ Approved' : document.status === 'rejected' ? '❌ Rejected' : '🟠 Pending'}
                                                    </span>
                                                </div>
                                            </div>
                                            {/* Tooltip */}
                                            {document.status === 'rejected' && tooltipVisibleIndex === index && (
                                                <div className="absolute z-10 w-48 p-2 text-sm text-white bg-gray-800 rounded-lg shadow-lg -top-10 left-1/2 transform -translate-x-1/2 text-center">
                                                    <span className="font-medium">Click to view the reason of rejection</span>
                                                </div>
                                            )}


                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-center text-gray-600">No documents submitted.</p>
            )}
              {/* Note for the user */}
<div className="mt-4 p-4 bg-gray-100 rounded-lg shadow-md">
    <p className="text-sm text-gray-700 text-center">
        Note: If you want to know why a document was rejected, simply hover over the rejected status and click on it.
    </p>
</div>

            <div className="mt-6 flex justify-end">
                <button
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-500 transition duration-300"
                    onClick={() => setShowDocumentStatusModal(false)}
                >
                    Close
                </button>
            </div>
        </div>
    </div>
)}



{showRejectionReasonModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md mx-4">
            <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Reason for Rejection</h2>
            <div className="bg-gray-100 p-4 rounded-lg mb-6"> {/* New background for reason */}
                <p className="text-lg text-gray-700 text-center">{rejectionReason}</p>
            </div>
            <div className="flex justify-center">
                <button
                    className="bg-red-600 text-white px-6 py-3 rounded hover:bg-red-500 transition duration-300"
                    onClick={() => setShowRejectionReasonModal(false)}
                >
                    Close
                </button>
            </div>
        </div>
    </div>
)}

{/* Submit Documents Modal */}
{isSubmitDocumentsModalOpen && (
  <div className="fixed inset-0 bg-gray-800 bg-opacity-60 flex justify-center items-center z-50">
    <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 md:w-3/4 lg:w-2/3 max-h-[90vh] overflow-y-auto">
      <h2 className="text-2xl font-semibold mb-6 text-center text-gray-900">
        Submit Documents for {selectedWarehouse?.name}
      </h2>
      <form onSubmit={handleDocumentSubmit}>
      {/* Tax Identification Number */}
      <div className="flex flex-col mb-4">
        <label className="text-gray-800 font-medium mb-2" htmlFor="taxIdentificationNumber">
        Tax Identification Number
        </label>
        <input
          type="file"
          id="taxIdentificationNumber"
          className="hidden"
          onChange={(e) => handleFileChange(e, 'taxIdentificationNumber')}
          required
        />
        <label
          htmlFor="taxIdentificationNumber"
          className="flex items-center justify-between w-full p-2 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
        >
          <span className="text-gray-700">Choose File</span>
          <span className="text-blue-600">{fileLabels.taxIdentificationNumber || 'Choose'}</span>
        </label>
      </div>

      {/* BIR Registration (BIR Certificate of Registration Form 2303) */}
      <div className="flex flex-col mb-4">
        <label className="text-gray-800 font-medium mb-2" htmlFor="birRegistration">
          BIR Registration (Form 2303)
        </label>
        <input
          type="file"
          id="birRegistration"
          className="hidden"
          onChange={(e) => handleFileChange(e, 'birRegistration')}
          required
        />
        <label
          htmlFor="birRegistration"
          className="flex items-center justify-between w-full p-2 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
        >
          <span className="text-gray-700">Choose File</span>
          <span className="text-blue-600">{fileLabels.birRegistration || 'Choose'}</span>
        </label>
      </div>

      {/* Barangay Clearance */}
      <div className="flex flex-col mb-4">
        <label className="text-gray-800 font-medium mb-2" htmlFor="barangayClearance">
          Barangay Clearance
        </label>
        <input
          type="file"
          id="barangayClearance"
          className="hidden"
          onChange={(e) => handleFileChange(e, 'barangayClearance')}
          required
        />
        <label
          htmlFor="barangayClearance"
          className="flex items-center justify-between w-full p-2 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
        >
          <span className="text-gray-700">Choose File</span>
          <span className="text-blue-600">{fileLabels.barangayClearance || 'Choose'}</span>
        </label>
      </div>

      {/* Letter of Intent (LOI) */}
      <div className="flex flex-col mb-4">
        <label className="text-gray-800 font-medium mb-2" htmlFor="letterOfIntent">
          Letter of Intent (LOI)
        </label>
        <input
          type="file"
          id="letterOfIntent"
          className="hidden"
          onChange={(e) => handleFileChange(e, 'letterOfIntent')}
          required
        />
        <label
          htmlFor="letterOfIntent"
          className="flex items-center justify-between w-full p-2 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
        >
          <span className="text-gray-700">Choose File</span>
          <span className="text-blue-600">{fileLabels.letterOfIntent || 'Choose'}</span>
        </label>
      </div>

      {/* Proof of Financial Capability (Bank Statement or Latest Income Tax Return) */}
      <div className="flex flex-col mb-4">
        <label className="text-gray-800 font-medium mb-2" htmlFor="financialCapabilityProof">
          Proof of Financial Capability (Bank Statement or Latest Income Tax Return)
        </label>
        <input
          type="file"
          id="financialCapabilityProof"
          className="hidden"
          onChange={(e) => handleFileChange(e, 'financialCapabilityProof')}
          required
        />
        <label
          htmlFor="financialCapabilityProof"
          className="flex items-center justify-between w-full p-2 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
        >
          <span className="text-gray-700">Choose File</span>
          <span className="text-blue-600">{fileLabels.financialCapabilityProof || 'Choose'}</span>
        </label>
      </div>

      {/* Government Issued ID */}
      <div className="flex flex-col mb-4">
        <label className="text-gray-800 font-medium mb-2" htmlFor="governmentIssuedId">
          Government Issued ID
        </label>
        <input
          type="file"
          id="governmentIssuedId"
          className="hidden"
          onChange={(e) => handleFileChange(e, 'governmentIssuedId')}
          required
        />
        <label
          htmlFor="governmentIssuedId"
          className="flex items-center justify-between w-full p-2 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
        >
          <span className="text-gray-700">Choose File</span>
          <span className="text-blue-600">{fileLabels.governmentIssuedId || 'Choose'}</span>
        </label>
        <button
          type="button"
          onClick={() => openIdOptionsModal()}
          className="text-blue-600 mt-2 text-sm hover:underline"
        >
          What IDs are accepted?
        </button>
      </div>

        {/* Submit and Cancel Buttons */}
        <div className="flex justify-end space-x-2 mt-6">
          <button
            type="button"
            className="bg-red-600 text-white py-2 px-4 rounded-lg shadow-sm hover:bg-red-500"
            onClick={closeSubmitDocumentsModal}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-green-600 text-white py-2 px-4 rounded-lg shadow-sm hover:bg-green-500"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  </div>
)}

 {/* ID Options Modal */}
 {isIdOptionsModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-3/4 md:w-1/2 lg:w-1/3">
            <h2 className="text-2xl font-bold mb-4">Accepted Government Issued IDs</h2>
            <ul className="list-disc pl-5 mb-4">
              <li>Philippine Identification (PhilID) / ePhilID</li>
              <li>Social Security System (SSS) Card</li>
              <li>Unified Multi-Purpose Identification (UMID) Card</li>
              <li>Land Transportation Office (LTO) Driver’s License</li>
              <li>Professional Regulatory Commission (PRC) ID</li>
              <li>Philippine National ID (PhilID)</li>
              <li>Overseas Workers Welfare Administration/Integrated Department of Labor and Employment ID (OWWA/iDole ID)</li>
              <li>Voter’s ID</li>
              <li>Philippine National Police (PNP) firearms license</li>
            </ul>
            <button
              className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-700 justify-end"
              onClick={closeIdOptionsModal}
            >
              Close
            </button>
          </div>
        </div>
        )}

{isLoading && (
  <div className="fixed inset-0 bg-gray-800 bg-opacity-70 flex justify-center items-center z-50">
    <div className="bg-white rounded-lg shadow-lg p-4 w-80 max-w-sm">
      <div className="text-center">
        <div className="mb-4">
          <div className="text-lg font-semibold text-blue-600">Uploading...</div>
          <div className="relative pt-2">
            <div className="text-xs font-semibold inline-block py-1 px-2 rounded-full text-teal-600 bg-teal-200">
              {Math.round(uploadProgress)}%
            </div>
            <div className="mt-2 h-2 bg-gray-300 rounded-full overflow-hidden">
              <div
                className="bg-teal-600 h-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            {uploadProgress < 100 && (
              <div className="text-sm text-gray-600 mt-2">Please wait...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
)}

{isSubmissionSuccessModalVisible && (
  <div className="fixed inset-0 bg-gray-800 bg-opacity-70 flex justify-center items-center z-50">
    <div className="bg-white rounded-lg shadow-lg p-4 w-80 max-w-sm">
      <div className="text-center">
        <div className="text-lg font-semibold mb-2 text-green-600">Success!</div>
        <p className="text-gray-700 mb-4">Your documents have been submitted successfully.</p>
        <button
          type="button"
          onClick={() => setSubmissionSuccessModalVisible(false)}
          className="bg-green-600 text-white py-2 px-4 rounded-lg shadow-sm hover:bg-green-500"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
{alreadyUploadedModalVisible && (
  <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
    <div className="bg-white p-8 rounded-xl shadow-2xl w-96 max-w-lg relative">
      {/* Icon Inside the Modal */}
      <div className="flex justify-center mb-6">
        <img src={Mark} alt="Warning Icon" className="w-12 h-12" />
      </div>

      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Documents Already Uploaded</h2>
        <p className="text-gray-600 mb-6">
          You have already submitted the required documents for this warehouse.
        </p>
        <button
          className="bg-red-500 text-white py-2 px-6 rounded-lg hover:bg-red-600 transition-colors duration-300 shadow-md"
          onClick={() => setAlreadyUploadedModalVisible(false)}
        >
          OK
        </button>
      </div>
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
                            <div className="flex space-x-2 mt-4">
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
                                {/* View Documents Button */}
                                <button
                                    className="bg-purple-500 text-white font-semibold py-2 px-12 rounded hover:bg-purple-600 transition duration-300"
                                    onClick={() => handleViewDocuments(warehouse)}
                                >
                                    Review Documents
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

       
        {showDocumentsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full relative">
                <h3 className="text-2xl font-bold mb-6">Submitted Documents</h3>
                {/* Close Button */}
                <button
                    className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
                    onClick={closeDocumentsModal}
                >
                    ✕
                </button>

                {/* Documents List */}
                {selectedWarehouseDocuments.length > 0 ? (
                <ul className="space-y-4">
                    {selectedWarehouseDocuments.map((document, index) => (
                        <li key={index} className="flex justify-between items-center p-4 bg-gray-100 rounded-lg">
                            <span className="text-lg">{document.name}</span>
                            <div className="flex space-x-4 items-center">
                                <button
                                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500 transition duration-300"
                                    onClick={() => window.open(document.url, '_blank')}
                                >
                                    View
                                </button>
                                <button
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500 transition duration-300"
                                    onClick={() => handleDownloadDocument(document.url)}
                                >
                                    Download
                                </button>
                                <div className="flex items-center justify-between p-2 bg-white rounded-lg shadow-md border border-gray-200 w-full max-w-xs">
                                    {document.status ? (
                                        <div className={`flex items-center justify-center text-sm font-semibold ${document.status === 'approved' ? 'text-green-600' : 'text-red-600'} w-32`}>
                                            <span>
                                                {document.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center space-x-2 w-full">
                                            <label className="flex items-center text-sm">
                                                <input
                                                    type="radio"
                                                    name={`status-${index}`}
                                                    value="approved"
                                                    checked={document.status === 'approved'}
                                                    onChange={() => handleDocumentStatusChange(index, 'approved')}
                                                    className="form-radio h-4 w-4 text-green-600 accent-green-600"
                                                />
                                                <span className="ml-1 text-green-600">Approve</span>
                                            </label>
                                            <label className="flex items-center text-sm">
                                                <input
                                                    type="radio"
                                                    name={`status-${index}`}
                                                    value="rejected"
                                                    checked={document.status === 'rejected'}
                                                    onChange={() => handleDocumentStatusChange(index, 'rejected')}
                                                    className="form-radio h-4 w-4 text-red-600 accent-red-600"
                                                />
                                                <span className="ml-1 text-red-600">Reject</span>
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-center text-gray-600">No documents submitted.</p>
            )}
    {/* Save Button */}
    <button
                className="bg-blue-600 text-white px-6 py-3 mt-6 rounded hover:bg-blue-500 transition duration-300 w-full"
                onClick={handleSaveDocumentStatus}
            >
                Save
            </button>
                </div>
            </div>
        )}
    </div>
)}

{/* Rejection Reason Modal */}
{rejectReasonModalOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full relative">
            <h3 className="text-2xl font-bold mb-6">Reason for Rejection</h3>
            
            {/* Close Button */}
            <button
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
                onClick={() => setRejectReasonModalOpen(false)}
            >
                ✕
            </button>

            {/* Rejection Reason Textarea */}
            <textarea
                className="w-full p-4 border border-gray-300 rounded-lg"
                rows="4"
                placeholder="Please state your reason for rejecting this document..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
            ></textarea>

            {/* Save Rejection Reason Button */}
            <button
                className="bg-red-600 text-white px-6 py-3 mt-6 rounded hover:bg-red-500 transition duration-300 w-full"
                onClick={handleSaveRejectionReason}
            >
                Save Reason
            </button>
        </div>
    </div>
)}
{/* Success Modal */}
{isModalOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full text-center relative">
            
            {/* Checkmark Icon Inside Modal */}
            <div className="flex justify-center items-center mb-6">
                <div className="bg-green-500 rounded-full p-4 shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            </div>

            {/* Success Text */}
            <div className="mt-2">
                <h2 className="text-2xl font-bold text-green-600 mb-4">Success!</h2>
                <p className="text-gray-700">{modalMessage}</p>
            </div>

            {/* Close Button */}
            <div className="mt-6">
                <button
                    className="bg-green-600 text-white px-10 py-2 rounded-2xl hover:bg-green-500 transition duration-300"
                    onClick={() => setIsModalOpen(false)}
                >
                    OK
                </button>
            </div>
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

              {/* Success GIF Modal */}
              {showSuccessGif && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-2xl p-4 relative max-w-xs">
                        <img src={successGif} alt="Success" className="w-32 h-32 object-cover mx-auto" />
                        <div className="text-center mt-2">
                            <h2 className="text-lg font-bold text-green-600">Success!</h2>
                            <p className="text-sm">The warehouse has been marked as rented.</p>
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
       {/* Success Message Modal */}
{successMessage && (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full relative overflow-hidden">
            <button 
                onClick={closeSuccessMessage} 
                className="absolute top-2 right-2 bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-full p-1.5 transition-colors duration-200 ease-in-out"
                aria-label="Close"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <p className="text-lg font-semibold text-green-800 mb-4">{successMessage}</p>
                <button 
                    onClick={closeSuccessMessage} 
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 ease-in-out"
                >
                    Close
                </button>
            </div>
        </div>
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


