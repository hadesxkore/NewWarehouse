import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, renderMatches } from 'react-router-dom';
import { db, auth } from '../firebase';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import error1 from '../images/error1.png';
function CreateAgreement() {
    const navigate = useNavigate();
    const location = useLocation();
    const initialFormData = location.state?.warehouse || {};

    const [error, setError] = useState(null); // State for error message
    const [showErrorModal, setShowErrorModal] = useState(false); // State for showing error modal
    const [hasUploadedWarehouses, setHasUploadedWarehouses] = useState(false); // State to track if user has uploaded warehouses
    const [showEditModal, setShowEditModal] = useState(false); // State for showing edit modal
    const [editableTerms, setEditableTerms] = useState(''); // State for editable terms
    const [formData, setFormData] = useState({
        warehouse_id: initialFormData.id || '',
        warehouseName: initialFormData.name || '',
        lesseeName: initialFormData.rentedBy ? `${initialFormData.rentedBy.firstName} ${initialFormData.rentedBy.lastName}` : '',
        lessorName: `${initialFormData.ownerFirstName} ${initialFormData.ownerLastName}` || '',
        lessee_id: initialFormData.rentedBy ? initialFormData.rentedBy.id : '',
        start_date: '',
        end_date: '',
        rentAmount: initialFormData.price || 0, // Default to 0 if price is not available
        rentFrequency: 'monthly',
        depositAmount: initialFormData.depositAmount || 0, // Default to 0 if depositAmount is not available
        terms: '',
        lessorTinNumber: initialFormData.owner ? initialFormData.owner.tinNumber : '',  // Access the tinNumber from the owner object
        lesseeTinNumber: initialFormData.rentedBy ? initialFormData.rentedBy.tinNumber : ''  // Assuming you have this in the rentedBy data
    });
    

    useEffect(() => {
        if (initialFormData) {
            setFormData(initialFormData);
        }
    }, [initialFormData]);

   // Define calculateMonthDifference outside handleChange
const calculateMonthDifference = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const years = end.getFullYear() - start.getFullYear();
    const months = (years * 12) + (end.getMonth() - start.getMonth());
    return months + 1; // +1 to include the start month in the calculation
};

