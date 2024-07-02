import React from 'react';
import { Link } from 'react-router-dom';

function Sidebar() {
    return (
        <div className="flex flex-col h-full min-h-screen w-64 bg-gray-800 text-white" style={{ paddingBottom: 'calc(140vh - 64px)' }}>
            <div className="p-4">
                <h2 className="text-lg font-semibold mb-4">Menu</h2>
                <ul className="space-y-2">
                    <li>
                        <Link to="/create-agreement" className="block py-2 px-4 rounded transition duration-300 hover:bg-gray-700">Create an Agreement</Link>
                    </li>
                    <li>
                        <Link to="/rental-agreements" className="block py-2 px-4 rounded transition duration-300 hover:bg-gray-700">View Agreements</Link>
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default Sidebar;
