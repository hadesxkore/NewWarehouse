import React, { useState, useEffect } from 'react';
import { firestore } from '../firebase'; // Import your Firebase configuration
import Navigation from './Navigation';
import './Superadmin.css';

function Superadmin() {
    const [uploadedWarehouses, setUploadedWarehouses] = useState([]);
    const [filterStatus, setFilterStatus] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    // Function to fetch uploaded warehouses based on the selected filter status
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
                // Fetch user information associated with this warehouse
                const userRef = await firestore.collection('users').doc(warehouseData.userUid).get();
                const userData = userRef.data();
                return { id: doc.id, user: userData || {}, ...warehouseData };
            });
            // Wait for all user information to be fetched
            const uploadedWarehousesWithUserData = await Promise.all(uploadedWarehousesData);
            setUploadedWarehouses(uploadedWarehousesWithUserData);
        } catch (error) {
            console.error('Error fetching uploaded warehouses:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const confirmAction = (action) => {
        const confirmed = window.confirm('Are you sure you want to proceed?');
        if (confirmed) {
            action();
        }
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

    // Function to handle rejection with reason
    const handleReject = (warehouseId) => {
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

    // Function to handle deletion of warehouses
    const handleDelete = async (warehouseId) => {
        try {
            const confirmed = window.confirm("Are you sure you want to delete this warehouse?");
            if (!confirmed) return;

            await firestore.collection('warehouses').doc(warehouseId).delete();
            fetchUploadedWarehouses();
            setFilterStatus('');

            const rentedWarehouseRef = firestore.collection('rentedWarehouses').doc(warehouseId);
            const rentedWarehouseDoc = await rentedWarehouseRef.get();
            if (rentedWarehouseDoc.exists) {
                await rentedWarehouseRef.delete();
            }
        } catch (error) {
            console.error('Error deleting warehouse:', error);
            alert('An error occurred while deleting the warehouse. Please try again later.');
        }
    };

    // Function to handle opening the modal and setting selected files
    const handleViewFiles = (warehouseId) => {
        const warehouse = uploadedWarehouses.find(wh => wh.id === warehouseId);
        if (warehouse) {
            setSelectedFiles([
                { label: "Identification Proof/Valid ID", url: warehouse.identificationProof },
                { label: "Address Proof", url: warehouse.addressProof },
                { label: "Ownership Documents", url: warehouse.ownershipDocuments },
                { label: "Previous Tenancy Details (if applicable)", url: warehouse.previousTenancyDetails },
                { label: "Business Permit", url: warehouse.businessPermit },
                { label: "Building Permit", url: warehouse.buildingPermit },
                { label: "Maintenance Records", url: warehouse.maintenanceRecords }
                // Add more fields as needed
            ]);
            setSelectedWarehouse(warehouse);
            setIsModalOpen(true);
        } else {
            console.error('Warehouse not found');
        }
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
                   {/* Filter Buttons */}
                   <div className="flex justify-center mt-4 space-x-2">
                <button onClick={() => setFilterStatus('')} className={`filter-btn ${filterStatus === '' && 'active'}`}>All</button>
                <button onClick={() => setFilterStatus('pending')} className={`filter-btn ${filterStatus === 'pending' && 'active'}`}>Pending</button>
                <button onClick={() => setFilterStatus('verified')} className={`filter-btn ${filterStatus === 'verified' && 'active'}`}>Verified</button>
                <button onClick={() => setFilterStatus('rejected')} className={`filter-btn ${filterStatus === 'rejected' && 'active'}`}>Rejected</button>
            </div>

                    {isLoading ? (
                        <p>Loading...</p>
                    ) : uploadedWarehouses.length === 0 ? (
                        <div className="no-warehouses-message">
                            <p>No warehouses found.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                            {uploadedWarehouses.map(warehouse => (
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

            {/* Modal for Viewing Files */}
            {isModalOpen && (
                <div className="modal fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-800 bg-opacity-75">
                    <div className="modal-content bg-white p-4 max-w-3xl max-h-3/4 overflow-y-auto relative">
                        <button className="absolute top-2 right-2 text-gray-700 hover:text-gray-900" onClick={closeModal}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="modal-header flex justify-center items-center mb-4">
                            <h2 className="text-xl font-bold">Documents: {selectedWarehouse?.name}</h2>
                        </div>
                        <div className="modal-body grid grid-cols-2 md:grid-cols-3 gap-4">
                            {selectedFiles.map((file, index) => (
                                <div key={index} className="file-item flex justify-center items-center p-4 border border-gray-300 rounded-md">
                                    {file.url.endsWith('.jpg') || file.url.endsWith('.jpeg') || file.url.endsWith('.png') ? (
                                        <img src={file.url} alt={file.label} className="h-24 w-24 object-cover rounded-md" />
                                    ) : (
                                        <div className="w-full text-center">
                                            <p className="text-gray-600">{file.label}</p>
                                            <a href={file.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-500 hover:underline">View File</a>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        {/* Close button for modal */}
                        <div className="absolute top-2 right-2">
                            <button
                                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-300"
                                onClick={closeModal}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
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
                        <div className="modal-footer mt-4 flex justify-end">
                            <button
                                className="bg-red-500 text-white font-semibold py-2 px-4 rounded-md mr-2"
                                onClick={submitRejection}
                            >
                                Submit
                            </button>
                            <button
                                className="bg-gray-500 text-white font-semibold py-2 px-4 rounded-md"
                                onClick={closeRejectModal}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Superadmin;