const handleChange = (e) => {
    const { name, value } = e.target;

    // Update the form data
    const updatedFormData = {
        ...formData,
        [name]: value
    };

    // Calculate the RentAmount if start_date or end_date changes
    if (name === "start_date" || name === "end_date") {
        const { start_date, end_date } = updatedFormData;

        if (start_date && end_date) {
            const months = calculateMonthDifference(start_date, end_date);
            const baseRentAmount = parseFloat(initialFormData.price) || 0; // Use the base rent amount from initialFormData
            const rentAmount = baseRentAmount * months;

            updatedFormData.rentAmount = rentAmount;
            updatedFormData.depositAmount = rentAmount * 0.5; // Set deposit amount to 50% of rent amount
        }
    } else if (name === "price") {
        // Update rentAmount and depositAmount when price changes
        const baseRentAmount = parseFloat(value) || 0;
        const { start_date, end_date } = updatedFormData;

        if (start_date && end_date) {
            const months = calculateMonthDifference(start_date, end_date);
            const rentAmount = baseRentAmount * months;

            updatedFormData.rentAmount = rentAmount;
            updatedFormData.depositAmount = rentAmount * 0.5; // Set deposit amount to 50% of rent amount
        } else {
            updatedFormData.rentAmount = baseRentAmount * (updatedFormData.months || 1);
            updatedFormData.depositAmount = updatedFormData.rentAmount * 0.5;
        }
    }

    // Update the state with the new form data
    setFormData(updatedFormData);
};

    useEffect(() => {
        const checkUserWarehouses = async () => {
            try {
                const currentUser = auth.currentUser;
                if (currentUser) {
                    const warehousesSnapshot = await db.collection('warehouses')
                        .where('userUid', '==', currentUser.uid)
                        .get();

                    if (!warehousesSnapshot.empty) {
                        setHasUploadedWarehouses(true); // User has uploaded warehouses
                    }
                }
            } catch (error) {
                console.error('Error checking user warehouses: ', error);
            }
        };

        checkUserWarehouses();
    }, []);
    
     // Check if the agreement duration is less than 6 months
     const isDurationLessThanSixMonths = () => {
        const { start_date, end_date } = formData;
        const months = calculateMonthDifference(start_date, end_date);
        return months < 6;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const currentUser = auth.currentUser;
    
            if (!currentUser) {
                console.error('User is not authenticated.');
                return;
            }
    
            // Check if the current user has uploaded warehouses
            const warehousesSnapshot = await db.collection('warehouses')
                .where('userUid', '==', currentUser.uid)
                .get();
    
            if (warehousesSnapshot.empty) {
                setError('Rental agreements can only be created by lessors who have uploaded warehouses.');
                setShowErrorModal(true); // Show modal
                return;
            }
    
            // Validate the duration
            if (isDurationLessThanSixMonths()) {
                setError('The rental agreement must be at least 6 months long.');
                setShowErrorModal(true);
                return;
            }
    
            const { start_date, end_date, rentFrequency, rentAmount, depositAmount, warehouseId } = formData;
            const startDate = new Date(start_date);
            const endDate = new Date(end_date);
            const daysDiff = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)); // Calculate difference in days
    
            if (daysDiff < 30) {
                setError('Agreement duration must be at least 30 days.');
                setShowErrorModal(true); // Show modal
                return;
            }
    
            if (rentFrequency === 'yearly' && daysDiff < 365) {
                setError('Yearly rent period requires a duration of at least 365 days (1 year).');
                setShowErrorModal(true); // Show modal
                return;
            }
    
            if (parseInt(depositAmount) > parseInt(rentAmount)) {
                setError('Deposit amount cannot be greater than rent amount.');
                setShowErrorModal(true); // Show modal
                return;
            }
    
            // Terms
            const terms = `
                Terms and Conditions
                1. Description of the Premises
                This Rental Agreement has been signed by the parties for the purpose of leasing the property at the address stated above. The leased property under this Agreement can only be used for residential purposes.
    
                2. Term of the Agreement
                The commencement date of the Rental Agreement is ${start_date} and the expiration date is ${end_date}.
    
                This contract expires automatically at the end of this period. The parties may decide to continue the lease under the same conditions, or they may sign a new agreement.
    
                3. Rent and Payment Method
                The monthly rental fee under this Agreement is ${formData.rentAmount.toLocaleString()}. This amount shall be paid in cash at the latest on the fifth of each month, and through the bank.
    
                4. Security Deposit
                Security deposit of ${depositAmount ? depositAmount.toLocaleString() : ''} shall be paid to Lessor at the date of signature of this Agreement. After the expiry of the Agreement, the deposit shall be refunded after the inspection to be made on the leased property. Damages and losses incurred on the real estate and the fixtures to be listed below are set off from the deposit.
    
                5. Fixtures and Maintenance
                Lessee shall maintain leased property and the fixtures in good order, repair, and appearance, and repair parts of leased property including without limitation, all interior and exterior, replacements to the roof, foundations, exterior walls, building systems, HVAC systems, parking areas, sidewalks, water, sewer and gas connections, and pipes.
            `;
    
            // Add rental agreement to Firestore
            const agreementData = {
                ...formData,
                terms: editableTerms, // Update terms with editableTerms
                userId: currentUser.uid,
            };
    
            const agreementRef = await db.collection('rentalAgreement').add(agreementData);
    
            // Use warehouseId from the created rental agreement to update rentedWarehouses
            const warehouseIdInAgreement = agreementData.warehouseId;
    
            const rentedWarehouseRef = db.collection('rentedWarehouses').doc(warehouseIdInAgreement);
            await rentedWarehouseRef.update({
                transactionStatus: "Status: Ready for Meet-Up",
            });
    
            console.log(`Rental agreement created with ID: ${agreementRef.id}`);
            console.log(`Transaction status updated to 'Status: Ready for Meet-Up'.`);
    
            navigate('/rental-agreements');
        } catch (error) {
            console.error('Error creating rental agreement: ', error);
            setError('Error creating rental agreement. Please try again later.');
            setShowErrorModal(true); // Show modal
        }
    };
    
