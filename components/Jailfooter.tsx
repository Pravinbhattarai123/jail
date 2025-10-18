// components/JailLuxuryFooter.tsx
"use client";

import Image from "next/image";
import React, { useState } from "react";

const SectionHeading: React.FC<{
  title: string;
  className?: string;
}> = ({ title, className }) => (
  <h3 className={`text-black text-lg mb-4 bg-white px-3 py-1 rounded-none inline-block ${className || ""}`}>
    {title}
  </h3>
);

const Chevron: React.FC<{ open: boolean }> = ({ open }) => (
  <svg
    className={`h-5 w-5 transform transition-transform ${open ? "rotate-180" : "rotate-0"}`}
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
      clipRule="evenodd"
    />
  </svg>
);

const JailLuxuryFooter: React.FC = () => {
  const [openCompany, setOpenCompany] = useState(false);
  const [openHelp, setOpenHelp] = useState(false);
  const [openShop, setOpenShop] = useState(false);
  const [openLocation, setOpenLocation] = useState(false);

  return (
    // Outer container for the entire footer section
    <footer className="relative w-full overflow-hidden py-12 text-white">
      {/* Background Image (corrected path) */}
      <Image
        src="/assets/Hero/ft.png"
        alt="Footer background"
        fill
        priority
        className="object-cover object-center z-0"
        sizes="100vw"
      />

      {/* Content Wrapper - positioned above the background image */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Mobile layout: accordions */}
        <div className="md:hidden space-y-6 pb-8 border-b border-white/20">
          {/* Brand info */}
          <div className="text-center">
            <div className="mb-4 flex items-center justify-center">
              <Image
                src="/assets/Hero/jail.png"
                alt="Jail Luxury Logo"
                width={48}
                height={48}
              />
              <span className="text-white text-3xl font-bold ml-2">LUXURY</span>
            </div>
            <p className="text-sm leading-relaxed mb-3 opacity-90">
              Jail is a luxury e-commerce store which sells premium leather products
            </p>
            <p className="text-sm">
              Mobile:{" "}
              <a href="tel:+918585858586" className="text-white underline underline-offset-4">
                +91-8585858586
              </a>
            </p>
            <p className="text-sm mt-1">
              Email:{" "}
              <a href="mailto:support@jailluxury.com" className="text-white underline underline-offset-4">
                support@jailluxury.com
              </a>
            </p>
          </div>

          {/* Accordions */}
          <div className="divide-y divide-white/15 rounded-lg bg-black/10 backdrop-blur-sm">
            {/* Company */}
            <div>
              <button
                className="w-full flex items-center justify-between px-4 py-3"
                onClick={() => setOpenCompany((v) => !v)}
                aria-expanded={openCompany}
              >
                <span className="font-semibold">Company</span>
                <Chevron open={openCompany} />
              </button>
              {openCompany && (
                <div className="px-4 pb-3">
                  <ul className="space-y-2 text-sm">
                    <li>
                      <a href="/about-us" className="hover:underline">About Us</a>
                    </li>
                    <li>
                      <a href="/contact" className="hover:underline">Contact Us</a>
                    </li>
                  </ul>
                </div>
              )}
            </div>
            {/* Help */}
            <div>
              <button
                className="w-full flex items-center justify-between px-4 py-3"
                onClick={() => setOpenHelp((v) => !v)}
                aria-expanded={openHelp}
              >
                <span className="font-semibold">Help</span>
                <Chevron open={openHelp} />
              </button>
              {openHelp && (
                <div className="px-4 pb-3">
                  <ul className="space-y-2 text-sm">
                    <li><a href="/terms" className="hover:underline">Terms and Conditions</a></li>
                    <li><a href="/privacy" className="hover:underline">Privacy Policy</a></li>
                    <li><a href="/returns" className="hover:underline">Returns and Refunds Policy</a></li>
                    <li><a href="/shipping" className="hover:underline">Shipping Policy</a></li>
                    <li><a href="/cancellation" className="hover:underline">Cancellation Policy</a></li>
                  </ul>
                </div>
              )}
            </div>
            {/* Shop Products */}
            <div>
              <button
                className="w-full flex items-center justify-between px-4 py-3"
                onClick={() => setOpenShop((v) => !v)}
                aria-expanded={openShop}
              >
                <span className="font-semibold">Shop Products</span>
                <Chevron open={openShop} />
              </button>
              {openShop && (
                <div className="px-4 pb-3">
                  <ul className="space-y-2 text-sm">
                    <li><a href="/leather-goods/bags" className="hover:underline">Bags</a></li>
                    <li><a href="/leather-goods/belts" className="hover:underline">Belts</a></li>
                    <li><a href="/leather-goods/duffle-bags" className="hover:underline">Duffle Bags</a></li>
                    <li><a href="/leather-goods/gloves" className="hover:underline">Gloves</a></li>
                    <li><a href="/leather-goods/jackets" className="hover:underline">Jackets</a></li>
                    <li><a href="/leather-goods/shoes" className="hover:underline">Shoes</a></li>
                    <li><a href="/leather-goods/trolley" className="hover:underline">Trolley</a></li>
                    <li><a href="/leather-goods/wallets" className="hover:underline">Wallets</a></li>
                  </ul>
                </div>
              )}
            </div>
            {/* Location */}
            <div>
              <button
                className="w-full flex items-center justify-between px-4 py-3"
                onClick={() => setOpenLocation((v) => !v)}
                aria-expanded={openLocation}
              >
                <span className="font-semibold">Location</span>
                <Chevron open={openLocation} />
              </button>
              {openLocation && (
                <div className="px-4 pb-3 text-sm leading-relaxed">
                  <address className="not-italic opacity-90">
                    3633 Prabhhash Complex
                    <br />
                    Mukundapur Bhagwanpur – 24
                    <br />
                    South Pargana
                    <br />
                    Kolkata 700150
                    <br />
                    India
                  </address>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop layout: original 4-column grid */}
        <div className="hidden md:grid grid-cols-4 gap-x-8 gap-y-12 pb-8 border-b border-gray-700/50">
          {/* Column 1: Brand Info */}
          <div className="flex flex-col items-center md:border-r md:border-white/30 md:pr-8 text-center">
            <div className="w-full flex flex-col items-center">
              <div className="mb-4 flex items-center justify-center">
                <Image src="/assets/Hero/jail.png" alt="Jail Luxury Logo" width={50} height={50} />
                <span className="text-white text-3xl font-bold ml-2">LUXURY</span>
              </div>
              <p className="text-sm leading-relaxed mb-4">
                Jail is a luxury e-commerce store which sells premium leather products
              </p>
              <p className="text-sm">
                Mobile: <a href="tel:+918585858586" className="text-white hover:text-yellow-500 transition-colors">+91-8585858586</a>
              </p>
              <p className="text-sm mt-1">
                Email: <a href="mailto:support@jailluxury.com" className="text-white hover:text-yellow-500 transition-colors">support@jailluxury.com</a>
              </p>
            </div>
          </div>

          {/* Column 2: Company & Help */}
          <div className="md:border-r md:border-white/30 md:pr-8 flex flex-col items-center">
            <div className="flex flex-col sm:flex-row gap-8 justify-center w-full">
              <div className="flex flex-col items-center text-center">
                <SectionHeading title="Company" />
                <ul className="space-y-2 text-sm">
                  <li><a href="/about-us" className="hover:text-white transition-colors">About Us</a></li>
                  <li><a href="/contact" className="hover:text-white transition-colors">Contact Us</a></li>
                </ul>
              </div>
              <div className="self-stretch w-px bg-white/30 h-auto hidden sm:block" />
              <div className="flex flex-col items-center text-center">
                <SectionHeading title="Help" />
                <ul className="space-y-2 text-sm">
                  <li><a href="/terms" className="hover:text-white transition-colors">Terms and Conditions</a></li>
                  <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                  <li><a href="/returns" className="hover:text-white transition-colors">Returns and Refunds Policy</a></li>
                  <li><a href="/shipping" className="hover:text-white transition-colors">Shipping Policy</a></li>
                  <li><a href="/cancellation" className="hover:text-white transition-colors">Cancellation Policy</a></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Column 3: Shop Products */}
          <div className="md:border-r md:border-white/30 md:pr-8 flex flex-col items-center text-center">
            <SectionHeading title="Shop Products" />
            <ul className="space-y-2 text-sm">
              <li><a href="/leather-goods/bags" className="hover:text-white transition-colors">Bags</a></li>
              <li><a href="/leather-goods/belts" className="hover:text-white transition-colors">Belts</a></li>
              <li><a href="/leather-goods/duffle-bags" className="hover:text-white transition-colors">Duffle Bags</a></li>
              <li><a href="/leather-goods/gloves" className="hover:text-white transition-colors">Gloves</a></li>
              <li><a href="/leather-goods/jackets" className="hover:text-white transition-colors">Jackets</a></li>
              <li><a href="/leather-goods/shoes" className="hover:text-white transition-colors">Shoes</a></li>
              <li><a href="/leather-goods/trolley" className="hover:text-white transition-colors">Trolley</a></li>
              <li><a href="/leather-goods/wallets" className="hover:text-white transition-colors">Wallets</a></li>
            </ul>
          </div>

          {/* Column 4: Location */}
          <div className="flex flex-col items-center text-center">
            <SectionHeading title="Location" />
            <address className="not-italic text-sm leading-relaxed">
              3633 Prabhhash Complex
              <br />
              Mukundapur Bhagwanpur – 24
              <br />
              South Pargana
              <br />
              Kolkata 700150
              <br />
              India
            </address>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="pt-8 text-center text-sm">
          <p>&copy; Copyright 2025 Jail Luxury. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default JailLuxuryFooter;
