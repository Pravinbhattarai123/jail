"use client";
import Image from "next/image";
import React, { useEffect, useRef } from "react";
import Link from "next/link";
import CollectionDisplay from "./Collectiondisplay";
import ShopByCategories from "./ShopbyCategories";
import BestSellerSection from "./BestsellerSection";
import CategoryShowcase from "./CategoryShowcase";
import ImageSlider from "./ImageSlider";
import JailLuxurySection from "./JailLuxurySection";
import Jailfooter from "./Jailfooter";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HeroDuo, { HeroItem } from "./HeroDuo";

gsap.registerPlugin(ScrollTrigger);

const HomePageContent: React.FC = () => {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;

    const ctx = gsap.context(() => {
      // Smooth reveal for each marked section
  const blocks = gsap.utils.toArray<HTMLElement>(".lux-reveal");
  blocks.forEach((el: HTMLElement, i: number) => {
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 40 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: "power2.out",
            delay: i * 0.05,
            scrollTrigger: {
              trigger: el,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      // Parallax subtle background motion for hero cards
  const parallaxCards = gsap.utils.toArray<HTMLElement>(".lux-parallax");
  parallaxCards.forEach((el: HTMLElement) => {
        gsap.to(el, {
          yPercent: -8,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.3,
          },
        });
      });

      // Ensure slider is visible immediately; gently scale on reveal only
      const slider = document.querySelector(".lux-hero-slider");
      if (slider) {
        gsap.set(slider, { autoAlpha: 1 });
        gsap.fromTo(
          slider,
          { scale: 0.98 },
          {
            scale: 1,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: slider as HTMLElement,
              start: "top 95%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // Footer fade-up as finale
      const footer = document.querySelector(".lux-footer");
      if (footer) {
        gsap.fromTo(
          footer,
          { autoAlpha: 0, y: 30 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: footer as HTMLElement,
              start: "top 90%",
            },
          }
        );
      }
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="overflow-x-hidden">
      {/* The Hero Section (ALIBI Banner) has been REMOVED from here.
        This includes the 'div' with classes 'relative w-full h-[500px] mb-8' 
        and its contents (Image and Button).
      */}
      <div className="lux-hero-slider lux-reveal">
        <ImageSlider />
      </div>
  <div className="w-full px-4 sm:px-6 lg:px-10 py-10">
        <HeroDuo
          items={[
            {
              id: 'duffle',
              title: 'DUFFLE',
              subtitle: 'Crafted for every on the go moment',
              imageUrl: '/assets/Hero/duffle.png',
              href: '/leather-goods/bags/duffle',
            },
            {
              id: 'wallet',
              title: 'WALLET',
              subtitle: 'Made to feel the worth',
              imageUrl: '/assets/Hero/Wallet.png',
              href: '/leather-goods/wallets',
            },
          ] as HeroItem[]}
        />

        {/* another section */}
        <div className="lux-reveal">
          <ShopByCategories />
        </div>

        <div className="gap-1 lux-reveal">
          <CollectionDisplay />
        </div>
        <div className="lux-reveal">
          <BestSellerSection />
        </div>
        <div className="lux-reveal">
          <CategoryShowcase />
        </div>

        {/* About Us Section */}
      </div>{" "}
      <div className="lux-reveal">
        <JailLuxurySection />
      </div>
      {/* Footer Section */}
      <div className="lux-footer lux-reveal">
        <Jailfooter />
      </div>
    </div>
  );
};

export default HomePageContent;