useEffect(() => {
    const checkUserWarehouses = async () => {
        try {
            const currentUser = auth.currentUser;
            if (currentUser) {
                const warehousesSnapshot = await db.collection('warehouses')
                    .where('userUid', '==', currentUser.uid)
                    .get();

                if (!warehousesSnapshot.empty) {
                    setHasUploadedWarehouses(true); // User has uploaded warehouses
                }
            }
        } catch (error) {
            console.error('Error checking user warehouses: ', error);
        }
    };

    checkUserWarehouses();
}, []);
useEffect(() => {
    const { start_date, end_date, rentAmount, depositAmount } = formData;
    const terms = `
      
        1. Description of the Premises
        This Rental Agreement has been signed by the parties for the purpose of leasing the property at the address stated above. The leased property under this Agreement can only be used for residential purposes.

        2. Term of the Agreement
        The commencement date of the Rental Agreement is ${start_date} and the expiration date is ${end_date}.

        This contract expires automatically at the end of this period. The parties may decide to continue the lease under the same conditions, or they may sign a new agreement.

        3. Rent and Payment Method
        The monthly rental fee under this Agreement is ${rentAmount ? rentAmount.toLocaleString() : ''}. This amount shall be paid in cash at the latest on the fifth of each month, and through the bank.

        4. Security Deposit
        Security deposit of ${depositAmount ? depositAmount.toLocaleString() : ''} shall be paid to Lessor at the date of signature of this Agreement. After the expiry of the Agreement, the deposit shall be refunded after the inspection to be made on the leased property. Damages and losses incurred on the real estate and the fixtures to be listed below are set off from the deposit.

        5. Fixtures and Maintenance
        Lessee shall maintain leased property and the fixtures in good order, repair, and appearance, and repair parts of leased property including without limitation, all interior and exterior, replacements to the roof, foundations, exterior walls, building systems, HVAC systems, parking areas, sidewalks, water, sewer and gas connections, and pipes.
    `;
    setEditableTerms(terms); // Initialize editableTerms with the initial terms
}, [formData.start_date, formData.end_date, formData.rentAmount, formData.depositAmount]);


const handleEditTerms = () => {
    setShowEditModal(true);
};

const handleSaveTerms = async () => {
    try {
        const currentUser = auth.currentUser;
        if (currentUser) {
            const agreementData = {
                ...formData,
                terms: editableTerms, // Update terms with editableTerms
                userId: currentUser.uid,
            };
            await db.collection('rentalAgreement').add(agreementData);
            navigate('/rental-agreements');
        } else {
            console.error('User is not authenticated.');
        }
    } catch (error) {
        console.error('Error creating rental agreement: ', error);
        // Handle error state
    }
};

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex flex-grow">
            <Sidebar />
                <div className="flex-grow p-8">
                    <h2 className="text-4xl font-semibold mb-8 mt-4 text-center">Create New Rental Agreement</h2>
                    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
                     
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
    {/* Lessor Name and Lessor TIN Number */}
    <div className="flex flex-col">
        <label className="text-gray-700 mb-2">Lessor Name</label>
        <input
            type="text"
            name="lessorName"
            value={formData.lessorName}
            onChange={handleChange}
            className="border border-gray-300 rounded-md px-6 py-4 focus:outline-none focus:border-blue-500 w-full"
            required
        />
        
        <label className="text-gray-700 mt-4 mb-2">Lessor TIN Number</label>
<input
    type="text"
    name="lessorTinNumber"
    value={formData.lessorTinNumber}
    onChange={(e) => {
        // Allow only numbers and hyphens, and automatically format TIN as 'XXX-XXX-XXX'
        const value = e.target.value.replace(/[^\d-]/g, ''); // Remove non-digit and non-hyphen characters
        let formattedValue = value;

        // Insert hyphens at the appropriate positions if the length is correct
        if (formattedValue.length > 3 && formattedValue.length <= 6) {
            formattedValue = `${formattedValue.slice(0, 3)}-${formattedValue.slice(3)}`;
        } else if (formattedValue.length > 6 && formattedValue.length <= 9) {
            formattedValue = `${formattedValue.slice(0, 3)}-${formattedValue.slice(3, 6)}-${formattedValue.slice(6)}`;
        }

        if (formattedValue.length <= 11) {
            setFormData({
                ...formData,
                lessorTinNumber: formattedValue,
            });
        }
    }}
    className="border border-gray-300 rounded-md px-6 py-4 focus:outline-none focus:border-blue-500 w-full"
    required
    maxLength={11} // Allow a maximum of 11 characters (including hyphens)
