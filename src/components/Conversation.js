import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { firestore, auth, storage } from '../firebase';
import Navbar from './Navbar';
import './Chat.css';
import locationIcon from '../images/location.png';
import emailIcon from '../images/gmail.png';
import phoneIcon from '../images/phone.png';
import fileIcon from '../images/attach-file.png';
import editMessageIcon from '../images/editmessage.png';
import moreIcon from '../images/more.png';
import documentIcon from '../images/document.png';
import deleteIcon from '../images/delete.png';
import sendIcon from '../images/send-message.png';

const Conversation = () => {
    const { conversationId } = useParams();
    const [conversation, setConversation] = useState(null);
    const [messageInput, setMessageInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [ownerInfo, setOwnerInfo] = useState(null); // Owner's additional information
    const [ownerRole, setOwnerRole] = useState(''); // New state for owner role

    const [imageUrl, setImageUrl] = useState('');
    const [deleteMessageId, setDeleteMessageId] = useState(null); // Track message ID for deletion confirmation
    const [moreMessageId, setMoreMessageId] = useState(null); // Track message ID for more options
    
    const messagesEndRef = useRef(null);

    const loadConversation = async () => {
        try {
            const conversationRef = firestore.collection('conversations').doc(conversationId);
            const conversationSnapshot = await conversationRef.get();
            if (conversationSnapshot.exists) {
                const conversationData = conversationSnapshot.data();
                setConversation(conversationData);

                // Determine the role based on rentedWarehouses collection
                const ownerParticipantId = conversationData.participants.find(participant => participant !== currentUserId);
                const rentedWarehousesRef = firestore.collection('rentedWarehouses');
                const rentedWarehousesSnapshot = await rentedWarehousesRef.where('ownerUid', '==', ownerParticipantId).get();
                
                if (!rentedWarehousesSnapshot.empty) {
                    setOwnerRole('Lessor');
                } else {
                    setOwnerRole('Lessee');
                }

                const ownerRef = firestore.collection('users').doc(ownerParticipantId);
                const ownerSnapshot = await ownerRef.get();
                if (ownerSnapshot.exists) {
                    const ownerData = ownerSnapshot.data();
                    setOwnerInfo(ownerData);
                } else {
                    console.error('Owner not found');
                }

                const messagesSnapshot = await conversationRef.collection('messages').orderBy('timestamp', 'asc').get();
                const messagesData = messagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setMessages(messagesData);
            } else {
                console.error('Conversation not found');
            }
        } catch (error) {
            console.error('Error loading conversation:', error);
        }
    };

    const sendMessage = async () => {
        try {
            if (!currentUserId) {
                console.error('Current user ID is not set');
                return;
            }

            const userDoc = await firestore.collection('users').doc(currentUserId).get();
            if (!userDoc.exists) {
                console.error('User not found');
                return;
            }
            const userData = userDoc.data();
            const senderProfile = {
                firstName: userData.first_name,
                lastName: userData.last_name,
                profileImage: userData.profileImage
            };

            const messageData = {
                senderId: currentUserId,
                senderName: `${userData.first_name} ${userData.last_name}`,
                senderProfile: senderProfile,
                text: messageInput,
                timestamp: new Date(),
                type: 'text'
            };
            await firestore.collection('conversations').doc(conversationId).collection('messages').add(messageData);
            setMessageInput('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const getFileType = (fileName) => {
        const extension = fileName.split('.').pop().toLowerCase();
        switch (extension) {
            case 'jpg':
            case 'jpeg':
            case 'png':
                return 'image';
            case 'pdf':
                return 'pdf';
            case 'docx':
                return 'docx';
            default:
                return 'unknown';
        }
    };

    const handleFileUpload = async (e) => {
        try {
            const file = e.target.files[0];
            const storageRef = storage.ref();
            const fileRef = storageRef.child(file.name);
            await fileRef.put(file);
            const fileURL = await fileRef.getDownloadURL();
            const fileType = getFileType(file.name);
            const userDoc = await firestore.collection('users').doc(currentUserId).get();
            const userData = userDoc.data();

            const messageData = {
                senderId: currentUserId,
                senderName: `${userData.first_name} ${userData.last_name}`,
                text: 'File uploaded',
                fileURL: fileURL,
                fileName: file.name,
                fileType: fileType,
                timestamp: new Date(),
                type: 'file'
            };
            await firestore.collection('conversations').doc(conversationId).collection('messages').add(messageData);
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    const deleteMessage = async (messageId) => {
        setDeleteMessageId(messageId); // Set message ID for deletion confirmation
    };

    const confirmDeleteMessage = async () => {
        try {
            // Log currentUserId for debugging
            console.log('Current User ID:', currentUserId);
            
            // Find the message by ID
            const message = messages.find(message => message.id === deleteMessageId);
            if (!message) {
                console.error('Message not found');
                return;
            }
            
            // Log senderId of the message for debugging
            console.log('Sender ID:', message.senderId);
    
            // Delete the message if the senderId matches the currentUserId
            if (message.senderId === currentUserId) {
                await firestore.collection('conversations').doc(conversationId)
                    .collection('messages').doc(deleteMessageId).delete();
                console.log('Message deleted successfully');
                
                // Update messages state after deleting the message
                setMessages(prevMessages => prevMessages.filter(message => message.id !== deleteMessageId));
            } else {
                console.error('You are not authorized to delete this message');
            }
        } catch (error) {
            console.error('Error deleting message:', error);
        } finally {
            setDeleteMessageId(null); // Reset deleteMessageId after deletion
        }
    };

    const toggleMoreOptions = (messageId) => {
        if (moreMessageId === messageId) {
            setMoreMessageId(null);
        } else {
            setMoreMessageId(messageId);
        }
    };
    const handleEditMessage = async (messageId) => {
        try {
            // Find the message by ID
            const messageToEdit = messages.find(message => message.id === messageId);
            if (!messageToEdit) {
                console.error('Message not found');
                return;
            }

            // Prompt the user to edit the message
            const editedMessageInput = prompt('Edit your message:', messageToEdit.text);
            if (editedMessageInput === null) {
                // User clicked cancel
                return;
            }

            // Update the message in Firestore
            await firestore.collection('conversations').doc(conversationId)
                .collection('messages').doc(messageId).update({ text: editedMessageInput });
            console.log('Message edited successfully');

            // Update the message in the state
            setMessages(prevMessages =>
                prevMessages.map(message =>
                    message.id === messageId ? { ...message, text: editedMessageInput } : message
                )
            );
        } catch (error) {
            console.error('Error editing message:', error);
        }
    };

    useEffect(() => {
        loadConversation();

        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                setCurrentUserId(user.uid);
            } else {
                setCurrentUserId(null);
            }
        });

        const messagesRef = firestore.collection('conversations').doc(conversationId).collection('messages').orderBy('timestamp', 'asc');
        const unsubscribeMessages = messagesRef.onSnapshot(snapshot => {
            const messagesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); // Add 'id' field to each message
            setMessages(messagesData);
            scrollToBottom();
        });

        return () => {
            unsubscribe();
            unsubscribeMessages();
        };
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div>
            <Navbar />
            
            <div className="flex flex-col md:flex-row h-screen overflow-hidden">
    <div className="md:w-1/3 bg-gray-200 rounded-lg px-4 py-6 md:px-8 md:py-10 h-full md:max-h-screen md:overflow-auto">
        <h2 className="text-xl md:text-3xl font-semibold mb-4">{ownerInfo ? `${ownerInfo.first_name}'s Information` : 'Owner Information'}</h2>
     
        <div className="bg-white rounded-lg p-4 md:p-6 space-y-4">
            {ownerInfo ? (
                <>
                    <div className="flex items-center space-x-4">
                        <img src={ownerInfo.profileImage} alt="Profile" className="w-12 h-12 md:w-16 md:h-16 rounded-full" />
                        <div>
                                <p className="text-base md:text-2xl font-semibold">{`${ownerInfo.first_name} ${ownerInfo.last_name}`}</p>
                                <p className="text-sm md:text-xl text-gray-700">{`(${ownerRole})`}</p>
                            <p className="text-sm md:text-xl text-gray-700">{ownerInfo.email}</p>
                        </div>
                    </div>
                    <div className="border-t border-gray-300 pt-4">
                        <p className="text-base md:text-2xl text-gray-700 font-semibold">Additional Information:</p>
                        <div className="flex items-center text-sm md:text-base text-gray-700">
                            <img src={locationIcon} alt="Location" className="w-4 h-4 md:w-6 md:h-6 mr-2" />
                            <span className="font-semibold">Address:</span> {ownerInfo.address || 'Not available'}
                        </div>
                        <div className="flex items-center text-sm md:text-base text-gray-700">
                            <img src={emailIcon} alt="Email" className="w-4 h-4 md:w-6 md:h-6 mr-2" />
                            <span className="font-semibold">Email:</span>
                            <a href={`mailto:${ownerInfo.email}`} className="ml-1 email-link underline text-blue-700">
                                {ownerInfo.email || 'Not available'}
                            </a>
                        </div>
                        <div className="flex items-center text-sm md:text-base text-gray-700">
                            <img src={phoneIcon} alt="Phone" className="w-4 h-4 md:w-6 md:h-6 mr-2" />
                            <span className="font-semibold">Contact Number:</span>
                            <a href={`tel:${ownerInfo.contact_number}`} className="ml-1 phone-link underline text-blue-700">
                                {ownerInfo.contact_number || 'Not available'}
                            </a>
                        </div>
                    </div>
                </>
            ) : (
                <p className="text-base md:text-2xl">Loading...</p>
            )}
        </div>
    </div>


    <div className="flex flex-col flex-grow bg-gray-100 chat-container h-full">
    <div className="chat-content overflow-y-auto px-2 md:px-4 py-4 md:py-6">
    {messages.length === 0 && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-4 ml-80">
                <p className="text-xl text-gray-700 font-semibold mb-4 text-center">Start a conversation</p>
            </div>
        )}
        {messages.map((message, index) => (
            <div key={index} className={`mb-4 relative ${message.senderId === currentUserId ? 'text-right' : 'text-left'}`}>
                <div className={`relative ${message.senderId === currentUserId ?'bg-white text-gray-800' : 'bg-blue-400 text-white'} p-4 rounded-lg inline-block`}>
                    {message.type === 'text' && (
                        <p className="text-xl">{message.text}</p>
                    )}
                   {message.type === 'file' && message.fileType === 'image' && (
                        <div>
                            <img
                                src={message.fileURL}
                                alt="Uploaded File"
                                className="w-32 h-32 cursor-pointer"
                                onClick={() => {
                                    setModalVisible(true);
                                    setImageUrl(message.fileURL);
                                }}
                            />
                             {modalVisible && imageUrl === message.fileURL && (
                                <div className="modal-overlay">
                                    <div className="modal-content">
                                        <img src={message.fileURL} alt="Uploaded File" className="max-w-full max-h-full mx-auto" />
                                        <div className="button-container mt-4 flex justify-center">
                                            <button className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-full hover:bg-blue-600 transition duration-300 mr-2" onClick={() => setModalVisible(false)}>Close</button>
                                            <a href={message.fileURL} download={message.fileName} target="_blank" rel="noopener noreferrer" className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-full hover:bg-blue-600 transition duration-300 ml-2">Download</a>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {message.type === 'file' && (message.fileType === 'pdf' || message.fileType === 'docx') && (
                        <div>
                            <a href={message.fileURL} download={message.fileName} target="_blank" rel="noopener noreferrer" className="file-link">
                                <img src={documentIcon} alt="File Icon" className="w-6 h-6 md:w-7 md:h-7 mr-2" />
                                <span className="file-name">{message.fileName} ({message.fileType})</span>
                            </a>
                        </div>
                    )}
                    <div className="flex items-center mt-1">
                        {message.senderProfile ? (
                            <>
                                <img src={message.senderProfile.profileImage} alt="Profile" className="w-8 h-8 md:w-10 md:h-10 rounded-full mr-2" />
                                <span className="text-sm font-semibold">{`${message.senderProfile.firstName} ${message.senderProfile.lastName}`}</span>
                            </>
                        ) : null}
                    </div>
                </div>
                {message.senderId === currentUserId && (
                    <div className="relative flex items-center ml-4">
                        {moreMessageId === message.id && (
                            <div className="absolute top-0 -right-8 mb-8 mr-8 bg-white rounded-lg shadow-lg">
                                <button className="block w-full text-left px-4 py-2 hover:bg-gray-200" onClick={() => handleEditMessage(message.id)}>
                                    <img src={editMessageIcon} alt="Edit" className="inline-block w-4 h-4 md:w-5 md:h-5 mr-2" />
                                    Edit
                                </button>
                                <button className="block w-full text-left px-4 py-2 hover:bg-red-200" onClick={() => deleteMessage(message.id)}>
                                    <img src={deleteIcon} alt="Delete" className="inline-block w-4 h-4 md:w-5 md:h-5 mr-2" />
                                    Delete
                                </button>
                            </div>
                        )}
                        <button className="absolute bottom-0 right-2 mb-2 mr-2 text-gray-500 hover:text-gray-700 focus:outline-none" onClick={() => toggleMoreOptions(message.id)}>
                            <img src={moreIcon} alt="More" className="w-6 h-6 md:w-7 md:h-7" />
                        </button>
                    </div>
                )}
            </div>
        ))}
        <div ref={messagesEndRef} />
    </div>
    <div className="flex items-center bg-white px-4 py-3 rounded-full">
        <input
            type="text"
            className="flex-grow border border-gray-300 rounded-full py-2 px-4 mr-4 focus:outline-none"
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
        />
        <label htmlFor="file-upload" className="flex items-center cursor-pointer">
            <img src={fileIcon} alt="File Icon" className="w-6 h-6 mr-2 " />
            <input id="file-upload" type="file" className="hidden" onChange={handleFileUpload} />
        </label>
        <button
    className=" text-white font-semibold py-2 px-4 md:py-3 md:px-6 rounded-full hover:bg-gray-200 transition duration-300"
    onClick={sendMessage}
>
    <img src={sendIcon} alt="Send" className="w-6 h-6 " />
</button>
    </div>
</div>

            </div>
            {/* Confirmation dialog */}
            {deleteMessageId && (
                <div className="modal-overlay">
                    <div className="confirmation-dialog">
                        <p className="text-xl mb-4">Are you sure you want to delete this message?</p>
                        <div className="button-container">
                            <button className="confirm-button" onClick={confirmDeleteMessage}>Yes</button>
                            <button className="cancel-button" onClick={() => setDeleteMessageId(null)}>No</button>
                        </div>
                    </div>
                </div>
            )}
                
        </div>
        
    );
};

export default Conversation;
