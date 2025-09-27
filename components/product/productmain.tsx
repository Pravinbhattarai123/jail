"use client";

import Image from 'next/image';
import React, { useState, ReactNode } from 'react';

// --- Type Definitions ---
interface Color {
    name: string;
    hex: string;
    className: string;
}

interface PersonalizationOption {
    id: string;
    label: string;
    price: number;
}

interface ProductData {
    name: string;
    rating: number;
    reviewCount: number;
    delivery: {
        start: string;
        end: string;
    };
    price: number;
    colors: Color[];
    personalizationOptions: PersonalizationOption[];
    description: string;
    warranty: string;
    moreInfo: string;
    images: string[];
}

interface ProductFeature {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

interface Review {
    id: number;
    author: string;
    avatarUrl: string;
    date: string;
    rating: number;
    text: string;
}
interface ReviewStats {
    companyName: string;
    averageRating: number;
    totalReviews: number;
    ratingDistribution: { star: number; count: number }[];
}
// --- Helper Components for Icons ---
const StarIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
    <svg className={`w-5 h-5 ${filled ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
    </svg>
);
const ReviewStarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={`w-6 h-6 ${className}`} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z"/>
    </svg>
);
const ChevronLeftIcon: React.FC = () => (
    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
    </svg>
);

const ChevronRightIcon: React.FC = () => (
    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
    </svg>
);

const ChevronDownIcon: React.FC<{ open: boolean }> = ({ open }) => (
   <svg className={`w-5 h-5 text-gray-500 transform transition-transform duration-300 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
);

// --- Mock Data (to be replaced by API calls) ---
const productData: ProductData = {
    name: 'Premium Leather Wallet',
    rating: 4.5,
    reviewCount: 213,
    delivery: {
        start: 'Sat, 2 Aug',
        end: 'Tue, 5 Aug'
    },
    price: 6123,
    colors: [
        { name: 'Brown', hex: '#A0522D', className: 'bg-yellow-800' },
        { name: 'Black', hex: '#000000', className: 'bg-black' },
        { name: 'Green', hex: '#006400', className: 'bg-green-800' },
    ],
    personalizationOptions: [
        { id: 'engraving-motto', label: 'Add Personalized Engraving on Motto Flap - Crypto/Black', price: 600 },
        { id: 'engraving-slider', label: 'Add Personalized Engraving on Slider Flap - Crypto/Black', price: 650 },
    ],
    description: 'A finely crafted wallet made from genuine full-grain leather. It features multiple card slots, a clear ID window, and a spacious bill compartment. Its slim design ensures it fits comfortably in your pocket without adding bulk.',
    warranty: 'This product comes with a 2-year warranty covering manufacturing defects. Returns are accepted within 30 days of purchase for a full refund, provided the item is in its original condition.',
    moreInfo: 'Dimensions: 4.5" x 3.5" x 0.5". Material: 100% Genuine Leather. Care: Wipe with a soft, damp cloth. Avoid exposure to extreme heat and moisture.',
    images: [
        '/assets/productspecificatin/wallets.png',
      '/assets/productspecificatin/wallets.png',
       '/assets/productspecificatin/wallets.png',
        '/assets/productspecificatin/wallets.png',
    ]
};

const productFeatures: ProductFeature[] = [
  {
    id: '01',
    title: 'Flat Opening Tech Compartment',
    description: 'Fits upto 16 inches of laptop with a strap lock & a 180° flat opening for easy access. Additional 5 pockets to hold all your tech-accessories.',
    imageUrl:  '/assets/productspecificatin/wallets.png',
  },
  {
    id: '02',
    title: 'Front Bucket Compartment',
    description: 'Can easily hold up to 2 days change of clothes, along with your other essentials. Houses a retractable key holder, cardholder, pen pockets, slip pockets and a zipper pocket.',
    imageUrl:  '/assets/productspecificatin/wallets.png',
  },
  {
    id: '03',
    title: 'Quick Access Pocket',
    description: 'A dedicated quick access pocket for your smaller essentials like earphones, chargers, or a passport. Keeps your most used items within easy reach.',
    imageUrl:  '/assets/productspecificatin/wallets.png',
  }
];


const reviewStats: ReviewStats = {
    companyName: "Company Name",
    averageRating: 5.0,
    totalReviews: 500,
    ratingDistribution: [
        { star: 5, count: 450 },
        { star: 4, count: 30 },
        { star: 3, count: 10 },
        { star: 2, count: 5 },
        { star: 1, count: 5 },
    ]
};

const customerReviews: Review[] = [
    { id: 1, author: 'Maria Sheferd', avatarUrl: 'https://placehold.co/40x40/EFEFEF/333333?text=MS', date: '19/04/2024', rating: 5, text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco' },
    { id: 2, author: 'John Doe', avatarUrl: 'https://placehold.co/40x40/EFEFEF/333333?text=JD', date: '18/04/2024', rating: 5, text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco' },
    { id: 3, author: 'Jane Smith', avatarUrl: 'https://placehold.co/40x40/EFEFEF/333333?text=JS', date: '17/04/2024', rating: 5, text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco' },
    { id: 4, author: 'Peter Jones', avatarUrl: 'https://placehold.co/40x40/EFEFEF/333333?text=PJ', date: '16/04/2024', rating: 4, text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco', },
];


// --- Accordion Item Component ---
const AccordionItem: React.FC<{ title: string; children: ReactNode }> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    return (
        <div className="border-b border-gray-200 py-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex justify-between items-center w-full text-left text-gray-800 focus:outline-none"
            >
                <span className="font-medium">{title}</span>
                <ChevronDownIcon open={isOpen} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 mt-2' : 'max-h-0'}`}>
                <p className="text-gray-600 text-sm">
                    {children}
                </p>
            </div>
        </div>
    );
};

// --- Feature Section Component ---
type FeatureSectionProps = ProductFeature;
const FeatureSection: React.FC<FeatureSectionProps> = ({ id, title, description, imageUrl }) => {
  return (
    <div className="flex flex-col lg:flex-row items-center gap-12 md:gap-16">
      {/* Text Content */}
      <div className="w-full lg:w-1/2 flex-1 order-2 lg:order-1">
        <div className="flex items-center gap-4 mb-4">
          
          <span className="text-lg font-semibold text-gray-600">{id}</span>
          <div className="w-16 h-0.5 bg-gray-800"></div>
        </div>
        <h3 className="font-normal text-[48px] leading-[1.21] tracking-normal max-w-[503px] mb-6">
          {title}
        </h3>
        <p className="text-gray-600 text-base md:text-lg max-w-md">
          {description}
        </p>
      </div>
      
      {/* Image Content */}
      <div className="w-full lg:w-1/2 flex-1 flex items-center justify-center order-1 lg:order-2">
        <img 
          src={imageUrl} 
          alt={title}
          className="rounded-lg shadow-xl object-cover w-full h-auto max-w-[561px] max-h-[495px]"
          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = 'https://placehold.co/561x495/cccccc/FFFFFF?text=Image+Not+Found';
          }}
        />
      </div>
    </div>
  );
};

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
    <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
            <ReviewStarIcon key={i} className={i < rating ? 'text-red-500' : 'text-gray-300'} />
        ))}
    </div>
);

