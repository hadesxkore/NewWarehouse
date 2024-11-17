import React, { useState, useEffect } from 'react';
import { firestore } from '../firebase'; // Import your Firebase configuration
import Navigation from './Navigation';
import './Superadmin.css';
import { useNavigate } from 'react-router-dom';  // Import the useNavigate hook
import firebase from 'firebase/compat/app';  // Ensure this import is included
import 'firebase/compat/firestore'; // Ensure this import is included for Firestore

import { HiCalendar, HiArrowUp, HiArrowDown, HiX, HiCheckCircle, HiXCircle, HiOutlineEye, HiRefresh } from "react-icons/hi";
import error1 from '../images/error1.png';
import success from '../images/Success.gif'
function Superadmin() {
    const [uploadedWarehouses, setUploadedWarehouses] = useState([]);
    const [filterStatus, setFilterStatus] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalVisible, setModalVisible] = useState(false); // Renamed state variable
    const [currentAction, setCurrentAction] = useState(null); // Store the current action to confirm
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isDeleteErrorModalOpen, setIsDeleteErrorModalOpen] = useState(false);
    const [warehouseToDelete, setWarehouseToDelete] = useState(null);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [sortOption, setSortOption] = useState(''); // State for sorting option
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
    const [archivedWarehouses, setArchivedWarehouses] = useState([]);
    const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
    const [selectedApproval, setSelectedApproval] = useState(null);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [fileStatuses, setFileStatuses] = useState({});
    const [resubmittedClicked, setResubmittedClicked] = useState({});

    const [showApproveSuccessModal, setShowApproveSuccessModal] = useState(false);
const [showRejectSuccessModal, setShowRejectSuccessModal] = useState(false);

    const [rejectionReasonText, setRejectionReasonText] = useState("");

    const navigate = useNavigate();  // Initialize the navigate function

    const closeDeleteErrorModal = () => {
        setIsDeleteErrorModalOpen(false);
        setErrorMessage('');
    };

  
    const confirmDelete = async () => {
        if (!warehouseToDelete) return;
    
        try {
            const warehouseDocRef = firestore.collection('warehouses').doc(warehouseToDelete);
            const warehouseDoc = await warehouseDocRef.get();
            
            // Archive the warehouse before deleting it
            const archiveData = warehouseDoc.data();
            archiveData.deletedAt = new Date();  // Add a timestamp for the archive
            await firestore.collection('archivedWarehouses').doc(warehouseToDelete).set(archiveData);
    
            // Delete from 'warehouses'
            await warehouseDocRef.delete();
    
            // Also delete from 'rentedWarehouses' if it exists
            const rentedWarehouseRef = firestore.collection('rentedWarehouses').doc(warehouseToDelete);
            const rentedWarehouseDoc = await rentedWarehouseRef.get();
            if (rentedWarehouseDoc.exists) {
                await rentedWarehouseRef.delete();
            }
    
            fetchUploadedWarehouses();  // Refresh warehouse list
            setFilterStatus('');
            setIsDeleteConfirmModalOpen(false);
            setIsSuccessModalOpen(true);
            setWarehouseToDelete(null);
        } catch (error) {
            console.error('Error deleting warehouse:', error);
            alert('An error occurred while deleting the warehouse. Please try again later.');
        }
    };

    

const fetchArchivedWarehouses = async () => {
    try {
        const archivedRef = firestore.collection('archivedWarehouses');
        const snapshot = await archivedRef.get();
        const archivedData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setArchivedWarehouses(archivedData);
    } catch (error) {
        console.error('Error fetching archived warehouses:', error);
    }
};


 // This function is called when the button is clicked
 const openArchiveModal = () => {
    navigate('/ArchiveWarehouse');  // Redirects to the ArchiveWarehouse page
};

const handleResubmittedClick = (sanitizedLabel) => {
    setResubmittedClicked((prevState) => ({
        ...prevState,
        [sanitizedLabel]: true,
    }));
};

const closeArchiveModal = () => {
    setIsArchiveModalOpen(false);
};


    const cancelDelete = () => {
        setIsDeleteConfirmModalOpen(false);
        setWarehouseToDelete(null);
    };
