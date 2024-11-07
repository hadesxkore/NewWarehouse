import React, { useEffect, useState } from 'react';
import { firestore } from '../firebase';
import Navigation from './Navigation';
import { HiSearch, HiSortAscending, HiSortDescending,  HiOutlineExclamationCircle, HiCheckCircle, HiXCircle } from 'react-icons/hi'; // Importing icons

const ArchiveWarehouse = () => {
    const [archivedWarehouses, setArchivedWarehouses] = useState([]);
    const [filteredWarehouses, setFilteredWarehouses] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false); // State for confirmation modal
    const [sortOrder, setSortOrder] = useState('asc'); // Default sorting by ascending

    useEffect(() => {
        const fetchArchivedWarehouses = async () => {
            try {
                const archivedRef = firestore.collection('archivedWarehouses');
                const snapshot = await archivedRef.get();

                const archivedData = await Promise.all(
                    snapshot.docs.map(async (doc) => {
                        const warehouse = { id: doc.id, ...doc.data() };
                        if (warehouse.userUid) {
                            const userSnapshot = await firestore
                                .collection('users')
                                .doc(warehouse.userUid)
                                .get();
                            if (userSnapshot.exists) {
                                warehouse.uploader = userSnapshot.data();
                            }
                        }
                        return warehouse;
                    })
                );
                setArchivedWarehouses(archivedData);
                setFilteredWarehouses(archivedData); // Initially display all warehouses
            } catch (error) {
                console.error('Error fetching archived warehouses:', error);
            }
        };
        fetchArchivedWarehouses();
    }, []);

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        const query = e.target.value.toLowerCase();
    
        if (query === '') {
            setFilteredWarehouses(archivedWarehouses);  // Reset to all warehouses if search is empty
        } else {
            // Filter warehouses based on the name or uploader's full name
            const filteredData = archivedWarehouses.filter((warehouse) =>
                warehouse.name.toLowerCase().includes(query) ||
                (warehouse.uploader && `${warehouse.uploader.first_name} ${warehouse.uploader.last_name}`.toLowerCase().includes(query))
            );
            setFilteredWarehouses(filteredData);
        }
    };

    const handleSort = (key) => {
        const sortedWarehouses = [...filteredWarehouses].sort((a, b) => {
            if (key === 'name') {
                return sortOrder === 'asc'
                    ? a.name.localeCompare(b.name)
                    : b.name.localeCompare(a.name);
            } else if (key === 'price') {
                return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
            }
            return 0;
        });
        setFilteredWarehouses(sortedWarehouses);
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

    const handleRestore = async (warehouseId) => {
        try {
            const warehouseDoc = await firestore.collection('archivedWarehouses').doc(warehouseId).get();
            const warehouseData = warehouseDoc.data();

            // Add the warehouse back to the 'warehouses' collection
            await firestore.collection('warehouses').doc(warehouseId).set(warehouseData);

            // Remove the warehouse from the 'archivedWarehouses' collection
            await firestore.collection('archivedWarehouses').doc(warehouseId).delete();

            // Update the local state to reflect the restoration
            setArchivedWarehouses(archivedWarehouses.filter((warehouse) => warehouse.id !== warehouseId));
            setFilteredWarehouses(filteredWarehouses.filter((warehouse) => warehouse.id !== warehouseId));
            setIsConfirmationModalOpen(false); // Close confirmation modal after restore
        } catch (error) {
            console.error('Error restoring warehouse:', error);
        }
    };
    const openConfirmationModal = (warehouseId) => {
        setSelectedWarehouse(warehouseId);
        setIsConfirmationModalOpen(true);
    };

    const closeConfirmationModal = () => {
        setIsConfirmationModalOpen(false);
        setSelectedWarehouse(null);
    };

    const handleViewFiles = (warehouseId) => {
        const warehouse = archivedWarehouses.find(wh => wh.id === warehouseId);
        if (warehouse) {
            const availableFiles = [
                { label: "Identification Proof/Valid ID", url: warehouse.identificationProof },
                { label: "Address Proof", url: warehouse.addressProof },
                { label: "Ownership Documents", url: warehouse.ownershipDocuments },
                { label: "Previous Tenancy Details (if applicable)", url: warehouse.previousTenancyDetails },
                { label: "Business Permit", url: warehouse.businessPermit },
                { label: "Sanitary Permit", url: warehouse.sanitaryPermit },
                { label: "Maintenance Records", url: warehouse.maintenanceRecords }
            ].filter(file => file.url);

            setSelectedFiles(availableFiles);
            setSelectedWarehouse(warehouse);
            setIsModalOpen(true);
        } else {
            console.error('Warehouse not found');
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            <Navigation />
            <div className="container mx-auto p-10">
            <h2 className="text-5xl font-bold text-center text-gray-800 mb-8">Archived Warehouses</h2>
  {/* Search and Sort Section */}
  <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center bg-white rounded-md border border-gray-300">
                        <input
                            type="text"
                            placeholder="Search by name or uploader..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className="px-4 py-2 rounded-l-md focus:outline-none"
                        />
                        <HiSearch className="text-gray-500 text-xl mr-3" />
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => handleSort('name')}
                        className="flex items-center text-indigo-600 hover:text-indigo-700"
                    >
                        <HiSortAscending className="mr-2" />
                        Sort by Name
                    </button>
                    <button
                        onClick={() => handleSort('price')}
                        className="flex items-center text-indigo-600 hover:text-indigo-700"
                    >
                        <HiSortDescending className="mr-2" />
                        Sort by Price
                    </button>
                </div>
            </div>

            
            {/* Display Warehouses */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {filteredWarehouses.length > 0 ? (
                    filteredWarehouses.map(warehouse => (
                        <div
                            key={warehouse.id}
                            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transform transition-all duration-300 w-full max-w-6xl mx-auto"
                        >
                            {/* Warehouse Content */}
                            <div className="flex items-center mb-4">
                                <img
                                    src={warehouse.uploader?.profileImage || 'https://via.placeholder.com/100'}
                                    alt="Uploader Profile"
                                    className="w-16 h-16 rounded-full mr-6 object-cover"
                                />
                                <div>
                                    {warehouse.uploader ? (
                                        <p className="font-semibold text-xl text-gray-700">
                                            {`${warehouse.uploader.first_name} ${warehouse.uploader.last_name}`}
                                        </p>
                                    ) : (
                                        <p className="font-semibold text-xl text-gray-700">Uploader: Unknown</p>
                                    )}
                                    <p className="text-gray-600 text-base">{warehouse.uploader?.contact_number || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="mb-4">
                                <h3 className="text-3xl font-semibold text-gray-800">{warehouse.name}</h3>
                                <p className="text-gray-700 text-lg"><strong>Address:</strong> {warehouse.address}</p>
                                <p className="text-gray-700 text-lg"><strong>Price:</strong> ₱{warehouse.price}</p>
                                <p className="text-gray-700 text-lg"><strong>Status:</strong> Archived</p>
                                <p className="text-gray-700 text-lg">
                                    <strong>Deleted At:</strong> {new Date(warehouse.deletedAt.seconds * 1000).toLocaleString()}
                                </p>
                            </div>

                            {/* Warehouse Images */}
                            {warehouse.images && warehouse.images.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="text-xl font-semibold text-gray-800">Warehouse Images</h4>
                                    <div className="grid grid-cols-2 gap-4 mt-2">
                                        {warehouse.images.map((image, index) => (
                                            <div key={index} className="w-full h-24 bg-gray-200 rounded-md overflow-hidden">
                                                <img
                                                    src={image}
                                                    alt={`Warehouse Image ${index + 1}`}
                                                    className="object-cover w-full h-full"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between mt-4">
                                <button
                                    className="bg-indigo-600 text-white py-2 px-6 rounded w-full hover:bg-indigo-700 transition-colors text-lg"
                                    onClick={() => handleViewFiles(warehouse.id)}
                                >
                                    View Documents
                                </button>
                                <button
                                    className="bg-green-600 text-white py-2 px-6 rounded ml-4 w-full hover:bg-green-700 transition-colors text-lg"
                                    onClick={() => openConfirmationModal(warehouse.id)} // Add your restore function here
                                >
                                    Restore
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500 text-lg">No archived warehouses found.</p>
                )}
            </div>
        </div>
        
          {/* Confirmation Modal */}
{isConfirmationModalOpen && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 transition-opacity duration-300">
    <div className="bg-white p-8 rounded-3xl max-w-sm w-full animate__animated animate__fadeIn shadow-2xl">
      <div className="flex items-center justify-center mb-6">
        <HiOutlineExclamationCircle className="text-red-600 text-6xl" />
      </div>
      <h2 className="text-2xl font-semibold text-gray-800 text-center mb-4">
        Are you sure you want to restore this warehouse?
      </h2>
      <p className="text-gray-600 text-lg mb-6 text-center">
        This action cannot be undone, and the warehouse will be moved back to the active list.
      </p>

      <div className="flex justify-between">
       
        <button
          onClick={closeConfirmationModal}
          className="flex items-center bg-red-600 text-white py-2 px-6 rounded hover:bg-red-700 transition-colors"
        >
          <HiXCircle className="mr-2 text-xl" />
          Cancel
        </button>
        <button
          onClick={() => handleRestore(selectedWarehouse)}
          className="flex items-center bg-green-600 text-white py-2 px-6 rounded hover:bg-green-700 transition-colors"
        >
          <HiCheckCircle className="mr-2 text-xl" />
          Yes, Restore
        </button>
      </div>
    </div>
  </div>
)}

            {/* Modal for Document Viewing */}
            {isModalOpen && selectedFiles.length > 0 && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-10 rounded-2xl max-w-3xl w-full animate__animated animate__fadeIn shadow-lg">
                        <h2 className="text-4xl font-semibold mb-6 text-gray-800 text-center">Warehouse Documents</h2>
                        <div className="space-y-4">
                            {selectedFiles.map((file, index) => (
                                <div key={index} className="flex justify-between items-center text-lg">
                                    <p className="text-gray-700">{file.label}</p>
                                    <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700">
                                        View Document
                                    </a>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-center mt-6">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="bg-red-600 text-white px-6 py-3 rounded hover:bg-red-700"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArchiveWarehouse;
