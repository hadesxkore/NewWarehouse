import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import placeholderIcon from '../images/placeholder.png'; // Import report icon

import { motion, AnimatePresence } from 'framer-motion';
import { auth, firestore, storage, db } from '../firebase'; // Assuming you have Firebase storage
import firebase from 'firebase/compat/app'; // Import firebase itself
import * as THREE from 'three';
import  Panorama  from 'panolens';
import * as PANOLENS from 'panolens';
import { doc, updateDoc, deleteField, getFirestore, getDoc  } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { HiOutlineX, HiCheck, HiMap , HiTrash, HiCheckCircle, HiUpload, HiDocumentText, HiOutlineStatusOnline, HiEye, HiOutlineRefresh, HiX, HiXCircle, HiRefresh ,
    HiOutlineDocumentText, HiOutlineSave, HiOutlineBan
 } from 'react-icons/hi'; // Import the HiTrash icon

import { HiExclamationCircle, HiInformationCircle   } from 'react-icons/hi';


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
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [currentFile, setCurrentFile] = useState(''); // State to hold the current file name
    const [userDocuments, setUserDocuments] = useState([]); // Renamed variable
    const [isModalVisible, setIsModalVisible] = useState(false); // Renamed variable
    const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
const [rejectionMessage, setRejectionMessage] = useState('');
const [existingDocuments, setExistingDocuments] = useState({});

    // Inside your component
const [searchText, setSearchText] = useState('');
const [suggestions, setSuggestions] = useState([]);
const [rejectionReasonModalVisible, setRejectionReasonModalVisible] = useState(false);
const [currentRejectionReason, setCurrentRejectionReason] = useState(""); // Store the rejection reason
const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
const [transactionStatus, setTransactionStatus] = useState("");
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
  const [isPopupOpen, setIsPopupOpen] = useState(false); // To control popup visibility
  const [popupMessage, setPopupMessage] = useState(''); // For the popup message/content

  const [selectedWarehouseDocuments, setSelectedWarehouseDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null); // New state to track selected document
  const [showApprovalConfirmationModal, setShowApprovalConfirmationModal] = useState(false);
  const [documentToApproveIndex, setDocumentToApproveIndex] = useState(null); // To keep track of which document is being approved
  
const [show360ImageModal, setShow360ImageModal] = useState(false);
const [current360ImageUrl, setCurrent360ImageUrl] = useState('');
const [isValidUrl, setIsValidUrl] = useState(true);
const [reviewedDocumentIndex, setReviewedDocumentIndex] = useState(null);
const [newStatus, setNewStatus] = useState(null); // To store the new status

    const [rentalWarehouses, setRentalWarehouses] = useState([]);
    const [showRentalWarehousesModal, setShowRentalWarehousesModal] = useState(false);
  // State for managing confirmation modal visibility
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  
  // State for storing the warehouse ID to be rented
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showRejectModal2, setShowRejectModal2] = useState(false);
const [rejectReason, setRejectReason] = useState('');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);
  const [showValidationModal, setShowValidationModal] = useState(false);

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
    const [newFile, setNewFile] = useState(null); // State to hold the new file
    const [currentDocumentIndex, setCurrentDocumentIndex] = useState(null); // Track which document is being resubmitted
    const [loadingStatus, setLoadingStatus] = useState(false);
    const [progressPercentage, setProgressPercentage] = useState(0);
    const [successNotificationVisible, setSuccessNotificationVisible] = useState(false);
    const [documentType, setDocumentType] = useState(''); // State to hold the current document type
// State for the Resubmit modal
const [isResubmitModalVisible, setResubmitModalVisible] = useState(false);
const [selectedDoc, setSelectedDoc] = useState(null); // To keep track of the document being resubmitted
const [uploadedFile, setUploadedFile] = useState(null); // Changed from newFile to uploadedFile
const [successModalVisible, setSuccessModalVisible] = useState(false); // For success popup

    const [tooltipVisibleIndex, setTooltipVisibleIndex] = useState(null); // State to track the hovered document
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [isModalActive, setModalActive] = useState(false); // New variable name
    const [statusMessage, setStatusMessage] = useState(''); // New variable name
    // Add these state variables and handlers to your Dashboard component
    const [isSubmitDocumentsModalOpen, setIsSubmitDocumentsModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

 
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
        sanitaryPermit: null,
        maintenanceRecords: null,
    });
    
    const handleOpenStatusModal = async () => {
        try {
            // Fetch the latest transaction status from Firestore
            const warehouseRef = firestore.collection("rentedWarehouses").get();
            const warehouses = (await warehouseRef).docs.map((doc) => doc.data());
            setTransactionStatus(
                warehouses.map((warehouse) => warehouse.transactionStatus).join(", ")
            ); // Combine all statuses or customize as needed
            setIsStatusModalVisible(true);
        } catch (error) {
            console.error("Error fetching transaction status:", error);
        }
    };
    
    const handleCloseStatusModal = () => {
        setIsStatusModalVisible(false);
    };
 
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
      const file = e.target.files[0];
      setNewFile(file);
    }
    setSelectedFile(file);

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
      setSubmissionSuccessModalVisible(false); // Reset success modal
  
      try {
        const documentUrls = {};
        const uploadTasks = [];
  
        // Iterate over each document to upload
        for (const [key, file] of Object.entries(documents)) {
          if (file) {
            const storageRef = storage.ref(`documents/${selectedWarehouse.warehouseId}/${key}/${file.name}`);
            const uploadTask = storageRef.put(file);
  
            // Using a promise to handle each upload
            const uploadPromise = new Promise((resolve, reject) => {
              uploadTask.on(
                'state_changed',
                (snapshot) => {
                  // Calculate and update upload progress
                  const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                  setUploadProgress(progress);
                },
                (error) => {
                  // Reject the promise on error
                  console.error('Upload error: ', error);
                  reject(new Error('Failed to upload some documents.'));
                },
                async () => {
                  // Get the file URL and save it
                  const fileUrl = await uploadTask.snapshot.ref.getDownloadURL();
                  documentUrls[key] = fileUrl;
                  resolve(); // Resolve the promise
                }
              );
            });
  
            uploadTasks.push(uploadPromise);
          }
        }
  
        // Wait for all upload promises to complete
        await Promise.all(uploadTasks);
  
        // Update Firestore with document URLs only if all uploads are successful
        const warehouseRef = firestore.collection('rentedWarehouses').doc(selectedWarehouse.warehouseId);
        await warehouseRef.update({ documents: documentUrls });
  
        
        setSubmissionSuccessModalVisible(true); // Show success modal
        setIsSubmitDocumentsModalOpen(false); 
      } catch (error) {
        console.error('Error submitting documents: ', error);
        alert('Failed to submit documents. Please try again.');
      } finally {
        setIsLoading(false); // Hide loading state
      }
    }
  };
  
  const handleShowTransactionStatus = (warehouse) => {
    setStatusMessage(warehouse.transactionStatus);
    setModalActive(true);
  };

  const handleCloseTransactionModal = () => {
    setModalActive(false);
    setStatusMessage('');
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
            resubmitted: data.documents?.taxIdentificationNumberResubmitted, // Access resubmitted field
            rejectionReason: data.documents?.taxidentificationnumberRejectionReason, // Access rejection reason
        },
        { 
            name: 'BIR Registration', 
            url: data.documents?.birRegistration, 
            status: data.documents?.birregistrationStatus,
            resubmitted: data.documents?.birRegistrationResubmitted, // Access resubmitted field
            rejectionReason: data.documents?.birregistrationRejectionReason, // Access rejection reason
        },
        { 
            name: 'Barangay Clearance', 
            url: data.documents?.barangayClearance, 
            status: data.documents?.barangayclearanceStatus,
            resubmitted: data.documents?.barangayClearanceResubmitted, // Assuming a similar structure for Barangay Clearance
            rejectionReason: data.documents?.barangayclearanceRejectionReason, // Access rejection reason
        },
        { 
            name: 'Letter of Intent', 
            url: data.documents?.letterOfIntent, 
            status: data.documents?.letterofintentStatus,
            resubmitted: data.documents?.letterOfIntentResubmitted, // Access resubmitted field
            rejectionReason: data.documents?.letterofintentRejectionReason, // Access rejection reason
        },
        { 
            name: 'Financial Capability Proof', 
            url: data.documents?.financialCapabilityProof, 
            status: data.documents?.financialcapabilityproofStatus,
            resubmitted: data.documents?.financialCapabilityProofResubmitted, // Access resubmitted field
            rejectionReason: data.documents?.financialcapabilityproofRejectionReason, // Access rejection reason
        },
        { 
            name: 'Government Issued ID', 
            url: data.documents?.governmentIssuedId, 
            status: data.documents?.governmentissuedidStatus,
            resubmitted: data.documents?.governmentIssuedIdResubmitted, // Access resubmitted field
            rejectionReason: data.documents?.governmentissuedidRejectionReason, // Access rejection reason
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

    // Check for rejected documents and log resubmission
    documents.forEach(doc => {
        if (doc.status === "rejected" && doc.resubmitted) {
            console.log(`${doc.name} = Resubmitted`);
        }
    });

    if (isLessor) {
        // Open the documents modal for the lessor
        setShowDocumentsModal(true);

        // Update the transaction status in the warehouses collection
        try {
            await firestore.collection('rentedWarehouses').doc(warehouse.warehouseId).update({
                transactionStatus: "Under Review: Lessee's documents is being evaluated by Lessor"  // Set the status to "Under Review"
            });
            console.log("Warehouse transaction status updated to 'Under Review'");
        } catch (error) {
            console.error("Error updating transaction status:", error);
        }

    } else if (isLessee) {
        // Open the document status modal for the lessee
        setShowDocumentStatusModal(true);
    } else {
        alert("You are not authorized to view the documents for this warehouse.");
    }
};



