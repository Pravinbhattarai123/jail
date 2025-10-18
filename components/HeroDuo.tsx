"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useMemo, useState } from "react";

export interface HeroItem {
  id: string | number;
  title: string;
  subtitle: string;
  imageUrl: string; // background image URL
  href: string;
}

interface HeroDuoProps {
  items: HeroItem[]; // typically 2, but supports more
}

// Two-card hero section with mobile image ratio 615x455 and overlay content
const HeroDuo: React.FC<HeroDuoProps> = ({ items }) => {
  const slides = useMemo(() => items ?? [], [items]);
  const [index, setIndex] = useState(0);
  const go = (dir: 1 | -1) => {
    if (!slides.length) return;
    setIndex((prev) => (prev + dir + slides.length) % slides.length);
  };

  const renderCard = (item: HeroItem) => (
    <div
      className="relative w-full isolate bg-transparent"
      style={{
        aspectRatio: "615 / 455",
        backgroundColor: 'transparent',
        backgroundImage: `url(${item.imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center'
      }}
    >
      <Image src={item.imageUrl} alt={item.title} fill priority={true} sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover z-0" />
      {/* Overlay content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-between py-6 sm:py-8 text-black bg-transparent">
        <div className="flex flex-col items-center text-center">
          <h1 className="font-normal text-2xl sm:text-3xl lg:text-4xl leading-tight tracking-widest font-archivo uppercase">
            {item.title}
          </h1>
          <p className="text-sm sm:text-base lg:text-lg leading-snug font-poppins font-light mt-2">
            {item.subtitle}
          </p>
        </div>
        <Link href={item.href} className="inline-block">
          <button className="cursor-pointer h-10 min-w-28 px-6 rounded transition-colors bg-[#CFC5BD] text-black hover:opacity-95 sm:bg-black sm:text-white sm:hover:bg-neutral-900">
            Shop
          </button>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile: slider with rounded corners and bottom-right controls */}
  <div className="block lg:hidden mb-12 overflow-hidden relative z-10">
        <div className="lux-parallax lux-reveal relative overflow-hidden rounded-2xl shadow-sm">
          <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${index * 100}%)` }}>
            {slides.map((s) => (
              <div key={s.id} className="flex-none w-full">
                {renderCard(s)}
              </div>
            ))}
          </div>
          {/* Nav cluster bottom-right */}
          <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm rounded-2xl shadow p-1.5 flex items-center gap-1">
            <button aria-label="Previous" onClick={() => go(-1)} className="w-8 h-8 rounded-full bg-white text-gray-800 border border-gray-200 flex items-center justify-center hover:shadow">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <button aria-label="Next" onClick={() => go(1)} className="w-8 h-8 rounded-full bg-white text-gray-800 border border-gray-200 flex items-center justify-center hover:shadow">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop/tablet: two-column grid */}
  <div className="hidden lg:grid grid-cols-2 gap-4 sm:gap-6 mb-12 overflow-hidden relative z-10">
        {slides.map((item) => (
          <div key={item.id} className="lux-parallax lux-reveal relative w-full rounded-lg overflow-hidden">
            {renderCard(item)}
          </div>
        ))}
      </div>
    </>
  );
};

export default HeroDuo;
