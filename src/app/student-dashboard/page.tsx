'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, ClipboardList, Upload } from 'lucide-react';

// Assignment data
const assignments = [
  {
    id: 1,
    subject: 'Mathematics',
    dueDate: 'Tomorrow, 11:59 PM',
  },
  {
    id: 2,
    subject: 'Machine Learning',
    dueDate: 'Tomorrow, 11:59 PM',
  },
  {
    id: 3,
    subject: 'Data Sciences',
    dueDate: 'Tomorrow, 11:59 PM',
  },
];

// Upcoming events data
const upcomingEvents = [
  {
    id: 1,
    month: 'OCT',
    day: '28',
    title: 'Chemistry Midterm',
    time: '10:00 AM',
    location: 'Room 402',
  },
  {
    id: 2,
    month: 'NOV',
    day: '02',
    title: 'Peer Review Workshop',
    time: '02:00 PM',
    location: 'Online',
  },
];

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState<'done' | 'pending'>('pending');
  
  const fullName = 'soeng senghorng';
  const classInfo = 'Class SE B 12';
  const assignmentsDueCount = 4;
  const completedCourses = 12;
  const pendingCourses = 3;
  const progressPercentage = 75;

  return (
    <div className="min-h-screen bg-[#E8F5E9] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="white"
                className="w-6 h-6"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-green-700">Academic Growth</span>
          </Link>

          {/* Right side - notification & user */}
          <div className="flex items-center gap-6">
            <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{fullName}</p>
                <p className="text-xs text-gray-500">{classInfo}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold">
                {fullName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Dashboard Header with Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
              <p className="text-gray-600">welcome back! You have {assignmentsDueCount} assignments due this week.</p>
            </div>
            
            {/* Done/Pending Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('done')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'done'
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Done
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'pending'
                    ? 'bg-green-500 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Pending
              </button>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Active Assignments */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                {/* Section Header */}
                <div className="flex items-center gap-2 mb-6">
                  <ClipboardList className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-bold text-gray-900">Active Assignments</h2>
                </div>

                {/* Assignment List */}
                <div className="space-y-4">
                  {assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-1 h-12 bg-green-500 rounded-full"></div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{assignment.subject}</h3>
                          <p className="text-sm text-gray-500">Due: {assignment.dueDate}</p>
                        </div>
                      </div>
                      <button className="btn-primary px-5 py-2.5 text-white font-medium rounded-lg text-sm flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Upload file
                      </button>
                    </div>
                  ))}
                </div>

                {/* View Archive Button */}
                <button className="w-full mt-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl transition-colors">
                  View Archive
                </button>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Course Progress Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-gray-900">Course Progress</h3>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-gray-500">Monthly Target</p>
                  <span className="text-sm font-semibold text-green-600">{progressPercentage}%</span>
                </div>
                
                {/* Progress Bar */}
                <div className="h-2 bg-gray-200 rounded-full mb-6 overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                
                {/* Stats */}
                <div className="flex gap-3">
                  <div className="flex-1 bg-green-50 rounded-xl py-3 px-4 text-center border border-green-200">
                    <p className="text-sm text-green-600 mb-1">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{completedCourses}</p>
                  </div>
                  <div className="flex-1 bg-orange-50 rounded-xl py-3 px-4 text-center border border-orange-200">
                    <p className="text-sm text-orange-500 mb-1">Pending</p>
                    <p className="text-2xl font-bold text-orange-500">{String(pendingCourses).padStart(2, '0')}</p>
                  </div>
                </div>
              </div>

              {/* Upcoming Events Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">Upcoming Events</h3>
                
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-start gap-4">
                      {/* Date Badge */}
                      <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg px-3 py-2 min-w-[50px] border border-gray-100">
                        <span className="text-xs font-medium text-green-600">{event.month}</span>
                        <span className="text-lg font-bold text-gray-900">{event.day}</span>
                      </div>
                      
                      {/* Event Details */}
                      <div>
                        <h4 className="font-semibold text-gray-900">{event.title}</h4>
                        <p className="text-sm text-gray-500">{event.time} - {event.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
