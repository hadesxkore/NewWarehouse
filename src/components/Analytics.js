import React, { useEffect, useState, useRef } from 'react';
import Navigation from './Navigation';
import { firestore, auth } from '../firebase'; // Import auth from Firebase
import Chart from 'chart.js/auto';
import { DateTime } from 'luxon';
import 'chartjs-adapter-luxon';

function Analytics() {
    const [userRegistrationsData, setUserRegistrationsData] = useState({});
    const [warehouseStatusData, setWarehouseStatusData] = useState({ verified: 0, pending: 0, rejected: 0 });
    const [userCount, setUserCount] = useState(0); // State for user count
    const userRegistrationsChartRef = useRef(null);
    const warehouseStatusChartRef = useRef(null);

    useEffect(() => {
        // Fetch initial user count from Firebase Authentication
        auth.onAuthStateChanged(user => {
            if (user) {
                setUserCount(userCount + 1);
            }
        });

        const unsubscribeUserRegistrations = firestore.collection('users').onSnapshot(snapshot => {
            const userRegistrations = {};
            snapshot.forEach(doc => {
                const registrationDate = doc.data().registrationDate?.toDate(); // Check if registrationDate exists
                if (registrationDate) {
                    const formattedDate = DateTime.fromJSDate(registrationDate, { zone: 'Asia/Manila' }).toFormat('yyyy-MM-dd');
                    userRegistrations[formattedDate] = (userRegistrations[formattedDate] || 0) + 1;
                }
            });
            setUserRegistrationsData(userRegistrations);
            setUserCount(snapshot.size);
        }, error => {
            console.error('Error fetching user registrations data:', error);
        });
        
        const unsubscribeWarehouseStatus = firestore.collection('warehouses').onSnapshot(snapshot => {
            const warehouseData = snapshot.docs.map(doc => doc.data());
            const statusCounts = warehouseData.reduce((acc, warehouse) => {
                acc[warehouse.status] = (acc[warehouse.status] || 0) + 1;
                return acc;
            }, {});
            setWarehouseStatusData(statusCounts);
        }, error => {
            console.error('Error fetching warehouse status data:', error);
        });

        return () => {
            unsubscribeUserRegistrations();
            unsubscribeWarehouseStatus();
        };
    }, []);

    useEffect(() => {
        const ctxUserRegistrations = userRegistrationsChartRef.current;
        if (ctxUserRegistrations) {
            if (ctxUserRegistrations.chart) {
                ctxUserRegistrations.chart.destroy();
            }

            const labels = Object.keys(userRegistrationsData).sort();

            const datasets = [{
                label: 'User Registrations',
                data: labels.map(date => userRegistrationsData[date]),
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgb(54, 162, 235)',
                borderWidth: 1,
                tension: 0.4,
                pointRadius: 5,
                pointHoverRadius: 7
            }];

            ctxUserRegistrations.chart = new Chart(ctxUserRegistrations, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: datasets
                },
                options: {
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        x: {
                            type: 'time',
                            time: {
                                unit: 'day',
                                displayFormats: {
                                    day: 'MMM dd'
                                }
                            },
                            title: {
                                display: true,
                                text: 'Date'
                            }
                        },
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Number of Registrations'
                            }
                        }
                    }
                }
            });
        }
    }, [userRegistrationsData]);

    useEffect(() => {
        // Render warehouse status distribution chart
        const ctxWarehouseStatus = warehouseStatusChartRef.current;
        if (ctxWarehouseStatus) {
            if (ctxWarehouseStatus.chart) {
                ctxWarehouseStatus.chart.destroy();
            }
            ctxWarehouseStatus.chart = new Chart(ctxWarehouseStatus, {
                type: 'bar',
                data: {
                    labels: ['Verified', 'Pending', 'Rejected'],
                    datasets: [{
                        label: 'Warehouse Status',
                        data: [warehouseStatusData.verified, warehouseStatusData.pending, warehouseStatusData.rejected],
                        backgroundColor: [
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(255, 99, 132, 0.2)'
                        ],
                        borderColor: [
                            'rgb(75, 192, 192)',
                            'rgb(255, 206, 86)',
                            'rgb(255, 99, 132)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    }, [warehouseStatusData]);

    return (
        <div style={{ backgroundColor: '#eeeeee', minHeight: '100vh' }}>
            <Navigation />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-semibold mb-6">Charts</h1>
                <div className="mb-8">
                    <div className="card p-4 bg-white rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">User Registrations Chart</h2>
                        <canvas ref={userRegistrationsChartRef} width="800" height="400"></canvas>
                        <p>Current Users: {userCount}</p> {/* Display current user count */}
                    </div>
                </div>
                <div>
                    <div className="card p-4 bg-white rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Warehouse Status Chart</h2>
                        <canvas ref={warehouseStatusChartRef} width="400" height="200"></canvas>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Analytics;
