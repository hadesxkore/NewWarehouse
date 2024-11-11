import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Circle, Popup } from 'react-leaflet';
import axios from 'axios';
import placeholderIcon from '../images/placeholder.png'; // Import report icon
import { Carousel } from 'react-responsive-carousel';
import Footer from './Footer';
import 'leaflet/dist/leaflet.css';
import { auth } from '../firebase'; // Make sure to import auth from firebase
import 'react-datepicker/dist/react-datepicker.css';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import Navbar from './Navbar';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import warnIcon from '../images/warn.png'; // Import report icon

import markerRetina from 'leaflet/dist/images/marker-icon-2x.png';
import './DetailedView.css';
import { firestore } from '../firebase'; // Assuming you have Firebase initialized properly
import * as THREE from 'three';
import  Panorama  from 'panolens';
import * as PANOLENS from 'panolens';
import 'panolens';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

const DetailView = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    const [mapCenter, setMapCenter] = useState([0, 0]); // Initial map center

    const { warehouse, uploaderInfo } = location.state || {};
    const [userWarehouses, setUserWarehouses] = useState([]);

    const [show360Modal, setShow360Modal] = useState(false);
    const [image360Url, setImage360Url] = useState('');
    const [modalImageUrl, setModalImageUrl] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [position, setPosition] = useState([0, 0]); // Initial position
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [showOwnerNotificationModal, setShowOwnerNotificationModal] = useState(false);

    const [error, setError] = useState(null);

    const handleRentButtonClick = async () => {
        const user = auth.currentUser;
        if (user && (user.uid === warehouse.userUid)) {
            setShowOwnerNotificationModal(true);
        } else {
            setShowConfirmationModal(true);
        }
    };
    const OwnerNotificationModal = ({ show, onClose }) => {
        if (!show) return null;
    
        return (
            <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50">
                <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full">
                    {/* Icon at the top center */}
                    <div className="flex justify-center mb-4">
                        <HiOutlineExclamationCircle className="text-red-500 text-7xl" />
                    </div>
                    {/* Message content */}
                    <div className="text-center">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Important Notification</h3>
                        <p className="text-gray-600 mb-6">
                            This warehouse is registered under your ownership.
                        </p>
                    </div>
                    {/* Action button */}
                    <div className="flex justify-center">
                        <button
                            className="bg-blue-600 text-white px-6 py-2 rounded-xl text-lg font-semibold hover:bg-blue-700 transition"
                            onClick={onClose}
                        >
                            OK
                        </button>
                    </div>
                </div>
            </div>
        );
    };
    
    
