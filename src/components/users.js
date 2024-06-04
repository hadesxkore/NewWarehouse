import React, { useState, useEffect } from 'react';
import { firestore } from '../firebase'; // Import Firestore
import Navigation from './Navigation'; // Import Navigation component
import CustomPopUp from './CustomPopUp'; // Import CustomPopUp component
import './users.css';

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

    const handleDeleteAccount = async (accountId) => {
        try {
            await firestore.collection('superadmins').doc(accountId).delete();
        } catch (error) {
            console.error('Error deleting account:', error);
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
        <div key={user.id} className="rounded-lg overflow-hidden shadow-lg bg-white transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl">
            <img src={user.profileImage} alt="Profile" className="w-24 h-24 rounded-full mx-auto mt-4 hover:opacity-75" onClick={() => showUserDetails(user.id)} />
            <div className="p-4">
                <h2 className="text-xl font-semibold mb-2 text-center">{user.firstName} {user.lastName}</h2>
                <p className="text-gray-600 mb-2 text-center">{user.email}</p>
                <div className="bg-white bg-opacity-70 p-4 rounded-md shadow-md mb-4">
                    <p className="text-green-500">Verified Warehouses: {warehouseCounts[user.id]?.verifiedCount || 0}</p>
                    <p className="text-yellow-500">Pending Warehouses: {warehouseCounts[user.id]?.pendingCount || 0}</p>
                    <p className="text-red-500">Rejected Warehouses: {warehouseCounts[user.id]?.rejectedCount || 0}</p>
                </div>
                <div className="flex justify-center">
                    <button className="text-red-500 hover:text-red-700 mr-2" onClick={(event) => deleteUser(event, user.id)}>Delete</button>
                </div>
            </div>
        </div>
    ))}


<div className="grid grid-cols-1">
    {showUserAccounts && (
        <div className="user-card">
            {adminAccounts.map(account => (
                <div key={account.id} className="rounded-lg overflow-hidden shadow-lg bg-white transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl p-4 mb-4">
                    <p className="text-lg font-semibold mb-2"><strong>Display Name:</strong> {account.displayName}</p>
                    <p className="text-gray-600 mb-2"><strong>Email:</strong> {account.email}</p>
                    <p className="text-gray-600 mb-2"><strong>Created Timestamp:</strong> {account.createdTimestamp ? account.createdTimestamp.toDate().toString() : ''}</p>
                    <p className="text-gray-600 mb-2"><strong>Last Login Timestamp:</strong> {account.lastLoginTimestamp ? account.lastLoginTimestamp.toDate().toString() : ''}</p>
                    <p className="text-gray-600 mb-2"><strong>Profile Picture:</strong> {account.profilePicture}</p>
                    <p className="text-gray-600 mb-2"><strong>Role:</strong> {account.role}</p>
                    <button onClick={() => handleDeleteAccount(account.id)} className="bg-red-500 text-white px-4 py-2 rounded-md mt-4 hover:bg-red-600 transition duration-300">Delete Account</button>
                </div>
            ))}
        </div>
    )}
</div>
</div>
</div>
         
            {/* Confirmation popup */}
            {showConfirmation && (
                <CustomPopUp
                    message="Are you sure you want to delete this user?"
                    onCancel={() => setShowConfirmation(false)}
                    onConfirm={confirmDeleteUser}
                />
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