const handleResubmittedClick = (index) => {
    setReviewedDocumentIndex(index);
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
    } else if (status === 'resubmitted') {
        setSelectedWarehouseDocuments(prevDocuments => {
            const updatedDocuments = [...prevDocuments];
            updatedDocuments[index].status = status; // Update the status to 'resubmitted'
            return updatedDocuments;
        });
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

    // Check if all documents have a status of 'approved'
    const allDocumentsApproved = selectedWarehouseDocuments.every(doc => doc.status === 'approved');
    console.log("All documents approved:", allDocumentsApproved);

    const updatedDocumentStatuses = selectedWarehouseDocuments.reduce((acc, doc) => {
        const fieldName = doc.name.replace(/\s+/g, '').toLowerCase();

        acc[`documents.${fieldName}Status`] = doc.status;

        // Clear resubmission fields for approved documents
        if (doc.status === 'approved') {
            acc[`documents.birRegistrationResubmitted`] = deleteField();
            acc[`documents.letterOfIntentResubmitted`] = deleteField();
            acc[`documents.taxIdentificationNumberResubmitted`] = deleteField();
            acc[`documents.financialCapabilityProofResubmitted`] = deleteField();
            acc[`documents.governmentIssuedIdResubmitted`] = deleteField();
        }

        // Include rejection reasons if present
        if (doc.rejectionReason) {
            acc[`documents.${fieldName}RejectionReason`] = doc.rejectionReason;
        }

        return acc;
    }, {});

    // Update the transactionStatus if all documents are approved
    if (allDocumentsApproved) {
        updatedDocumentStatuses.transactionStatus = "Status: Approved";
    } else {
        updatedDocumentStatuses.transactionStatus = "Under Review";
    }

    console.log("Updating document with:", updatedDocumentStatuses); // Debug log
    console.log("Computed transactionStatus:", updatedDocumentStatuses.transactionStatus);

    try {
        const db = getFirestore(); // Get Firestore instance
        const docRef = doc(db, 'rentedWarehouses', warehouseId);

        // Check if the document exists
        const docSnapshot = await getDoc(docRef);
        if (!docSnapshot.exists()) {
            console.error("Document does not exist:", warehouseId);
            return; // Exit early if the document doesn't exist
        }

        await updateDoc(docRef, updatedDocumentStatuses); // Perform the update

        // Update local state after saving
        setSelectedWarehouseDocuments(prevDocuments =>
            prevDocuments.map(doc => ({
                ...doc,
                status: doc.status // Ensure status is set
            }))
        );

        setIsStatusSaved(true); // Set the status as saved

        // Show success modal with appropriate message
        setModalMessage(
            allDocumentsApproved
                ? 'All documents have been successfully approved, and the transaction status has been updated.'
                : 'The documents have been successfully validated.'
        );

        setIsModalOpen(true);

        // Refresh the document list after saving
    } catch (error) {
        console.error("Error updating document:", error.message); // Log the error message
        alert("Failed to update document: " + error.message); // Display the error message
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
        const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
        const [submissionErrorMessage, setSubmissionErrorMessage] = useState('');        
        const [successMessage, setSuccessMessage] = useState('');
        const [newAddress, setNewAddress] = useState('');
        // New state for restriction modal visibility
const [restrictedResubmitModalVisible, setRestrictedResubmitModalVisible] = useState(false);
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
const handleAmenitySelection = (amenity) => {
    // Check if the amenity is already selected by comparing names
    const index = selectedAmenities.findIndex(item => item.name === amenity.name);
    if (index !== -1) {
        // If it's selected, remove it from the selected amenities array
        const updatedSelection = [...selectedAmenities];
        updatedSelection.splice(index, 1);
        setSelectedAmenities(updatedSelection);
    } else {
        // If it's not selected, add it to the selected amenities array
        setSelectedAmenities([...selectedAmenities, amenity]);
    }
};


const handleResubmit = async () => {
    if (!selectedFile || !selectedDocument) {
        alert("Please select a file to resubmit.");
        return;
    }

    setLoadingStatus(true); // Start loading

    try {
        // Upload the file to Firebase Storage
        const storageRef = firebase.storage().ref();
        const fileRef = storageRef.child(`documents/${selectedFile.name}`);

        // Monitor the upload progress
        fileRef.put(selectedFile).on(
            "state_changed",
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setProgressPercentage(progress);
            },
            (error) => {
                console.error("Error uploading file:", error);
                alert("Error uploading file: " + error.message);
                setLoadingStatus(false); // Stop loading
            },
            async () => {
                // Get the file URL after upload completes
                const fileURL = await fileRef.getDownloadURL();

                // Log the selected document name for debugging
                console.log("Selected Document Name:", selectedDocument.name);

                // Initialize fieldName variable
                let fieldName;

                // Map the selected document name to the corresponding Firestore field
                switch (selectedDocument.name) {
                    case 'Barangay Clearance':
                        fieldName = 'barangayClearance';
                        break;
                    case 'BIR Registration':
                        fieldName = 'birRegistration';
                        break;
                    case 'Financial Capability Proof':
                        fieldName = 'financialCapabilityProof';
                        break;
                    case 'Government Issued ID':
                        fieldName = 'governmentIssuedId';
                        break;
                    case 'Letter of Intent':
                        fieldName = 'letterOfIntent';
                        break;
                    case 'Tax Identification Number':
                        fieldName = 'taxIdentificationNumber';
                        break;
                    default:
                        console.error("No matching field found for the selected document.");
                        setLoadingStatus(false); // Stop loading
                        return; // Exit the function if no field matches
                }

                // Update Firestore for the specific document being resubmitted
                await firestore.collection('rentedWarehouses').doc(selectedWarehouse.warehouseId).update({
                    [`documents.${fieldName}`]: fileURL, // Store the URL under the specific field in the documents map
                    [`documents.${fieldName}Resubmitted`]: 'Resubmitted', // Add the documentResubmitted field
                });

                // Log the updated document name and URL to the console
                console.log(`Updated Document: ${selectedDocument.name}, URL: ${fileURL}`);

                // Reset file input and state
                setSelectedFile(null);
                setSelectedDocument(null); // Reset the selected document
                setShowRejectionReasonModal(false);
                setLoadingStatus(false); // Stop loading
                setSuccessNotificationVisible(true); // Show success message

                // Real-time update: Set up Firestore listener
                const unsubscribe = firestore.collection('rentedWarehouses')
                    .doc(selectedWarehouse.warehouseId)
                    .onSnapshot((doc) => {
                        if (doc.exists) {
                            const updatedData = doc.data();
                            setDocuments(updatedData.documents); // Update the documents state with new data
                        }
                    });

                // Clean up the listener when done
                return () => unsubscribe();
            }
        );
    } catch (error) {
        console.error("Error uploading file:", error);
        alert("Error uploading file: " + error.message);
        setLoadingStatus(false); // Stop loading
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
        setIsModalVisible(false); // Close the modal

    };

    
     // Function to handle image upload
     const handleImageUpload = async (e) => {
        setUploading(true);
        const file = e.target.files[0];
        
        if (file) {
            const storageRef = storage.ref();
            const fileRef = storageRef.child(file.name);
            await fileRef.put(file);
            const url = await fileRef.getDownloadURL();
            setWarehouseData((prevData) => ({ ...prevData, images: [...prevData.images, url] }));

            // Update uploadedFiles state with the new file name
            setUploadedFiles((prevFiles) => [...prevFiles, file]); // Add the file object
            
            // Set the current file name
            setCurrentFile(file.name);
        }
        
        setUploading(false);
    };


{/* Function to handle file removal */}
const handleFileRemove = (index) => {
    setUploadedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
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
        
        // Validation checks
        if (warehouseData.images.length < 3) {
            setSubmissionErrorMessage("Please upload at least 3 images.");
            setIsErrorModalVisible(true);
            return;
        }
        if (selectedAmenities.length === 0) {
            setSubmissionErrorMessage("Please select at least one amenity.");
            setIsErrorModalVisible(true);
            return;
        }
        const requiredDocuments = [
            warehouseData.identificationProof,
            warehouseData.addressProof,
            warehouseData.ownershipDocuments,
            warehouseData.previousTenancyDetails,
            warehouseData.businessPermit,
            warehouseData.sanitaryPermit,
            warehouseData.maintenanceRecords
        ];
        const uploadedDocuments = requiredDocuments.filter(doc => doc !== '');
        if (uploadedDocuments.length < 7) {
            setSubmissionErrorMessage("Please upload all required documents (7 files).");
            setIsErrorModalVisible(true);
            return;
        }
    
        // Proceed with submission if validations pass
        setUploading(true);
        try {
            const warehouseRef = firestore.collection('warehouses').doc();
            await warehouseRef.set({
                ...warehouseData,
                category: warehouseData.category, // Added category
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
                category: '',
                images: [],
                videos: [],
                status: 'pending',
                uploadDate: null,
                identificationProof: '',
                addressProof: '',
                ownershipDocuments: '',
                previousTenancyDetails: '',
                businessPermit: '',
                sanitaryPermit: '',
                maintenanceRecords: '',
            });
            setSelectedAmenities([]);
        } catch (error) {
            console.error('Error uploading warehouse:', error);
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        const fetchExistingDocuments = async () => {
            try {
                const userUid = auth.currentUser.uid;
                const querySnapshot = await firestore.collection('warehouses')
                    .where('userUid', '==', userUid)
                    .get();

                const documents = {};
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    // Add existing documents to the list
                    [
                        'identificationProof',
                        'addressProof',
                        'ownershipDocuments',
                        'previousTenancyDetails',
                        'businessPermit',
                        'sanitaryPermit',
                        'maintenanceRecords',
                    ].forEach((field) => {
                        if (data[field] && !documents[field]) {
                            documents[field] = data[field]; // Use the first found document
                        }
                    });
                });

                setExistingDocuments(documents);
            } catch (error) {
                console.error('Error fetching existing documents:', error);
            }
        };

        fetchExistingDocuments();
    }, []);

    const handleShowDocuments = async () => {
        const userId = auth.currentUser.uid; // Get the current user's ID
        const warehousesRef = firestore.collection('warehouses');
        const querySnapshot = await warehousesRef.where('userUid', '==', userId).get();
    
        const docs = await Promise.all(querySnapshot.docs.map(async (doc) => {
            console.log("Fetched document:", { id: doc.id, ...doc.data() }); // Log fetched documents
    
            const warehouseData = { id: doc.id, ...doc.data() };
    
            // Fetch file statuses for the warehouse document
            const warehouseRef = firestore.collection('warehouses').doc(doc.id);
            const warehouseDoc = await warehouseRef.get();
            const fileStatusesFromDb = warehouseDoc.data()?.fileStatuses || [];
    
            // Log current file statuses
            console.log(`Current file statuses for document ${doc.id}:`, fileStatusesFromDb);
    
            // Create a map for the file statuses including rejectionReason
            const fileStatusesMap = fileStatusesFromDb.reduce((acc, file) => {
                const sanitizedLabel = sanitizeFieldName(file.fileLabel);
                acc[sanitizedLabel] = {
                    status: file.status,
                    rejectionReason: file.rejectionReason, // Add rejectionReason to the map
                };
                return acc;
            }, {});
    
            // Add fileStatuses to the warehouse data
            warehouseData.fileStatuses = fileStatusesMap;
    
            // Log file statuses for debugging
            console.log(`Mapped file statuses for document ${doc.id}:`, warehouseData.fileStatuses);
    
            return warehouseData;
        }));
    
        // Set user documents with file statuses
        setUserDocuments(docs); 
        setIsModalVisible(true); // Show the modal after fetching documents
        setIsEditModalOpen(false);
    };
    
    const handleShowRejectionReason = (rejectionReason) => {
        setCurrentRejectionReason(rejectionReason); // Set the rejection reason
        setRejectionReasonModalVisible(true); // Show the rejection reason modal
    };
    
    const handleCloseRejectionReasonModal = () => {
        setRejectionReasonModalVisible(false); // Close the rejection reason modal
    };
    
