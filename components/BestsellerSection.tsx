// NOTE: Replaced Next.js 'Image' with standard 'img' for compilation.

import React, { useState } from "react";

// --- Data Structures ---

interface Product {
  name: string;
  mrp: string;
  colors: string[];
}

interface ProductCategory {
  image: string;
  alt: string;
  details: Product;
}

interface CategoryData {
  categories: ProductCategory[];
}

// --- Static Hero Data (UPDATED to use specified paths: /assest/hero/...) ---
const menHeroData = {
  // Using specified relative path
  Image: "assets/hero/forhim.png",
  heroAlt: "Man wearing a black leather backpack in a forest",
  collection: "FOR HIM",
  link: "products/men",
};

const womenHeroData = {
  // Using specified relative path
  Image: "assets/hero/forher.png",
  heroAlt: "Woman wearing a black and red shoulder bag",
  collection: "FOR HER",
  link: "products/women",
};

// --- Product Categories Data ---
// Using placeholder images for categories since the actual assets are not available.
const menCategories: CategoryData = {
  categories: [
    {
      image: "assets/hero/IMG_5738 1.png",
      alt: "Premium leather wallet",
      details: {
        name: "Leather Wallet",
        mrp: "₹2,499",
        colors: ["bg-black", "bg-amber-800", "bg-gray-800"],
      },
    },
    {
      image: "assets/hero/image 86.png",
      alt: "Genuine leather belt",
      details: {
        name: "Leather Belt",
        mrp: "₹1,899",
        colors: ["bg-black", "bg-amber-900", "bg-gray-700"],
      },
    },
    {
      image: "assets/hero/image 85.png",
      alt: "Formal leather shoes",
      details: {
        name: "Formal Shoes",
        mrp: "₹8,999",
        colors: ["bg-black", "bg-amber-800", "bg-gray-900"],
      },
    },
    {
      image: "assets/hero/image 83.png",
      alt: "Luxury wrist watch",
      details: {
        name: "Gloves",
        mrp: "₹15,999",
        colors: ["bg-black", "bg-yellow-600", "bg-gray-400"],
      },
    },
  ],
};

const womenCategories: CategoryData = {
  categories: [
    {
      image: "https://placehold.co/400x400/3d3d3d/FFFFFF?text=Sling+Bag",
      alt: "Elegant sling bag",
      details: {
        name: "Sling Bag",
        mrp: "₹3,499",
        colors: ["bg-black", "bg-pink-400", "bg-red-600"],
      },
    },
    {
      image: "https://placehold.co/400x400/3d3d3d/FFFFFF?text=Duffle",
      alt: "Travel duffle bag",
      details: {
        name: "Duffle Bag",
        mrp: "₹4,999",
        colors: ["bg-black", "bg-purple-600", "bg-blue-600"],
      },
    },
    {
      image: "https://placehold.co/400x400/3d3d3d/FFFFFF?text=Carryon",
      alt: "Premium suitcase",
      details: {
        name: "Steamer Carryon",
        mrp: "₹31,000",
        colors: ["bg-red-900", "bg-yellow-400", "bg-white"],
      },
    },
    {
      image: "https://placehold.co/400x400/3d3d3d/FFFFFF?text=Jacket",
      alt: "Jackets",
      details: {
        name: "Jackets",
        mrp: "₹6,999",
        colors: ["bg-black", "bg-green-300", "bg-blue-400"],
      },
    },
  ],
};

// --- Component ---

const BestSellerSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"MEN" | "WOMEN">("MEN");

  // Get current categories based on active tab
  const activeCategories =
    activeTab === "MEN" ? menCategories.categories : womenCategories.categories;

  // Tailwind class for the gold border line
  const goldBorder = "border-t border-b border-yellow-800";
  const tabStyles = (tab: "MEN" | "WOMEN") =>
    `text-lg font-medium cursor-pointer transition-colors duration-300 ${
      activeTab === tab
        ? "text-black border-b-2 border-black"
        : "text-black/60 hover:text-black"
    } pb-1 px-4`;

  // Generic click handler for the Hero Cards
  const handleHeroClick = (collection: string, link: string) => {
    console.log(`Redirecting to ${collection} at ${link}`);
    // Simulate navigation by assigning the link to window.location.href
    window.location.href = link;
  };

  return (
    <section className="py-16 font-serif bg-transparent text-black">
      <div className="max-w-7xl mx-auto px-4">
        {/* --- Top Section: FOR HIM / FOR HER (Interactive & Centered) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2  gap-4 mb-8 sm:mb-10">
          {/* Card 1: FOR HIM (Interactive and Centered) */}
          <div
            className="relative aspect-[4/3] overflow-hidden rounded-lg group cursor-pointer shadow-xl bg-transparent"
            onClick={() =>
              handleHeroClick(menHeroData.collection, menHeroData.link)
            }
          >
            {/* Image (Using direct image path from menHeroData) */}
            <img
              src={menHeroData.Image}
              alt={menHeroData.heroAlt}
              className="w-full h-full z-30 object-cover transition-transform duration-700 ease-in-out group-hover:scale-[1.03]"
            />

            {/* Dark Overlay for text readability */}
            {/* <div className="absolute inset-0 bg-black bg-opacity-30 transition-opacity duration-500 group-hover:bg-opacity-40"></div> */}

            {/* Centered Text */}
            <div className="absolute inset-0 flex justify-center items-center bg-transparent">
              <span className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tighter text-center text-white/90">
                {menHeroData.collection}
              </span>
            </div>
          </div>

          {/* Card 2: FOR HER (Interactive and Centered) */}
          <div
            className="relative aspect-[4/3] overflow-hidden rounded-lg group cursor-pointer shadow-xl bg-transparent"
            onClick={() =>
              handleHeroClick(womenHeroData.collection, womenHeroData.link)
            }
          >
            {/* Image (Using direct image path from womenHeroData) */}
            <img
              src={womenHeroData.Image}
              alt={womenHeroData.heroAlt}
              className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-[1.03]"
            />

            {/* Dark Overlay for text readability */}
            {/* <div className="absolute inset-0 bg-black bg-opacity-30 transition-opacity duration-500 group-hover:bg-opacity-40"></div> */}

            {/* Centered Text */}
            <div className="absolute inset-0 flex justify-center items-center bg-transparent">
              <span className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tighter text-center text-white/90">
                {womenHeroData.collection}
              </span>
            </div>
          </div>
        </div>

        {/* --- Center Section: OUR BEST SELLER & Tabs --- */}
        <div className="flex flex-col items-center">
          <p className="text-sm tracking-widest text-black/80 uppercase mb-4">
            OUR BEST SELLER
          </p>

          <div className={`w-full ${goldBorder}`}>
            <div className="flex justify-center space-x-8 py-3">
              <span
                className={tabStyles("MEN")}
                onClick={() => setActiveTab("MEN")}
              >
                MEN
              </span>
              <span
                className={tabStyles("WOMEN")}
                onClick={() => setActiveTab("WOMEN")}
              >
                WOMEN
              </span>
            </div>
          </div>
        </div>

        {/* --- Bottom Section: Product Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
          {activeCategories.map((category, index) => (
            <div
              key={`${activeTab}-${index}`}
              className="relative flex flex-col items-center group cursor-pointer"
            >
              {/* Product Image (Using placeholder images) */}
              <div className="relative w-full aspect-square overflow-hidden rounded-lg transition-transform duration-300 group-hover:scale-105">
                <img
                  src={category.image}
                  alt={category.alt}
                  className="w-full h-full object-cover transition-brightness duration-300 group-hover:brightness-110"
                />
              </div>
              <div className="text-center mt-4">
                <p className="text-lg font-normal transition-colors duration-300 group-hover:text-yellow-400">
                  {category.details.name}
                </p>
                <p className="text-sm text-gray-400">
                  MRP {category.details.mrp}
                </p>
                <div className="flex justify-center space-x-2 mt-2">
                  {category.details.colors.map((colorClass, colorIndex) => (
                    <div
                      key={colorIndex}
                      className={`w-3 h-3 rounded-full ${colorClass} border border-gray-600 transition-transform duration-300 hover:scale-125`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* --- Bottom Link --- */}
        
      </div>
    </section>
  );
};

export default BestSellerSection;
