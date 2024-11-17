import React, { useEffect, useState } from 'react';
import { firestore } from '../firebase';
import Navigation from './Navigation';
import { HiSearch, HiSortAscending, HiSortDescending,  HiOutlineExclamationCircle, HiCheckCircle, HiXCircle, HiX,  HiDocumentText   } from 'react-icons/hi'; // Importing icons

const ArchiveWarehouse = () => {
    const [archivedWarehouses, setArchivedWarehouses] = useState([]);
    const [filteredWarehouses, setFilteredWarehouses] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false); // State for confirmation modal
    const [sortOrder, setSortOrder] = useState('asc'); // Default sorting by ascending
    const [isDeleteConfirmationModalOpen, setIsDeleteConfirmationModalOpen] = useState(false); // State for delete confirmation modal
const [selectedWarehouseToDelete, setSelectedWarehouseToDelete] = useState(null);
const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);


const openDeleteConfirmationModal = (warehouseId) => {
    setSelectedWarehouseToDelete(warehouseId);
    setIsDeleteConfirmationModalOpen(true);
};

const closeDeleteConfirmationModal = () => {
    setIsDeleteConfirmationModalOpen(false);
    setSelectedWarehouseToDelete(null);
};


const handleDelete = async (warehouseId) => {
    try {
        await firestore.collection('archivedWarehouses').doc(warehouseId).delete();
        
        // Update the state to remove the deleted warehouse
        setArchivedWarehouses(archivedWarehouses.filter((warehouse) => warehouse.id !== warehouseId));
        setFilteredWarehouses(filteredWarehouses.filter((warehouse) => warehouse.id !== warehouseId));
        
        // Open success modal after deletion
        setIsSuccessModalOpen(true);
        closeDeleteConfirmationModal();  // Close delete confirmation modal after deletion
    } catch (error) {
        console.error('Error deleting warehouse:', error);
    }
};