// Function to sanitize the file label
const sanitizeFieldName = (label) => {
    return label.replace(/[^a-zA-Z0-9]/g, '_'); // Replace non-alphanumeric characters with underscores
};

const handleResubmitClick = async (item) => {
    console.log("Document selected for resubmit:", item); // Debug log

    if (item) {
        try {
            // Fetch the warehouse document
            const docRef = firestore.collection('warehouses').doc(item.id);
            const docSnapshot = await docRef.get();

            if (docSnapshot.exists) {
                const docData = docSnapshot.data();
                
                // Log the current fileStatuses for debugging
                console.log("Current fileStatuses in the document:", docData.fileStatuses);

                // Normalize labels for comparison (remove spaces and replace underscores)
                const normalizeLabel = (label) => label.replace(/\s+/g, '_').toLowerCase(); // Normalize spaces and toLowerCase
                
                // Find the specific file from fileStatuses
                const fileStatuses = docData.fileStatuses || [];
                const fileToUpdate = fileStatuses.find(file => normalizeLabel(file.fileLabel) === normalizeLabel(item.label)); // Normalize and compare labels

                if (fileToUpdate) {
                    // Show the resubmit modal
                    setSelectedDoc(item); // Set the selected document
                    setResubmitModalVisible(true); // Show the resubmit modal
                } else {
                    console.error("File not found in fileStatuses:", item.label);
                }
            } else {
                console.error("Document does not exist:", item.id);
            }
        } catch (error) {
            console.error("Error during resubmission:", error);
        }
    } else {
        console.error("Document is undefined:", item);
    }
};




const handleFileUploadChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        setUploadedFile(file); // Set the new file to upload
    }
};
// Mapping function to convert input labels to Firestore field names
const mapFieldName = (label) => {
    const fieldMappings = {
        "Identification Proof": "identificationProof",
        "Address Proof": "addressProof",
        "Ownership Documents": "ownershipDocuments",
        "Previous Tenancy Details": "previousTenancyDetails",
        "Business Permit": "businessPermit",
        "Sanitary Permit": "sanitaryPermit",
        "Maintenance Records": "maintenanceRecords"
    };

    return fieldMappings[label] || null; // Return the mapped field name or null if not found
};
const uploadDocument = async () => {
    console.log("Attempting to upload document:", selectedDoc); // Debug log

    // Function to sanitize the file label (replaces non-alphanumeric characters with underscores)
    const sanitizeFieldName = (label) => {
        return label.replace(/[^a-zA-Z0-9]/g, '_'); // Replace non-alphanumeric characters with underscores
    };

    if (uploadedFile && selectedDoc) {
        console.log("Selected Document ID:", selectedDoc.id); // Log the document ID
        
        setIsUploading(true); // Show loading modal
        setResubmitModalVisible(false); // Close resubmit modal

        try {
            // Upload the file to Firebase Storage
            const storageRef = storage.ref(`documents/${uploadedFile.name}`);
            await storageRef.put(uploadedFile);

            // Get the download URL for the uploaded file
            const newFileUrl = await storageRef.getDownloadURL();

            // Get the document reference
            const docRef = firestore.collection('warehouses').doc(selectedDoc.id);
            const docSnapshot = await docRef.get();

            // Check if the document exists
            if (!docSnapshot.exists) {
                console.error("Document does not exist:", selectedDoc.id);
                return;
            }

            // Use the mapping function to get the correct field name
            const fieldName = mapFieldName(selectedDoc.label);
            
            // If the field name is valid, update the document
            if (fieldName) {
                // Update the document with the new file URL
                await docRef.update({
                    [fieldName]: newFileUrl // Update using the correct field name casing
                });

                // Now, update the file status to "Validating"
                const docData = docSnapshot.data();
                const fileStatuses = docData.fileStatuses || [];
                const updatedFileStatuses = fileStatuses.map(file => {
                    if (sanitizeFieldName(file.fileLabel) === sanitizeFieldName(selectedDoc.label)) {
                        return {
                            ...file,
                            status: 'Validating',  // Update the status of the file
                        };
                    }
                    return file;
                });

                // Update the document with the new file statuses
                await docRef.update({
                    fileStatuses: updatedFileStatuses,
                });

                setSuccessModalVisible(true); // Show success modal
                setIsModalVisible(false); // Show the modal after fetching documents
                setResubmitModalVisible(false); // Close resubmit modal
                setUploadedFile(null); // Clear the uploaded file
            } else {
                console.error("Invalid field name for label:", selectedDoc.label);
            }
        } catch (error) {
            console.error("Error uploading document:", error);
        } finally {
            setIsUploading(false); // Hide loading modal
        }
    } else {
        console.warn("No uploaded file or selected document:", uploadedFile, selectedDoc);
    }
};



