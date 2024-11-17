import React, { useState, useEffect } from 'react';
import { auth, firestore } from '../firebase'; // Import Firestore and Firebase Auth
import Navigation from './Navigation'; // Import Navigation component
import CustomPopUp from './CustomPopUp'; // Import CustomPopUp component
import './users.css';
import { HiOutlineExclamationCircle,HiTrash } from 'react-icons/hi';
import { HiMail, HiCalendar, HiUserCircle, HiLockClosed } from 'react-icons/hi';

function Users() {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserAccounts, setShowUserAccounts] = useState(false);
    const [adminAccounts, setAdminAccounts] = useState([]);
    const userCount = users.length; // Calculate the number of current users
    const [title, setTitle] = useState('User Management');
    const [warehouseCounts, setWarehouseCounts] = useState({});
    const [accountToDelete, setAccountToDelete] = useState(null); // For storing the account to delete

    useEffect(() => {
        // Set up Firestore listeners on component mount
        const unsubscribeUsers = firestore.collection('users').onSnapshot(snapshot => {
            const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(usersData);
        });

        const unsubscribeAdmins = firestore.collection('superadmins').onSnapshot(snapshot => {
            const adminAccountsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAdminAccounts(adminAccountsData);
        });

        return () => {
            // Unsubscribe from Firestore listeners when component unmounts
            unsubscribeUsers();
            unsubscribeAdmins();
        };
    }, []);

    // Function to update the lastLoginTimestamp on user login
const updateLastLogin = async (userId) => {
    try {
        await firestore.collection('superadmins').doc(userId).update({
            lastLoginTimestamp: new Date(), // Update with the current timestamp
        });
    } catch (error) {
        console.error("Error updating last login timestamp: ", error);
    }
};

// Call this function when the admin logs in
auth.onAuthStateChanged((user) => {
    if (user) {
        updateLastLogin(user.uid); // Update last login for the logged-in admin
    }
});
    useEffect(() => {
        // Set up Firestore listeners for warehouse counts
        const warehouseListeners = users.map(user => {
            return firestore.collection('warehouses').where('userUid', '==', user.id).onSnapshot(snapshot => {
                const warehouseData = snapshot.docs.map(doc => doc.data());
                const verifiedCount = warehouseData.filter(warehouse => warehouse.status === 'verified').length;
                const pendingCount = warehouseData.filter(warehouse => warehouse.status === 'pending').length;
                const rejectedCount = warehouseData.filter(warehouse => warehouse.status === 'rejected').length;

                setWarehouseCounts(prevCounts => ({
                    ...prevCounts,
                    [user.id]: { verifiedCount, pendingCount, rejectedCount }
                }));
            });
        });

        return () => {
            // Unsubscribe from warehouse count listeners when component unmounts
            warehouseListeners.forEach(unsubscribe => unsubscribe());
        };
    }, [users]);

    // Filter users based on search term
    const filteredUsers = users.filter(user => {
        const firstName = user.firstName ? user.firstName.toLowerCase() : '';
        const lastName = user.lastName ? user.lastName.toLowerCase() : '';
        const email = user.email ? user.email.toLowerCase() : '';
        return firstName.includes(searchTerm.toLowerCase()) ||
            lastName.includes(searchTerm.toLowerCase()) ||
            email.includes(searchTerm.toLowerCase());
    });

    const deleteUser = async (event, userId) => {
        event.stopPropagation(); // Prevent event propagation
        setUserToDelete(userId);
        setShowConfirmation(true);
    };

    const confirmDeleteUser = async () => {
        try {
            await firestore.collection('users').doc(userToDelete).delete();
        } catch (error) {
            console.error('Error deleting user:', error);
        } finally {
            setShowConfirmation(false);
            setUserToDelete(null);
        }
    };

    const showUserDetails = async (userId) => {
        const selectedUserData = users.find(user => user.id === userId);
        setSelectedUser(selectedUserData);
    };

    const toggleUserAccounts = () => {
        setShowUserAccounts(!showUserAccounts);
        setSearchTerm(''); // Clear search term when toggling
        if (!showUserAccounts) {
            setTitle('Admin Account');
        } else {
            setTitle('User Management');
        }
    };

    const toggleManageUsers = () => {
        setShowUserAccounts(false); // Close user accounts card
        setTitle('User Management');
        setSearchTerm(''); // Clear search term
    };

    const handleDeleteAccount = (accountId) => {
        setAccountToDelete(accountId); // Set the account to be deleted
        setShowConfirmation(true); // Show the confirmation modal
    };

    const confirmDeleteAccount = async () => {
        try {
            await firestore.collection('superadmins').doc(accountToDelete).delete();
        } catch (error) {
            console.error('Error deleting account:', error);
        } finally {
            setShowConfirmation(false);
            setAccountToDelete(null); // Reset the accountToDelete
        }
    };

    return (
        <div style={{ backgroundColor: '#eeeeee', minHeight: '100vh' }}>
            <Navigation /> {/* Include Navigation component here */}
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-semibold mb-6">{title}</h1>
                <div className="flex justify-between mb-4">
                    <div className="flex items-center">
                        <input
                            type="text"
                            placeholder="Search by name or email"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-28 py-3 border rounded-md text-lg"
                        />
                        <button className="px-8 py-3 bg-blue-500 text-white rounded-md ml-2">Search</button>
                    </div>
                    <div>
                        <button className="px-6 py-3 bg-blue-500 text-white rounded-md mr-2" onClick={toggleManageUsers}>Manage Users</button>
                        <button className="px-6 py-3 bg-blue-500 text-white rounded-md" onClick={toggleUserAccounts}>Admin Account</button>
                    </div>
                </div>
                <div>
                    <p className="text-gray-600 text-lg mb-2">Total Users: <span className="font-semibold text-xl">{userCount}</span></p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {!showUserAccounts && filteredUsers.map(user => (
        <div key={user.id} className="rounded-lg overflow-hidden shadow-lg bg-white transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-2xl">
            <div className="flex justify-center mt-4">
                <img
                    src={user.profileImage || '/path/to/default-profile-icon.png'} // Default image for users without a profile picture
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover hover:opacity-80 cursor-pointer transition duration-300"
                    onClick={() => showUserDetails(user.id)}
                />
            </div>
            <div className="p-6">
                <h2 className="text-2xl font-semibold text-center text-gray-800 mb-2">{user.firstName} {user.lastName}</h2>
                <p className="text-lg text-center text-gray-600 mb-4">{user.email}</p>
                
                <div className="bg-white bg-opacity-80 p-4 rounded-lg shadow-md mb-4">
                    <p className="text-green-500 font-semibold">Verified Warehouses: {warehouseCounts[user.id]?.verifiedCount || 0}</p>
                    <p className="text-yellow-500 font-semibold">Pending Warehouses: {warehouseCounts[user.id]?.pendingCount || 0}</p>
                    <p className="text-red-500 font-semibold">Rejected Warehouses: {warehouseCounts[user.id]?.rejectedCount || 0}</p>
                </div>
                
                <div className="flex justify-center space-x-4">
                    <button
                        onClick={(event) => deleteUser(event, user.id)}
                        className="bg-red-600 text-white hover:bg-red-700 px-6 py-3 rounded-lg font-medium transition duration-300 flex items-center"
                    >
                        <HiTrash size={20} className="mr-2" />
                        Delete
                    </button>
                </div>
            </div>
        </div>
    ))}





<div className="grid grid-cols-1 gap-6">
    {showUserAccounts && (
        <div className="user-card">
            {adminAccounts.map(account => (
                <div key={account.id} className="bg-white shadow-2xl rounded-2xl p-8 transition-transform transform hover:scale-105 hover:shadow-2xl mb-6">
                    <div className="flex items-center space-x-6 mb-6">
                        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                            {account.profilePicture ? (
                                <img 
                                    src={account.profilePicture} 
                                    alt="Profile Picture" 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <HiUserCircle size={72} className="text-gray-400" />
                            )}
                        </div>
                        <div className="flex flex-col justify-center space-y-2">
                            <div className="flex items-center space-x-2">
                                <p className="text-sm text-gray-500 font-medium">Name:</p>
                                <p className="text-2xl font-semibold text-gray-800">{account.displayName}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <p className="text-sm text-gray-500 font-medium">Role:</p>
                                <p className="text-lg text-gray-600">{account.role}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center text-lg font-medium text-gray-800 mb-4">
                        <HiMail size={24} className="mr-2 text-gray-500" />
                        <span><strong>Email:</strong> {account.email}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="flex items-center text-sm text-gray-600">
                            <HiCalendar size={22} className="mr-2 text-gray-500" />
                            <span><strong>Created:</strong> {account.createdTimestamp ? account.createdTimestamp.toDate().toLocaleString() : 'N/A'}</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                            <HiLockClosed size={22} className="mr-2 text-gray-500" />
                            <span><strong>Last Login:</strong> {account.lastLoginTimestamp ? account.lastLoginTimestamp.toDate().toLocaleString() : 'Never Logged In'}</span>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => handleDeleteAccount(account.id)} 
                        className="mt-6 bg-red-600 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-red-700 transition duration-300 w-full">
                        Delete Account
                    </button>
                </div>
            ))}
        </div>
    )}
