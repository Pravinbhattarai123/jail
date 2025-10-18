// src/components/Sidebar.js
'use client';
import React from 'react';
import Link from 'next/link'
import { usePathname , useRouter } from 'next/navigation'

const Sidebar = () => {
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 10a8 8 0 018-8v8h8a8 8 0 01-8 8v-8H2z"></path>
        <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>
      </svg>
  )},
  { name: 'Users', href: '/dashboard/users', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
      </svg>
    )},
    { name: 'Categories', href: '/dashboard/categories', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M4 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1H4zM4 11a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1v-3a1 1 0 00-1-1H4zM12 3a1 1 0 00-1 1v3a1 1 0 001 1h4a1 1 0 001-1V4a1 1 0 00-1-1h-4zM12 11a1 1 0 00-1 1v3a1 1 0 001 1h4a1 1 0 001-1v-3a1 1 0 00-1-1h-4z" />
      </svg>
    )},
    { name: 'Subcategories', href: '/dashboard/subcategories', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 2a1 1 0 011 1v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0V9H5a1 1 0 110-2h4V3a1 1 0 011-1z" />
      </svg>
    )},
    { name: 'Brands', href: '/dashboard/brands', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v9a1 1 0 01-1 1h-2l-3 2-3-2H5a1 1 0 01-1-1V6z" />
      </svg>
    )},
    { name: 'Products', href: '/dashboard/products', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 000 2h1v1a1 1 0 001 1h2a1 1 0 001-1v-1h1a1 1 0 001-1V9h1a1 1 0 000-2h-1V6a4 4 0 00-4-4zm-2 9a1 1 0 100 2h4a1 1 0 100-2h-4z" clipRule="evenodd"></path>
      </svg>
    )},
     { name: 'Orders', href: '/dashboard/orders', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 000 2h1v1a1 1 0 001 1h2a1 1 0 001-1v-1h1a1 1 0 001-1V9h1a1 1 0 000-2h-1V6a4 4 0 00-4-4zm-2 9a1 1 0 100 2h4a1 1 0 100-2h-4z" clipRule="evenodd"></path>
      </svg>
    )},
  ];

  return (
    <aside className="w-64 bg-white/90 backdrop-blur border-r border-gray-200 flex flex-col">
      <div className="h-16 px-6 flex items-center cursor-pointer border-b border-gray-100">
        <button onClick={() => {router.push('/')}} className="text-lg font-bold tracking-tight text-gray-900">Jail Luxury</button>
      </div>
      <nav className="p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href || '#'}
              className={`flex items-center px-3 py-2 rounded-md transition-colors duration-150 ${
                active
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="mr-3 text-gray-500">{item.icon}</span>
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;