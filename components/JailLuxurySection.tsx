// components/JailLuxurySection.tsx
"use client"; // This component might use client-side features if interactivity is added later

import Image from "next/image";
import React from "react";

const JailLuxurySection: React.FC = () => {
  return (
    // Outer container with Image 3 as background, padding, and max width
    // Using a div for the background image is more reliable than bg-[url()] on the main div
    <div className="relative w-full py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      
      {/* Content wrapper - centered, slightly transparent white background (as seen in Image 1) */}
      <div className="relative max-w-7xl mx-auto 
             bg-opacity-90 
             rounded-lg p-6 md:p-10 shadow-xl z-10 
             bg-[url('/assets/Hero/Rectangle635.png')] 
             bg-cover bg-center bg-blend-overlay">
        <h2 className="text-center text-4xl font-normal tracking-widest text-stone-700 mb-12 uppercase">
          JAIL LUXURY
        </h2>

        {/* Grid for image and text */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left Column: Image (Image 2) */}
          <div className="relative w-full h-96 md:h-[450px] overflow-hidden rounded-lg shadow-xl">
            <Image
              src="/assets/Hero/girimage.png" // Assuming you'd save Image 2 as this
              alt="Woman modeling a leather jacket for Jail Luxury"
              fill
              priority={false}
              className="rounded-lg z-1 object-cover"
            />
          </div>

          {/* Right Column: Text Content */}
          <div className="p-4 md:p-0"> {/* Adjusted padding for text content */}
            <h3 className="text-3xl font-light text-black mb-6">
              Why jail ?
            </h3>
            <p className="text-base text-gray-700 leading-relaxed">
              The name **"Jail" is more than just a brand**. It's a nod to our
              roots. The original shop was located on Jail Road in Banka, and the name
              was born out of the simplicity of direction "Jail
              Road, Jail Road." Today, it stands as a symbol of
              our journey, from a small shop in Bihar to a
              **luxury brand** that resonates with customers
              around the world.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JailLuxurySection;