import React, { useState, useRef, useEffect } from 'react';
import { firestore } from '../firebase'; 
import Navigation from './Navigation'; 
import loupe from '../images/loupe.png';
import { HiExclamationCircle  } from 'react-icons/hi';
import { Tooltip } from 'react-tooltip'; // Correct import for Tooltip

import Chart from 'chart.js/auto'; // Import Chart.js

import * as XLSX from 'xlsx';

function Warehouses() {
    const [warehouses, setWarehouses] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null); // State for selected user info
    const [selectedLessee, setSelectedLessee] = useState(null); // State for selected lessee info
    const [isModalOpen, setIsModalOpen] = useState(false); // State for lessor modal visibility
    const [isLesseeModalOpen, setIsLesseeModalOpen] = useState(false); // State for lessee modal visibility
    const [searchQuery, setSearchQuery] = useState('');
    const [showChart, setShowChart] = useState(false);
    const [chartData, setChartData] = useState({});
    const canvasRef = useRef(null); // Create a ref for the canvas
    const [tooltipContent, setTooltipContent] = useState('');
    const [notificationCount, setNotificationCount] = useState(0);
    const [hasSeenNotification, setHasSeenNotification] = useState(false); // Add this state
    const [selectedWarehouseId, setSelectedWarehouseId] = useState(null); // Track the selected warehouse
    const [viewedWarehouseIds, setViewedWarehouseIds] = useState([]); // Track the viewed warehouse IDs

    const [filteredWarehouses, setFilteredWarehouses] = useState(warehouses);
    const [sortField, setSortField] = useState('name');
const [sortOrder, setSortOrder] = useState('asc');
const [rentedWarehouses, setRentedWarehouses] = useState([]);

const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
const [transactionStatus, setTransactionStatus] = useState('');
const [selectedWarehouse, setSelectedWarehouse] = useState(null);




const getRentedWarehousesData = () => {
    const rentedWarehouses = warehouses.filter(warehouse => warehouse.rentStatus === 'Rented'); // Ensure you're filtering correctly
    const labels = rentedWarehouses.map(warehouse => warehouse.name); // Labels for the chart
    const data = rentedWarehouses.map(warehouse => warehouse.price); // Data for the chart
    return { labels, data };
};

  // Simulating an API call or other mechanism that updates the notification count
  useEffect(() => {
    // Example: Mock notification update logic, this should be replaced by actual notification logic
    const fetchNotifications = async () => {
      // Simulate fetching notification count (you can replace this with your actual logic)
      const newNotificationCount = 5; // Example: Setting to 5 for testing
      setNotificationCount(newNotificationCount);
    };

    // Simulate fetching data on component mount
    fetchNotifications();

    // You can also set an interval to fetch updates periodically (optional)
    const interval = setInterval(fetchNotifications, 10000); // Every 10 seconds
    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

const renderChart = () => {
    if (!canvasRef.current) return; // Check if canvasRef is available
    const { labels, data } = getRentedWarehousesData();
    const ctx = canvasRef.current.getContext('2d');

    // Calculate the highest and lowest prices
    const maxPrice = Math.max(...data);
    const minPrice = Math.min(...data);

    // Display max and min prices in a text element
    const priceInfoElement = document.getElementById('priceInfo');
    if (priceInfoElement) {
        priceInfoElement.innerHTML = `Highest Price: ₱${maxPrice.toLocaleString()}, Lowest Price: ₱${minPrice.toLocaleString()}`;
    }

    if (window.warehouseChart) {
        window.warehouseChart.destroy();
    }

    window.warehouseChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Rented Warehouse Prices',
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            }],
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        },
    });
};

