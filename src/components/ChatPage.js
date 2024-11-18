import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Use useNavigate from React Router v6
import { firestore, auth } from '../firebase'; // Import Firebase's compat SDK methods

import Navbar from './Navbar';

const ChatPage = () => {
    const [conversations, setConversations] = useState([]);
    const [currentUser, setCurrentUser] = useState(null); // State to store the current user
    const navigate = useNavigate(); // For redirecting if the user is not authenticated

    useEffect(() => {
        // Fetch current user using Firebase Authentication
        const user = auth.currentUser;

        if (!user) {
            navigate('/login'); // Redirect to login page if not authenticated
        } else {
            setCurrentUser(user); // Set the current user if authenticated
        }
    }, [navigate]); // Re-run this effect if the user changes

    useEffect(() => {
        if (currentUser) {
            const loadConversations = async () => {
                try {
                    const conversationsSnapshot = await firestore.collection('conversations').get();
                    const conversationsData = await Promise.all(conversationsSnapshot.docs.map(async doc => {
                        const conversation = doc.data();
                        const participants = conversation.participants || [];

                        // Only show the conversation if the current user is a participant
                        if (!participants.includes(currentUser?.uid)) {
                            return null;  // Skip this conversation if the user is not a participant
                        }

                        // Get the latest message
                        const messagesSnapshot = await firestore.collection('conversations').doc(doc.id).collection('messages').orderBy('timestamp', 'desc').limit(1).get();
                        const latestMessageData = messagesSnapshot.docs.map(messageDoc => messageDoc.data())[0]; // Get the latest message

                        // Check if the current user is the sender
                        const isCurrentUserSender = latestMessageData.senderId === currentUser.uid;

                        // Get the other user's UID (if the current user is the sender, the other user is the recipient, and vice versa)
                        const otherUserUid = isCurrentUserSender ? conversation.participants.find(uid => uid !== currentUser.uid) : latestMessageData.senderId;

                        // Fetch the other user's profile information
                        const otherUserData = await firestore.collection('users').doc(otherUserUid).get();
                        const profileImage = otherUserData.exists ? otherUserData.data().profileImage : null;
                        const senderName = otherUserData.exists ? `${otherUserData.data().first_name} ${otherUserData.data().last_name}` : 'Unknown';

                        return { 
                            id: doc.id, 
                            ...conversation, 
                            latestMessage: latestMessageData, 
                            profileImage: profileImage,
                            senderName: senderName
                        };
                    }));

                    // Filter out null values (conversations the user shouldn't see)
                    setConversations(conversationsData.filter(convo => convo !== null));
                } catch (error) {
                    console.error('Error loading conversations:', error);
                }
            };

            loadConversations();
        }
    }, [currentUser]);  // Depend on currentUser to reload conversations if the user changes

    return (
        <div>
            <Navbar />
            <div className="flex h-screen overflow-hidden">
                {/* Sidebar with chat records */}
                <div className="w-1/4 bg-gray-200 px-4 py-6">
                    <h2 className="text-lg font-semibold mb-4">Chat Records</h2>
                    <div className="overflow-y-auto">
                        {conversations.map(conversation => (
                            <div key={conversation.id}>
                                <div className="py-2 px-4 bg-white shadow-md rounded-lg mb-2 hover:bg-gray-100 transition duration-300">
                                    <Link to={`/conversation/${conversation.id}`} className="block hover:text-blue-700">
                                        <div className="flex items-center">
                                            {conversation.profileImage && <img src={conversation.profileImage} alt="Profile" className="h-8 w-8 rounded-full mr-2" />}
                                            <p className="text-lg font-bold">{conversation.senderName || 'Unknown'}</p>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Main chat area */}
                <div className="flex flex-col flex-grow bg-gray-100">
                    <div className="px-4 py-6">
                        {/* Main chat content */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