const closeSuccessModal = () => {
    setIsSuccessModalOpen(false);
};


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
    <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">Archived Warehouses</h2>
    
    {/* Search and Sort Section */}
    <div className="flex items-center justify-between mb-8">
        
        {/* Search Bar */}
        <div className="flex items-center space-x-4 w-full md:w-1/2 lg:w-1/3">
            <div className="flex items-center bg-white border border-gray-300 rounded-lg shadow-md w-full">
                <input
                    type="text"
                    placeholder="Search by name or uploader..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="px-4 py-3 w-full rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <HiSearch className="text-gray-500 text-2xl mr-4" />
            </div>
        </div>

        {/* Sort Buttons */}
        <div className="flex items-center space-x-6">
            <button
                onClick={() => handleSort('name')}
                className="flex items-center text-lg text-indigo-600 hover:text-indigo-700 font-semibold hover:underline focus:outline-none"
            >
                <HiSortAscending className="mr-2 text-xl" />
                Sort by Name
            </button>
            <button
                onClick={() => handleSort('price')}
                className="flex items-center text-lg text-indigo-600 hover:text-indigo-700 font-semibold hover:underline focus:outline-none"
            >
                <HiSortDescending className="mr-2 text-xl" />
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
                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 w-full max-w-6xl mx-auto"
            >
                {/* Warehouse Header */}
                <div className="flex items-center mb-6">
                    <img
                        src={warehouse.uploader?.profileImage || 'https://via.placeholder.com/100'}
                        alt="Uploader Profile"
                        className="w-16 h-16 rounded-full mr-6 object-cover border-2 border-indigo-500"
                    />
                    <div>
                        {warehouse.uploader ? (
                            <p className="font-semibold text-xl text-gray-800">{`${warehouse.uploader.first_name} ${warehouse.uploader.last_name}`}</p>
                        ) : (
                            <p className="font-semibold text-xl text-gray-800">Uploader: Unknown</p>
                        )}
                        <p className="text-gray-600 text-base">{warehouse.uploader?.contact_number || 'N/A'}</p>
                    </div>
                </div>

                {/* Warehouse Info */}
                <div className="mb-6">
                    <h3 className="text-2xl font-semibold text-gray-800 mb-2">{warehouse.name}</h3>
                    <p className="text-gray-700 text-lg"><strong>Address:</strong> {warehouse.address}</p>
                    <p className="text-gray-700 text-lg"><strong>Price:</strong> ₱{warehouse.price}</p>
                    <p className="text-gray-700 text-lg"><strong>Status:</strong> Archived</p>
                    <p className="text-gray-700 text-lg"><strong>Deleted At:</strong> {new Date(warehouse.deletedAt.seconds * 1000).toLocaleString()}</p>
                </div>

                {/* Warehouse Images */}
                {warehouse.images && warehouse.images.length > 0 && (
                    <div className="mt-6">
                        <h4 className="text-xl font-semibold text-gray-800 mb-4">Warehouse Images</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
<div className="flex items-center justify-between mt-6 space-x-4">
    <button
        className="bg-indigo-600 text-white py-3 rounded-md w-full hover:bg-indigo-700 transition-colors text-base font-semibold shadow-md hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
        onClick={() => handleViewFiles(warehouse.id)}
    >
        Documents
    </button>
    <button
        className="bg-green-600 text-white py-3  rounded-md w-full hover:bg-green-700 transition-colors text-base font-semibold shadow-md hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-500"
        onClick={() => openConfirmationModal(warehouse.id)} // Add your restore function here
    >
        Restore
    </button>
    <button
        className="bg-red-600 text-white py-3 rounded-md w-full hover:bg-red-700 transition-colors text-base font-semibold shadow-md hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-red-500"
        onClick={() => openDeleteConfirmationModal(warehouse.id)}
    >
        Delete
    </button>
</div>

            </div>
        ))
    ) : (
        <p className="text-center text-gray-500 text-lg mt-10">No archived warehouses found.</p>
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
        <div className="bg-white p-10 rounded-3xl max-w-4xl w-full animate__animated animate__fadeIn shadow-xl">
            {/* Title Section with Icon */}
            <div className="flex justify-center items-center mb-8 space-x-3">
                <HiDocumentText size={32} className="text-indigo-600" /> {/* Customizable Document Icon */}
                <h2 className="text-3xl font-semibold text-gray-800">Warehouse Documents</h2>
            </div>
            
            {/* Table Layout for Document List */}
            <div className="overflow-x-auto rounded-lg mb-6">
                <table className="min-w-full table-auto bg-white border border-gray-300 rounded-lg shadow-md">
                    <thead>
                        <tr className="bg-indigo-600 text-white">
                            <th className="px-6 py-3 text-left text-lg font-semibold">Document Name</th>
                            <th className="px-6 py-3 text-left text-lg font-semibold">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedFiles.map((file, index) => (
                            <tr key={index} className="border-t border-gray-200">
                                <td className="px-6 py-4 text-gray-700 text-lg">{file.label}</td>
                                <td className="px-6 py-4 text-lg">
                                    <a
                                        href={file.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-600 hover:text-indigo-700 font-medium transition duration-300"
                                    >
                                        View Document
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Close Button */}
            <div className="flex justify-center mt-6">
                <button
                    onClick={() => setIsModalOpen(false)}
                    className="bg-red-600 text-white py-3 px-8 rounded-full hover:bg-red-700 transition duration-300 font-medium"
                >
                    Close
                </button>
            </div>
        </div>
    </div>
)}


{isDeleteConfirmationModalOpen && (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-8 rounded-3xl max-w-sm w-full animate__animated animate__fadeIn shadow-2xl">
            <div className="flex items-center justify-center mb-6">
                <HiOutlineExclamationCircle className="text-red-600 text-6xl" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 text-center mb-4">
                Are you sure you want to delete this warehouse?
            </h2>
            <p className="text-gray-600 text-lg mb-6 text-center">
                This action cannot be undone, and the warehouse will be permanently deleted.
            </p>

            <div className="flex justify-between">
                <button
                    onClick={closeDeleteConfirmationModal}
                    className="flex items-center bg-gray-600 text-white py-2 px-6 rounded hover:bg-gray-700 transition-colors"
                >
                    <HiXCircle className="mr-2 text-xl" />
                    Cancel
                </button>
                <button
                    onClick={() => handleDelete(selectedWarehouseToDelete)}
                    className="flex items-center bg-red-600 text-white py-2 px-6 rounded hover:bg-red-700 transition-colors"
                >
                    <HiCheckCircle className="mr-2 text-xl" />
                    Yes, Delete
                </button>
            </div>
        </div>
    </div>
)}

{/* Success Modal */}
{isSuccessModalOpen && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white p-8 rounded-3xl max-w-sm w-full shadow-2xl">
      <div className="flex justify-center mb-6">
        <HiCheckCircle className="text-red-600 text-7xl" />
      </div>
      <h3 className="text-2xl font-semibold text-center text-red-600 mb-4">Deletion Successful</h3>
      <p className="text-center text-gray-600 mb-6">The warehouse has been successfully deleted from the archive.</p>
      <div className="flex justify-center">
        <button
          className="bg-red-600 text-white py-2 px-6 rounded-md hover:bg-red-700 focus:outline-none"
          onClick={closeSuccessModal}
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