const openConfirmModal = (warehouseId) => {
    setWarehouseToDelete(warehouseId);
    setIsConfirmModalOpen(true);
};
   // Sorting function
   const sortWarehouses = (warehouses, option) => {
    const sortedWarehouses = [...warehouses];
    if (option === 'uploadDateAsc') {
        return sortedWarehouses.sort((a, b) => a.uploadDate - b.uploadDate);
    } else if (option === 'uploadDateDesc') {
        return sortedWarehouses.sort((a, b) => b.uploadDate - a.uploadDate);
    } else if (option === 'priceLowToHigh') {
        return sortedWarehouses.sort((a, b) => a.price - b.price);
    } else if (option === 'priceHighToLow') {
        return sortedWarehouses.sort((a, b) => b.price - a.price);
    }
    return sortedWarehouses; // Return unsorted if no option matches
};
  // Sort warehouses when sortOption changes
  const sortedWarehouses = sortWarehouses(uploadedWarehouses, sortOption);

     // Function to fetch uploaded warehouses
     const fetchUploadedWarehouses = async () => {
        setIsLoading(true);
        try {
            const warehousesRef = firestore.collection('warehouses');
            let query = warehousesRef;
            if (filterStatus) {
                query = query.where('status', '==', filterStatus);
            }
            const snapshot = await query.get();
            const uploadedWarehousesData = snapshot.docs.map(async doc => {
                const warehouseData = doc.data();
                const userRef = await firestore.collection('users').doc(warehouseData.userUid).get();
                const userData = userRef.data();
                return { id: doc.id, user: userData || {}, ...warehouseData };
            });
            const uploadedWarehousesWithUserData = await Promise.all(uploadedWarehousesData);
            setUploadedWarehouses(uploadedWarehousesWithUserData);
        } catch (error) {
            console.error('Error fetching uploaded warehouses:', error);
        } finally {
            setIsLoading(false);
        }
    };
        // Function to check if a warehouse is rented
        const isWarehouseRented = (rentStatus) => rentStatus === 'Rented';

        const confirmAction = (action) => {
            setCurrentAction(() => action); // Set the current action
            setModalVisible(true); // Open the modal
        };
        const handleConfirm = () => {
            if (currentAction) currentAction(); // Call the action if it exists
            setModalVisible(false); // Close the modal
        };
        const handleCancel = () => {
            setModalVisible(false); // Just close the modal
        };    
    

    // Function to handle verification of uploaded warehouses
    const handleVerification = async (warehouseId, status, reason = '') => {
        try {
            const updateData = { status };
            if (status === 'rejected') {
                updateData.rejectionReason = reason;
            }
            await firestore.collection('warehouses').doc(warehouseId).update(updateData);
            fetchUploadedWarehouses();
        } catch (error) {
            console.error('Error updating warehouse status:', error);
        }
    };

    const handleReject = (warehouseId) => {
        const warehouse = uploadedWarehouses.find(wh => wh.id === warehouseId);
        if (warehouse &&  warehouse.rentStatus === 'Rented') {
            setErrorMessage('This warehouse is currently rented and cannot be rejected.');
            setIsErrorModalOpen(true);
            return;
        }
        setSelectedWarehouse(warehouseId);
        setIsRejectModalOpen(true);
    };

    const submitRejection = () => {
        if (selectedWarehouse) {
            handleVerification(selectedWarehouse, 'rejected', rejectionReason);
            setIsRejectModalOpen(false);
            setRejectionReason('');
        }
    };

    const handleDelete = (warehouseId) => {
        const warehouse = uploadedWarehouses.find(wh => wh.id === warehouseId);
        if (warehouse && warehouse.rentStatus === 'Rented') {
            setErrorMessage('This warehouse is currently rented and cannot be deleted.');
            setIsDeleteErrorModalOpen(true);
            return;
        }
        
        setWarehouseToDelete(warehouseId);
        setIsDeleteConfirmModalOpen(true);
    };
    const closeSuccessModal = () => {
        setIsSuccessModalOpen(false);
    };
    const handleViewFiles = async (warehouseId) => {
        const warehouse = uploadedWarehouses.find(wh => wh.id === warehouseId);
        if (warehouse) {
            // Fetch file statuses from Firestore
            try {
                const warehouseRef = firestore.collection('warehouses').doc(warehouseId);
                const warehouseDoc = await warehouseRef.get();
                const fileStatusesFromDb = warehouseDoc.data()?.fileStatuses || [];
    
                // Create a map for the file statuses
                const fileStatusesMap = fileStatusesFromDb.reduce((acc, file) => {
                    const sanitizedLabel = sanitizeFieldName(file.fileLabel);
                    acc[sanitizedLabel] = file.status;
                    return acc;
                }, {});
    
                // Update local state with the file statuses
                setFileStatuses(fileStatusesMap);
    
                // Filter out any null or undefined URLs
                const availableFiles = [
                    { label: "Identification Proof", url: warehouse.identificationProof },
                    { label: "Address Proof", url: warehouse.addressProof },
                    { label: "Ownership Documents", url: warehouse.ownershipDocuments },
                    { label: "Previous Tenancy Details", url: warehouse.previousTenancyDetails },
                    { label: "Business Permit", url: warehouse.businessPermit },
                    { label: "Sanitary Permit", url: warehouse.sanitaryPermit },
                    { label: "Maintenance Records", url: warehouse.maintenanceRecords }
                ].filter(file => file.url); // Only keep files with valid URLs
    
                setSelectedFiles(availableFiles);
                setSelectedWarehouse(warehouse);
                setIsModalOpen(true);
            } catch (error) {
                console.error('Error fetching warehouse data:', error);
            }
        } else {
            console.error('Warehouse not found');
        }
    };

