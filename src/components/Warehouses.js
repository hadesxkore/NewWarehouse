import React, { useState, useEffect } from 'react';
import { firestore } from '../firebase'; 
import Navigation from './Navigation'; 
import loupe from '../images/loupe.png';

import * as XLSX from 'xlsx';

function Warehouses() {
    const [warehouses, setWarehouses] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null); // State for selected user info
    const [selectedLessee, setSelectedLessee] = useState(null); // State for selected lessee info
    const [isModalOpen, setIsModalOpen] = useState(false); // State for lessor modal visibility
    const [isLesseeModalOpen, setIsLesseeModalOpen] = useState(false); // State for lessee modal visibility
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredWarehouses, setFilteredWarehouses] = useState(warehouses);
    const [sortField, setSortField] = useState('name');
const [sortOrder, setSortOrder] = useState('asc');
    

const sortWarehouses = (field) => {
    const sorted = [...filteredWarehouses].sort((a, b) => {
        if (a[field] < b[field]) return sortOrder === 'asc' ? -1 : 1;
        if (a[field] > b[field]) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });
    setFilteredWarehouses(sorted);
    setSortField(field);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
};

const exportToExcel = () => {
    // Transform data to include only the required fields
    const transformedData = filteredWarehouses.map(warehouse => ({
        'Warehouse Name': warehouse.name,
        'Address': warehouse.address,
        'Price': warehouse.price,
        'Status': warehouse.rentStatus,
        'Upload Date': formatDate(new Date(warehouse.uploadDate.seconds * 1000))
    }));

    // Convert transformed data to a worksheet
    const ws = XLSX.utils.json_to_sheet(transformedData);
    const wb = XLSX.utils.book_new();

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Warehouses');

    // Write the workbook to a file
    XLSX.writeFile(wb, 'warehouses.xlsx');
};
    useEffect(() => {
        // Fetch warehouses where rentStatus is 'Rented'
        const fetchWarehouses = async () => {
            const warehousesSnapshot = await firestore.collection('warehouses')
                .where('rentStatus', '==', 'Rented')
                .get();

            const warehousesData = warehousesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            setWarehouses(warehousesData);
        };

        fetchWarehouses();
    }, []);

    useEffect(() => {
        setFilteredWarehouses(
            warehouses.filter(warehouse =>
                warehouse.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                warehouse.address.toLowerCase().includes(searchQuery.toLowerCase())
            )
        );
    }, [searchQuery, warehouses]);
    const fetchUserInfo = async (userUid) => {
        // Fetch user info when button is clicked
        const userSnapshot = await firestore.collection('users').doc(userUid).get();
        if (userSnapshot.exists) {
            setSelectedUser(userSnapshot.data());
            setIsModalOpen(true); // Open modal after fetching user data
        }
    };

    const fetchLesseeInfo = async (userId) => {
        // Fetch lessee info when button is clicked
        const userSnapshot = await firestore.collection('users').doc(userId).get();
        if (userSnapshot.exists) {
            setSelectedLessee(userSnapshot.data());
            setIsLesseeModalOpen(true); // Open modal after fetching lessee data
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    const closeLesseeModal = () => {
        setIsLesseeModalOpen(false);
        setSelectedLessee(null);
    };

    const formatDate = (date) => {
        if (!(date instanceof Date) || isNaN(date.getTime())) {
            console.error('Invalid date provided:', date);
            return "N/A";
        }
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };
    return (
        <div className="min-h-screen bg-gray-100">
            {/* Render the Navigation component */}
            <Navigation />  


            <div className="container mx-auto p-8">
    <h1 className="text-2xl font-bold mb-6 text-gray-800">Rented Warehouses</h1>
    
    <div className="bg-gradient-to-br from-gray-100 to-white p-6 rounded-lg shadow-lg relative mb-4">
    {/* Search and Export Section */}
    <div className="flex flex-col mb-6 space-y-4">
        {/* Summary Section */}
        <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-800">About</h2>
            <p className="text-gray-600">This section offers a snapshot of the current details related to the rented warehouses. It includes important metrics, summaries, and other relevant insights about the lessor, lessee, and the rented properties.</p>
        </div>

          {/* Search Input and Export Button */}
          <div className="flex justify-between items-center space-x-4">
            <div className="relative w-full max-w-xs">
                <input
                    type="text"
                    placeholder="Search by name or address"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="p-2 pr-10 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                />
                <img
                    src={loupe}
                    alt="Search"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5"
                />
            </div>
            <button 
                onClick={exportToExcel} 
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow-md"
            >
                Export to Excel
            </button>
        </div>
    </div>
    
    {/* Adding space at the bottom */}
    <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-br from-gray-100 to-white"></div>
</div>


                <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                    <table className="min-w-full bg-white">
                        <thead>
                            <tr className="border-b border-gray-200">
                       
<th onClick={() => sortWarehouses('name')} className="py-2 px-4 bg-gray-200 font-semibold text-gray-700 cursor-pointer text-right">
    Warehouse Name
</th>

                                <th className="py-2 px-4 bg-gray-200 font-semibold text-gray-700">Address</th>
                                <th className="py-2 px-4 bg-gray-200 font-semibold text-gray-700">Price</th>
                                <th className="py-2 px-4 bg-gray-200 font-semibold text-gray-700">Status</th>
                                <th className="py-2 px-4 bg-gray-200 font-semibold text-gray-700">Upload Date</th>
                                <th className="py-2 px-4 bg-gray-200 font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                        {filteredWarehouses.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="py-2 px-4 text-center text-gray-900">No data available</td>
                            </tr>
                        ) : (
                            filteredWarehouses.map(warehouse => (
                                    <tr key={warehouse.id} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="py-2 px-4 text-gray-900 text-center">{warehouse.name}</td>
                                        <td className="py-2 px-4 text-gray-900 text-center">{warehouse.address}</td>
                                        <td className="py-2 px-4 text-gray-900 text-center">{warehouse.price}</td>
                                        <td className="py-2 px-4 text-gray-900 text-center">{warehouse.rentStatus}</td>
                                        <td className="py-2 px-4 text-gray-900 text-center">
                                            {formatDate(new Date(warehouse.uploadDate.seconds * 1000))}
                                        </td>
                                        <td className="py-2 px-4 text-gray-900 flex justify-center items-center space-x-2">
                                            <button
                                                onClick={() => fetchUserInfo(warehouse.userUid)}
                                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded"
                                            >
                                                Lessor Info
                                            </button>
                                            <button
                                                onClick={() => fetchLesseeInfo(warehouse.userId)}
                                                className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded"
                                            >
                                                Lessee Info
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                            {/* Placeholder Rows */}
                            {[...Array(15 - warehouses.length)].map((_, index) => (
                                <tr key={`placeholder-${index}`} className="border-b border-gray-200">
                                    <td colSpan="6" className="py-2 px-4 text-center text-gray-300">Placeholder Row</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
          

            {/* Modal for displaying owner information */}
            {isModalOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white w-full md:w-3/4 lg:w-1/2 xl:w-1/3 rounded-lg shadow-2xl p-6 relative max-w-md">
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-3xl"
                        >
                            &times;
                        </button>
                        <div className="flex items-center mb-6">
                            {selectedUser.profileImage ? (
                                <img
                                    src={selectedUser.profileImage}
                                    alt="Profile"
                                    className="w-20 h-20 rounded-full border-4 border-gray-300 object-cover mr-4"
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-full bg-gray-300 border-4 border-gray-300 mr-4"></div>
                            )}
                            <div>
                                <h2 className="text-3xl font-bold mb-1">{selectedUser.first_name} {selectedUser.last_name}</h2>
                                <p className="text-gray-600">{selectedUser.email}</p>
                            </div>
                        </div>
                        <div className="space-y-3 text-gray-700">
                            <p><strong>Contact Number:</strong> {selectedUser.contact_number}</p>
                            <p><strong>Birthdate:</strong> {new Date(selectedUser.birthdate).toLocaleDateString()}</p>
                            <p><strong>Address:</strong> {selectedUser.address}</p>
                            <p><strong>Registration Date:</strong> {
                                selectedUser.registrationDate 
                                    ? new Date(selectedUser.registrationDate.seconds * 1000).toLocaleString('en-GB', { timeZone: 'Asia/Manila' }) 
                                    : 'N/A'
                            }</p>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={closeModal}
                                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg shadow-md"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for displaying lessee information */}
            {isLesseeModalOpen && selectedLessee && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white w-full md:w-3/4 lg:w-1/2 xl:w-1/3 rounded-lg shadow-2xl p-6 relative max-w-md">
                        <button
                            onClick={closeLesseeModal}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-3xl"
                        >
                            &times;
                        </button>
                        <div className="flex items-center mb-6">
                            {selectedLessee.profileImage ? (
                                <img
                                    src={selectedLessee.profileImage}
                                    alt="Profile"
                                    className="w-20 h-20 rounded-full border-4 border-gray-300 object-cover mr-4"
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-full bg-gray-300 border-4 border-gray-300 mr-4"></div>
                            )}
                            <div>
                                <h2 className="text-3xl font-bold mb-1">{selectedLessee.first_name} {selectedLessee.last_name}</h2>
                                <p className="text-gray-600">{selectedLessee.email}</p>
                            </div>
                        </div>
                        <div className="space-y-3 text-gray-700">
    <div className="border-b border-gray-300 pb-2">
        <p><strong>Contact Number:</strong> {selectedLessee.contact_number}</p>
    </div>
    <div className="border-b border-gray-300 pb-2">
        <p><strong>Birthdate:</strong> {new Date(selectedLessee.birthdate).toLocaleDateString()}</p>
    </div>
    <div className="border-b border-gray-300 pb-2">
        <p><strong>Address:</strong> {selectedLessee.address}</p>
    </div>
    <div className="border-b border-gray-300 pb-2">
        <p><strong>Registration Date:</strong> {
            selectedLessee.registrationDate 
                ? new Date(selectedLessee.registrationDate.seconds * 1000).toLocaleString('en-GB', { timeZone: 'Asia/Manila' }) 
                : 'N/A'
        }</p>
    </div>
</div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={closeLesseeModal}
                                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg shadow-md"
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

export default Warehouses;
