import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { firestore } from '../firebase';

const WarehouseCard = ({ warehouse }) => {
    const [uploaderInfo, setUploaderInfo] = useState(null);
    const [truncatedDescription, setTruncatedDescription] = useState('');

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
                   
                    <Link to="/details" state={{ warehouse, uploaderInfo }}>
                        <button className="bg-green-600 hover:bg-green-500 text-white font-semibold py-3 px-6 rounded-md">Rent</button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default WarehouseCard;
