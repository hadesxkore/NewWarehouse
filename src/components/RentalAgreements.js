import React, { useState, useEffect } from 'react';
import { db, auth, firestore } from '../firebase'; // Import firebase and firestore
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { saveAs } from 'file-saver'; // Import saveAs function from file-saver library
import { jsPDF } from 'jspdf'; // Import jsPDF for PDF generation
import { HiX, HiCheckCircle, HiOutlineExclamation  } from 'react-icons/hi'; // Import the icons
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
    
                    // Automatically delete agreements whose end date has passed
                    allAgreements.forEach(async (agreement) => {
                        const currentDate = new Date();
                        const endDate = new Date(agreement.end_date); // Ensure it's a date object
    
                        // Check if the agreement's end date has passed
                        if (endDate < currentDate) {
                            try {
                                // Delete expired agreement from Firestore
                                await db.collection('rentalAgreement').doc(agreement.id).delete();
                                // Remove the agreement from the state
                                setRentalAgreements(prevAgreements => 
                                    prevAgreements.filter(a => a.id !== agreement.id)
                                );
                                console.log(`Agreement with ID ${agreement.id} has been automatically deleted because the end date has passed.`);
                            } catch (error) {
                                console.error('Error deleting expired agreement:', error);
                            }
                        }
                    });
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
        setSuccessMessage2(true);

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
Rent Amount: ₱${rentAmount.toLocaleString()} (${rentFrequency})
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

     // Function to convert to PDF
     const handleConvertToPDF = () => {
        if (!selectedAgreement) {
            alert('Please click the View button first.');
            return;
        }

        const doc = new jsPDF();

        const { warehouseName, lessorName, lesseeName, start_date, end_date, rentAmount, rentFrequency, depositAmount, terms } = selectedAgreement;

        // Add content to the PDF
        doc.setFontSize(18);
        doc.text('Rental Agreement', 20, 20);

        doc.setFontSize(14);
        doc.text(`Warehouse Name: ${warehouseName}`, 20, 40);
        doc.text(`Lessor Name: ${lessorName}`, 20, 50);
        doc.text(`Lessee Name: ${lesseeName}`, 20, 60);
        doc.text(`Start Date: ${new Date(start_date).toLocaleDateString()}`, 20, 70);
        doc.text(`End Date: ${new Date(end_date).toLocaleDateString()}`, 20, 80);
        doc.text(`Amount: ₱${rentAmount} (${rentFrequency})`, 20, 90);
        doc.text(`Deposit: ₱${depositAmount}`, 20, 100);

        // Terms Section
        doc.text('Terms:', 20, 120);
        const termsArr = terms.split('\n');
        termsArr.forEach((term, index) => {
            const lineHeight = 10;
            const yOffset = 130 + (index * lineHeight);
            doc.text(term, 20, yOffset);
        });

        // Save the PDF
        doc.save('rental_agreement.pdf');
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
                    <div className="bg-gray-100 p-4 rounded-lg">
                        <p className="text-gray-900 text-lg font-semibold">Lessor TIN Number:</p>
                        <p className="text-gray-700">{agreement.lessorTinNumber}</p>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg">
                        <p className="text-gray-900 text-lg font-semibold">Lessee TIN Number:</p>
                        <p className="text-gray-700">{agreement.lesseeTinNumber}</p>
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
                    <p className="text-gray-700">₱{agreement.rentAmount.toLocaleString()} {agreement.rentFrequency}</p>
                </div>
                    <div className="bg-gray-100 p-4 rounded-lg">
                    <p className="text-gray-900 text-lg font-semibold">Deposit Amount:</p>
                    <p className="text-gray-700">₱{agreement.depositAmount.toLocaleString()}</p>
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
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full">
            <div className="text-center mb-6">
                {/* Updated Icon */}
                <HiOutlineExclamation  className="text-yellow-500 text-6xl mb-4 mx-auto" />
                <p className="text-lg font-semibold text-gray-800">Are you sure you want to terminate this agreement?</p>
            </div>

            <textarea
                value={terminationReason}
                onChange={(e) => setTerminationReason(e.target.value)}
                className="block w-full border border-gray-300 rounded-md p-3 mb-4 focus:ring-2 focus:ring-red-500"
                rows="4"
                placeholder="Enter termination reason... (Optional)"
            ></textarea>

            <div className="flex justify-between mt-6">
                <button
                    onClick={() => setConfirmDeleteVisible(false)}
                    className="flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                    <HiX className="mr-2 text-xl" />
                    Cancel
                </button>

                <button
                    onClick={() => handleDelete(agreementToDelete)}
                    className="flex items-center justify-center bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                    <HiCheckCircle className="mr-2 text-xl" />
                    End Contract
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
                        End Contract
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
            <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md text-center">
                
                {/* Checkmark Icon Inside Modal */}
                <div className="flex justify-center items-center mb-6">
                    <div className="bg-green-500 rounded-full p-4 shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </div>

                {/* Success Text */}
                <p className="text-lg font-semibold mb-4 text-green-400">Termination successful!</p>
                <p className="mb-4">Termination Reason:</p>
                <p className="text-gray-700">{terminationReason}</p>
                
                {/* Close Button */}
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
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <div className="relative bg-white rounded-lg w-full max-w-5xl p-10 overflow-y-auto shadow-2xl transition-transform transform duration-300 ease-in-out max-h-[90vh]">
            <button
                className="absolute top-4 right-4 text-gray-700 hover:text-gray-900 text-3xl transition-colors duration-200"
                onClick={() => setModalVisible(false)}
            >
                &times;
            </button>

            <h2 className="text-4xl font-bold text-center text-gray-900 mb-6">LEASE CONTRACT</h2>
            
     {/* Pre-sample sentence about contract signing */}
<div className="mb-6 text-lg text-gray-700">
    <p className="text-center">
        This Lease Agreement is made and entered into by and between the LESSOR and LESSEE on the terms and conditions set forth below. The parties agree to the lease of the premises as described, and both acknowledge their mutual understanding and acceptance of the terms outlined herein.
    </p>
</div>

{/* Lessor and Lessee Details */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mb-8 text-lg">
    <div className='text-left'>
        <p className="font-semibold text-gray-800">LESSOR:</p>
        <p className="text-gray-800">{selectedAgreement?.lessorName}</p>
        <p className="text-gray-600">TIN Number: {selectedAgreement?.lessorTinNumber}</p>
    </div>
    <div className='text-right'>
        <p className="font-semibold text-gray-800">LESSEE:</p>
        <p className="text-gray-800">{selectedAgreement?.lesseeName}</p>
        <p className="text-gray-600">TIN Number: {selectedAgreement?.lesseeTinNumber}</p> {/* Assuming lesseeTinNumber exists */}
    </div>
</div>

            {/* Start Date, End Date, Amount, and Deposit */}
            <div className="grid grid-cols-2 gap-8 mb-6 text-lg">
                <div className="flex justify-between">
                    <p className="font-semibold text-gray-800">Start Date:</p>
                    <p>{new Date(selectedAgreement?.start_date).toLocaleDateString()}</p>
                </div>
                <div className="flex justify-between">
                    <p className="font-semibold text-gray-800">End Date:</p>
                    <p>{new Date(selectedAgreement?.end_date).toLocaleDateString()}</p>
                </div>
                <div className="flex justify-between">
                    <p className="font-semibold text-gray-800">Amount:</p>
                    <p>₱{selectedAgreement?.rentAmount?.toLocaleString()}</p> {/* Format rentAmount */}
                </div>
                <div className="flex justify-between">
                    <p className="font-semibold text-gray-800">Deposit:</p>
                    <p>₱{selectedAgreement?.depositAmount?.toLocaleString()}</p> {/* Format depositAmount */}
                </div>
            </div>

            {/* Lease Details */}
            <div className="mb-8">
                <p className="text-2xl font-semibold text-gray-900">WITNESSETH; That</p>
                <p className="mt-4 text-lg text-gray-700">
                    WHEREAS, the LESSOR is the owner of THE LEASED PREMISES, a residential property situated at {selectedAgreement?.warehouseAddress};
                </p>
                <p className="mt-4 text-lg text-gray-700">
                    WHEREAS, the LESSOR agrees to lease-out the property to the LESSEE and the LESSEE is willing to lease the same;
                </p>
            </div>

            {/* Terms */}
            <div className="mb-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Terms and Conditions</h3>
                <div className=" p-6  ">
                    {selectedAgreement.terms?.split('\n').map((term, index) => (
                        <p key={index} className="text-lg text-gray-700 mb-3">{term}</p>
                    ))}
                </div>
            </div>

            {/* Additional Information */}
            <div className="mb-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">AGREEMENT CONTEXT:</h3>
                <p className="text-lg text-gray-700">
                    This rental agreement contract establishes the leasing terms between the LESSOR and LESSEE as outlined above. Both parties agree to comply with the terms.
                </p>
            </div>

            {/* Signatures */}
            <div className="flex justify-between pt-6 border-t-4 border-gray-300 mt-10 text-lg">
                <div className="w-1/2 pr-8">
                    <div className="border-b-4 border-gray-400 mb-4 h-16"></div>
                    <p className="text-center text-lg text-gray-600">LESSOR SIGNATURE</p>
                </div>
                <div className="w-1/2 pl-8">
                    <div className="border-b-4 border-gray-400 mb-4 h-16"></div>
                    <p className="text-center text-lg text-gray-600">LESSEE SIGNATURE</p>
                </div>
            </div>

            <div className="mt-6 text-center">
                <p className="text-lg text-gray-600">Signed in the presence of:</p>
                <div className="flex justify-between mt-6 text-lg">
                    <div className="w-1/2">
                        <p className="border-b-4 border-gray-400 mb-4 h-16"></p>
                        <p className="text-center text-lg text-gray-600">Witness 1</p>
                    </div>
                    <div className="w-1/2">
                        <p className="border-b-4 border-gray-400 mb-4 h-16"></p>
                        <p className="text-center text-lg text-gray-600">Witness 2</p>
                    </div>
                </div>
            </div>

            {/* Acknowledgment */}
            <div className="mt-8 text-right">
                <p className="text-2xl font-semibold text-gray-900">ACKNOWLEDGMENT</p>
                <p className="mt-4 text-lg text-gray-700">Republic of the Philippines)</p>
                <p className="text-lg text-gray-700">______________________) S.S.</p>

                <div className="mt-4 text-left">
    <p className="text-lg text-gray-700">BEFORE ME, personally appeared:</p>
    <div className="space-y-2 mt-2">
        <p className="text-lg text-gray-700">Name: {selectedAgreement?.lessorName}</p>
        <p className="text-lg text-gray-700">CTC/ID Number: {selectedAgreement?.lessorTinNumber}</p>
    </div>
</div>

                
            </div>

            <p className="mt-4 text-lg text-gray-700">
                    Known to me and to me known to be the same persons who executed the foregoing instrument and acknowledged to me that the same is their free and voluntary act and deed.
                </p>

                <div className="text-gray-600 text-lg mt-6">
                <p>This CONTRACT OF LEASE is made and executed at the City of ____________________, this day of _____________________, 20____, by and between:</p>
            </div>
            <div className="mt-4 text-center">
                <p className="text-lg text-gray-700">This instrument consisting of ____ page/s, including the page with the signature of the parties.</p>
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
