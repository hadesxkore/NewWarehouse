import React, { useState, useEffect } from 'react';
import { db, auth, firestore } from '../firebase'; // Import firebase and firestore
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { saveAs } from 'file-saver'; // Import saveAs function from file-saver library
import error1 from '../images/error1.png';
function RentalAgreements() {
    const [rentalAgreements, setRentalAgreements] = useState([]);
    const [selectedAgreement, setSelectedAgreement] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [successMessage, setSuccessMessage] = useState(false);
    const [successMessage2, setSuccessMessage2] = useState(false);
    const [deletionSuccessMessage, setDeletionSuccessMessage] = useState(false);
    const [agreementsCount, setAgreementsCount] = useState(0); // State to store the count of rental agreements
    const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
    const [agreementToDelete, setAgreementToDelete] = useState(null);
    const [terminationReason, setTerminationReason] = useState('');
    const [otherReasonModalVisible, setOtherReasonModalVisible] = useState(false);
    const [currentUserRole, setCurrentUserRole] = useState(''); // State to store current user role (lessor or lessee)
    const [unauthorizedDeleteVisible, setUnauthorizedDeleteVisible] = useState(false); // State for unauthorized delete modal


    const handleOtherReason = (agreementId) => {
        setAgreementToDelete(agreementId);
        setConfirmDeleteVisible(false); // Close delete confirmation modal
        setOtherReasonModalVisible(true); // Open other reason modal
    };

    const handleTerminate = async () => {
        try {
            if (!agreementToDelete) {
                console.error('No agreement ID provided for termination.');
                return;
            }
    
            await db.collection('rentalAgreement').doc(agreementToDelete).delete();
    
            // Remove the deleted agreement from the state
            setRentalAgreements(prevAgreements => prevAgreements.filter(agreement => agreement.id !== agreementToDelete));
    
            // Show success message modal
            setSuccessMessage2(true);
            setOtherReasonModalVisible(false);
    
            console.log('Termination successful. Agreement deleted.');
        } catch (error) {
            console.error('Error terminating agreement:', error);
        }
    };
    
    
    
    useEffect(() => {
        const currentUser = auth.currentUser;
        if (currentUser) {
            // Fetch agreements for both lessor (userUid) and lessee (userId)
            const lessorQuery = db.collection('rentalAgreement')
                .where('userId', '==', currentUser.uid);

            const lesseeQuery = db.collection('rentalAgreement')
                .where('userUid', '==', currentUser.uid);

            // Combine queries using Promise.all to wait for both to resolve
            Promise.all([lessorQuery.get(), lesseeQuery.get()])
                .then(([lessorSnapshot, lesseeSnapshot]) => {
                    const lessorAgreements = lessorSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    const lesseeAgreements = lesseeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    const allAgreements = [...lessorAgreements, ...lesseeAgreements];

                    setRentalAgreements(allAgreements);
                    setAgreementsCount(allAgreements.length); // Update the count of rental agreements

                    // Determine current user role (lessor or lessee)
                    if (lessorSnapshot.docs.length > 0) {
                        setCurrentUserRole('lessor');
                    } else if (lesseeSnapshot.docs.length > 0) {
                        setCurrentUserRole('lessee');
                    }
                })
                .catch((error) => {
                    console.error('Error fetching rental agreements: ', error);
                });
        }
    }, []);

    const showConfirmDeleteModal = (agreementId) => {
        setAgreementToDelete(agreementId);
        setConfirmDeleteVisible(true);
    };

    const handleDelete = (agreementId) => {
        // Check if the current user is the lessor to allow deletion
        if (currentUserRole !== 'lessor') {
            // Show unauthorized delete modal
            setUnauthorizedDeleteVisible(true);
            setConfirmDeleteVisible(false);
            return;
        }

        // Get a reference to the document
        const agreementRef = db.collection('rentalAgreement').doc(agreementId);

        // Delete the document
        agreementRef.delete()
            .then(() => {
                // Update the state with the updated rental agreements after deletion
                const updatedAgreements = rentalAgreements.filter(agreement => agreement.id !== agreementId);
                setRentalAgreements(updatedAgreements);
                setDeletionSuccessMessage(true); // Show success message
                setTimeout(() => setDeletionSuccessMessage(false), 2000); // Hide message after 2 seconds
            })
            .catch((error) => {
                console.error('Error deleting document: ', error);
            });

        setConfirmDeleteVisible(false); // Hide the confirmation modal
    };

    const handleViewClick = (agreement) => {
        setSelectedAgreement(agreement);
        setModalVisible(true);
    };

    // Function to generate Word file
    const handleConvertToWord = () => {
        if (!selectedAgreement) {
            alert('Please click the View button first.');
            return;
        }

        // Extract selected agreement data
        const {
            warehouseName,
            lessorName,
            lesseeName,
            start_date,
            end_date,
            rentAmount,
            rentFrequency,
            depositAmount,
            terms
        } = selectedAgreement;

        // Create a string representing the content of the Word document
        const wordContent = `
        Rental Agreement
        Warehouse Name: ${warehouseName}
        Lessor Name: ${lessorName}
        Lessee Name: ${lesseeName}
        Start Date: ${new Date(start_date).toLocaleDateString()}
        End Date: ${new Date(end_date).toLocaleDateString()}
        Rent Amount: ₱${rentAmount} (${rentFrequency})
        Deposit Amount: ₱${depositAmount}
        Terms: ${terms}
        `;

        // Save the Blob as a Word file
        const blob = new Blob([wordContent], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, 'rental_agreement.doc');

        // Show success message
        setSuccessMessage(true);
        setTimeout(() => setSuccessMessage(false), 3000); // Hide message after 3 seconds
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex flex-grow">
                <Sidebar />
                <div className="flex-grow p-4">
                    <h2 className="text-3xl font-semibold mb-8 text-center">Rental Agreements</h2>

                    <p className="text-lg mb-4 text-left ml-10 mt-4">Total Agreements: {agreementsCount}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ml-10">
                        {rentalAgreements.map(agreement => (
                            <div key={agreement.id} className="rounded-lg overflow-hidden shadow-md bg-white">
                                <div className="p-6">
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="bg-gray-100 p-4 rounded-lg">
                                            <p className="text-gray-900 text-lg font-semibold">Lessor Name:</p>
                                            <p className="text-gray-700">{agreement.lessorName}</p>
                                        </div>
                                        <div className="bg-gray-100 p-4 rounded-lg">
                                            <p className="text-gray-900 text-lg font-semibold">Lessee Name:</p>
                                            <p className="text-gray-700">{agreement.lesseeName}</p>
                                        </div>
                                        <div className="col-span-2 bg-gray-100 p-4 rounded-lg">
                                            <p className="text-gray-900 text-lg font-semibold">Warehouse Name:</p>
                                            <p className="text-gray-700">{agreement.warehouseName}</p>
                                        </div>
                                        <div className="bg-gray-100 p-4 rounded-lg">
                                            <p className="text-gray-900 text-lg font-semibold">Start Date:</p>
                                            <p className="text-gray-700">{new Date(agreement.start_date).toLocaleDateString()}</p>
                                        </div>
                                        <div className="bg-gray-100 p-4 rounded-lg">
                                            <p className="text-gray-900 text-lg font-semibold">End Date:</p>
                                            <p className="text-gray-700">{new Date(agreement.end_date).toLocaleDateString()}</p>
                                        </div>
                                        <div className="bg-gray-100 p-4 rounded-lg">
                                            <p className="text-gray-900 text-lg font-semibold">Rent Amount:</p>
                                            <p className="text-gray-700">₱{agreement.rentAmount} {agreement.rentFrequency}</p>
                                        </div>
                                        <div className="bg-gray-100 p-4 rounded-lg">
                                            <p className="text-gray-900 text-lg font-semibold">Deposit Amount:</p>
                                            <p className="text-gray-700">₱{agreement.depositAmount}</p>
                                        </div>
                                        <div className="col-span-2 bg-gray-100 p-4 rounded-lg">
                                            <p className="text-gray-900 text-lg font-semibold">Terms:</p>
                                            <p className="text-gray-700">{agreement.terms.length > 55 ? `${agreement.terms.slice(0, 55)}...` : agreement.terms}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-center">
                                        <button
                                            onClick={() => handleViewClick(agreement)}
                                            className="bg-blue-500 text-white rounded-md px-6 py-2 mr-2 hover:bg-blue-600 transition duration-300"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={handleConvertToWord}
                                            className="bg-green-500 text-white rounded-md px-6 py-2 mr-2 hover:bg-green-600 transition duration-300"
                                        >
                                            Convert to Word
                                        </button>
                                        <button
                                            onClick={() => showConfirmDeleteModal(agreement.id)}
                                            className="bg-red-500 text-white rounded-md px-6 py-2 hover:bg-red-600 transition duration-300"
                                        >
                                            Terminate
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {confirmDeleteVisible && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
                    <div className="absolute bg-white rounded-lg shadow-md p-8 y-8">
                        <p className="mb-4 text-center text-lg">Are you sure you want to terminate this agreement?</p>
                        <div className="flex justify-center mt-6">
                            <button
                                onClick={() => setConfirmDeleteVisible(false)}
                                className="mr-2 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(agreementToDelete)}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                            >
                                End Contract
                            </button>
                            <button
                                onClick={() => handleOtherReason(agreementToDelete)}
                                className="ml-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                            >
                                Other
                            </button>
                        </div>
                    </div>
                </div>
            )}
                 {otherReasonModalVisible && (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
                <p className="mb-4 text-center text-lg">Enter termination reason:</p>
                <textarea
                    value={terminationReason}
                    onChange={(e) => setTerminationReason(e.target.value)}
                    className="block w-full border border-gray-300 rounded-md p-2 mb-4"
                    rows="4"
                    placeholder="Enter reason..."
                ></textarea>
                <div className="flex justify-center">
                    <button
                        onClick={() => setOtherReasonModalVisible(false)}
                        className="mr-2 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleTerminate}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                    >
                        Terminate Agreement
                    </button>
                </div>
            </div>
        </div>
    </div>
)}

{unauthorizedDeleteVisible && (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-50 bg-gray-900 bg-opacity-50">
        <div className="absolute bg-white rounded-lg shadow-md p-4 max-w-md">
            <div className="flex flex-col items-center">
                <img src={error1} alt="Error Icon" className="w-14 h-14 mb-2" />
                <p className="font-semibold mb-4 text-center text-xl mt-2">You are not authorized to delete this agreement.</p>
            </div>
            <div className="flex justify-center mt-2">
                <button onClick={() => setUnauthorizedDeleteVisible(false)} className="bg-red-500 text-white font-semibold py-2 px-8 rounded hover:bg-red-600">
                    Close
                </button>
            </div>
        </div>
    </div>
)}

                    {deletionSuccessMessage && (
                        <div className="fixed top-4 right-4 bg-green-500 text-white py-2 px-4 rounded-lg shadow-md">
                            Deletion successful!
                        </div>
                    )}




{successMessage2 && (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
                <p className="text-lg font-semibold mb-4 text-green-400 text-center">Termination successful!</p>
                <p className="mb-4 text-center">Termination Reason:</p>
                <p className="text-gray-700 text-center">{terminationReason}</p>
                <div className="flex justify-center mt-6">
                    <button
                        onClick={() => setSuccessMessage2(false)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    </div>
)}
       {modalVisible && (
                        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
                            <div className="absolute inset-0 flex items-center justify-center z-60">
                                <div className="relative bg-white rounded-lg shadow-md p-4 max-w-3xl max-h-full overflow-y-auto">
                                    <button
                                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                                        onClick={() => setModalVisible(false)}
                                    >
                                        &times;
                                    </button>
                                    <h2 className="text-xl font-semibold mb-4 text-center">Rental Agreement</h2>
                                    <div className="border-b border-gray-400 mb-4"></div>
                                    <div className="flex justify-center mb-4">
                                        <div className="border border-gray-400 rounded-full px-2 py-1 text-lg font-semibold">
                                            {selectedAgreement?.warehouseName}
                                        </div>
                                    </div>
                                    <div className="flex mb-4 justify-end">
                                        <p className="font-semibold mr-4">Lessor Name:</p>
                                        <p>{selectedAgreement?.lessorName}</p>
                                    </div>
                                    <div className="flex justify-end mb-4">
                                        <p className="font-semibold mr-4">Lessee Name:</p>
                                        <p>{selectedAgreement?.lesseeName}</p>
                                    </div>
                                    <div className="border-b border-gray-400 mb-4"></div>
                                    <div className="flex justify-between mb-4">
                                        <p className="font-semibold">Start Date:</p>
                                        <p>{new Date(selectedAgreement?.start_date).toLocaleDateString()}</p>
                                        <p className="font-semibold">End Date:</p>
                                        <p>{new Date(selectedAgreement?.end_date).toLocaleDateString()}</p>
                                        <p className="font-semibold">Amount:</p>
                                        <p>₱{selectedAgreement?.rentAmount} ({selectedAgreement?.rentFrequency})</p>
                                        <p className="font-semibold">Deposit:</p>
                                        <p>₱{selectedAgreement?.depositAmount}</p>
                                    </div>
                                    <div className="border-b border-gray-400 mb-4"></div>
                                    <div className="mb-4">
                                        <p className="font-semibold mb-2">Terms:</p>
                                        <div className="pl-4 text-justify">
                                            <p style={{ textIndent: '3em' }}>{selectedAgreement?.terms}</p>
                                        </div>
                                    </div>
                                    <div className="flex mt-20">
                                        <div className="text-right">
                                            <hr className="mt-1 mb-1 border-gray-400" />
                                            <p>Lessee Signature</p>
                                        </div>
                                    </div>
                                    <div className="flex mt-10">
                                        <div className="text-right">
                                            <hr className="mt-1 mb-1 border-gray-400" />
                                            <p>Lessor Signature</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {successMessage && (
                        <div className="fixed top-4 right-4 bg-green-500 text-white py-2 px-4 rounded-lg shadow-md">
                            Download successful!
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

export default RentalAgreements;
