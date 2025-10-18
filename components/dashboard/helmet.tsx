// src/components/Helmet.tsx
'use client';
import React from 'react';

// Helper component to load Tailwind CSS CDN styles.
// *** REMOVE THIS FILE AND ITS IMPORT IN A REAL PROJECT ***
export const Helmet = () => (
  <React.Fragment>
    {/* This script is only for online simulators. Remove for real projects. */}
    <script src="https://cdn.tailwindcss.com"></script>
    <style jsx global>
      {`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
        body {
          font-family: 'Inter', sans-serif;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          background-color: #f3f4f6;
        }
        .hover\\:shadow-3xl:hover {
          box-shadow: 0 20px 25px -5px rgba(59, 130, 246, 0.2), 0 10px 10px -5px rgba(59, 130, 246, 0.1);
        }
      `}
    </style>
  </React.Fragment>
);