import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { firestore, auth } from '../firebase'; // Import auth from firebase.js
import { HiOutlineLockClosed } from 'react-icons/hi'; // Import the icon

const WarehouseCard = ({ warehouse }) => {
    const [uploaderInfo, setUploaderInfo] = useState(null);
    const [truncatedDescription, setTruncatedDescription] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUploaderInfo = async () => {
            try {
                const userRef = await firestore.collection('users').doc(warehouse.userUid).get();
                if (userRef.exists) {
                    const userData = userRef.data();
                    setUploaderInfo(userData);
                } else {
                    console.log('User not found');
                }
            } catch (error) {
                console.error('Error fetching uploader info:', error);
            }
        };
    
        fetchUploaderInfo();
    }, [warehouse.userUid]);

    useEffect(() => {
        if (warehouse.description.length > 400) {
            setTruncatedDescription(warehouse.description.substring(0, 400) + '...');
        } else {
            setTruncatedDescription(warehouse.description);
        }
    }, [warehouse.description]);

    const handleRentClick = () => {
        // Check if the user is logged in
        const isLoggedIn = auth.currentUser !== null; // Check if there is a current user
        if (!isLoggedIn) {
            setModalVisible(true); // Show modal if not logged in
        } else {
            navigate("/details", { state: { warehouse, uploaderInfo } }); // Navigate to details if logged in
        }
    };

    return (
        <div className="warehouse-card bg-white p-6 rounded-lg shadow-md relative mt-8">
            <div className="profile-image-container absolute -top-5 left-0 w-full flex justify-center -mt-8">
                {uploaderInfo && uploaderInfo.profileImage && (
                    <img src={uploaderInfo.profileImage} alt="Profile" className="h-24 w-24 rounded-full border-4 border-white bg-white z-10" />
                )}
            </div>
            <div className="content-container relative">
                <h3 className="text-xl font-semibold mt-4 text-center">{warehouse.name}</h3>
                <div className="description-container mb-4">
                    <p className="text-gray-700 mt-4 description">
                        <span className="font-bold">Address:</span> {warehouse.address}
                    </p>
                    <p className="text-gray-700 mt-4 description">
                        <span className="font-bold">Description:</span> {truncatedDescription}
                    </p>
                </div>
                <div className="media-container flex flex-wrap mb-4">
                    {warehouse.images.map((imageUrl, index) => (
                        <img key={index} src={imageUrl} alt={`Image ${index + 1}`} className="h-24 w-24 object-cover rounded-md mr-2 mb-2" />
                    ))}
                    {warehouse.videos.map((videoUrl, index) => (
                        <video key={index} src={videoUrl} controls className="h-24 w-24 rounded-md mr-2 mb-2"></video>
                    ))}
                </div>
                <p className="text-gray-700 mb-4">
                    <span className="font-bold">Price:</span> ₱{warehouse.price}
                </p>
                <p className="text-gray-700 mb-4">
                    <span className="font-bold">Created by:</span> {uploaderInfo ? `${uploaderInfo.first_name} ${uploaderInfo.last_name} (${uploaderInfo.contact_number})` : 'Unknown'}
                </p>
                <p className={`font-bold uppercase text-sm ${warehouse.status === 'verified' ? 'text-green-500' : 'text-gray-700'}`}>{warehouse.status}</p>
                <p className="text-gray-700 mb-4">
                    <span className="font-bold">Created Date:</span> {warehouse.uploadDate ? new Date(warehouse.uploadDate.toDate()).toLocaleString() : 'Unknown'}
                </p>
          
                <div className="flex justify-end mt-4">
                    <button onClick={handleRentClick} className="bg-green-600 hover:bg-green-500 text-white font-semibold py-3 px-6 rounded-md">Rent</button>
                </div>
            </div>


{modalVisible && (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
            <div className="flex items-center justify-center mb-4">
                <HiOutlineLockClosed className="text-4xl text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold">Login Required</h2>
            </div>
            <p className="mb-4 text-center">You need to be properly logged in before attempting to rent a warehouse.</p>
            <div className="flex justify-center">
                <button
                    onClick={() => navigate('/login')}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-md"
                >
                    Go to Login
                </button>
            </div>
            <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                onClick={() => setModalVisible(false)}
            >
                &times;
            </button>
        </div>
    </div>
)}

        </div>
    );
};

export default WarehouseCard;