const handleViewDocument = (fileUrl) => {
    window.open(fileUrl, '_blank'); // Open the uploaded file in a new tab
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

    const markAsRented = async (warehouseId) => {
        setSelectedWarehouseId(warehouseId);
    
        try {
            const hasLeaseAgreement = await checkLeaseAgreement(warehouseId);
    
            if (hasLeaseAgreement) {
                setShowConfirmationModal(true); // Show confirmation modal if lease agreement exists
                
                // Update transaction status to "Status: Contract Signed" in Firestore
                const warehouseRef = firestore.collection('rentedWarehouses').doc(warehouseId);
                await warehouseRef.update({
                    transactionStatus: 'Status: In Contract.'
                });
                console.log('Transaction status updated to "Status: Contract Signed"');
            } else {
                setShowErrorModal(true); // Show error modal if no lease agreement exists
            }
        } catch (error) {
            console.error('Error marking warehouse as rented:', error);
            setShowErrorModal(true); // Show error modal in case of any error
        }
    };
    

const handleLeaseAgreement = async (warehouse) => {
    setSelectedWarehouse(warehouse);
    
    // Fetch the latest data from Firestore to check document statuses
    const warehouseData = await firestore.collection('rentedWarehouses').doc(warehouse.warehouseId).get();
    const data = warehouseData.data();
    
    // Check for rejected documents
    const rejectedDocuments = [
        data.documents?.taxidentificationnumberStatus,
        data.documents?.birregistrationStatus,
        data.documents?.barangayclearanceStatus,
        data.documents?.letterofintentStatus,
        data.documents?.financialcapabilityproofStatus,
        data.documents?.governmentissuedidStatus,
    ].filter(status => status === 'rejected');

    if (rejectedDocuments.length > 0) {
        // Show validation modal if there are rejected documents
        setShowValidationModal(true);
    } else {
        // Proceed to show the lease modal
        setShowLeaseModal(true);
    }
};

const handleCloseValidationModal = () => {
    setShowValidationModal(false);
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
        const warehouseId = rentedWarehouseData.warehouseId; // Ensure this field exists
        const lesseeUserId = rentedWarehouseData.rentedBy?.userId; // Fetch lessee userId

        if (!lesseeUserId) {
            throw new Error('Lessee userId is undefined.');
        }

        // Update the rented warehouse's status to 'Rented'
        await rentedWarehouseRef.update({
            status: 'Rented'
        });

        console.log('Rented warehouse marked as rented successfully.');

        // Now, delete the warehouses marked as 'Processing' or 'Rejected' for the same owner
        const rentedWarehousesRef = firestore.collection('rentedWarehouses');

        // Query for 'Processing' status
        const processingQuerySnapshot = await rentedWarehousesRef
            .where('ownerUid', '==', ownerUid)
            .where('status', '==', 'Processing') // Check for Processing status
            .get();

        if (!processingQuerySnapshot.empty) {
            console.log('Processing warehouses found:', processingQuerySnapshot.docs.map(doc => doc.data()));
            // Delete warehouses with Processing status
            processingQuerySnapshot.docs.forEach(async (doc) => {
                await doc.ref.delete();
                console.log(`Deleted warehouse with ID: ${doc.id} (Processing status)`);
            });
        } else {
            console.log('No Processing warehouses found.');
        }

        // Query for 'Rejected' status
        const rejectedQuerySnapshot = await rentedWarehousesRef
            .where('ownerUid', '==', ownerUid)
            .where('status', '==', 'Rejected') // Check for Rejected status
            .get();

        if (!rejectedQuerySnapshot.empty) {
            console.log('Rejected warehouses found:', rejectedQuerySnapshot.docs.map(doc => doc.data()));
            // Delete warehouses with Rejected status
            rejectedQuerySnapshot.docs.forEach(async (doc) => {
                await doc.ref.delete();
                console.log(`Deleted warehouse with ID: ${doc.id} (Rejected status)`);
            });
        } else {
            console.log('No Rejected warehouses found.');
        }

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
            rentStatus: 'Rented', // Use rentStatus instead of status
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
            setShowSuccessGif(false); // Hide the success GIF after 1 second
            // Show the popup after the success GIF disappears
            setIsPopupOpen(true); // Show the popup with the success message
        }, 1700); // 1700 milliseconds = 1.7 seconds (to allow time for the success GIF to display)
        
    } catch (error) {
        console.error('Error updating warehouse status:', error);
        // Handle error: Show an error message or log it
    }
};

