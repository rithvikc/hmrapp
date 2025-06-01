'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle, AlertCircle, Clock, User } from 'lucide-react';

export default function TestStyles() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          CSS Styling Test Page
        </h1>
        
        {/* Color Palette Test */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Color Palette</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-600 text-white p-4 rounded-lg">
              <p className="font-medium">Blue Primary</p>
              <p className="text-sm opacity-90">bg-blue-600</p>
            </div>
            <div className="bg-green-600 text-white p-4 rounded-lg">
              <p className="font-medium">Green Success</p>
              <p className="text-sm opacity-90">bg-green-600</p>
            </div>
            <div className="bg-yellow-500 text-white p-4 rounded-lg">
              <p className="font-medium">Yellow Warning</p>
              <p className="text-sm opacity-90">bg-yellow-500</p>
            </div>
            <div className="bg-red-600 text-white p-4 rounded-lg">
              <p className="font-medium">Red Error</p>
              <p className="text-sm opacity-90">bg-red-600</p>
            </div>
          </div>
        </div>

        {/* Button Test */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
              Primary Button
            </button>
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg transition-colors">
              Secondary Button
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors">
              Success Button
            </button>
            <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors">
              Danger Button
            </button>
          </div>
        </div>

        {/* Card Test */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500">Total Patients</p>
                  <p className="text-2xl font-bold text-gray-900">24</p>
                </div>
                <User className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500">Pending Reviews</p>
                  <p className="text-2xl font-bold text-yellow-600">8</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="text-2xl font-bold text-green-600">16</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Form Test */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Form Elements</h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient Name
                </label>
                <input
                  type="text"
                  placeholder="Enter patient name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500">
                  <option>Pending</option>
                  <option>Completed</option>
                  <option>Draft</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Badge Test */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Status Badges</h2>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Completed
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Pending
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Draft
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Error
            </span>
          </div>
        </div>

        {/* Alert Test */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Alerts</h2>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-blue-500 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-blue-800">Information</h3>
                  <p className="text-sm text-blue-700 mt-1">This is an informational message.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-green-800">Success</h3>
                  <p className="text-sm text-green-700 mt-1">Operation completed successfully!</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Typography Test */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Typography</h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Heading 1</h1>
            <h2 className="text-3xl font-semibold text-gray-800 mb-2">Heading 2</h2>
            <h3 className="text-2xl font-medium text-gray-700 mb-2">Heading 3</h3>
            <p className="text-base text-gray-600 mb-2">
              This is regular paragraph text. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
            <p className="text-sm text-gray-500">
              This is small text for captions and secondary information.
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link 
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Main Application
          </Link>
        </div>
      </div>
    </div>
  );
} 