/>
    </div>
    
    {/* Lessee Name and Lessee TIN Number */}
    <div className="flex flex-col">
        <label className="text-gray-700 mb-2">Lessee Name</label>
        <input
            type="text"
            name="lesseeName"
            value={formData.lesseeName}
            onChange={handleChange}
            className="border border-gray-300 rounded-md px-6 py-4 focus:outline-none focus:border-blue-500 w-full"
            required
        />

<label className="text-gray-700 mt-4 mb-2">Lessee TIN Number</label>
<input
    type="text"
    name="lesseeTinNumber"
    value={formData.lesseeTinNumber}
    onChange={(e) => {
        // Allow only numbers and hyphens, and automatically format TIN as 'XXX-XXX-XXX'
        const value = e.target.value.replace(/[^\d-]/g, ''); // Remove non-digit and non-hyphen characters
        let formattedValue = value;

        // Insert hyphens at the appropriate positions if the length is correct
        if (formattedValue.length > 3 && formattedValue.length <= 6) {
            formattedValue = `${formattedValue.slice(0, 3)}-${formattedValue.slice(3)}`;
        } else if (formattedValue.length > 6 && formattedValue.length <= 9) {
            formattedValue = `${formattedValue.slice(0, 3)}-${formattedValue.slice(3, 6)}-${formattedValue.slice(6)}`;
        }

        if (formattedValue.length <= 11) {
            setFormData({
                ...formData,
                lesseeTinNumber: formattedValue,
            });
        }
    }}
    className="border border-gray-300 rounded-md px-6 py-4 focus:outline-none focus:border-blue-500 w-full"
    required
    maxLength={11} // Allow a maximum of 11 characters (including hyphens)
/>
    </div>
</div>


                        <div className="flex flex-col">
                            <label className="text-gray-700 mb-2">Warehouse Name</label>
                            <input
                                type="text"
                                name="warehouseName"
                                value={formData.warehouseName}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-md px-6 py-4 focus:outline-none focus:border-blue-500"
                                required
                            />
                        </div>
                        <div className="flex flex-col">
                                <label className="text-gray-700 mb-2">Rent Period</label>
                                <select
                                    name="rentFrequency"
                                    value={formData.rentFrequency}
                                    onChange={handleChange}
                                    className="border border-gray-300 rounded-md px-6 py-4 focus:outline-none focus:border-blue-500"
                                >
                                    <option value="monthly">Monthly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                            </div>
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                            <div className="flex flex-col">
                            <label className="text-gray-700 mb-2">Start Date</label>
    <input
        type="date"
        name="start_date"
        value={formData.start_date}
        onChange={handleChange}
        className="border border-gray-300 rounded-md px-6 py-4 focus:outline-none focus:border-blue-500"
        min={new Date().toISOString().split('T')[0]} // Set minimum date to today
        required
    />
</div>
                            <div className="flex flex-col">
                                <label className="text-gray-700 mb-2">End Date</label>
                                <input
                                    type="date"
                                    name="end_date"
                                    value={formData.end_date}
                                    onChange={handleChange}
                                    className="border border-gray-300 rounded-md px-6 py-4 focus:outline-none focus:border-blue-500"
                                    min={new Date().toISOString().split('T')[0]} // Set minimum date to today

                                    required
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                        <div className="flex flex-col">
    <label className="text-gray-700 mb-2">Rent Amount</label>
    <input
        type="text" // Change type to 'text' to allow formatting with commas
        name="rentAmount"
        value={formData.rentAmount !== undefined ? formData.rentAmount.toLocaleString() : ''} // Format rentAmount with commas
        onChange={(e) => {
            // Remove any non-numeric characters and update the state with the raw value
            const numericValue = e.target.value.replace(/[^0-9]/g, ''); 
            setFormData({
                ...formData,
                rentAmount: numericValue ? parseInt(numericValue) : 0, // Set rentAmount as a number
            });
        }}
        className="border border-gray-300 rounded-md px-6 py-4 focus:outline-none focus:border-blue-500"
        required
    />
