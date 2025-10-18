"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useWishlist } from "@/components/contexts/WishlistContext";

export type GridProduct = {
  id: number;
  title: string;
  slug: string;
  price: number;
  stock: number;
  images: string[]; // first image first
  categorySlug?: string | null;
  subcategorySlug?: string | null;
  colorsHex?: string[];
};

export type GridCategory = {
  name: string;
  slug: string;
  products: GridProduct[];
};

function classNames(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
}

const SideArrows: React.FC<{ onPrev: () => void; onNext: () => void; disabled?: boolean }>= ({ onPrev, onNext, disabled }) => (
  <>
    <button
      aria-label="Previous image"
      className="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/0 text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (!disabled) onPrev(); }}
      disabled={!!disabled}
    >
      <span className="sr-only">Previous</span>
      <svg viewBox="0 0 24 24" className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
    </button>
    <button
      aria-label="Next image"
      className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/0 text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (!disabled) onNext(); }}
      disabled={!!disabled}
    >
      <span className="sr-only">Next</span>
      <svg viewBox="0 0 24 24" className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
    </button>
  </>
);

const ProductCard: React.FC<{ p: GridProduct }>= ({ p }) => {
  const [idx, setIdx] = useState(0);
  const [selectedColorIdx, setSelectedColorIdx] = useState<number | null>(null);
  const [hasHearted, setHasHearted] = useState(false);
  const [showSignal, setShowSignal] = useState(false);
  const { addToWishlist, removeFromWishlist, state: wishlistState } = useWishlist();
  const imgs = p.images && p.images.length ? p.images : ["/assets/productspecificatin/wallets.png"];
  const disableControls = imgs.length <= 1;
  const href = p.categorySlug && p.subcategorySlug
    ? `/leather-goods/${p.categorySlug}/${p.subcategorySlug}/${p.slug}`
    : p.categorySlug
      ? `/leather-goods/${p.categorySlug}/${p.slug}`
      : `/leather-goods/${p.slug}`;

  const next = () => setIdx((i) => (i + 1) % imgs.length);
  const prev = () => setIdx((i) => (i - 1 + imgs.length) % imgs.length);
  const colorDots = useMemo(() => (p.colorsHex || []).slice(0, 6), [p.colorsHex]);
  const isInWishlist = useMemo(() => wishlistState.items.some((it) => it.id === p.id), [wishlistState.items, p.id]);
  const isHearted = hasHearted || isInWishlist;

  const onHeart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isHearted) {
      await removeFromWishlist(p.id);
      setHasHearted(false);
      setShowSignal(false);
    } else {
      const ok = await addToWishlist(p.id);
      if (ok) {
        setHasHearted(true);
        setShowSignal(true);
        setTimeout(() => setShowSignal(false), 2000);
      }
    }
  };

  return (
    <Link href={href} className="group block"
      onMouseEnter={() => { if (!disableControls) setIdx(1 % imgs.length); }}
      onMouseLeave={() => setIdx(0)}
    >
  <div className="relative aspect-square overflow-hidden rounded-none bg-white dark:bg-black border border-black/5 dark:border-white/10 shadow-sm group-hover:shadow-md transition-shadow p-3 sm:p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgs[idx]}
          alt={p.title}
          className="w-full h-full object-contain transition-transform duration-300 rounded-none"
        />
        <SideArrows onPrev={prev} onNext={next} disabled={disableControls} />
        {/* Heart button - top-right, transparent luxe styling; toggles add/remove */}
        <button
          aria-label="Add to wishlist"
          onClick={onHeart}
          className={classNames(
            "absolute top-3 right-3 z-20 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm transition shadow-sm",
            "border border-black/15 dark:border-white/20 bg-transparent hover:bg-black/5 dark:hover:bg-white/10",
            isHearted ? "ring-1 ring-black/25" : ""
          )}
        >
          <svg
            viewBox="0 0 24 24"
            className={classNames("w-5 h-5 drop-shadow-sm",
              isHearted ? "fill-black text-black" : "fill-none text-black dark:text-white"
            )}
            fill={isHearted ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={isHearted ? 1.5 : 2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
          </svg>
        </button>
        {/* Yellow ping signal near heart*/}
        {showSignal && (
          <span className="absolute top-3 right-3 translate-x-2 -translate-y-2 z-20 inline-flex h-2.5 w-2.5 rounded-full bg-yellow-400">
            <span className="absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75 animate-ping"></span>
          </span>
        )}
        {/* subtle inset gradient for luxury feel */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
        {/* Bottom overlay row: left name + price, right colors (not hugging corners) */}
        <div className="absolute inset-x-0 bottom-0 z-20 pr-3 pb-3 pt-1 pl-4 sm:pl-5 pointer-events-none">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0 max-w-[70%]">
              <p className="text-[12px] sm:text-sm text-black dark:text-white lux-serif leading-snug line-clamp-1 drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)] transition duration-300 group-hover:opacity-0 group-hover:translate-y-1">
                {p.title}
              </p>
              <p className="text-xs sm:text-sm font-semibold tracking-wide text-black dark:text-white mt-0.5 transition duration-300 group-hover:opacity-0 group-hover:translate-y-1">
                Rs. {Number(p.price).toLocaleString("en-IN")}
              </p>
            </div>
            {colorDots.length > 0 && (
              <div className="flex items-center gap-2 transition duration-300 group-hover:opacity-0 group-hover:translate-y-1">
                {colorDots.map((hex, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Color option ${i + 1}`}
                    className={classNames(
                      "pointer-events-auto inline-flex items-center justify-center w-4 h-4 rounded-full border shadow-sm transition",
                      selectedColorIdx === i ? "scale-110 ring-2 ring-black/40 dark:ring-white/40" : "hover:scale-110",
                      "border-black/10 dark:border-white/20"
                    )}
                    style={{ backgroundColor: hex }}
                    onMouseEnter={(e) => { e.preventDefault(); setIdx(i % imgs.length); }}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedColorIdx(i); setIdx(i % imgs.length); }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

const ViewMoreCard: React.FC<{ href: string; label?: string }>= ({ href, label = "View more" }) => (
  <Link href={href} className="group block">
    <div className="relative aspect-square overflow-hidden rounded-none border border-black/10 dark:border-white/10 bg-[radial-gradient(circle_at_30%_20%,rgba(0,0,0,0.04),transparent_40%),white] dark:bg-black flex items-center justify-center shadow-sm group-hover:shadow-md">
      <div className="text-center">
        <div className="text-base sm:text-lg font-semibold text-black/80 dark:text-white group-hover:text-black dark:group-hover:text-white transition-colors">
          {label} <span aria-hidden>→</span>
        </div>
        <div className="mt-2 text-[11px] sm:text-xs text-black/50 dark:text-white/70 tracking-wide">Explore the full collection</div>
      </div>
    </div>
  </Link>
);

export default function CategoryGrid({ categories, titleClassName }: { categories: GridCategory[]; titleClassName?: string }) {
  return (
    <div className="space-y-12">
      {categories.map((cat) => {
        const prods = cat.products;
        const maxCards = Math.min(prods.length, 8); // show up to 8 including the view-more card
        const showCount = Math.max(0, Math.min(maxCards - 1, prods.length));
        const first = prods.slice(0, showCount);
        return (
          <section key={cat.slug} className="scroll-mt-24">
            <div className="flex items-center justify-between mb-6">
              <h2 className={classNames("text-2xl font-semibold text-black", titleClassName)}>{cat.name}</h2>
              <Link href={`/leather-goods/${cat.slug}`} className="text-sm text-black/70 hover:text-black underline">View all</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
              {first.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
              {/* Last tile as 'View more' */}
              <ViewMoreCard href={`/leather-goods/${cat.slug}`} />
            </div>
          </section>
        );
      })}
    </div>
  );
}