useEffect(() => {
    // Listen for real-time updates to rentedWarehouses
    const unsubscribe = firestore.collection('rentedWarehouses')
      .onSnapshot((snapshot) => {
        const updatedWarehouses = snapshot.docs.map(doc => {
          return {
            id: doc.id,
            ...doc.data(),
          };
        });
  
        // Calculate new notifications (warehouses that are not yet viewed)
        const newNotifications = updatedWarehouses.filter(warehouse => 
          !viewedWarehouseIds.includes(warehouse.id)
        );
  
        // Update notification count and viewed warehouse IDs
        setNotificationCount(newNotifications.length);
      });
  
    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, [viewedWarehouseIds]); // Listen to changes in viewedWarehouseIds
  
  const handleViewStatus = async (warehouseId) => {
    try {
      // Fetch the transaction status from Firestore based on the warehouse ID
      const warehouseRef = firestore.collection('rentedWarehouses').doc(warehouseId);
      const warehouseDoc = await warehouseRef.get();
  
      if (warehouseDoc.exists) {
        const warehouseData = warehouseDoc.data();
        setTransactionStatus(warehouseData.transactionStatus || 'No transactions have been made yet'); // Default if no status
        setSelectedWarehouse(warehouseData); // Store selected warehouse data
        setIsStatusModalVisible(true); // Open the modal
  
        // Add the selected warehouse ID to the viewed list to remove its notification permanently
        setViewedWarehouseIds((prevIds) => [...prevIds, warehouseId]); // Store the viewed warehouse's ID
      } else {
        console.error('Warehouse document not found');
      }
    } catch (error) {
      console.error('Error fetching transaction status:', error);
    }
  };
  

useEffect(() => {
    const fetchRentedWarehouses = async () => {
        const rentedSnapshot = await firestore.collection('rentedWarehouses').get();
        const rentedData = rentedSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
        setRentedWarehouses(rentedData); // Store the rented data
    };
    fetchRentedWarehouses();
}, []);


 // Function to handle chart button click
 const handleChartButtonClick = () => {
    setShowChart(true);
};

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
        renderChart(); // Call renderChart here
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
        setShowChart(false);
        if (window.warehouseChart) {
            window.warehouseChart.destroy(); // Destroy the chart to avoid memory leaks
            window.warehouseChart = null; // Set it to null to reset
        }
    };
    useEffect(() => {
        if (showChart && canvasRef.current) {
            renderChart(); // Call to render the chart when modal opens
        }
    }, [showChart, warehouses]); // Add warehouses to the dependency array
    


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
                    
                        <div className="flex space-x-2">
                                <button 
                                    onClick={exportToExcel} 
                                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow-md"
                                >
                                    Export to Excel
                                </button>
                                <button 
                                    onClick={handleChartButtonClick} 
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-md"
                                >
                                    Chart
                                </button>
                            </div>
                    </div>
                </div>
                    {/* Popup Modal for Chart */}
                    {showChart && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                            <div className="bg-white p-4 rounded shadow-md w-11/12 md:w-3/5 lg:w-2/5 max-h-1/3 overflow-auto"> {/* Adjusted for smaller height and width */}
                                <h2 className="text-lg font-semibold mb-2">Rented Warehouse Chart</h2>
                                
                                {/* Text showing highest and lowest prices */}
                                <div id="priceInfo" className="flex justify-end text-sm mb-2"> {/* Flex container for right alignment */}
                                    <div>
                                        Highest Price: ₱X,XXX <br />
                                        Lowest Price: ₱X,XXX
                                    </div>
                                </div>

                                {/* Chart Canvas */}
                                <canvas ref={canvasRef} width="400" height="200"></canvas> {/* Adjusted canvas height */}
                                
                                <div className="flex justify-end mt-4"> {/* Flex container for button alignment */}
                                    <button 
                                        onClick={closeModal} 
                                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}


                        {/* Adding space at the bottom */}
                        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-br from-gray-100 to-white"></div>
                    </div>


                    <div className="overflow-x-auto bg-white shadow-xl rounded-3xl mt-8 p-8">
                    <table className="min-w-full bg-white table-auto rounded-lg overflow-hidden">
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
                                        <td className="py-4 px-6 text-gray-900">₱{Number(warehouse.price).toLocaleString()}</td>
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

            

    <div className="overflow-x-auto bg-white shadow-xl rounded-3xl mt-8 p-8">
      <div className="text-3xl font-semibold text-gray-900 mb-6">
        Viewing the Status Transaction of Lessor and Lessee
      </div>

      <table className="min-w-full bg-white table-auto rounded-lg overflow-hidden">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="py-4 px-6 bg-gray-50 font-semibold text-gray-700 text-left">Warehouse Name</th>
            <th className="py-4 px-6 bg-gray-50 font-semibold text-gray-700 text-left">Lessor First Name</th>
            <th className="py-4 px-6 bg-gray-50 font-semibold text-gray-700 text-left">Lessor Last Name</th>
            <th className="py-4 px-6 bg-gray-50 font-semibold text-gray-700 text-left">Lessee First Name</th>
            <th className="py-4 px-6 bg-gray-50 font-semibold text-gray-700 text-left">Lessee Last Name</th>
            <th className="py-4 px-6 bg-gray-50 font-semibold text-gray-700 text-left">Address</th>
            <th className="py-4 px-6 bg-gray-50 font-semibold text-gray-700 text-left">Price</th>
            <th className="py-4 px-6 bg-gray-50 font-semibold text-gray-700 text-left">Status</th>
            <th className="py-4 px-6 bg-gray-50 font-semibold text-gray-700 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {rentedWarehouses.length === 0 ? (
            <tr>
              <td colSpan="8" className="py-4 px-6 text-center text-gray-500">
                No data available
              </td>
            </tr>
          ) : (
            rentedWarehouses.map((warehouse) => (
              <tr
                key={warehouse.id}
                className="border-b border-gray-100 hover:bg-gray-100 transition-all duration-300 ease-in-out"
              >
                <td className="py-4 px-6 text-gray-900">{warehouse.name}</td>
                <td className="py-4 px-6 text-gray-900">{warehouse.ownerFirstName}</td>
                <td className="py-4 px-6 text-gray-900">{warehouse.ownerLastName}</td>
                <td className="py-4 px-6 text-gray-900">{warehouse.rentedBy?.firstName}</td>
                <td className="py-4 px-6 text-gray-900">{warehouse.rentedBy?.lastName}</td>
                <td className="py-4 px-6 text-gray-900">{warehouse.address}</td>
                <td className="py-4 px-6 text-gray-900">₱{Number(warehouse.price).toLocaleString()}</td>
                <td className="py-4 px-6 text-gray-900">{warehouse.status}</td>
                <td className="py-4 px-6 text-center">
    <button
      onClick={() => handleViewStatus(warehouse.id)}
      className="relative px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200"
      data-tip
      data-for="status-tooltip" // This links the tooltip to the button
    >
      View Status
      {/* Notification Icon - only show if this warehouse hasn't been viewed yet */}
      {!viewedWarehouseIds.includes(warehouse.id) && notificationCount > 0 && (
        <span className="absolute top-0 right-0 inline-block w-5 h-5 text-xs font-semibold text-white bg-red-500 rounded-full flex items-center justify-center">
          <HiExclamationCircle size={16} data-tip data-for="status-tooltip" />
        </span>
      )}
    </button>

    {/* Tooltip for the exclamation icon */}
    <Tooltip id="status-tooltip" place="top" content="New Transaction Status" />
  </td>

              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>


{/* Modal to display transaction status */}
{isStatusModalVisible && selectedWarehouse && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
    <div className="bg-white p-10 rounded-xl shadow-lg max-w-md w-full transform transition-all scale-95 hover:scale-100 duration-300">
      {/* Modal Header with Icon */}
      <div className="flex justify-center mb-6">
        <HiExclamationCircle 
          size={70} 
          className="text-blue-500"
        />
      </div>

      {/* Modal Content */}
      <div className="text-center">
        <div className="text-xl text-gray-700 mb-4">
          <strong className="text-gray-900 text-2xl font-semibold">Current Transaction Status:</strong>
          {/* Highlighted Status with improved contrast */}
          <div className="mt-3 text-lg font-bold text-white bg-blue-700 rounded-lg py-3 px-6 shadow-md">
            {transactionStatus || 'Not Available'}
          </div>
        </div>
      </div>

      {/* Close Button */}
      <div className="text-center mt-6">
        <button
          onClick={() => setIsStatusModalVisible(false)}  // Close the modal
          className="px-8 py-3 text-xl font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg transition-all duration-300"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

</div>    
        </div>
    );
}

export default Warehouses;
