import React from "react";
import Image from "next/image";
import Link from "next/link";

// Simple slugify helper: lowercases, trims, replaces spaces with hyphens,
// removes non-alphanumeric (except hyphen), and normalizes accents.
function slugify(str: string) {
  try {
    return str
      .toString()
      .normalize("NFKD") // split accents from letters
      .replace(/\p{Diacritic}/gu, "") // remove diacritics
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "") // remove invalid chars
      .replace(/\s+/g, "-") // collapse whitespace and replace with -
      .replace(/-+/g, "-"); // collapse multiple - into single
  } catch (e) {
    // fallback
    return str.toLowerCase().replace(/\s+/g, "-");
  }
}

interface Category {
  id: number;
  name: string;
  imageUrl: string; // Path to the category icon/image
  imageAlt: string;
}

const categories: Category[] = [
  {
    id: 1,
    name: "Duffle",
    imageUrl: "/assets/Hero/duffle.png",
    imageAlt: "Duffle bag",
  },
  {
    id: 2,
    name: "Belts",
    imageUrl: "/assets/Hero/image 86.png",
    imageAlt: "Leather belt",
  },
  {
    id: 3,
    name: "Bags",
    imageUrl: "/assets/Hero/leather.png",
    imageAlt: "Shoulder bag",
  },
  {
    id: 4,
    name: "Wallet",
    imageUrl: "/assets/Hero/wallet.png",
    imageAlt: "Leather wallet",
  },
  {
    id: 5,
    name: "Travel",
    imageUrl: "/assets/Hero/ANI01001 1.png",
    imageAlt: "Travel essentials",
  },
  {
    id: 6,
    name: "Jacket",
    imageUrl: "/assets/Hero/image 81.png",
    imageAlt: "Stylish jacket",
  },
  {
    id: 7,
    name: "Gloves",
    imageUrl: "/assets/Hero/image 83.png",
    imageAlt: "Leather gloves",
  },
  {
    id: 8,
    name: "Shoes",
    imageUrl: "/assets/Hero/image 85.png",
    imageAlt: "Brown shoes",
  },
];

const ShopByCategories: React.FC = () => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(true);

  const routeMap: Record<string, string> = {
    duffle: "/leather-goods/bags/duffle",
    bags: "/leather-goods/bags",
    wallet: "/leather-goods/wallets",
    belts: "/leather-goods/belts",
    travel: "/leather-goods/travel",
    jacket: "/leather-goods/jackets",
    gloves: "/leather-goods/gloves",
    shoes: "/leather-goods/shoes",
  };

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      setCanScrollPrev(el.scrollLeft > 0);
      setCanScrollNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const scrollBy = (dir: "prev" | "next") => {
    const el = containerRef.current;
    if (!el) return;
    const amount = Math.min(el.clientWidth * 0.7, 300);
    el.scrollBy({
      left: dir === "next" ? amount : -amount,
      behavior: "smooth",
    });
  };

  return (
    <section
      style={{ background: "var(--site-bg)", color: "var(--site-foreground)" }}
      className="py-12"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-center text-xl sm:text-2xl font-normal tracking-widest uppercase">
            SHOP BY CATEGORIES
          </h2>
          <div className="flex items-center gap-2">
            <button
              aria-label="Scroll left"
              onClick={() => scrollBy("prev")}
              disabled={!canScrollPrev}
              className={`p-2 rounded bg-white/5 hover:bg-white/10 disabled:opacity-40 transition`}
            >
              ‹
            </button>
            <button
              aria-label="Scroll right"
              onClick={() => scrollBy("next")}
              disabled={!canScrollNext}
              className={`p-2 rounded bg-white/5 hover:bg-white/10 disabled:opacity-40 transition`}
            >
              ›
            </button>
          </div>
        </div>

        <div
          ref={containerRef}
          className="flex overflow-x-auto no-scrollbar gap-6 py-2 px-1"
          role="list"
          tabIndex={0}
        >
          {categories.map((category) => {
            const slug = slugify(category.name);
            const href = routeMap[slug] ?? `/leather-goods/${slug}`;
            return (
              <Link
                key={category.id}
                href={href}
                className="group flex-shrink-0 w-24 sm:w-28 md:w-32"
                aria-label={`Shop ${category.name}`}
                role="listitem"
              >
                <div className="flex flex-col items-center cursor-pointer">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden mb-3 bg-gray-700 flex items-center justify-center ring-1 ring-gray-600 group-hover:ring-white transition-all duration-300">
                    <Image
                      src={category.imageUrl}
                      alt={category.imageAlt}
                      fill
                      className="group-hover:scale-105 transition-transform duration-300 brightness-90 group-hover:brightness-100 object-cover"
                    />
                  </div>
                  <p className="text-sm sm:text-base font-light capitalize tracking-wide group-hover:text-gray-300 transition-colors duration-300">
                    {category.name}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
        {/* Hide native scrollbars while preserving scrolling behavior */}
        <style jsx>{`
          .no-scrollbar {
            -ms-overflow-style: none; /* IE and Edge */
            scrollbar-width: none; /* Firefox */
          }
          .no-scrollbar::-webkit-scrollbar {
            display: none; /* Chrome, Safari, Opera */
            height: 0; /* horizontal scrollbar */
          }
        `}</style>
      </div>
    </section>
  );
};

export default ShopByCategories;