const renderPopup = () => (
    <div className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 ${isPopupOpen ? 'block' : 'hidden'}`}>
        <div className="bg-white p-5 rounded-lg shadow-md max-w-md w-full text-center">
            {/* Icon */}
            <div className="flex justify-center mb-4">
                <HiExclamationCircle className="text-blue-500 text-5xl" />
            </div>

            {/* Modal content */}
            <p className="text-base text-gray-800 mb-4">
                Pending warehouses with status{" "}
                <span className="text-yellow-500 font-medium">"Processing"</span> and{" "}
                <span className="text-red-500 font-medium">"Rejected"</span> will be deleted/rejected.
            </p>

            {/* Close Button */}
            <button
                onClick={() => setIsPopupOpen(false)}
                className="px-5 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition duration-150"
            >
                Close
            </button>
        </div>
    </div>
);


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
       
        <div className="ml-4 text-lg font-semibold">Rent Warehouses</div>
      
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
                <div className="flex flex-wrap gap-4">
                    {/* Warehouse Name */}
                    <div className="flex-1 min-w-[200px] max-w-[250px]">
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
                    <div className="flex-1 min-w-[200px] max-w-[250px]">
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
                    <div className="flex-1 min-w-[200px] max-w-[250px]">
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
                    {/* Warehouse Category Dropdown */}
                    <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="category">Warehouse Category</label>
                        <select
                            id="category"
                            name="category"
                            value={warehouseData.category}
                            onChange={handleWarehouseDataChange}
                            className="input-field"
                            required
                        >
                            <option value="" disabled>Select Category</option>
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                            <option value="commercial">Commercial</option>
                            <option value="industrial">Industrial</option>
                            <option value="specialized">Specialized</option>
                        </select>
                    </div>
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
              
{/* Upload Images and Videos */}
<div className="flex items-center justify-start mb-2">
    {/* Upload Images */}
    <div className="flex items-center mr-4">
        <label className="block text-sm font-medium mr-2">Upload Images</label>
        <label htmlFor="image-upload" className="upload-btn">Upload</label>
        <input
            id="image-upload"
            type="file"
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
        />
    </div>
    

     {/* Display Uploaded Files Inline */}
     <div className="flex items-center ml-4">
        {uploadedFiles.map((file, index) => (
            <div key={index} className="flex items-center mr-4 bg-white shadow-md rounded-lg p-2 transition-transform transform hover:scale-105">
                <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                <span className="text-sm text-gray-800 flex-grow">{file.name}</span>
                <button 
                    className="text-red-500 hover:text-red-700 transition-colors"
                    onClick={() => handleFileRemove(index)}
                    aria-label={`Remove ${file.name}`}
                >
                    <HiTrash className="w-5 h-5" />
                </button>
            </div>
        ))}
    {/* Upload Videos */}
    <div className="flex items-center mr-4">
        <label className="block text-sm font-medium mr-2">Upload Videos</label>
        <label htmlFor="video-upload" className="upload-btn">Upload</label>
        <input
            id="video-upload"
            type="file"
            onChange={handleVideoUpload}
            accept="video/*"
            className="hidden"
        />
    </div>
    {uploading && <p className="text-sm text-gray-500 ml-4">Uploading...</p>}
  
   
    </div>
</div>

{/* Amenities */}
<div>
  <label className="block text-sm font-medium mb-1">Amenities</label>
  <div className="amenities-container flex flex-wrap gap-3">
    {amenitiesList.map((amenity, index) => (
      <label key={index} className="amenity-item flex items-center cursor-pointer">
        <input
          type="checkbox"
          name={amenity.name}
          checked={selectedAmenities.some(item => item.name === amenity.name)}
          onChange={() => handleAmenitySelection(amenity)}
          className="form-checkbox h-5 w-5 text-blue-600 transition duration-150 ease-in-out"
        />
        <img src={amenity.icon} alt={amenity.name} className="w-5 h-5 ml-2" />
        <span className="ml-2">{amenity.name}</span>
      </label>
    ))}
  </div>
</div>
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
                { id: 'identificationProof', label: 'ID/Valid ID' },
                { id: 'addressProof', label: 'Address Proof' },
                { id: 'ownershipDocuments', label: 'Ownership Docs' },
                { id: 'previousTenancyDetails', label: 'Previous Tenancy Details' },
                { id: 'businessPermit', label: 'Business Permit' },
                { id: 'sanitaryPermit', label: 'Sanitary Permit' },
                { id: 'maintenanceRecords', label: 'Maintenance Records' },
            ].map((field) => (
                <div
                    key={field.id}
                    className="bg-white shadow rounded-md p-2 transition-transform transform hover:scale-105"
                >
                    <label
                        className="block text-sm font-medium text-gray-700 mb-1"
                        htmlFor={field.id}
                    >
                        {field.label}
                    </label>
                    <div className="relative border border-gray-300 rounded-md overflow-hidden transition-shadow hover:shadow-md">
                        {existingDocuments[field.id] ? (
                            <div className="flex flex-col items-center justify-center h-10 bg-gray-100 text-gray-700 text-sm">
                                Document Already Uploaded
                            </div>
                        ) : (
                            <>
                                <input
                                    type="file"
                                    id={field.id}
                                    name={field.id}
                                    onChange={handleFileUpload}
                                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                                    required={
                                        field.id !== 'previousTenancyDetails' &&
                                        field.id !== 'businessPermit' &&
                                        field.id !== 'maintenanceRecords'
                                    }
                                />
                                <div className="flex items-center justify-center h-10 bg-blue-500 hover:bg-blue-600 transition-colors rounded-md cursor-pointer">
                                    <span className="text-white">
                                        {fileNames[field.id] || 'Choose File'}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        {existingDocuments[field.id]
                            ? `Document already exists`
                            : fileNames[field.id]
                            ? `File uploaded: ${fileNames[field.id]}`
                            : 'No file uploaded'}
                    </p>
                </div>
            ))}
</div>

              {/* Buttons */}

              <div className="flex justify-end mt-4 space-x-2">
              <button
    type="button"
    className="flex items-center px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 transition-colors" // Changed to blue for better visibility
    onClick={handleShowMap}
>
    <HiMap className="mr-1 text-yellow-400" /> {/* Map icon with yellow color for contrast */}
    Show Map
</button>

    <button
        type="button"
        className="flex items-center px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
        onClick={() => setShowUploadModal(false)}
    >
        <HiOutlineX className="mr-1" /> {/* Cancel icon */}
        Cancel
    </button>
    <button
        type="submit"
        className="flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
    >
        <HiCheck className="mr-1" /> {/* Submit icon */}
        Submit
    </button>
    
</div>

            </form>
        </div>
    </div>
)}

{isErrorModalVisible && (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
            {/* Header with Error Icon and Title */}
            <div className="flex items-center justify-center bg-red-600 rounded-t-lg p-4">
                <HiExclamationCircle className="text-white text-4xl mr-2" aria-label="Error Icon" />
                <h2 className="text-xl font-semibold text-white">Error</h2>
            </div>
            
            {/* Content */}
            <div className="p-6 text-center">
                <p className="text-gray-700 text-lg mb-4">{submissionErrorMessage}</p>
                <button
                    onClick={() => setIsErrorModalVisible(false)}
                    className="mt-4 w-1/2 mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Close
                </button>
            </div>
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
    <div className="container mx-auto px-10 py-12 rounded-lg bg-gray-100 mt-4">
        {/* Filter buttons */}
        <div className="flex justify-center mb-8 space-x-4">
            <button
                onClick={() => handleFilterChange('All')}
                className={`px-5 py-3 rounded-lg mr-2 ${
                    filterStatus === 'All' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                }`}
            >
                All ({filterCounts && filterCounts.All})
            </button>
            <button
                onClick={() => handleFilterChange('Pending')}
                className={`px-5 py-3 rounded-lg mr-2 ${
                    filterStatus === 'Pending' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                }`}
            >
                Pending ({filterCounts && filterCounts.Pending})
            </button>
            <button
                onClick={() => handleFilterChange('Verified')}
                className={`px-5 py-3 rounded-lg mr-2 ${
                    filterStatus === 'Verified' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                }`}
            >
                Verified ({filterCounts && filterCounts.Verified})
            </button>
            <button
                onClick={() => handleFilterChange('Rejected')}
                className={`px-5 py-3 rounded-lg mr-2 ${
                    filterStatus === 'Rejected' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                }`}
            >
                Rejected ({filterCounts && filterCounts.Rejected})
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {userWarehouses.map(warehouse => (
                <div key={warehouse.id} className="bg-white p-6 rounded-lg shadow-lg relative max-w-4xl mx-auto">
                <div className="flex justify-between mb-4">
                        <h3 className="text-xl font-semibold">{warehouse.name}</h3>
                        {warehouse.status === 'rejected' && (
                            <span className="relative">
                                <span
                                    className="absolute top-0 right-0 mr-2 flex items-center justify-center cursor-pointer"
                                    style={{ width: '28px', height: '28px' }}
                                    onClick={() => openRejectReasonModal(warehouse.rejectionReason)}
                                    title="Click to see reason"
                                >
                                    <img src={error1} alt="Error Icon" className="h-6 w-6 pumping-icon" />
                                </span>
                            </span>
                        )}
                    </div>
                    <p className="text-gray-600 mb-3 text-lg">
                        <img src={location} alt="Location Icon" className="inline-block h-4 mr-2" />
                        <span className="font-bold">Address:</span> {warehouse.address}
                    </p>
                    <p className="text-gray-600 mb-3 text-lg">
                        <img src={infoIcon} alt="Info Icon" className="inline-block h-4 mr-2" />
                        <span className="font-bold">Description:</span> {warehouse.description}
                    </p>
                    <p className="text-gray-600 mb-3 text-lg">
    <img src={priceTagIcon} alt="Price Tag Icon" className="inline-block h-4 mr-2" />
    <span className="font-bold">Price:</span> ₱{warehouse.price ? Number(warehouse.price).toLocaleString() : '0'}
</p>

                    <p className="text-lg">
                        Status:
                        {warehouse.status === 'pending' && <span className="status-text" style={{ color: 'orange' }}> Pending</span>}
                        {warehouse.status === 'verified' && <span className="status-text" style={{ color: 'green' }}> Verified</span>}
                        {warehouse.status === 'rejected' && (
                            <span className="status-text" style={{ color: 'red' }}>
                                Rejected
                            </span>
                        )}
                    </p>
                    <div className="flex flex-wrap mt-3">
                        {warehouse.images.map((imageUrl, index) => (
                            <img key={index} src={imageUrl} alt={`Image ${index + 1}`} className="h-20 w-20 object-cover rounded-md mr-2 mb-2" />
                        ))}
                    </div>
                    <div className="flex flex-wrap mt-3">
                        {warehouse.videos.map((videoUrl, index) => (
                            <video key={index} src={videoUrl} controls className="h-20 w-20 rounded-md mr-2 mb-2"></video>
                        ))}
                    </div>
                    <span className="font-bold">Upload Date:</span> {warehouse.uploadDate ? new Date(warehouse.uploadDate.toDate()).toLocaleString() : 'Unknown'}
                    <div className="flex justify-center mt-6 space-x-4">
                        <button className="bg-blue-500 text-white font-semibold py-2 px-4 rounded w-36 hover:bg-blue-600 transition duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1" onClick={() => openCarousel(warehouse.images)}>
                            View
                        </button>
                        <button className="bg-red-500 text-white font-semibold py-2 px-4 rounded w-36 hover:bg-red-600 transition duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1" onClick={() => handleDeleteWarehouse(warehouse)}>
                            Delete
                        </button>
                        <button className="bg-green-500 text-white font-semibold py-2 px-4 rounded w-36 hover:bg-green-600 transition duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1" onClick={() => handleEditWarehouse(warehouse)}>
                            Edit
                        </button>
                        <button
                            type="button"
                            className="bg-gradient-to-r from-blue-500 to-purple-600 shadow-md hover:shadow-lg transform hover:-translate-y-1 text-white font-semibold py-2 px-4 rounded w-36"
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
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-50">
        <div className="relative bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl">
            {/* Close Icon */}
            <HiX 
                className="absolute top-4 right-4 text-2xl cursor-pointer text-gray-400 hover:text-gray-600"
                onClick={handleCloseEditModal}
            />
            {/* Header */}
            <div className="text-center mb-6">
                <h2 className="text-3xl font-semibold text-gray-800">Edit Warehouse</h2>
                <p className="text-gray-500 text-sm">Modify warehouse details below</p>
            </div>
            
            {/* Form */}
            <form>
                {/* 2x2 Grid Layout for Input Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                            type="text"
                            value={currentWarehouse.name}
                            onChange={(e) => setCurrentWarehouse({ ...currentWarehouse, name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200"
                        />
                    </div>
                    
                    {/* Address Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <input
                            type="text"
                            value={currentWarehouse.address}
                            onChange={(e) => setCurrentWarehouse({ ...currentWarehouse, address: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200"
                        />
                    </div>
                    
                    {/* Description Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            value={currentWarehouse.description}
                            onChange={(e) => setCurrentWarehouse({ ...currentWarehouse, description: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200"
                            rows="3"
                        />
                    </div>
                    
                    {/* Price Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                        <input
                            type="number"
                            value={currentWarehouse.price}
                            onChange={(e) => setCurrentWarehouse({ ...currentWarehouse, price: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200"
                        />
                    </div>
                </div>

                {/* Buttons */}
                <div className="mt-8 flex justify-end space-x-3">
                    {/* Cancel Button */}
                    <button 
                        type="button" 
                        className="flex items-center bg-red-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-red-500 transition duration-300"
                        onClick={handleCloseEditModal}
                    >
                        <HiOutlineBan className="mr-1" /> Cancel
                    </button>

                    {/* Save Button */}
                    <button 
                        type="button" 
                        className="flex items-center bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-blue-500 transition duration-300"
                        onClick={handleSaveChanges}
                    >
                        <HiOutlineSave className="mr-1" /> Save
                    </button>

                    {/* My Documents Button */}
                    <button
                        type="button"
                        className="flex items-center bg-green-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-green-500 transition duration-300"
                        onClick={handleShowDocuments}
                    >
                        <HiOutlineDocumentText className="mr-1" /> My Documents
                    </button>
                </div>
            </form>
        </div>
    </div>
)}

{isModalVisible && (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70">
        <div className="bg-white rounded-lg shadow-lg p-6 w-10/12 md:w-1/2 lg:w-1/3">
            <div className="flex items-center justify-center mb-6">
                <HiDocumentText className="text-blue-600 text-3xl mr-2" />
                <h2 className="text-2xl font-bold text-center text-gray-800">My Documents</h2>
            </div>
            <ul className="space-y-4">
                {userDocuments.map((doc) => (
                    <div key={doc.id} className="flex flex-col border rounded-lg p-4 bg-gray-50 shadow-sm w-full">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Warehouse: {doc.name}</h3>
                        <div className="space-y-2">
                            {[ 
                                { label: "Identification Proof", proof: doc.identificationProof },
                                { label: "Address Proof", proof: doc.addressProof },
                                { label: "Ownership Documents", proof: doc.ownershipDocuments },
                                { label: "Previous Tenancy Details", proof: doc.previousTenancyDetails },
                                { label: "Business Permit", proof: doc.businessPermit },
                                { label: "Sanitary Permit", proof: doc.sanitaryPermit },
                                { label: "Maintenance Records", proof: doc.maintenanceRecords }
                            ].map((item) => (
                                item.proof && (
                                    <div key={item.label} className="flex justify-between items-center border-b border-gray-300 py-2">
                                        <div className="flex items-center">
                                            <HiDocumentText className="text-gray-500 text-lg mr-2" />
                                            <span className="text-gray-700 font-medium">{item.label}</span>
                                        </div>
                                        <div className="flex items-center justify-center space-x-4 border-l border-gray-300 pl-4">
                                            <button
                                                className="flex items-center bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700 transition duration-300 text-sm"
                                                onClick={() => handleViewDocument(item.proof)}
                                            >
                                                <HiEye className="mr-1" /> View
                                            </button>
                                            <button
                                                className="flex items-center bg-cyan-600 text-white py-1 px-3 rounded hover:bg-cyan-700 transition duration-300 text-sm ml-2"
                                                onClick={() => handleResubmitClick({
                                                    id: doc.id,
                                                    label: item.label,
                                                    proof: item.proof // Pass the proof URL as well
                                                })}
                                            >
                                                <HiOutlineRefresh className="mr-1" /> Resubmit
                                            </button>

                                            {/* Vertical Divider */}
                                            <div className="border-l border-gray-300 h-8 mx-4"></div>

                                            {/* Display Status */}
                                            <div 
                                                className={`flex items-center justify-center text-sm font-medium ${doc.fileStatuses && doc.fileStatuses[sanitizeFieldName(item.label)]?.status === 'Rejected' ? 'bg-red-600 text-white px-3 py-1 rounded-md cursor-pointer' : 
                                                    doc.fileStatuses && doc.fileStatuses[sanitizeFieldName(item.label)]?.status === 'Approved' ? 'bg-green-600 text-white px-3 py-1 rounded-md' :
                                                    doc.fileStatuses && doc.fileStatuses[sanitizeFieldName(item.label)]?.status === 'Validating' ? 'bg-yellow-500 text-white px-3 py-1 rounded-md' : 'text-gray-600'}`}
                                                onClick={() => {
                                                    if (doc.fileStatuses && doc.fileStatuses[sanitizeFieldName(item.label)]?.status === 'Rejected') {
                                                        handleShowRejectionReason(doc.fileStatuses[sanitizeFieldName(item.label)]?.rejectionReason);
                                                    }
                                                }}
                                            >
                                                {doc.fileStatuses && doc.fileStatuses[sanitizeFieldName(item.label)]?.status === 'Rejected' ? (
                                                    <HiXCircle className="mr-2 text-white" />
                                                ) : doc.fileStatuses && doc.fileStatuses[sanitizeFieldName(item.label)]?.status === 'Approved' ? (
                                                    <HiCheckCircle className=" text-white" />
                                                ) : doc.fileStatuses && doc.fileStatuses[sanitizeFieldName(item.label)]?.status === 'Validating' ? (
                                                    <HiRefresh className=" text-white" />
                                                ) : null}
                                                {doc.fileStatuses && doc.fileStatuses[sanitizeFieldName(item.label)]?.status || 'Pending'}
                                            </div>
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                ))}
            </ul>

            {/* Note about Rejected Documents */}
            <div className="mt-4 text-sm text-gray-600 italic">
                If a document is marked as "Rejected," click the button to view the rejection reason.
            </div>

            <div className="mt-6">
                <button
                    className="flex items-center justify-center w-full bg-red-600 text-white font-semibold py-2 rounded hover:bg-red-700 transition duration-300"
                    onClick={handleCloseModal}
                >
                    <HiX className="mr-2" /> Close
                </button>
            </div>
        </div>
    </div>
)}


{/* Rejection Reason Modal */}
{rejectionReasonModalVisible && (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70">
        <div className="bg-white rounded-lg shadow-lg p-8 w-10/12 md:w-1/3 lg:w-1/4 max-w-md">
            {/* Icon and Text at the Top Center */}
            <div className="flex flex-col items-center mb-6">
                <HiExclamationCircle className="text-red-600 text-5xl mb-2" />
                <h3 className="text-xl font-semibold text-gray-800">Reason of Rejection</h3>
            </div>

            {/* Rejection Reason Card */}
            <div className="bg-gray-100 p-4 rounded-lg shadow-sm mb-6">
                <p className="text-center text-sm text-gray-800">
                    {currentRejectionReason || "No reason provided"}
                </p>
            </div>

            {/* Close Button */}
            <div className="flex justify-center">
                <button
                    className="bg-red-600 text-white py-2 px-6 rounded hover:bg-red-700 transition duration-300"
                    onClick={handleCloseRejectionReasonModal}
                >
                    Close
                </button>
            </div>
        </div>
    </div>
)}



 
 {restrictedResubmitModalVisible && (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-10/12 md:w-1/2 lg:w-1/3 text-center">
            <div className="flex flex-col items-center">
                <HiExclamationCircle className="text-red-600 text-6xl mb-3" />
                <h2 className="text-2xl font-bold text-red-600">Action Not Allowed</h2>
            </div>
            <p className="text-gray-800 mt-4">
                This warehouse has already been validated by the admin and marked as <strong>"Verified"</strong>. Document resubmission is no longer permitted.
            </p>
            <div className="mt-6">
                <button
                    className="bg-red-600 text-white py-2 px-6 rounded-lg hover:bg-red-700 transition duration-300 focus:outline-none"
                    onClick={() => setRestrictedResubmitModalVisible(false)}
                >
                    Close
                </button>
            </div>
        </div>
    </div>
)}
 {isResubmitModalVisible && (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70">
        <div className="bg-white rounded-lg shadow-lg p-8 w-11/12 md:w-96">
            <div className="flex items-center justify-center mb-4">
                <HiUpload className="text-blue-600 text-4xl" />
            </div>
            <h2 className="text-2xl font-semibold text-center mb-2">Resubmit Document</h2>
            <p className="text-center mb-4 text-gray-600">
                You are resubmitting for: <span className="font-bold">{selectedDoc?.label}</span>
            </p>
            <input
                type="file"
                onChange={handleFileUploadChange}
                className="w-full border border-gray-300 rounded-md p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            />
            <div className="flex flex-col mt-4">
                <button
                    className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 transition duration-300"
                    onClick={uploadDocument}
                >
                    Upload
                </button>
                <button
                    className="w-full bg-red-600 text-white font-semibold py-2 rounded hover:bg-red-700 transition duration-300 mt-2"
                    onClick={() => setResubmitModalVisible(false)}
                >
                    Cancel
                </button>
            </div>
        </div>
    </div>
)}


{isUploading && (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70">
        <div className="bg-white rounded-lg shadow-lg p-8 w-10/12 md:w-1/2 lg:w-1/3 flex flex-col items-center">
            <div className="animate-spin h-16 w-16 border-4 border-t-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
            <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">Uploading Document...</h2>
            <p className="text-gray-600 text-center">Please wait while your document is being uploaded.</p>
        </div>
    </div>
)}

{successModalVisible && (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70">
        <div className="bg-white rounded-lg shadow-lg p-4 w-10/12 md:w-1/3 lg:w-1/4">
            <div className="flex items-center justify-center mb-2">
                <HiCheckCircle className="text-green-600 text-7xl" /> {/* Use the Hi icon here */}
            </div>
            <h2 className="text-xl font-bold text-center mb-2">Success!</h2>
            <p className="text-center mb-4">The document has been successfully resubmitted.</p>
            <div className="mt-2">
                <button
                    className="w-full bg-green-600 text-white font-semibold py-2 rounded hover:bg-green-700 transition duration-300"
                    onClick={() => setSuccessModalVisible(false)}
                >
                    Close
                </button>
            </div>
        </div>
    </div>
)}


         {isSuccessModalOpen && (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-900 bg-opacity-75 z-50">
        <div className="relative bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center"> {/* Adjusted padding and max width */}
            <span className="absolute top-3 right-3 text-3xl cursor-pointer" onClick={() => setIsSuccessModalOpen(false)}>&times;</span>
            
            {/* Checkmark Icon */}
            <div className="flex justify-center mb-4">
                <div className="bg-green-500 rounded-full p-2 shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            </div>

            <h2 className="text-3xl font-bold mb-4 text-green-500">Success</h2>
            <p className="text-lg mb-6">Your changes have been saved successfully!</p>
            <button 
                type="button" 
                className="mt-4 bg-blue-500 text-white font-semibold py-2 px-6 rounded hover:bg-blue-600 transition duration-300 shadow-md"
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
                            <p className="text-gray-700 mb-4">
  <strong>Price:</strong> ₱{warehouse.price ? Number(warehouse.price).toLocaleString() : '0'}
</p>
                            <p className="text-gray-700 mb-4">
                                <strong>Status: </strong>
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
                            
                             {/* View Status Button */}
 <button
            className="mt-4 ml-2 bg-yellow-600 text-white py-2 px-4 rounded hover:bg-yellow-500"
            onClick={() => handleShowTransactionStatus(warehouse)}
          >
            View Status
          </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
)}

{isModalActive && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white rounded-lg shadow-lg p-8 w-10/12 max-w-xl relative">
      
      {/* Icon and Title */}
      <div className="flex flex-col items-center">
        <HiOutlineStatusOnline className="text-blue-500 text-6xl mb-2" />
        <h2 className="text-2xl  text-gray-800">Transaction Status</h2>
      </div>

    {/* Content Card */}
    <div className="bg-gray-100 p-4 rounded-lg shadow-md mt-2">
        <p className="text-lg text-gray-700 text-center font-bold">
          {statusMessage || "No transactions have been made yet."}
        </p>
      </div>

      {/* Close Button */}
      <button
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition duration-200"
        onClick={handleCloseTransactionModal}
      >
        ✖
      </button>
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
<div className="relative">
    <div className="flex items-center justify-center p-2 bg-white rounded-lg shadow-md border border-gray-200 w-full max-w-xs">
        <div
            className={`flex items-center justify-center text-sm font-semibold w-32 ${
                document.status === 'approved'
                    ? 'text-green-600'
                    : document.resubmitted === 'Resubmitted'
                    ? 'text-orange-600' // Use this for Resubmitted (shows Validating text)
                    : document.status === 'rejected'
                    ? 'text-red-600 cursor-pointer hover:underline'
                    : 'text-orange-600' // Fallback for other statuses
            }`}
            onClick={() => {
                // Prevent clicking if status is Resubmitted
                if (document.resubmitted === 'Resubmitted') {
                    return; // Prevent click if resubmitted
                }

                if (document.status === 'rejected') {
                    // Log the document name or URL to the console
                    console.log("Rejected Document:", document.name, document.url);
                    
                    // Set the selected document for resubmission
                    setSelectedDocument(document); // Track the selected document

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
                {document.status === 'approved'
                    ? '✅ Approved'
                    : document.resubmitted === 'Resubmitted'
                    ? '🟠 Validating' // Display "Validating" for Resubmitted
                    : document.status === 'rejected'
                    ? '❌ Rejected'
                    : '🟠 Pending'}
            </span>
        </div>
    </div>


{/* Tooltip */}
{document.status === 'rejected' && tooltipVisibleIndex === index && document.resubmitted !== 'Resubmitted' && (
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
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-4">
            <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Reason for Rejection</h2>
            <div className="bg-gray-100 p-4 rounded-lg mb-2"> 
                <p className="text-lg text-gray-700 text-center">{rejectionReason}</p>
            </div>

            {/* Horizontal line separating rejection reason and instruction text */}
            <hr className="my-4 border-gray-300" />

            {/* Instruction Text for Resubmission */}
            <p className="text-sm text-gray-900 mb-4 text-center">
                To resubmit a new document, please choose a new file below.
            </p>

            {/* Horizontal line above the file input */}
            <hr className="my-4 border-gray-300" />

            {/* Modern File Input for Resubmission */}
            <label className="block mb-4">
                <span className="sr-only">Choose file</span>
                <input
                    type="file"
                    accept="image/*" // Change according to your file type
                    onChange={(e) => handleFileChange(e)}
                    className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 transition duration-300 ease-in-out hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </label>

            {/* Button Container with Compact Design */}
            <div className="flex justify-between space-x-2">
              

                <button
                    className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-500 transition duration-300 w-full"
                    onClick={() => setShowRejectionReasonModal(false)}
                >
                    Close
                </button>
                <button
                    className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-500 transition duration-300 w-full"
                    onClick={handleResubmit}
                >
                    Resubmit
                </button>
            </div>
        </div>
    </div>
)}


{loadingStatus && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xs mx-4 text-center">
            <h2 className="text-lg font-semibold mb-2 text-gray-800">Uploading...</h2>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className="bg-green-500 h-full rounded-full"
                    style={{ width: `${progressPercentage}%` }}
                ></div>
            </div>
            <p className="mt-2 text-gray-600">{Math.round(progressPercentage)}%</p>
        </div>
    </div>
)}
{successNotificationVisible && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm text-center">
            <div className="flex items-center justify-center mb-6">
                <div className="flex items-center justify-center w-16 h-16 bg-green-400 rounded-full">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            </div>
            <h2 className="text-2xl font-semibold text-green-600 mb-2">Document Submitted! </h2>
            <p className="text-gray-600 mb-6">Kindly wait for the lessor to review and approve it.</p>
            <button
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-500 transition duration-200"
                onClick={() => setSuccessNotificationVisible(false)}
            >
                OK
            </button>
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
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm">
            <div className="text-center">
                {/* Success Icon */}
                <div className="flex items-center justify-center mb-6">
                    <div className="flex items-center justify-center w-16 h-16 bg-green-400 rounded-full">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-10 w-10 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </div>
                {/* New Success Message */}
                <div className="text-lg font-semibold mb-2 text-green-600">Document Successfully Submitted!</div>
                {/* New Paragraph Text */}
                <p className="text-gray-700 mb-4">Thank you for your submission. Please await approval from the lessor.</p>
                {/* Close Button */}
                <button
                    type="button"
                    onClick={() => setSubmissionSuccessModalVisible(false)}
                    className="bg-green-600 text-white py-2 px-4 rounded-lg shadow-sm hover:bg-green-500 transition duration-200"
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
           
           <div className="flex justify-between items-center mb-4">
    <h3 className="text-2xl font-semibold">{warehouse.name}</h3>
    {/* View Status Button */}
    <button
        className="bg-blue-500 text-white font-semibold py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
        onClick={() => handleOpenStatusModal(warehouse)}
    >
        View Status
    </button>
</div>

                            <div className="text-gray-700 mb-4 text-xl ">
                                <p><strong>Address:</strong> {warehouse.address}</p>
                                <p><strong>Description:</strong> {warehouse.description}</p>
                                <p><strong>Lessor:</strong> {warehouse.ownerFirstName} {warehouse.ownerLastName}</p>
                            </div>
                            <p className="text-gray-700 mb-4 text-xl">
  <strong>Price:</strong> ₱{warehouse.price ? Number(warehouse.price).toLocaleString() : '0'}
</p>
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
                                    className="bg-purple-500 text-white font-semibold py-2 px-12 rounded hover:bg-purple-600 transition duration-300"
                                    onClick={() => handleViewDocuments(warehouse)}
                                >
                                    Review Documents
                                </button>
                                <button
                                    className="bg-blue-500 text-white font-semibold py-2 px-12 rounded hover:bg-blue-600 transition duration-300"
                                    onClick={() => handleLeaseAgreement(warehouse)}
                                >
                                    Lease Agreement
                                </button>
                                <button
                                    className="bg-green-500 text-white font-semibold py-2 px-12 rounded hover:bg-green-600 transition duration-300"
                                    onClick={() => markAsRented(warehouse.warehouseId)}
                                >
                                    Approve
                                </button>
                            
                                <button
                                    className="bg-red-500 text-white font-semibold py-2 px-12 rounded hover:bg-red-600 transition duration-300"
                                    onClick={() => handleReject(warehouse)}
                                >
                                    Reject
                                </button>
                                {/* View Documents Button */}
                              
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {isStatusModalVisible && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
<div className="bg-white rounded-lg shadow-lg p-8 w-10/12 max-w-xl relative">
{/* Icon and Title */}
            <div className="flex flex-col items-center">
                <HiOutlineStatusOnline className="text-blue-500 text-6xl mb-2" />
                <h2 className="text-2xl font-bold text-gray-800">Transaction Status</h2>
            </div>
            
            {/* Content */}
            <p className="text-lg text-gray-700 mt-6 text-center">
                {transactionStatus || "No transactions have been made yet."}
            </p>
            


            {/* Close Button */}
            <button
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition duration-200"
                onClick={handleCloseStatusModal}
            >
                ✖
            </button>
        </div>
    </div>
)}



        {renderPopup()} {/* Popup modal rendering */}

   {/* Validation Modal */}
   {showValidationModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-sm text-center">
                        <HiExclamationCircle className="text-7xl text-blue-500 mx-auto" />
                        <h2 className="text-lg font-semibold mt-4">Validation Required</h2>
                        <p className="mt-2">You need to validate the rejected documents before proceeding with the lease agreement.</p>
                        <button
                            className="mt-4 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
                            onClick={handleCloseValidationModal}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

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
                                        <div className={`flex items-center justify-center text-sm font-semibold ${document.status === 'approved' ? 'text-green-600' : document.resubmitted ? 'text-orange-600 cursor-pointer' : 'text-red-600'} w-32`} onClick={document.resubmitted ? () => handleResubmittedClick(index) : undefined}>
           <span>
    {document.status === 'approved' ? (
        '✅ Approved'
    ) : document.resubmitted ? (
        <>
            <span className="text-orange-600 hover:underline hover:font-bold">
                🔄 Resubmitted
            </span>
        </>
    ) : (
        '❌ Rejected'
    )}
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
        onChange={() => {
            setDocumentToApproveIndex(index); // Set the document index to approve
            setShowApprovalConfirmationModal(true); // Show the confirmation modal
        }}
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

{showApprovalConfirmationModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
            <h3 className="text-xl font-bold mb-4">Confirm Approval</h3>
            <p>Are you sure you want to approve this document?</p>
            <div className="flex justify-end mt-6 space-x-4">
                <button
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-500"
                    onClick={() => setShowApprovalConfirmationModal(false)} // Close the modal without action
                >
                    Cancel
                </button>
                <button
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500"
                    onClick={() => {
                        handleDocumentStatusChange(documentToApproveIndex, 'approved'); // Approve the document
                        setShowApprovalConfirmationModal(false); // Close the modal
                    }}
                >
                    Confirm
                </button>
            </div>
        </div>
    </div>
)}

{/* Resubmitted Modal */}
{reviewedDocumentIndex !== null && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-70">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
            <h3 className="text-2xl font-semibold mb-4 text-center text-gray-800">Review Document Status</h3>
            <p className="mb-6 text-center text-gray-600">Please select the status for the document:</p>
            <div className="flex justify-center space-x-10 mb-6">
                <label className="flex items-center text-lg cursor-pointer">
                    <input
                        type="radio"
                        name="review-status"
                        value="approved"
                        checked={newStatus === 'approved'}
                        onChange={() => setNewStatus('approved')}
                        className="form-radio h-5 w-5 text-green-600 accent-green-600"
                    />
                    <span className="ml-2 text-green-600">Approve</span>
                </label>
                <label className="flex items-center text-lg cursor-pointer">
                    <input
                        type="radio"
                        name="review-status"
                        value="rejected"
                        checked={newStatus === 'rejected'}
                        onChange={() => setNewStatus('rejected')}
                        className="form-radio h-5 w-5 text-red-600 accent-red-600"
                    />
                    <span className="ml-2 text-red-600">Reject</span>
                </label>
            </div>
            <div className="mt-8 flex justify-center space-x-4">
                <button
                    className="bg-green-600 text-white px-6 py-2 rounded-lg shadow-md"
                    onClick={() => {
                        const updatedDocuments = [...selectedWarehouseDocuments];
                        updatedDocuments[reviewedDocumentIndex].status = newStatus; // Update the status
                        setSelectedWarehouseDocuments(updatedDocuments); // Update local state
                        setReviewedDocumentIndex(null); // Close modal
                    }}
                >
                    Confirm
                </button>
                <button
                    className="bg-red-600 text-white px-6 py-2 rounded-lg shadow-md"
                    onClick={() => setReviewedDocumentIndex(null)} // Close modal
                >
                    Cancel
                </button>
            </div>
        </div>
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
                <h2 className="text-2xl font-bold text-green-600 mb-4">Validation Complete!</h2>
                <p className="text-gray-700">{modalMessage}</p>
            </div>

            {/* Close Button */}
            <div className="mt-6">
            <button
    className="bg-green-600 text-white px-10 py-2 rounded-2xl hover:bg-green-500 transition duration-300"
    onClick={() => {
        setShowDocumentsModal(false);
        setIsModalOpen(false);
    }}
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
                        <p><strong>Price:</strong> ₱{selectedWarehouse.price ? Number(selectedWarehouse.price).toLocaleString() : '0'}</p>
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
                            <div className="flex justify-end space-x-2">
                              
                                <button
                                    className="bg-red-600 text-white font-semibold py-2 px-4 rounded hover:bg-red-500 transition duration-300 focus:outline-none"
                                    onClick={() => setShowConfirmationModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="bg-green-600 text-white font-semibold py-2 px-4 rounded hover:bg-green-500 transition duration-300 mr-2 focus:outline-none"
                                    onClick={confirmMarkAsRented}
                                >
                                    Yes, Approve
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
{/* Success Icon Modal */}
{showSuccessGif && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-2xl p-8 relative max-w-md"> {/* Increased padding and width */}
            {/* Icon Section */}
            <div className="flex justify-center">
                <HiCheckCircle className="text-green-600 text-8xl" /> {/* Increased icon size */}
            </div>
            {/* Text Section */}
            <div className="text-center mt-6"> {/* Adjusted margin for spacing */}
                <h2 className="text-xl font-bold text-green-600">Success!</h2> {/* Increased text size */}
                <p className="text-base">The warehouse has been marked as rented.</p> {/* Adjusted text size */}
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


