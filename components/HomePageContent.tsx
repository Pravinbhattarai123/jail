'use client'
import Image from 'next/image';
import React from 'react';
import CollectionDisplay from './Collectiondisplay';
import ShopByCategories from './ShopbyCategories';
import BestSellerSection from './BestsellerSection';


import CategoryShowcase from './CategoryShowcase';
import ImageSlider from './ImageSlider';

const HomePageContent: React.FC = () => {
    return (

        <div className="bg-neutral-800 text-white min-h-screen">

            {/* Hero Section - ALIBI Banner */}
            {/* Hero Section - ALIBI Banner */}
            <div className="relative w-full h-[500px] mb-8">

                {/* CORRECTED SRC PATH: /assets/Hero/herobanner.png */}

                <Image
                    src="/assets/Hero/herobanner.png"
                    alt="Quality Leather Goods Hero Banner"
                    fill
                    priority
                    className=" z-1 object-cover object-center"
                    sizes="(max-width: 768px) 100vw, 100vw"
                />

                <div>

                </div>
                <button className=' cursor-pointer absolute bg-gray-400 w-[245px] h-11 top-[452px] bottom-4 left-1/2 rounded-md z-2 -translate-x-1/2'>View Collecton</button>
                <h2 className=' absolute top-[500px] left-145  font-light text-[20px] leading-[120%] tracking-[0.14em] w-[203px] h-[24px] opacity-100 z-2 text-white'>From our gallery</h2>

            </div>


            <div>
                <ImageSlider/>
            </div>

            <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ">


                <div className=' flex gap-3 mb-16 justify-center'>
                    <div className="  w-[670px] h-[455px] bg-[url('/assets/Hero/Component%2024.png')] bg-cover bg-no-repeat opacity-100">
                        <div className=' relative flex flex-col  items-center  justify-center gap-1  '>
                            <h1 className=' w-[156px] h-[48px] font-normal text-[40px] leading-[120%] tracking-[0.14em] opacity-100 font-archivo '>DUFFLE</h1>
                            <p className='w-[360px] h-[22px]  text-[20px] leading-[120%] tracking-[0em] opacity-100 font-poppins font-[200] pl-4 '>Crafted for every on the go moment </p>
                        </div>
                        <div className=' flex pl-50 pt-75 '>

<button className='cursor-pointer bg-black h-[36px] w-[130px] relative '>Shop</button>

                        </div>

                        
                    </div>
                    <div className="w-[670px] h-[455px] bg-[url('/assets/Hero/Wallet.png')] bg-cover bg-no-repeat opacity-100">
                        {/* <h1 className='w-[156px] h-[48px] font-normal text-[40px] leading-[120%] tracking-[0.14em] opacity-100'>WALLET</h1>
        <h3>Made to feel the worth</h3>
        <button>Shop</button>*/}</div>
                </div>

                {/* another section */}

                {/* <div className=" flex justify-between w-[1210px] h-[445px] opacity-100 gap-[32px]">
                    <div className="bg-[url('/assets/Hero/travel-essentials.png')]"></div>
                    <div className="bg-[url('/assets/Hero/suitcaseboys.png')] "></div>
                    <div className="bg-[url('/assets/Hero/.png')]"></div>
                </div> */}
                 <div>
                    <ShopByCategories/>
                </div>

                <div className='gap-1'>
<CollectionDisplay />
                </div>
                <div>
                    <BestSellerSection/>
                </div>
                <div>
                    <CategoryShowcase/>
                </div>




              

                {/* About Us Section (White Box with Text and Image) */}
               

            </div> {/* End max-w-7xl div */}

            {/* Footer Section */}
            <footer className="bg-neutral-900 text-gray-400 p-8">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-white text-lg mb-4">ALIBI</h3>
                        <p className="text-sm">Quality Leather Goods since 1990.</p>
                    </div>
                    <div>
                        <h3 className="text-white text-lg mb-4">CATEGORIES</h3>
                        <ul className="space-y-2 text-sm">
                            <li><a href="/bags" className="hover:text-white transition-colors">Bags</a></li>
                            <li><a href="/wallets" className="hover:text-white transition-colors">Wallets</a></li>
                            <li><a href="/apparel" className="hover:text-white transition-colors">Apparel</a></li>
                            <li><a href="/accessories" className="hover:text-white transition-colors">Accessories</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-white text-lg mb-4">SUPPORT</h3>
                        <ul className="space-y-2 text-sm">
                            <li><a href="/contact" className="hover:text-white transition-colors">Contact Us</a></li>
                            <li><a href="/faq" className="hover:text-white transition-colors">FAQ</a></li>
                            <li><a href="/shipping" className="hover:text-white transition-colors">Shipping & Returns</a></li>
                            <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-white text-lg mb-4">FOLLOW US</h3>
                        <div className="flex space-x-4 text-xl">
                            <a href="#" className="hover:text-white transition-colors"> {/* FiFacebook */}  </a>
                            <a href="#" className="hover:text-white transition-colors"> {/* FiInstagram */} </a>
                            <a href="#" className="hover:text-white transition-colors"> {/* FiTwitter */}  </a>
                        </div>
                        <p className="mt-4 text-sm">&copy; 2023 ALIBI. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePageContent;