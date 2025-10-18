"use client";
import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// small slugify helper
function slugify(str: string) {
  return str
    .toString()
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

interface CategorySection {
  id: number;
  title: string;
  imageUrl: string;
  imageAlt: string;
  layout: "imageLeft" | "imageRight";
  // New Field Added
  description: string; 
}

const sectionsData: CategorySection[] = [
  {
    id: 1,
    title: "DUFFLE BAGS",
    imageUrl: "/assets/Hero/duffle.png",
    imageAlt: "Pair of brown leather shoes",
    layout: "imageLeft",
    description: "Crafted for the journey, our Duffle Bags offer timeless style and rugged utility. Perfect for a weekend getaway or a quick escape.",
  },
  {
    id: 2,
    title: "SLING BAGS",
    imageUrl: "/assets/Hero/leather.png",
    imageAlt: "Red duffle bag floating in a desert scene",
    layout: "imageRight",
    description: "The ultimate blend of convenience and modern aesthetics. Keep your essentials close and secure with our versatile Sling Bags.",
  },
  {
    id: 3,
    title: "PREMIUM WALLETS",
    imageUrl: "/assets/Hero/IMG_5738 1.png",
    imageAlt: "Stack of black leather wallets",
    layout: "imageLeft",
    description: "Experience luxury in your pocket. Our Premium Wallets are handcrafted from the finest leather, designed for durability and elegance.",
  },
  {
    id: 4,
    title: "TROLLEY",
    imageUrl: "/assets/Hero/ANI01001 1.png",
    imageAlt: "Man and woman in leather jackets",
    layout: "imageRight",
    description: "Travel with sophistication. These Trolley bags combine sleek design with robust functionality for effortless international travel.",
  },
  {
    id: 5,
    title: "JACKETS",
    imageUrl: "/assets/Hero/image 81.png",
    imageAlt: "Brown leather belt with buckle",
    layout: "imageLeft",
    description: "Define your style with our iconic leather jackets. Each piece is a statement of rebellion and enduring quality.",
  },
  {
    id: 6,
    title: "GLOVES",
    imageUrl: "/assets/Hero/image 83.png",
    imageAlt: "Man wearing a black leather sling bag",
    layout: "imageRight",
    description: "Protect your hands with unmatched grip and luxury. Our driving gloves offer a smooth, comfortable, and stylish experience.",
  },
  {
    id: 7,
    title: "SHOES",
    imageUrl: "/assets/Hero/image 85.png",
    imageAlt: "Person pulling a black cylindrical trolley bag",
    layout: "imageLeft",
    description: "Step out in distinction. From classic oxfords to rugged boots, our leather shoes are built for comfort and longevity.",
  },
  {
    id: 8,
    title: "BELT",
    imageUrl: "/assets/Hero/image 86.png",
    imageAlt: "Hands wearing black leather driving gloves on a steering wheel",
    layout: "imageRight",
    description: "The essential finishing touch. Our genuine leather belts are the perfect accessory to complete any refined look.",
  },
];

const CategoryShowcase: React.FC = () => {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      const rows = gsap.utils.toArray<HTMLElement>(".cs-row");
      rows.forEach((row) => {
        const layout = row.dataset.layout || 'left';
        const image = row.querySelector<HTMLElement>('.cs-image');
        const text = row.querySelector<HTMLElement>('.cs-text');
        if (!image || !text) return;

        const fromXImg = layout === 'left' ? -80 : 80;
        const fromXTxt = layout === 'left' ? 80 : -80;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: row,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          }
        });
        tl.fromTo(image,
          { autoAlpha: 0, x: fromXImg },
          { autoAlpha: 1, x: 0, duration: prefersReduced ? 0.4 : 0.9, ease: 'power3.out' }
        ).fromTo(text,
          { autoAlpha: 0, x: fromXTxt },
          { autoAlpha: 1, x: 0, duration: prefersReduced ? 0.4 : 0.9, ease: 'power3.out' },
          '-=0.6'
        );
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="cs-bg-black text-white font-serif">
      <div className="text-center mt-12">
          <a
            href="/leather-goods?bestsellers=true"
            className="text-sm tracking-widest text-gray-400 hover:text-yellow-400 transition-colors duration-200 border-b border-white/70 hover:border-yellow-400 pb-1"
          >
            EXPLORE BEST SELLERS
          </a>
        </div>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
      {sectionsData.map((section, index) => {
        // zig-zag: image left on even indices, right on odd indices
        const imageOnLeft = index % 2 === 0;

        return (
          <div
            key={section.id}
            className={`cs-row flex flex-row md:flex-row items-center mb-12 w-full min-h-[10rem] md:min-h-[12rem]`}
            data-layout={imageOnLeft ? 'left' : 'right'}
          >
            {/* Image block */}
            <Link
              href={`/leather-goods/${slugify(section.title)}`}
              aria-label={`Shop ${section.title}`}
              className={`cs-image relative ${
                imageOnLeft ? "order-1 md:order-1" : "order-2 md:order-2"
              } overflow-hidden flex-shrink-0 w-[255px] h-[170px] md:w-[742px] md:h-[516px]`}
            >
              <Image
                src={section.imageUrl}
                alt={section.imageAlt}
                fill
                className="object-contain md:object-cover"
                priority={false}
              />
            </Link>

            {/* Text block */}
            <div
              className={`${
                imageOnLeft ? "order-2 md:order-2" : "order-1 md:order-1"
              } cs-text flex-1 flex items-center justify-center md:justify-start h-[170px] md:h-auto p-2 md:p-16 text-black`}
            >
              <div className="w-full text-center md:text-left">
                {/* Title */}
                <div className="flex flex-col md:block">
                  <h2 className="text-[24px] md:text-[80px] font-bodoni tracking-wide mb-0 uppercase leading-[1.05]">
                    <Link
                      href={`/leather-goods/${slugify(section.title)}`}
                      aria-label={`Shop ${section.title}`}
                    >
                      {section.title}
                    </Link>
                  </h2>
                </div>

                {/* paragraph HIDDEN on mobile, visible on md+ (Now uses the specific description) */}
                <p className="hidden md:block text-[28px] mb-6 mt-4 leading-snug">
                  {section.description}
                </p>

                {/* More link */}
                <div className="hidden md:flex items-center gap-4 mt-8">
                  <Link
                    href={`/leather-goods/${slugify(section.title)}`}
                    className="text-sm font-light tracking-wider uppercase cursor-pointer"
                    aria-label={`Shop ${section.title}`}
                  >
                    More
                  </Link>
                  <div className="h-px bg-white/70 flex-1" />
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <div className="relative mx-auto w-full max-w-[1037px] aspect-[1037/733] sm:max-w-none sm:aspect-[3/1] overflow-hidden mb-10 h-[295px] md:h-[733px]">
        <Image
          src="/assets/Hero/Rectangle 356.png"
          alt="Man and woman wearing leather jackets"
          fill
          className="object-cover"
          priority={false}
        />
      </div>
      </div>
    </div>
  );
};

export default CategoryShowcase;