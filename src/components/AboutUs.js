import React, { useState } from 'react';
import { HiMail, HiPhone } from 'react-icons/hi';
import { FaFacebook, FaInstagram } from 'react-icons/fa';
import Navbar from './Navbar';
import diane from '../images/diane.png';
import drex from '../images/drex.png';
import jars from '../images/jars.png';
import kobie from '../images/kobie.png';

const teamMembers = [
  {
    name: 'Diane',
    image: diane,
    title: 'Project Leader/Manager',
    address: 'Daang Bago Dinalupihan, Bataan',
    description:
      'Diane oversees project execution and documentation, ensuring successful coordination and completion of tasks.',
  },
  {
    name: 'Drex',
    image: drex,
    title: 'Lead Tester',
    address: '017 Macopa Street Landing Limay Bataan',
    description:
      'Drex ensures the quality of project deliverables through meticulous testing and detailed documentation.',
  },
  {
    name: 'Jars',
    image: jars,
    title: 'Lead Designer',
    address: '150 Masinop St Cupang West Balanga City Bataan',
    description:
      'Jars focuses on the visual design and assists in programming, creating a seamless user experience.',
  },
  {
    name: 'Kobie',
    image: kobie,
    title: 'Lead Programmer',
    address: '226 Sitio Toto Cupang Proper Balanga City Bataan',
    description:
      'Kobie leads the development process, implementing advanced programming solutions for the project.',
  },
];

const AboutUs = () => {
  const [selectedMember, setSelectedMember] = useState(null);

  const openModal = (member) => setSelectedMember(member);
  const closeModal = () => setSelectedMember(null);

  return (
    <div className="bg-white text-black min-h-screen font-sans">
      <Navbar />

      {/* Hero Section */}
      <div className="text-center py-20 border-b border-gray-200">
        <h1 className="text-4xl font-extrabold mb-4">About Us</h1>
        <p className="text-lg">Meet our team and learn about our mission and vision.</p>
      </div>

      {/* Mission & Vision Section */}
      <section className="container mx-auto py-16 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="p-8 border rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p>Our mission is to make renting a warehouse easy and efficient by providing a simple platform that connects lessors and lessees, helping both parties manage their rental needs smoothly.

</p>
          </div>
          <div className="p-8 border rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">Our Vision</h2>
            <p>We aim to create a world where businesses can quickly find and rent warehouse spaces, making the process faster and more transparent for everyone.</p>
          </div>
        </div>
      </section>

      {/* About Wherehouse */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Wherehouse</h2>
          <p className="text-lg max-w-3xl mx-auto text-gray-700">
            Wherehouse is a web-based Warehouse Rental Management System designed to facilitate seamless interactions between lessors and lessees. It aims to modernize the traditional warehouse rental process by providing an efficient, user-friendly platform for managing rentals.
          </p>
        </div>
      </section>

      {/* Team Section */}
      <section className="container mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Our Team</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="p-6 border rounded-lg hover:shadow-lg transition cursor-pointer"
              onClick={() => openModal(member)}
            >
              <img
                src={member.image}
                alt={member.name}
                className="w-28 h-28 mx-auto mb-4 rounded-full object-cover border"
              />
              <h3 className="text-xl font-semibold">{member.name}</h3>
              <p className="text-sm text-gray-600">{member.title}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Modal for Team Member Details */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-3xl shadow-lg transform transition-all duration-300 scale-95 hover:scale-100">
            <button
              className="text-gray-800 font-bold text-3xl absolute top-4 right-4 hover:text-gray-600"
              onClick={closeModal}
            >
              &times;
            </button>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
              {/* Image */}
              <div className="flex justify-center">
                <img
                  src={selectedMember.image}
                  alt={selectedMember.name}
                  className="w-40 h-40 rounded-full object-cover border-2 border-gray-300 shadow-md"
                />
              </div>
              {/* Details */}
              <div className="space-y-6">
                <h2 className="text-3xl font-semibold text-gray-900 text-center sm:text-left border-b border-gray-300 pb-3">{selectedMember.name}</h2>
                <h3 className="text-xl font-medium text-gray-700 text-center sm:text-left border-b border-gray-300 pb-3">{selectedMember.title}</h3>
                <p className="text-gray-600 text-sm text-center sm:text-left">{selectedMember.address}</p>
                <div className="border-t border-gray-300 mt-6 pt-4">
                  <p className="text-gray-800 text-base leading-relaxed">{selectedMember.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Us Section */}
      <section className="py-16 px-4 border-t border-gray-200">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Contact Us</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex items-center justify-center gap-2">
              <HiMail className="text-2xl" />
              <p>Email: rentwarehouse@gmail.com</p>
            </div>
            <div className="flex items-center justify-center gap-2">
              <FaFacebook className="text-2xl" />
              <p>Facebook: facebook.com/rentwarehouse</p>
            </div>
            <div className="flex items-center justify-center gap-2">
              <FaInstagram className="text-2xl" />
              <p>Instagram: @rentwarehouse</p>
            </div>
            <div className="flex items-center justify-center gap-2">
              <HiPhone className="text-2xl" />
              <p>Contact: +63 912 345 6789</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