// Handle Approve button click
const handleApproveClick = (file, warehouseId) => {
    setSelectedApproval({ warehouseId, fileLabel: file.label }); // Store warehouseId and file label together
    setShowApproveModal(true);
  };
  

// Handle Reject button click
const handleRejectClick = (file, warehouseId) => {
    setSelectedApproval({ warehouseId, fileLabel: file.label }); // Store warehouseId and file label together
    setShowRejectModal(true);
  };

// Function to sanitize the file label
const sanitizeFieldName = (label) => {
    return label.replace(/[^a-zA-Z0-9]/g, '_'); // Replace non-alphanumeric characters with underscores
};
// Handle Confirm Approve
const handleConfirmApprove = async () => {
    setShowApproveModal(false);

    const sanitizedFileLabel = sanitizeFieldName(selectedApproval.fileLabel);

    // Update local state immediately
    setFileStatuses((prevStatuses) => ({
        ...prevStatuses,
        [sanitizedFileLabel]: 'Approved',
    }));

    try {
        const warehouseRef = firestore.collection('warehouses').doc(selectedApproval.warehouseId);
        await warehouseRef.update({
            fileStatuses: firebase.firestore.FieldValue.arrayUnion({
                fileLabel: sanitizedFileLabel,
                status: 'Approved',
            }),
        });
        console.log('Warehouse document updated with Approved status for file:', selectedApproval.fileLabel);

        // Show success modal after approval
        setShowApproveSuccessModal(true);
    } catch (error) {
        console.error('Error updating approval status:', error);
    }
};

// Handle Confirm Reject
const handleConfirmReject = async () => {
    setShowRejectModal(false);

    const sanitizedFileLabel = sanitizeFieldName(selectedApproval.fileLabel);

    // Update local state immediately
    setFileStatuses((prevStatuses) => ({
        ...prevStatuses,
        [sanitizedFileLabel]: 'Rejected',
    }));

    try {
        const warehouseRef = firestore.collection('warehouses').doc(selectedApproval.warehouseId);
        await warehouseRef.update({
            fileStatuses: firebase.firestore.FieldValue.arrayUnion({
                fileLabel: sanitizedFileLabel,
                status: 'Rejected',
                rejectionReason: rejectionReasonText,
            }),
        });
        console.log('Warehouse document updated with Rejected status for file:', selectedApproval.fileLabel);

        // Show success modal after rejection
        setShowRejectSuccessModal(true);
    } catch (error) {
        console.error('Error updating rejection status:', error);
    }
};






