import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-gray-300 py-12 mt-32">
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 px-4">
                {/* About Section */}
                <div className="footer-section border-r border-gray-600 pr-4 last:border-r-0">
                    <h3 className="footer-heading text-lg font-semibold mb-4">ABOUT</h3>
                    <ul className="footer-list space-y-2">
                        <li><a href="#" className="hover:text-white transition">Terms & Conditions</a></li>
                        <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                        <li><a href="#" className="hover:text-white transition">Copyrights</a></li>
                        <li><a href="#" className="hover:text-white transition">About Us</a></li>
                        <li><a href="#" className="hover:text-white transition">Events</a></li>
                        <li><a href="#" className="hover:text-white transition">Careers</a></li>
                    </ul>
                </div>

                {/* Customer Service Section */}
                <div className="footer-section border-r border-gray-600 pr-4 last:border-r-0">
                    <h3 className="footer-heading text-lg font-semibold mb-4">CUSTOMER SERVICE</h3>
                    <ul className="footer-list space-y-2">
                        <li><a href="#" className="hover:text-white transition">How it Works</a></li>
                        <li><a href="#" className="hover:text-white transition">Why Partner with Us?</a></li>
                        <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
                        <li><a href="#" className="hover:text-white transition">FAQs</a></li>
                        <li><a href="#" className="hover:text-white transition">Video Tutorials</a></li>
                        <li><a href="#" className="hover:text-white transition">Broker Academy</a></li>
                        <li><a href="#" className="hover:text-white transition">Popular Searches</a></li>
                    </ul>
                </div>

                {/* Other Info Section */}
                <div className="footer-section border-r border-gray-600 pr-4 last:border-r-0">
                    <h3 className="footer-heading text-lg font-semibold mb-4">OTHER INFO</h3>
                    <ul className="footer-list space-y-2">
                        <li><a href="#" className="hover:text-white transition">Trends</a></li>
                        <li><a href="#" className="hover:text-white transition">Press</a></li>
                        <li><a href="#" className="hover:text-white transition">Success Stories</a></li>
                        <li><a href="#" className="hover:text-white transition">The Outlook Awards</a></li>
                        <li><a href="#" className="hover:text-white transition">Broker Awards</a></li>
                        <li><a href="#" className="hover:text-white transition">City Insider</a></li>
                    </ul>
                </div>

                {/* Contact Information */}
                <div className="footer-section last:border-r-0">
                    <h3 className="footer-heading text-lg font-semibold mb-4">CONTACT</h3>
                    <p className="mb-2">
                        FACEBOOK MESSENGER: <a href="https://www.messenger.com/t/Wherehouse" className="underline hover:text-white transition">Wherehouse</a>
                    </p>
                    <p className="mb-2">
                        EMAIL: <a href="mailto:wherehouse@gmail.com" className="underline hover:text-white transition">wherehouse@gmail.com</a>
                    </p>
                    <p>OFFICE: 226 Sitio Toto Cupang Proper, Balanga City, Bataan.</p>
                </div>
            </div>

            {/* Copyright */}
            <div className="mt-8 text-center">
                <p className="text-sm">© 2024 Wherehouse Philippines Inc. All rights reserved. Material may not be published or reproduced in any form without prior written permission.</p>
            </div>
        </footer>
    );
};

export default Footer;
