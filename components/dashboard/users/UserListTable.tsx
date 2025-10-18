// src/components/users/UserListTable.tsx
'use client';
import React, { useState } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  city: string;
  createdDate: string;
  active: boolean;
}

// Mock User Data
const MOCK_USERS: User[] = [
  { id: 1, name: 'Floyd Miles', email: 'floyd.miles@example.com', city: 'Omsk', createdDate: '4/4/18', active: true },
  { id: 2, name: 'Kristin Watson', email: 'kristin.weaver@example.com', city: 'Nalchik', createdDate: '4/4/18', active: true },
  { id: 3, name: 'Annette Black', email: 'deanna.curtis@example.com', city: 'Khabarovsk', createdDate: '3/4/16', active: true },
  { id: 4, name: 'Wade Warren', email: 'felicia.reid@example.com', city: 'Mannheim', createdDate: '4/21/12', active: false },
  { id: 5, name: 'Esther Howard', email: 'dolores.chambers@example.com', city: 'Cincinnati (OH)', createdDate: '12/4/17', active: true },
  { id: 6, name: 'Cameron Williamson', email: 'michael.mitc@example.com', city: 'Sterlitamak', createdDate: '8/30/14', active: true },
  { id: 7, name: 'Albert Flores', email: 'sara.cruz@example.com', city: 'Lomas de Zamora', createdDate: '8/10/17', active: false },
  { id: 8, name: 'Robert Fox', email: 'kerri.lawson@example.com', city: 'Greensboro (NC)', createdDate: '5/30/14', active: true },
  { id: 9, name: 'Jenny Wilson', email: 'jackson.graham@example.com', city: 'Lübeck', createdDate: '5/27/15', active: true },
  { id: 10, name: 'Ralph Edwards', email: 'willie.jennings@example.com', city: 'Vladivostok', createdDate: '1/31/14', active: true },
  { id: 11, name: 'Cody Fisher', email: 'michelle.rivera@example.com', city: 'Krasnodar', createdDate: '5/18/12', active: false },
  { id: 12, name: 'Brooklyn Simmons', email: 'georgia.young@example.com', city: 'Rubtsovsk', createdDate: '7/18/17', active: true },
  { id: 13, name: 'Theresa Webb', email: 'debbie.baker@example.com', city: 'Herne', createdDate: '8/16/13', active: true },
  { id: 14, name: 'Darrell Steward', email: 'nathan.roberts@example.com', city: 'Bochum', createdDate: '10/6/13', active: true },
  { id: 15, name: 'Ronald Richards', email: 'nevaeh.simmons@example.com', city: 'Mönchengladbach', createdDate: '9/18/16', active: false },
  { id: 16, name: 'Jerome Bell', email: 'bill.sanders@example.com', city: 'Baton Rouge (LA)', createdDate: '9/4/15', active: true },
];

const ROWS_PER_PAGE = 10;
const TOTAL_PAGES = Math.ceil(MOCK_USERS.length / ROWS_PER_PAGE);

const UserListTable: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Filtering Logic
  const filteredUsers = MOCK_USERS.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination Logic
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + ROWS_PER_PAGE);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= TOTAL_PAGES) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      
      {/* Header and Search */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-800">User List</h2>
          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
            {filteredUsers.length} Users
          </span>
        </div>
        <div className="relative w-1/3 max-w-sm">
          <input
            type="text"
            placeholder="Search User"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to page 1 on new search
            }}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
          />
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>
      
      {/* Table Structure */}
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12"></th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-3/12">User name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-4/12">Email address</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">City</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">Account created date</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {paginatedUsers.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                <input type="checkbox" className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.city}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.createdDate}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-center items-center pt-6">
        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
          {/* Previous Button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 ${currentPage === 1 ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50'}`}
          >
            <span className="sr-only">Previous</span>
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            Previous
          </button>
          
          {/* Page Numbers */}
          {[...Array(TOTAL_PAGES)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              aria-current={currentPage === index + 1 ? 'page' : undefined}
              className={`relative hidden md:inline-flex items-center px-4 py-2 border text-sm font-medium ${
                currentPage === index + 1
                  ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {index + 1}
            </button>
          ))}
          
          {/* Next Button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === TOTAL_PAGES}
            className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 ${currentPage === TOTAL_PAGES ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50'}`}
          >
            Next
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default UserListTable;