const ReviewCard: React.FC<{ review: Review }> = ({ review }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
        <StarRating rating={review.rating} />
        <p className="text-gray-600 my-4 text-sm">{review.text}</p>
        <div className="flex items-center">
            <img src={review.avatarUrl} alt={review.author} className="w-10 h-10 rounded-full mr-4" />
            <div>
                <p className="font-semibold text-gray-800">{review.author}</p>
                <p className="text-gray-500 text-xs">{review.date}</p>
            </div>
        </div>
    </div>
);

const CustomerReviewsSection: React.FC = () => {
    // In a real app, you would fetch reviewStats and customerReviews from an API
    const totalDistribution = reviewStats.ratingDistribution.reduce((sum, item) => sum + item.count, 0);

    return (
        <div className="bg-gray-50/50 font-sans py-12 md:py-24">
            <div className="max-w-6xl mx-auto px-4">
                <h1 className='font-bold text-center mb-10 text-4xl'>Verified Customer Reviews</h1>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Summary Card */}
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 flex flex-wrap items-center">
                        <div className="w-full sm:w-1/2 pr-4">
                            <h3 className="font-bold text-xl mb-4">{reviewStats.companyName}</h3>
                            <div className="space-y-2">
                                {reviewStats.ratingDistribution.map(item => (
                                    <div key={item.star} className="flex items-center text-sm">
                                        <span className="text-gray-600">{item.star}</span>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 mx-2">
                                            <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${(item.count / totalDistribution) * 100}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="w-full sm:w-1/2 flex flex-col items-center justify-center mt-6 sm:mt-0">
                            <p className="text-7xl font-bold text-gray-800">{reviewStats.averageRating.toFixed(1)}</p>
                            <p className="text-gray-500">{reviewStats.totalReviews} reviews</p>
                        </div>
                    </div>
                    {/* Customer Review Count Card */}
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 flex flex-col items-center justify-center text-center">
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => <ReviewStarIcon key={i} className="text-red-500" />)}
                        </div>
                        <p className="text-4xl font-bold mt-2">323</p>
                        <p className="text-gray-600">Customer Review</p>
                    </div>
                </div>

                {/* Individual Review Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                    {customerReviews.slice(0, 3).map(review => (
                        <ReviewCard key={review.id} review={review} />
                    ))}
                </div>

                {/* Bottom Single Review */}
                {customerReviews.length > 3 && (
                     <div className="flex items-start space-x-4">
                        <img src={customerReviews[3].avatarUrl} alt={customerReviews[3].author} className="w-10 h-10 rounded-full" />
                        <div className="flex-1">
                            <p className="text-gray-600 text-sm mb-2">{customerReviews[3].text}</p>
                            <StarRating rating={customerReviews[3].rating} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};


// --- Main Product Page Component ---
export default function App() {
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
    const [selectedColor, setSelectedColor] = useState<Color>(productData.colors[1]); // Default to black

    const handlePrevImage = (): void => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === 0 ? productData.images.length - 1 : prevIndex - 1
        );
    };

    const handleNextImage = (): void => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === productData.images.length - 1 ? 0 : prevIndex + 1
        );
    };

    return (
        <div className="font-sans bg-white p-4 sm:p-6 lg:p-8">
            {/* Product Details Section */}
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-10 ">
                
                {/* Image Gallery */}
                <div className="flex flex-col items-center">
                    <div className="relative w-full aspect-square max-w-md">
                        <img
                            src={productData.images[currentImageIndex]}
                            alt={`Premium Leather Wallet - View ${currentImageIndex + 1}`}
                            className="w-full h-full object-cover rounded-3xl shadow-sm"
                        />
                        <div className="absolute bottom-4 right-4 flex space-x-3">
                            <button onClick={handlePrevImage} className="bg-white rounded-md p-2 shadow-inner hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 border border-black">
                                <ChevronLeftIcon />
                            </button>
                            <button onClick={handleNextImage} className="bg-white rounded-md p-2 shadow-inner hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 border border-black">
                                <ChevronRightIcon />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Product Details */}
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-800">{productData.name}</h1>
                    
                    <div className="flex items-center mt-2">
                        <div className="flex">
                            {[...Array(5)].map((_, i) => (
                                <StarIcon key={i} filled={i < Math.floor(productData.rating)} />
                            ))}
                        </div>
                        <span className="text-gray-600 ml-2 text-sm">{productData.reviewCount} reviews</span>
                    </div>

                    <p className="text-sm text-gray-500 mt-4">
                        Expected delivery between <span className="font-medium text-gray-700">{productData.delivery.start}</span> - <span className="font-medium text-gray-700">{productData.delivery.end}</span>
                    </p>

                    <p className="text-4xl lg:text-5xl font-extrabold text-gray-900 mt-4">₹{productData.price.toLocaleString('en-IN')}</p>

                    <div className="mt-6">
                        <h3 className="text-sm font-medium text-gray-900">Color: <span className="font-normal text-gray-600">{selectedColor.name}</span></h3>
                        <div className="flex items-center space-x-3 mt-2">
                            {productData.colors.map((color) => (
                                <button
                                    key={color.name}
                                    onClick={() => setSelectedColor(color)}
                                    className={`w-8 h-8 rounded-full ${color.className} border-2 transition-all duration-200 ${selectedColor.name === color.name ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-1' : 'border-gray-300 hover:border-gray-500'}`}
                                    aria-label={`Select color ${color.name}`}
                                />
                            ))}
                        </div>
                    </div>
                    
                    <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-semibold text-gray-800">Personalize your Luxury</h3>
                        <div className="space-y-3 mt-3">
                            {productData.personalizationOptions.map((option) => (
                                <label key={option.id} className="flex items-center text-sm text-gray-600">
                                    <input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                    <span className="ml-3">{option.label} (+₹{option.price})</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    
                    <button className="w-full mt-8 bg-gray-900 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2">
                        Add To Cart
                    </button>

                    <p className="text-xs text-gray-500 mt-4 text-center">
                        Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy
                    </p>

                    <div className="mt-8">
                        <AccordionItem title="Description">
                            {productData.description}
                        </AccordionItem>
                        <AccordionItem title="Warranty & Return">
                            {productData.warranty}
                        </AccordionItem>
                        <AccordionItem title="More Information">
                           {productData.moreInfo}
                        </AccordionItem>
                    </div>

                </div>
            </div>

            <Image
                   src="/assets/productspecificatin/girlimage.png"
                   alt="Girl Image"
                   width={1560}
                   height={407}
                   className="rounded-4xl shadow-lg pl-3 mt-2"
                 />

            {/* Product Specification Section */}
            <div className="bg-white font-['Poppins',_sans-serif] text-gray-800">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
                    <h2 className="text-3xl md:text-5xl font-bold text-center mb-12 md:mb-24">
                      Product Specification
                    </h2>
                    <div className="space-y-20 md:space-y-32">
                      {productFeatures.map((feature) => (
                        <FeatureSection
                          key={feature.id}
                          id={feature.id}
                          title={feature.title}
                          description={feature.description}
                          imageUrl={feature.imageUrl}
                        />
                      ))}
                    </div>
                </div>
            </div>

              <CustomerReviewsSection />
        </div>
    );
};