</div>
<div className="flex flex-col">
    <label className="text-gray-700 mb-2">Deposit Amount</label>
    <input
        type="text" // Change type to 'text' for custom formatting
        name="depositAmount"
        value={formData.depositAmount !== undefined ? formData.depositAmount.toLocaleString() : ''} // Format the depositAmount with commas
        onChange={(e) => {
            // Remove any non-numeric characters and update the state with the raw value
            const numericValue = e.target.value.replace(/[^0-9]/g, ''); 
            setFormData({
                ...formData,
                depositAmount: numericValue ? parseInt(numericValue) : 0, // Set depositAmount as a number
            });
        }}
        placeholder="(50%)"
        className="border border-gray-300 rounded-md px-6 py-4 focus:outline-none focus:border-blue-500"
        required
    />
</div>

                        </div>
  {/* Terms section */}
  {hasUploadedWarehouses && (
<div className="mt-8 bg-gray-100 p-6 rounded-lg shadow-md h-80 overflow-y-auto">
    <h3 className="text-2xl font-semibold mb-4">Terms and Conditions</h3>
    {editableTerms.split('\n').map((paragraph, index) => (
        <React.Fragment key={index}>
            {paragraph.trim() && (
                <div className="mb-4">
                    <p className="text-gray-700">
                        <span className="font-semibold">{paragraph.split('.')[0]}.</span> {paragraph.slice(paragraph.split('.')[0].length + 1)}
                    </p>
                    {index !== editableTerms.split('\n').length - 1 && <hr className="my-4" />}
                </div>
            )}
        </React.Fragment>
    ))}
</div>
)}

                        <div className="flex flex-col">
                           
                            <button
                                type="button"
                                onClick={handleEditTerms}
                                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
                            >
                                Edit Terms
                            </button>
                        </div>
                        <button type="submit" className="mt-8 px-6 py-4 bg-green-500 text-white rounded-md">
                            Create Agreement
                        </button>
                    </form>

                    {showEditModal && hasUploadedWarehouses && (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
        <div className="bg-white p-8 rounded-md shadow-md max-w-screen-lg w-full mx-4">
            <h3 className="text-2xl font-semibold mb-4">Edit Terms</h3>
            <textarea
                value={editableTerms}
                onChange={(e) => setEditableTerms(e.target.value)}
                rows="10"
                className="w-full border border-gray-300 rounded-md px-4 py-2 mb-4 resize-none"
                style={{ minHeight: '200px' }}
                placeholder="Edit terms here..."
            />
            <div className="flex justify-end">
                
                <button
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 focus:outline-none focus:bg-blue-400"
                >
                    Save
                </button>
            </div>
        </div>
    </div>
)}




            {/* Error Modal */}
{showErrorModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
        {/* Overlay */}
        <div className="absolute inset-0 bg-gray-800 opacity-75"></div>

        {/* Modal Content */}
        <div className="relative w-auto max-w-md p-5 mx-auto my-6 bg-white rounded-lg shadow-lg">
            {/* Modal Body */}
            <div className="text-center">
                {/* Error Icon */}
                <div className="flex flex-col items-center">
                    <img 
                        src={error1} 
                        alt="Error Icon" 
                        className="w-14 h-14 mb-2" 
                    />
                </div>

                {/* Error Message */}
                <p className="text-gray-700 mb-2 mt-2">{error}</p>

                {/* Close Button */}
                <button
                    className="bg-red-500 text-white font-semibold py-2 px-8 rounded hover:bg-red-600 mt-4"
                    onClick={() => setShowErrorModal(false)}
                >
                    Close
                </button>
            </div>
        </div>
    </div>
)}

                </div>
            </div>
        </div>
    );
}

export default CreateAgreement;