</div>



</div>
</div>
        {/* Confirmation Popup */}
{showConfirmation && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white p-8 rounded-3xl max-w-sm w-full shadow-xl">
      <div className="flex justify-center mb-6">
        <HiOutlineExclamationCircle className="text-red-600 text-5xl" />
      </div>
   <h3 className="text-2xl font-semibold text-center text-gray-800 mb-4">
  Are you sure you want to delete this user?
</h3>

      <p className="text-center text-gray-700 mb-6">This action cannot be undone.</p>
      <div className="flex justify-between">
        <button
          className="bg-gray-300 text-gray-700 py-2 px-6 rounded-md hover:bg-gray-400 focus:outline-none transition"
          onClick={() => setShowConfirmation(false)}
        >
          Cancel
        </button>
        <button
          className="bg-red-600 text-white py-2 px-6 rounded-md hover:bg-red-700 focus:outline-none transition"
          onClick={confirmDeleteUser}
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
)}
{/* User details pop-up modal */}
{selectedUser && (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50 bg-gray-800 bg-opacity-75">
        <div className="bg-white rounded-lg overflow-hidden shadow-lg max-w-md">
            <div className="px-6 py-4 bg-gray-800 text-white">
                <h2 className="text-2xl font-semibold mb-2">{selectedUser.firstName} {selectedUser.lastName}</h2>
                <p className="text-lg"><strong><span className="text-white">Email:</span></strong> {selectedUser.email}</p>
            </div>
            <div className="p-6">
                <p className="text-gray-800 text-lg mb-4"><strong>Address:</strong> {selectedUser.address}</p>
                <p className="text-gray-800 text-lg mb-4"><strong>Birthdate:</strong> {selectedUser.birthdate}</p>
                <p className="text-gray-800 text-lg mb-4"><strong>Contact Number:</strong> {selectedUser.contact_number}</p>
                <div className="flex justify-end pt-4">
                    <button className="px-4 py-2 w-full bg-red-500 text-white text-lg rounded-md hover:bg-red-600 transition duration-300" onClick={() => setSelectedUser(null)}>Close</button>
                </div>
            </div>
        </div>
    </div>
)}



        </div>
    );
}

export default Users;