// Handle change in rejection reason input
const handleRejectionReasonChange = (event) => {
    setRejectionReasonText(event.target.value);
};

    // Function to close the modal
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedFiles([]);
    };

    const closeRejectModal = () => {
        setIsRejectModalOpen(false);
        setRejectionReason('');
    };

    const closeErrorModal = () => {
        setIsErrorModalOpen(false);
        setErrorMessage('');
    };

    // Fetch uploaded warehouses on component mount or when filterStatus changes
    useEffect(() => {
        fetchUploadedWarehouses();
    }, [filterStatus]);

    return (
        <div style={{ backgroundColor: '#eeeeee', minHeight: '100vh' }}>
            {/* Navigation component */}
            <Navigation />

            <div className="superadmin-container">
            <div className="container mx-auto px-8 py-10 border border-gray-600 rounded-lg mt-8">
               {/* Sorting Dropdown */}
<div className="flex justify-end mb-4 relative">
    <div className="border rounded p-2 flex items-center space-x-2 bg-white">
        <HiCalendar className="text-gray-500 mr-2" />
        <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="appearance-none bg-transparent border-none focus:outline-none cursor-pointer"
        >
            <option value="">Sort By</option>
            <option value="uploadDateAsc">
                Upload Date: Past
            </option>
            <option value="uploadDateDesc">
                Upload Date: Latest
            </option>
            <option value="priceLowToHigh">
                Price: Low to High
            </option>
            <option value="priceHighToLow">
                Price: High to Low
            </option>
        </select>
    </div>
</div>
<button
                onClick={openArchiveModal}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
                View Archived Warehouses
            </button>
{/* Display icons beside dropdown for a similar effect */}
<div className="absolute top-12 right-0 flex flex-col space-y-2 mt-2 text-gray-600">
    {sortOption === "uploadDateAsc" && <HiCalendar />}
    {sortOption === "uploadDateDesc" && <HiCalendar />}
    {sortOption === "priceLowToHigh" && <HiArrowDown />}
    {sortOption === "priceHighToLow" && <HiArrowUp />}
</div>
                {/* Filter Buttons */}
                <div className="flex justify-center mt-4 space-x-2">
                    <button onClick={() => setFilterStatus('')} className={`filter-btn ${filterStatus === '' && 'active'}`}>All</button>
                    <button onClick={() => setFilterStatus('pending')} className={`filter-btn ${filterStatus === 'pending' && 'active'}`}>Pending</button>
                    <button onClick={() => setFilterStatus('verified')} className={`filter-btn ${filterStatus === 'verified' && 'active'}`}>Verified</button>
                    <button onClick={() => setFilterStatus('rejected')} className={`filter-btn ${filterStatus === 'rejected' && 'active'}`}>Rejected</button>
                </div>

                {isLoading ? (
                    <p>Loading...</p>
                ) : sortedWarehouses.length === 0 ? (
                    <div className="no-warehouses-message">
                        <p>No warehouses found.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                        {sortedWarehouses.map(warehouse => (
                            <div key={warehouse.id} className="uploaded-warehouse bg-white p-4 rounded-lg shadow-md relative">
                                <div className="flex justify-between mb-2">
                                    <h3 className="text-lg font-semibold">{warehouse.name}</h3>
                                </div>
                                <p className="text-gray-600 mb-2">
                                    <span className="font-bold">Address:</span> {warehouse.address}
                                </p>
                                <p className="text-gray-600 mb-2">
                                    <span className="font-bold">Description:</span> {warehouse.description}
                                </p>
                                <p className="text-gray-600 mb-2">
                                    <span className="font-bold">Price:</span> ₱{warehouse.price}
                                </p>
                                <p className="text-gray-600 mb-2">
                                    <span className="font-bold">Uploader:</span> {warehouse.user ? `${warehouse.user.first_name} ${warehouse.user.last_name} (${warehouse.user.contact_number})` : 'Unknown'}
                                </p>
                                <p className="text-gray-600 mb-2">
                                    <span className="font-bold">Status:</span>
                                    {warehouse.status === 'pending' && <span className="status-text" style={{ color: 'orange' }}>Pending</span>}
                                    {warehouse.status === 'verified' && <span className="status-text" style={{ color: 'green' }}>Verified</span>}
                                    {warehouse.status === 'rejected' && <span className="status-text" style={{ color: 'red' }}>Rejected</span>}
                                </p>
                                <div className="flex flex-wrap mt-2">
                                    {warehouse.images.map((imageUrl, index) => (
                                        <img key={index} src={imageUrl} alt={`Image ${index + 1}`} className="h-16 w-16 object-cover rounded-md mr-2 mb-2 cursor-pointer"
                                            onClick={() => handleViewFiles(warehouse.id)} />
                                    ))}
                                </div>
                                <div className="flex flex-wrap mt-2">
                                    {warehouse.videos.map((videoUrl, index) => (
                                        <video key={index} src={videoUrl} controls className="h-16 w-16 rounded-md mr-2 mb-2"></video>
                                    ))}
                                </div>
                                <p className="text-gray-600 mt-2">
                                    <span className="font-bold">Upload Date:</span> {warehouse.uploadDate ? new Date(warehouse.uploadDate.toDate()).toLocaleString() : 'Unknown'}
                                </p>
                                <div className="verification-buttons mt-2 space-x-3">
                                    <button
                                        onClick={() => confirmAction(() => handleVerification(warehouse.id, 'verified'))}
                                        disabled={warehouse.status === 'verified'}
                                        className="button-style bg-green-500"
                                    >
                                        Confirm
                                    </button>
                                    <button
                                        onClick={() => handleReject(warehouse.id)}
                                        disabled={warehouse.status === 'rejected'}
                                        className="button-style bg-red-500"
                                    >
                                        Reject
                                    </button>
                                    <button onClick={() => handleDelete(warehouse.id)} className="button-style bg-red-500">
                                        Delete
                                    </button>
                                    <button className="button-style bg-blue-500 ml-2" onClick={() => handleViewFiles(warehouse.id)}>
                                        Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

  {/* Modal */}
{modalVisible && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white w-full md:w-3/4 lg:w-1/2 xl:w-1/3 rounded-lg shadow-2xl p-6 relative max-w-md">
            <button
                onClick={() => setModalVisible(false)} // Use setModalVisible to close the modal
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-3xl"
            >
                &times;
            </button>
            <h2 className="text-2xl font-bold mb-4">Confirm Action</h2>
            <p className="text-gray-700 mb-6">Are you sure you want to proceed?</p>
            <div className="flex justify-end space-x-2">
                
                <button
                    onClick={() => setModalVisible(false)} // Use setModalVisible to cancel
                    className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded"
                >
                    No
                </button>
                <button
                    onClick={handleConfirm}
                    className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded"
                >
                    Yes, Proceed
                </button>
            </div>
        </div>
    </div>
)}

{/* Redesigned Modal with Larger Text and Improved Button Styling */}
{isModalOpen && (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-70 z-50 transition-opacity">
        <div className="relative bg-white p-8 w-full max-w-4xl rounded-xl shadow-2xl">
            {/* Close Button */}
            <button
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                onClick={closeModal}
                aria-label="Close Modal"
            >
                <HiX className="h-7 w-7" />
            </button>

            {/* Modal Header */}
            <div className="text-center mb-6">
                <h2 className="text-3xl font-semibold text-gray-900">Documents for {selectedWarehouse?.name}</h2>
                <p className="text-xl text-gray-600">Review and update the status of the documents below.</p>
            </div>

            {/* Table Layout */}
            <div className="overflow-x-auto rounded-lg shadow-sm ring-1 ring-gray-200">
                <table className="min-w-full text-lg">
                    {/* Table Header */}
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-lg font-semibold text-gray-700">Document Name</th>
                            <th className="px-6 py-4 text-left text-lg font-semibold text-gray-700">Documents</th>
                            <th className="px-6 py-4 text-left text-lg font-semibold text-gray-700">Status</th>
                        </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody className="divide-y divide-gray-100">
                        {selectedFiles.map((file, index) => {
                            const sanitizedLabel = sanitizeFieldName(file.label);
                            const fileStatus = fileStatuses[sanitizedLabel] || '';
                            const isResubmittedClicked = resubmittedClicked[sanitizedLabel] || false;

                            return (
                                <tr key={index} className="bg-white hover:bg-gray-50 transition-colors">
                                    {/* Document Name Column */}
                                    <td className="px-6 py-4 text-gray-800 font-medium">{file.label}</td>

                                    {/* Documents Column */}
                                    <td className="px-6 py-4 text-gray-800">
                                        <a
                                            href={file.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-block text-blue-600 hover:text-blue-700 font-semibold"
                                        >
                                            View Document
                                        </a>
                                    </td>

  {/* Status Column */}
<td className="px-6 py-4 text-white">
    {fileStatus === 'Approved' || fileStatus === 'Rejected' ? (
        <div
            className={`flex items-center justify-center text-lg font-medium ${
                fileStatus === 'Approved'
                    ? 'bg-green-600 text-white px-6 py-3 rounded-md' // Medium rounded corners
                    : 'bg-red-600 text-white px-6 py-3 rounded-md'
            }`}
        >
            {fileStatus === 'Approved' ? (
                <HiCheckCircle className="mr-2" />
            ) : (
                <HiXCircle className="mr-2" />
            )}
            {fileStatus}
        </div>
    ) : (
        <>
            {fileStatus === 'Validating' && !isResubmittedClicked ? (
                <div className="flex items-center justify-center text-lg font-medium bg-yellow-500 text-white px-6 py-3 rounded-md cursor-pointer" onClick={() => handleResubmittedClick(sanitizedLabel)}>
                    <HiRefresh className="h-5 w-5 mr-2" />
                    Resubmitted
                </div>
            ) : (
                <div className="flex items-center gap-6"> {/* Increased gap for clarity */}
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        name={`status-${index}`}
                        className="accent-green-600"
                        onClick={() => handleApproveClick(file, selectedWarehouse.id)}
                    />
                    <span className="text-white bg-green-600 px-6 py-3 rounded-md font-semibold hover:bg-green-700">
                        Approve
                    </span>
                </label>
            
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        name={`status-${index}`}
                        className="accent-red-600"
                        onClick={() => handleRejectClick(file, selectedWarehouse.id)}
                    />
                    <span className="text-white bg-red-600 px-6 py-3 rounded-md font-semibold hover:bg-red-700">
                        Reject
                    </span>
                </label>
            </div>
            
            )}
        </>
    )}
</td>



                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
)}

{/* Approve Confirmation Modal */}
{showApproveModal && (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-8 w-full max-w-md rounded-2xl shadow-xl transform transition-all duration-300">
            {/* Centered Check Icon at the Top */}
            <div className="flex justify-center mb-6">
                <HiCheckCircle className="text-green-600 h-16 w-16" />
            </div>

            {/* Modal Title */}
            <h2 className="text-2xl font-semibold text-center text-gray-900 mb-4">
                Confirm Approval
            </h2>

            {/* Confirmation Message */}
            <p className="text-lg text-center text-gray-700 mb-6">
                Are you sure you want to approve this document? This action cannot be undone.
            </p>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
                <button 
                    className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors w-full md:w-auto" 
                    onClick={() => setShowApproveModal(false)}
                >
                    Cancel
                </button>
                <button 
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors w-full md:w-auto" 
                    onClick={handleConfirmApprove}
                >
                    Yes, Approve
                </button>
            </div>
        </div>
    </div>
)}


{/* Reject Confirmation Modal */}
{showRejectModal && (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-8 w-full max-w-md rounded-2xl shadow-xl transform transition-all duration-300">
            {/* Centered X Icon at the Top */}
            <div className="flex justify-center mb-6">
                <HiXCircle className="text-red-600 h-16 w-16" />
            </div>

            {/* Modal Title */}
            <h2 className="text-2xl font-semibold text-center text-gray-900 mb-4">
                Reason for Rejection
            </h2>

            {/* Informational Message */}
            <p className="text-sm text-gray-600 text-center mb-6">
                Please provide a reason for rejecting this document. This will help the user understand why their submission was not approved.
            </p>

            {/* Input for Rejection Reason */}
            <input
                type="text"
                className="w-full p-3 mb-6 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter rejection reason"
                value={rejectionReasonText}
                onChange={handleRejectionReasonChange}
            />

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
                <button 
                    className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors w-full md:w-auto" 
                    onClick={() => setShowRejectModal(false)}
                >
                    Cancel
                </button>
                <button 
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors w-full md:w-auto" 
                    onClick={handleConfirmReject}
                >
                    Yes, Reject
                </button>
            </div>
        </div>
    </div>
)}

{/* Approve Success Modal */}
{showApproveSuccessModal && (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-8 w-full max-w-md rounded-2xl shadow-xl transform transition-all duration-300">
            {/* Centered Check Icon at the Top */}
            <div className="flex justify-center mb-6">
                <HiCheckCircle className="text-green-600 h-16 w-16" />
            </div>

            {/* Modal Title */}
            <h2 className="text-2xl font-semibold text-center text-gray-900 mb-4">
                Success!
            </h2>

            {/* Success Message */}
            <p className="text-lg text-center text-gray-700 mb-6">
            <span className="font-bold">{selectedApproval.fileLabel}</span> has been successfully approved!
            </p>

            {/* Action Button */}
            <div className="flex justify-center">
                <button 
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors" 
                    onClick={() => setShowApproveSuccessModal(false)}
                >
                    Close
                </button>
            </div>
        </div>
    </div>
)}

{/* Reject Success Modal */}
{showRejectSuccessModal && (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 w-full max-w-md rounded-xl shadow-md"> {/* Adjusted width */}
            {/* Centered X Icon at the Top */}
            <div className="flex justify-center mb-4">
                <HiXCircle className="text-red-600 h-12 w-12" /> {/* Slightly smaller Icon */}
            </div>

            {/* Modal Title */}
            <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">
                Rejected
            </h2>

            {/* Reject Message */}
            <p className="text-lg text-center text-gray-700 mb-4">
                {selectedApproval.fileLabel} has been rejected.
            </p>

         
            {/* Reason Card for Rejection */}
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm mb-6 justify-center">
                <p className="text-lg text-gray-600">{rejectionReasonText}</p>
            </div>

            {/* Action Button */}
            <div className="flex justify-center">
                <button 
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors" 
                    onClick={() => setShowRejectSuccessModal(false)}
                >
                    Close
                </button>
            </div>
        </div>
    </div>
)}





{isConfirmModalOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white w-full md:w-3/4 lg:w-1/2 xl:w-1/3 rounded-lg shadow-2xl p-6 relative max-w-md">
            <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-3xl"
            >
                &times;
            </button>
            <h2 className="text-2xl font-bold mb-4">Confirm Deletion</h2>
            <p className="text-gray-700 mb-6">Are you sure you want to delete this warehouse?</p>
            <div className="flex justify-end space-x-2">
                <button
                    onClick={confirmDelete}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                >
                    Yes, Delete
                </button>
                <button
                    onClick={() => setIsConfirmModalOpen(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                >
                    Cancel
                </button>
            </div>
        </div>
    </div>
)}
             {/* Modal for Rejection Reason */}
             {isRejectModalOpen && (
                    <div className="modal fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-800 bg-opacity-75">
                        <div className="modal-content bg-white p-4 max-w-lg max-h-3/4 overflow-y-auto relative">
                            <button className="absolute top-2 right-2 text-gray-700 hover:text-gray-900" onClick={closeRejectModal}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <div className="modal-header flex justify-center items-center mb-4">
                                <h2 className="text-xl font-bold">Reject Warehouse</h2>
                            </div>
                            <div className="modal-body">
                                <textarea
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    placeholder="Enter rejection reason"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                ></textarea>
                            </div>
                            <div className="modal-footer mt-4 flex justify-end mr-2 space-x-2">
    <button
        className="bg-gray-500 text-white font-semibold py-2 px-4 rounded-md"
        onClick={closeRejectModal}
    >
        Cancel
    </button>
    <button
        className="bg-red-500 text-white font-semibold py-2 px-4 rounded-md"
        onClick={submitRejection}
    >
        Submit
    </button>
</div>

                        </div>
                    </div>
                )}
{/* Error Modal for Rented Warehouse */}
{isErrorModalOpen && (
    <div className="modal fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-800 bg-opacity-75">
        <div className="modal-content bg-white p-6 max-w-lg max-h-3/4 overflow-y-auto relative rounded-lg shadow-lg flex flex-col items-center">
            <button className="absolute top-3 right-3 text-gray-700 hover:text-gray-900" onClick={closeErrorModal}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            <div className="modal-body text-center flex flex-col items-center">
                <img src={error1} alt="Error" className="h-12 w-12 mb-4" />
                <p className="text-gray-700">This warehouse is currently rented and cannot be rejected.</p>
            </div>
            <div className="modal-footer mt-4">
                <button
                    className="bg-red-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-red-600"
                    onClick={closeErrorModal}
                >
                    Close
                </button>
            </div>
        </div>
    </div>
)}
       {/* Delete Confirmation Modal */}
       {isDeleteConfirmModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white w-full md:w-3/4 lg:w-1/2 xl:w-1/3 rounded-lg shadow-2xl p-6 relative max-w-md">
                        <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
                        <p>Are you sure you want to delete this warehouse?</p>
                        <div className="mt-6 flex justify-end space-x-2">
                            <button
                                onClick={cancelDelete}
                                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg"
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}


{/* Success Modal */}
{isSuccessModalOpen && (
    <div className="modal fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-800 bg-opacity-75">
        <div className="modal-content bg-white p-8 max-w-lg rounded-lg shadow-lg flex flex-col items-center">
            <button
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
                onClick={closeSuccessModal}
            >
                <HiX className="h-6 w-6" />
            </button>
            <div className="flex flex-col items-center mb-6">
                <HiCheckCircle className="text-green-600 h-20 w-20 mb-4" />
                <h2 className="text-2xl font-bold text-green-600 mb-2">Success</h2>
                <p className="text-gray-700 text-center text-lg">
                    The warehouse has been successfully deleted.
                </p>
            </div>
            <div className="flex justify-center w-full">
                <button
                    onClick={closeSuccessModal}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg focus:outline-none"
                >
                    Close
                </button>
            </div>
        </div>
    </div>
)}


{isArchiveModalOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white w-full md:w-3/4 lg:w-1/2 xl:w-1/3 rounded-lg shadow-2xl p-6 relative max-w-md">
            <button
                onClick={closeArchiveModal}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-3xl"
            >
                &times;
            </button>
            <h2 className="text-2xl font-bold mb-4">Archived Warehouses</h2>
            <div className="space-y-4">
                {archivedWarehouses.length > 0 ? (
                    archivedWarehouses.map(warehouse => (
                        <div key={warehouse.id} className="bg-white p-4 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold">{warehouse.name}</h3>
                            <p className="text-gray-600 mb-2"><span className="font-bold">Address:</span> {warehouse.address}</p>
                            <p className="text-gray-600 mb-2"><span className="font-bold">Price:</span> ₱{warehouse.price}</p>
                            <p className="text-gray-600 mb-2"><span className="font-bold">Status:</span> Archived</p>
                            <p className="text-gray-600 mb-2"><span className="font-bold">Deleted At:</span> {new Date(warehouse.deletedAt.seconds * 1000).toLocaleString()}</p>
                        </div>
                    ))
                ) : (
                    <p>No archived warehouses.</p>
                )}
            </div>
        </div>
    </div>
)}



{/* Error Modal for Delete Error */}
{isDeleteErrorModalOpen && (
    <div className="modal fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-800 bg-opacity-75">
        <div className="modal-content bg-white p-6 max-w-lg max-h-3/4 overflow-y-auto relative rounded-lg shadow-lg flex flex-col items-center">
            <button
                className="absolute top-3 right-3 text-gray-700 hover:text-gray-900"
                onClick={() => setIsDeleteErrorModalOpen(false)}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            <div className="text-center flex flex-col items-center">
                <img src={error1} alt="Error" className="h-12 w-12 mb-4" />
          
                <p>{errorMessage}</p>
            </div>
            <div className="mt-6 flex justify-end">
                <button
                    onClick={() => setIsDeleteErrorModalOpen(false)}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg"
                >
                    Close
                </button>
            </div>
        </div>
    </div>
)}


        </div>
    );
}

export default Superadmin;
