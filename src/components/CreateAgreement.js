import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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

    const [formData, setFormData] = useState({
        warehouse_id: initialFormData.id || '',
        warehouseName: initialFormData.name || '',
        lesseeName: initialFormData.rentedBy ? `${initialFormData.rentedBy.firstName} ${initialFormData.rentedBy.lastName}` : '',
        lessorName: `${initialFormData.ownerFirstName} ${initialFormData.ownerLastName}` || '',
        lessee_id: initialFormData.rentedBy ? initialFormData.rentedBy.id : '',
        start_date: '',
        end_date: '',
        rentAmount: initialFormData.price || '', // Initialize with existing data
        rentFrequency: 'monthly',
        depositAmount: '',
        terms: ''
    });

    useEffect(() => {
        if (initialFormData) {
            setFormData(initialFormData);
        }
    }, [initialFormData]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
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
   const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const currentUser = auth.currentUser;
        if (currentUser) {
            // Check if the current user has uploaded warehouses
            const warehousesSnapshot = await db.collection('warehouses')
                .where('userUid', '==', currentUser.uid)
                .get();
            
            if (warehousesSnapshot.empty) {
                // Display an error message if the user hasn't uploaded any warehouses
                setError('Rental agreements can only be created by lessors who have uploaded warehouses.');
                setShowErrorModal(true); // Show modal
                return;
            }

            // Continue with agreement creation logic
            const { start_date, end_date, rentFrequency, rentAmount, depositAmount } = formData;
            const startDate = new Date(start_date);
            const endDate = new Date(end_date);
            const daysDiff = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)); // Calculate difference in days

            if (daysDiff < 30) { // If duration is less than 30 days
                setError('Agreement duration must be at least 30 days.');
                setShowErrorModal(true); // Show modal
                return;
            }

            if (rentFrequency === 'yearly' && daysDiff < 365) { // If rent frequency is yearly and duration is less than 365 days (1 year)
                setError('Yearly rent period requires a duration of at least 365 days (1 year).');
                setShowErrorModal(true); // Show modal
                return;
            }

            if (parseInt(depositAmount) > parseInt(rentAmount)) {
                setError('Deposit amount cannot be greater than rent amount.');
                setShowErrorModal(true); // Show modal
                return;
            }

            const terms = `
                Terms and Conditions
                1. Description of the Premises
                This Rental Agreement has been signed by the parties for the purpose of leasing the property at the address stated above. The leased property under this Agreement can only be used for residential purposes.

                2. Term of the Agreement
                The commencement date of the Rental Agreement is ${start_date} and the expiration date is ${end_date}.

                This contract expires automatically at the end of this period. The parties may decide to continue the lease under the same conditions, or they may sign a new agreement.

                3. Rent and Payment Method
                The monthly rental fee under this Agreement is ${rentAmount}. This amount shall be paid in cash at the latest on the fifth of each month, and through the bank.

                4. Security Deposit
                Security deposit of ${depositAmount ? depositAmount.toLocaleString() : ''} shall be paid to Lessor at the date of signature of this Agreement. After the expiry of the Agreement, the deposit shall be refunded after the inspection to be made on the leased property. Damages and losses incurred on the real estate and the fixtures to be listed below are set off from the deposit.

                5. Fixtures and Maintenance
                Lessee shall maintain leased property and the fixtures in good order, repair, and appearance, and repair parts of leased property including without limitation, all interior and exterior, replacements to the roof, foundations, exterior walls, building systems, HVAC systems, parking areas, sidewalks, water, sewer and gas connections, and pipes.
            `;

            const agreementData = { ...formData, terms, userId: currentUser.uid };
            await db.collection('rentalAgreement').add(agreementData);
            navigate('/rental-agreements');
        } else {
            console.error('User is not authenticated.');
        }
    } catch (error) {
        console.error('Error creating rental agreement: ', error);
        setError('Error creating rental agreement. Please try again later.');
        setShowErrorModal(true); // Show modal
    }
};

    useEffect(() => {
        const { start_date, end_date, rentAmount, depositAmount } = formData;
        const terms = `
            Terms and Conditions
            1. Description of the Premises
            This Rental Agreement has been signed by the parties for the purpose of leasing the property at the address stated above. The leased property under this Agreement can only be used for residential purposes.

            2. Term of the Agreement
            The commencement date of the Rental Agreement is ${start_date} and the expiration date is ${end_date}.

            This contract expires automatically at the end of this period. The parties may decide to continue the lease under the same conditions, or they may sign a new agreement.

            3. Rent and Payment Method
            The monthly rental fee under this Agreement is ${rentAmount}. This amount shall be paid in cash at the latest on the fifth of each month, and through the bank.

            4. Security Deposit
            Security deposit of ${depositAmount ? depositAmount.toLocaleString() : ''} shall be paid to Lessor at the date of signature of this Agreement. After the expiry of the Agreement, the deposit shall be refunded after the inspection to be made on the leased property. Damages and losses incurred on the real estate and the fixtures to be listed below are set off from the deposit.

            5. Fixtures and Maintenance
            Lessee shall maintain leased property and the fixtures in good order, repair, and appearance, and repair parts of leased property including without limitation, all interior and exterior, replacements to the roof, foundations, exterior walls, building systems, HVAC systems, parking areas, sidewalks, water, sewer and gas connections, and pipes.
        `;
        setFormData(prevState => ({
            ...prevState,
            terms
        }));
    }, [formData.start_date, formData.end_date, formData.rentAmount, formData.depositAmount]);

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex flex-grow">
                <Sidebar />
                <div className="flex-grow p-8">
                    <h2 className="text-4xl font-semibold mb-8 mt-4 text-center">Create New Rental Agreement</h2>
                    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                            <div className="flex flex-col">
                                <label className="text-gray-700 mb-2">Lessor Name</label>
                                <input
                                    type="text"
                                    name="lessorName"
                                    value={formData.lessorName}
                                    onChange={handleChange}
                                    className="border border-gray-300 rounded-md px-6 py-4 focus:outline-none focus:border-blue-500"
                                    required
                                />
                            </div>
                            
                            <div className="flex flex-col">
                                <label className="text-gray-700 mb-2">Lessee Name</label>
                                <input
                                    type="text"
                                    name="lesseeName"
                                    value={formData.lesseeName}
                                    onChange={handleChange}
                                    className="border border-gray-300 rounded-md px-6 py-4 focus:outline-none focus:border-blue-500"
                                    required
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
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                            <div className="flex flex-col">
                                <label className="text-gray-700 mb-2">Start Date</label>
                                <input
                                    type="date"
                                    name="start_date"
                                    value={formData.start_date}
                                    onChange={handleChange}
                                    className="border border-gray-300 rounded-md px-6 py-4 focus:outline-none focus:border-blue-500"
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
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                            <div className="flex flex-col">
                                <label className="text-gray-700 mb-2">Rent Amount</label>
                                <input
                                    type="number"
                                    name="rentAmount"
                                    value={formData.rentAmount}
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
                            <div className="flex flex-col">
                                <label className="text-gray-700 mb-2">Deposit Amount</label>
                                <input
                                    type="number"
                                    name="depositAmount"
                                    value={formData.depositAmount}
                                    onChange={handleChange}
                                    className="border border-gray-300 rounded-md px-6 py-4 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>
                        {hasUploadedWarehouses && ( // Conditionally render the terms section
                            <div className="mt-8 bg-gray-100 p-6 rounded-lg shadow-md">
                                <h3 className="text-2xl font-semibold mb-4">Terms and Conditions</h3>
                                <p className="text-gray-700 mb-4">
                                    <span className="font-semibold">1. Description of the Premises</span>
                                    <br />
                                    This Rental Agreement has been signed by the parties for the purpose of leasing the property at the address stated above. The leased property under this Agreement can only be used for residential purposes.
                                </p>
                                <hr className="my-4" />
                                <p className="text-gray-700 mb-4">
                                    <span className="font-semibold">2. Term of the Agreement</span>
                                    <br />
                                    The commencement date of the Rental Agreement is <strong>{formData.start_date}</strong> and the expiration date is <strong>{formData.end_date}</strong>.
                                    <br />
                                    This contract expires automatically at the end of this period. The parties may decide to continue the lease under the same conditions, or they may sign a new agreement.
                                </p>
                                <hr className="my-4" />
                                <p className="text-gray-700 mb-4">
                                    <span className="font-semibold">3. Rent and Payment Method</span>
                                    <br />
                                    The monthly rental fee under this Agreement is <strong>{formData.rentAmount !== undefined ? `₱${formData.rentAmount.toLocaleString()}` : ''}</strong>. This amount shall be paid in cash at the latest on the fifth of each month, and through the bank.
                                </p>
                                <hr className="my-4" />
                                <p className="text-gray-700 mb-4">
                                    <span className="font-semibold">4. Security Deposit</span>
                                    <br />
                                    Security deposit of <strong>{formData.depositAmount !== undefined ? `₱${formData.depositAmount.toLocaleString()}` : ''}</strong> shall be paid to Lessor at the date of signature of this Agreement. After the expiry of the Agreement, the deposit shall be refunded after the inspection to be made on the leased property. Damages and losses incurred on the real estate and the fixtures to be listed below are set off from the deposit.
                                </p>
                                <hr className="my-4" />
                                <p className="text-gray-700 mb-4">
                                    <span className="font-semibold">5. Fixtures and Maintenance</span>
                                    <br />
                                    Lessee shall maintain leased property and the fixtures in good order, repair, and appearance, and repair parts of leased property including without limitation, all interior and exterior, replacements to the roof, foundations, exterior walls, building systems, HVAC systems, parking areas, sidewalks, water, sewer and gas connections, and pipes.
                                </p>
                            </div>
                        )}
                        <div className="flex justify-center">
                            <button
                                type="submit"
                                className="bg-blue-500 text-white rounded-md px-16 py-4 mt-10 hover:bg-blue-600"
                            >
                                Create Agreement
                            </button>
                        </div>
                    </form>

                    {/* Error Modal */}
                    {showErrorModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
                            <div className="absolute inset-0 bg-gray-800 opacity-75"></div>
                            <div className="relative w-auto max-w-md p-5 mx-auto my-6 bg-white rounded-lg shadow-lg">
                                {/* Content */}
                                <div className="text-center">
                                <div className="flex flex-col items-center">
                                <img src={error1} alt="Error Icon" className="w-14 h-14 mb-2" />
            </div>

                                    <p className="text-gray-700 mb-2 mt-2">{error}</p>
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