// Define a custom icon for the marker
const locationIcon = new L.Icon({
    iconUrl: placeholderIcon,
    iconSize: [30, 30], // Set to the size of your custom icon
    iconAnchor: [15, 30], // Adjust this to position the icon correctly
    popupAnchor: [0, -30], // Adjust this to position the popup correctly
    shadowUrl:placeholderIcon,
    shadowSize: [30, 30], // Adjust to fit better with the icon size
    shadowAnchor: [15, 30] // Adjust this to position the shadow correctly
});
useEffect(() => {
    const geocodeAddress = async () => {
        try {
            const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(warehouse.address)}&key=87f39a31f9164bd281efd37f917e402b`);
            const { lat, lng } = response.data.results[0].geometry;
            setPosition([lat, lng]); // Set marker position
            setMapLoaded(true);
        } catch (error) {
            console.error('Error fetching coordinates:', error);
        }
    };

    if (warehouse.address) {
        geocodeAddress(); // Call the function to fetch coordinates
    }
}, [warehouse.address]);

const handleShow360Tour = (image360Url) => {
    setModalImageUrl(image360Url);
    setShow360Modal (true);
};

useEffect(() => {
    if (show360Modal && modalImageUrl) {
        initPanoramaViewer(modalImageUrl);
    }
}, [show360Modal, modalImageUrl]);


const handleFullscreen = () => {
    const viewerContainer = document.getElementById('panolens-container');
    if (viewerContainer) {
        if (viewerContainer.requestFullscreen) {
            viewerContainer.requestFullscreen();
        } else if (viewerContainer.mozRequestFullScreen) { // Firefox
            viewerContainer.mozRequestFullScreen();
        } else if (viewerContainer.webkitRequestFullscreen) { // Chrome, Safari and Opera
            viewerContainer.webkitRequestFullscreen();
        } else if (viewerContainer.msRequestFullscreen) { // IE/Edge
            viewerContainer.msRequestFullscreen();
        }
    }
};

useEffect(() => {
    const fetchUserWarehouses = async () => {
        try {
            // Assuming you have access to the warehouse owner's userUid
            const warehouseOwnerUid = warehouse.userUid || uploaderInfo?.uid; // Assuming uploaderInfo contains the warehouse owner's information
            if (warehouseOwnerUid) {
                const userWarehousesSnapshot = await firestore.collection('warehouses').where('userUid', '==', warehouseOwnerUid).get();
                const userWarehouses = userWarehousesSnapshot.docs.map(doc => doc.data());
                // Update state with user warehouses
                setUserWarehouses(userWarehouses);
            }
        } catch (error) {
            console.error('Error fetching user warehouses:', error);
        }
    };

    fetchUserWarehouses();
}, [warehouse.userUid, uploaderInfo?.uid]); // Dependency array includes userUid and uploaderInfo.uid
const initPanoramaViewer = (imageUrl) => {
    const viewerContainer = document.getElementById('panolens-container');

    if (!viewerContainer) {
        console.error("Panolens container not found");
        return;
    }

    viewerContainer.innerHTML = ''; // Clear existing content

    const viewer = new PANOLENS.Viewer({ container: viewerContainer });
    const panorama = new PANOLENS.ImagePanorama(imageUrl);
    viewer.add(panorama);

    // Enable controls directly
    viewer.enableControl(PANOLENS.CONTROLS.ORBIT);
    viewer.enableControl(PANOLENS.CONTROLS.ZOOM);

    // Dispose the viewer when closing
    viewer.addEventListener('panolens-viewer-handler', () => {
        viewer.dispose();
    });
};


const handleCloseModal = () => {
    setShow360Modal(false);
    setShowModal(false);
    setModalImageUrl('');
    setImage360Url('');

};


    const handleMarkerMove = (e) => {
        const latLng = e.target.getLatLng();
        setMapCenter([latLng.lat, latLng.lng]); // Update map center when marker is moved
    };
    const handleRentConfirmation = async (confirmed) => {
        if (confirmed) {
            try {
                const unsubscribe = auth.onAuthStateChanged(async (user) => {
                    if (user && warehouse) {
                        try {
                            const userDoc = await firestore.collection('users').doc(user.uid).get();
                            const userData = userDoc.data();
                            console.log('User data:', userData); // Log user data here
                            if (userData) {
                                const { first_name, last_name } = userData; // Adjust field names here
                                console.log('First Name:', first_name); // Log first name here
                                console.log('Last Name:', last_name); // Log last name here
                                
                                // Retrieve the ownerUid from the warehouse data
                                const ownerUid = warehouse.userUid || warehouse.id;
                                
                                if (!ownerUid) {
                                    throw new Error('Owner UID is undefined');
                                }
                                
                                const rentedWarehouseRef = await firestore.collection('rentedWarehouses').doc();    
                                await rentedWarehouseRef.set({
                                    warehouseId: rentedWarehouseRef.id,
                                    userUid: user.uid,
                                    ownerUid: ownerUid, // Set ownerUid to the uploader's UID or warehouse ID
                                    rentedAt: new Date(),
                                    status: 'Processing', // Retain the status processing
                                    rentedBy: {
                                        userId: user.uid,
                                        firstName: first_name || '',
                                        lastName: last_name || '',
                                    },
                                    amenities: warehouse.amenities,
                                    name: warehouse.name,
                                    address: warehouse.address,
                                    description: warehouse.description,
                                    price: warehouse.price,
                                    images: warehouse.images,
                                    ownerFirstName: uploaderInfo ? uploaderInfo.first_name : '',
                                    ownerLastName: uploaderInfo ? uploaderInfo.last_name : '',
                                });
                                navigate('/dashboard');
                            } else {
                                console.error('Error storing rented warehouse: User data is missing or incomplete');
                            }
                        } catch (error) {
                            console.error('Error fetching user data:', error);
                        }
                    } else {
                        console.error('Error storing rented warehouse: User ID or Warehouse data is undefined');
                    }
                    unsubscribe();
                });
            } catch (error) {
                console.error('Error storing rented warehouse:', error);
                // Handle error appropriately
            }
        }
        setShowConfirmationModal(false);
    };

    

    const ConfirmationModal = ({ show, onClose }) => {
        if (!show) return null;

        return (
            <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50">
                <div className="bg-white p-8 rounded-lg">
                    <p className="text-xl mb-4">Are you sure you want to rent this warehouse?</p>
                    <div className="flex justify-end">
                        <button className="bg-red-500 text-white px-4 py-2 rounded mr-4" onClick={() => onClose(false)}>Cancel</button>
                        <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={() => onClose(true)}>Confirm</button>
                    </div>
                </div>
            </div>
        );
    };
    
    const createOrGetConversation = async (user, ownerUid, uploaderInfo) => {
        try {
            const participants = [user.uid, ownerUid].sort();
            const conversationRef = firestore.collection('conversations');
            const conversationSnapshot = await conversationRef
                .where('participants', 'array-contains', user.uid)
                .get();

            let conversationId = null;
            conversationSnapshot.forEach(doc => {
                const data = doc.data();
                if (data.participants.includes(ownerUid)) {
                    conversationId = doc.id;
                }
            });

            if (!conversationId) {
                const newConversationRef = conversationRef.doc();
                await newConversationRef.set({
                    participants,
                    ownerFirstName: uploaderInfo.first_name,
                    ownerLastName: uploaderInfo.last_name,
                });
                conversationId = newConversationRef.id;
            }

            navigate(`/conversation/${conversationId}`);
        } catch (error) {
            console.error('Error creating or fetching conversation:', error);
        }
    };
    const handleMessageButtonClick = async () => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user && warehouse) {
                try {
                    const ownerUid = warehouse.userUid || warehouse.id;
                    if (!ownerUid) {
                        throw new Error('Owner UID is undefined');
                    }
                    await createOrGetConversation(user, ownerUid, uploaderInfo);
                } catch (error) {
                    console.error('Error handling message button click:', error);
                }
            }
            unsubscribe();
        });
    };


  
 

  

    const uploadDate = warehouse.uploadDate && warehouse.uploadDate.toDate ? warehouse.uploadDate.toDate() : new Date(warehouse.uploadDate.seconds * 1000);

    return (
        <div>
            <Navbar />
            <div className="bg-gray-100 min-h-screen flex flex-col justify-center items-center">
  <div className="container mx-auto px-4 py-8">
    <div className="bg-white rounded-2xl shadow-xl p-8 md:flex space-y-8 md:space-y-0 md:space-x-8">
      {/* Left Section with Carousel and Suggestions */}
      <div className="md:w-1/2 space-y-6">
        <Carousel showThumbs={false} showArrows={true} infiniteLoop={true} autoPlay={true} interval={5000} transitionTime={500}>
          {warehouse.images.map((imageUrl, index) => (
            <div key={index}>
              <img src={imageUrl} alt={`Warehouse Image ${index + 1}`} className="rounded-xl object-cover" />
            </div>
          ))}
        </Carousel>

        <button
          type="button"
          className="bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 w-full rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-1"
          onClick={() => handleShow360Tour(warehouse.image360Url)}
        >
          Show 360 Tour
        </button>

        <h2 className="text-xl font-semibold text-gray-800">Other Warehouses You Might Like</h2>
        {userWarehouses && userWarehouses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            {userWarehouses.map((warehouse, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-4 space-y-2">
                <Carousel showThumbs={false} showArrows={true} infiniteLoop={true} autoPlay={true} interval={5000} transitionTime={500}>
                  {warehouse.images.map((imageUrl, imageIndex) => (
                    <div key={imageIndex}>
                      <img src={imageUrl} alt={`Warehouse Image ${index + 1}`} className="rounded-lg object-cover" />
                    </div>
                  ))}
                </Carousel>
                <h3 className="text-lg font-semibold text-gray-900">{warehouse.name}</h3>
                <p className="text-gray-600">Lessor: {uploaderInfo ? `${uploaderInfo.first_name} ${uploaderInfo.last_name}` : 'Unknown'}</p>
                <p className="text-gray-800 font-semibold">Price: ₱{warehouse.price}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Section with Details */}
      <div className="md:w-1/2 md:pl-8 space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">{warehouse.name}</h1>
        <div className="text-lg"><strong>Lessor:</strong> {uploaderInfo ? `${uploaderInfo.first_name} ${uploaderInfo.last_name}` : 'Unknown'}</div>
        <div className="text-lg"><strong>Status:</strong> <span className="text-green-600 font-semibold">{warehouse.status}</span></div>
        <div className="text-lg"><strong>Address:</strong> {warehouse.address}</div>
        <div className="text-lg"><strong>Description:</strong> {warehouse.description}</div>
        <div className="text-lg"><strong>Price:</strong> ₱{warehouse.price}</div>
        <div className="text-lg"><strong>Created Date:</strong> {uploadDate ? new Date(uploadDate).toLocaleString() : 'Unknown'}</div>

        {/* Amenities Section */}
        <div className="text-lg font-semibold">Amenities:</div>
        <div className="grid grid-cols-2 gap-4">
          {warehouse.amenities.map((amenity, index) => (
            <div key={index} className="flex items-center bg-gray-100 rounded-lg p-2 shadow-sm">
              <img src={amenity.icon} alt={amenity.name} className="w-6 h-6 mr-2" />
              <span className="text-gray-800">{amenity.name}</span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-6">
          <button
            className="flex-1 bg-blue-500 text-white font-semibold py-3 rounded-lg hover:bg-blue-600 transition duration-300"
            onClick={handleRentButtonClick}
          >
            Rent
          </button>
          <button
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-1"
            onClick={handleMessageButtonClick}
          >
            Message
          </button>
        </div>
   
    



                        </div>
                    </div>
                       {/* Confirmation modal */}
            <ConfirmationModal show={showConfirmationModal} onClose={handleRentConfirmation} />
            
            {/* Owner notification modal */}
            <OwnerNotificationModal show={showOwnerNotificationModal} onClose={() => setShowOwnerNotificationModal(false)} />
            <div className="flex flex-col md:flex-row justify-between mt-8 space-y-6 md:space-y-0 md:space-x-8">
  <div className="w-full">
    <div className="text-lg font-semibold mb-2 text-gray-800">
      <strong>📍 LOCATION:</strong> {warehouse.address}
    </div>
    <div
      className="relative bg-white rounded-xl shadow-lg overflow-hidden"
      style={{ height: '600px', width: '100%' }}
    >
      {mapLoaded && (
        <MapContainer
          center={position}
          zoom={15}
          style={{
            height: '100%',
            width: '100%',
            borderRadius: 'inherit'
          }}
        >
          <TileLayer
            url="https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=aer2dxkMUVJORhqFpZiS"
          />
          <Marker
            position={position}
            draggable={true}
            icon={locationIcon}
            eventHandlers={{ dragend: handleMarkerMove }}
          >
            <Popup>{warehouse.address}</Popup>
          </Marker>
          <Circle center={position} radius={500} />
        </MapContainer>
      )}
      {/* Subtle shadow for floating effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-100 opacity-30 pointer-events-none" />
    </div>
    </div>

 




            
                  
                </div>
            </div>

           {/* Confirmation modal */}
           <ConfirmationModal show={showConfirmationModal} onClose={handleRentConfirmation} />
           {show360Modal && (
    <div className="modal" style={{ zIndex: 9999 }}> {/* Set a high z-index value */}
        <div className="modal-content">
            <span className="close" onClick={handleCloseModal}>×</span>
            <div id="panolens-container" style={{ width: '100%', height: '800px' }}></div>
            <button onClick={handleFullscreen}>Enter Fullscreen</button>
        </div>
    </div>
)}
        </div>
    </div>
);
};

export default DetailView;
