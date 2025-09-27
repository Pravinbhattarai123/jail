"use client";

import React, { useState, useMemo } from 'react';

// --- Type Definitions ---
interface ProductColor {
    name: string;
    hex: string;
}

interface Product {
    id: number;
    name: string;
    category: string;
    price: number;
    inStock: boolean;
    colors: ProductColor[];
    imageUrl: string;
}

// --- Helper Components for Icons ---
const FilterIcon: React.FC = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h18M3 10h12M3 16h6"></path>
    </svg>
);

const ChevronDownIcon: React.FC<{ open: boolean }> = ({ open }) => (
    <svg className={`w-5 h-5 text-gray-500 transform transition-transform duration-300 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
);

const AddToBagIcon: React.FC = () => (
    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
    </svg>
);


// --- Mock Data ---
const mockProducts: Product[] = [
    { id: 1, name: 'Leawal | High Quality Leather Wallet', category: 'Wallets', price: 6050, inStock: true, colors: [{ name: 'Brown', hex: '#A0522D' }, { name: 'Black', hex: '#000000' }, { name: 'Green', hex: '#006400' }], imageUrl: 'https://placehold.co/300x300/000000/FFFFFF?text=Wallet' },
    { id: 2, name: 'Leawal | High Quality Leather Wallet', category: 'Wallets', price: 6050, inStock: true, colors: [{ name: 'Brown', hex: '#A0522D' }, { name: 'Black', hex: '#000000' }], imageUrl: 'https://placehold.co/300x300/000000/FFFFFF?text=Wallet' },
    { id: 3, name: 'Leawal | High Quality Leather Wallet', category: 'Wallets', price: 6050, inStock: false, colors: [{ name: 'Black', hex: '#000000' }, { name: 'Green', hex: '#006400' }], imageUrl: 'https://placehold.co/300x300/000000/FFFFFF?text=Wallet' },
    { id: 4, name: 'Slim Card Holder', category: 'Wallets', price: 2500, inStock: true, colors: [{ name: 'Red', hex: '#B22222' }, { name: 'Yellow', hex: '#FFD700' }], imageUrl: 'https://placehold.co/300x300/000000/FFFFFF?text=Wallet' },
    { id: 5, name: 'Travel Wallet', category: 'Wallets', price: 8000, inStock: true, colors: [{ name: 'Green', hex: '#006400' }, { name: 'Gray', hex: '#808080' }], imageUrl: 'https://placehold.co/300x300/000000/FFFFFF?text=Wallet' },
    { id: 6, name: 'Bifold Classic', category: 'Wallets', price: 5500, inStock: true, colors: [{ name: 'Brown', hex: '#A0522D' }, { name: 'Black', hex: '#000000' }], imageUrl: 'https://placehold.co/300x300/000000/FFFFFF?text=Wallet' },
];

const availableColors: ProductColor[] = [
    { name: 'Brown', hex: '#8B4513' },
    { name: 'Red', hex: '#B22222' },
    { name: 'Black', hex: '#000000' },
    { name: 'Gray', hex: '#808080' },
    { name: 'Green', hex: '#228B22' },
    { name: 'Yellow', hex: '#DAA520' }
];

// --- Sub-Components ---
const ProductCard: React.FC<{ product: Product }> = ({ product }) => (
    <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-100/50">
        <div className="bg-gray-100 rounded-lg mb-4">
            <img src={product.imageUrl} alt={product.name} className="w-full h-auto object-cover rounded-lg" />
        </div>
        <p className="text-gray-600 text-sm">{product.name} | Black</p>
        <p className="font-bold text-lg my-2">Rs. {product.price.toLocaleString('en-IN')}</p>
        <div className="flex items-center justify-between">
            <div className="flex space-x-2">
                {product.colors.map(color => (
                    <span key={color.name} className="w-5 h-5 rounded-full border border-gray-200" style={{ backgroundColor: color.hex }}></span>
                ))}
            </div>
            <button className="bg-black text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center hover:bg-gray-800 transition-colors">
                <AddToBagIcon />
                Add to bag
            </button>
        </div>
    </div>
);

const FilterSidebar: React.FC<{
    inStockOnly: boolean;
    setInStockOnly: (val: boolean) => void;
    maxPrice: number;
    setMaxPrice: (price: number) => void;
    selectedColors: string[];
    setSelectedColors: (colors: string[]) => void;
}> = ({ inStockOnly, setInStockOnly, maxPrice, setMaxPrice, selectedColors, setSelectedColors }) => {

    const [priceOpen, setPriceOpen] = useState(true);
    const [colorOpen, setColorOpen] = useState(true);

    const handleColorToggle = (colorName: string) => {
        const newColors = selectedColors.includes(colorName)
            ? selectedColors.filter(c => c !== colorName)
            : [...selectedColors, colorName];
        setSelectedColors(newColors);
    };

    const SLIDER_MAX = 10000;
    const tooltipPosition = (maxPrice / SLIDER_MAX) * 100;

    return (
        <div className="w-full lg:w-64">
            <div className="flex items-center mb-6">
                <FilterIcon />
                <h2 className="text-lg font-semibold ml-2">Filter</h2>
            </div>

            <div className="space-y-6">
                <div>
                    <div className="flex items-center justify-between">
                        <label htmlFor="in-stock" className="text-gray-700">In stock only</label>
                        <button
                            id="in-stock"
                            onClick={() => setInStockOnly(!inStockOnly)}
                            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${inStockOnly ? 'bg-black' : 'bg-gray-200'}`}
                        >
                            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${inStockOnly ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                    <button onClick={() => setPriceOpen(!priceOpen)} className="w-full flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-gray-800">Price</h3>
                        <ChevronDownIcon open={priceOpen} />
                    </button>
                    {priceOpen && (
                        <div className="relative pt-6">
                            <div 
                                className="absolute -top-2 bg-black text-white text-xs rounded py-1 px-2 pointer-events-none"
                                style={{ 
                                    left: `calc(${tooltipPosition}% - 20px)`,
                                }}
                            >
                                Rs.{maxPrice}
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                                <span>Rs.0</span>
                                <span>Rs.{SLIDER_MAX}</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" 
                                max={SLIDER_MAX}
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2 accent-black" 
                            />
                        </div>
                    )}
                </div>

                <div className="border-t border-gray-200 pt-4">
                    <button onClick={() => setColorOpen(!colorOpen)} className="w-full flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-gray-800">Color</h3>
                         <ChevronDownIcon open={colorOpen} />
                    </button>
                    {colorOpen && (
                        <div className="flex flex-wrap gap-3">
                            {availableColors.map(color => (
                                <button
                                    key={color.name}
                                    onClick={() => handleColorToggle(color.name)}
                                    className={`w-8 h-8 rounded-md border-2 p-0.5 ${selectedColors.includes(color.name) ? 'border-black' : 'border-transparent'}`}
                                >
                                    <div className="w-full h-full rounded-sm" style={{ backgroundColor: color.hex }}></div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Main Page Component ---
export default function ProductListingPage() {
    const [inStockOnly, setInStockOnly] = useState(false);
    const [maxPrice, setMaxPrice] = useState(5000);
    const [selectedColors, setSelectedColors] = useState<string[]>([]);

    const filteredProducts = useMemo(() => {
        return mockProducts.filter(product => {
            if (inStockOnly && !product.inStock) return false;
            if (product.price > maxPrice) return false;
            if (selectedColors.length > 0 && !product.colors.some(pc => selectedColors.includes(pc.name))) return false;
            return true;
        });
    }, [inStockOnly, maxPrice, selectedColors]);

    return (
        <div className="bg-gray-50 min-h-screen font-sans p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-center mb-10">Wallets</h1>
                <div className="flex flex-col lg:flex-row gap-8">
                    <FilterSidebar 
                        inStockOnly={inStockOnly} 
                        setInStockOnly={setInStockOnly}
                        maxPrice={maxPrice}
                        setMaxPrice={setMaxPrice}
                        selectedColors={selectedColors}
                        setSelectedColors={setSelectedColors}
                    />
                    <div className="flex-1">
                        {filteredProducts.length > 0 ? (
                             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {filteredProducts.map(product => <ProductCard key={product.id} product={product} />)}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <p className="text-gray-500">No products match your filters.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

