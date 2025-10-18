"use client";

import Image from "next/image";
import React, { useEffect, useRef, useState, ReactNode } from "react";
import ProductSizes, { NotifyForm } from "./ProductSizes";
import { useRouter, usePathname } from "next/navigation";

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
  delivery: { start: string; end: string };
  price: number;
  compareAtPrice?: number | null;
  currency?: string;
  stock?: number | null;
  colors: Color[]; // visual color selectors derived from csv or single color
  csvColors?: string[]; // raw color names if provided
  csvSizes?: string[]; // raw sizes if provided
  material?: string | null;
  gender?: string | null;
  description: string;
  personalizationOptions: PersonalizationOption[];
  warranty: string;
  moreInfo: string;
  images: string[];
  detailsClothesSize?: string[];
  detailsShoesSize?: string[];
  detailsDimensions?: Record<string, string | number> | null;
  attributes?: Record<string, any> | null;
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
  <svg
    className={`w-5 h-5 ${filled ? "text-yellow-400" : "text-gray-300"}`}
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
  </svg>
);
const ReviewStarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={`w-6 h-6 ${className}`}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z" />
  </svg>
);
const ChevronLeftIcon: React.FC = () => (
  <svg
    className="w-6 h-6 text-gray-600"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M15 19l-7-7 7-7"
    ></path>
  </svg>
);

const ChevronRightIcon: React.FC = () => (
  <svg
    className="w-6 h-6 text-gray-600"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M9 5l7 7-7 7"
    ></path>
  </svg>
);

const ChevronDownIcon: React.FC<{ open: boolean }> = ({ open }) => (
  <svg
    className={`w-5 h-5 text-gray-500 transform transition-transform duration-300 ${
      open ? "rotate-180" : ""
    }`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M19 9l-7 7-7-7"
    ></path>
  </svg>
);

// Defaults to keep design if API is loading/failed
const defaultProductData: ProductData = {
  name: "",
  rating: 0,
  reviewCount: 0,
  delivery: { start: "", end: "" },
  price: 0,
  compareAtPrice: null,
  currency: "INR",
  stock: null,
  colors: [],
  csvColors: [],
  csvSizes: [],
  material: null,
  gender: null,
  personalizationOptions: [
    {
      id: "engraving-motto",
      label: "Add Personalized Engraving on Motto Flap - Crypto/Black",
      price: 600,
    },
    {
      id: "engraving-slider",
      label: "Add Personalized Engraving on Slider Flap - Crypto/Black",
      price: 650,
    },
  ],
  description: "",
  warranty: "",
  moreInfo: "",
  images: [],
  detailsClothesSize: [],
  detailsShoesSize: [],
  detailsDimensions: null,
  attributes: null,
};

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
  ],
};

const customerReviews: Review[] = [
  {
    id: 1,
    author: "Maria Sheferd",
    avatarUrl: "https://placehold.co/40x40/EFEFEF/333333?text=MS",
    date: "19/04/2024",
    rating: 5,
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco",
  },
  {
    id: 2,
    author: "John Doe",
    avatarUrl: "https://placehold.co/40x40/EFEFEF/333333?text=JD",
    date: "18/04/2024",
    rating: 5,
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco",
  },
  {
    id: 3,
    author: "Jane Smith",
    avatarUrl: "https://placehold.co/40x40/EFEFEF/333333?text=JS",
    date: "17/04/2024",
    rating: 5,
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco",
  },
  {
    id: 4,
    author: "Peter Jones",
    avatarUrl: "https://placehold.co/40x40/EFEFEF/333333?text=PJ",
    date: "16/04/2024",
    rating: 4,
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco",
  },
];

// --- Accordion Item Component ---
const AccordionItem: React.FC<{ title: string; children: ReactNode }> = ({
  title,
  children,
}) => {
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
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-96 mt-2" : "max-h-0"
        }`}
      >
        {/* Use a div here because children may contain block elements (div, etc.).
            A <p> cannot contain <div> which causes hydration/runtime HTML errors. */}
        <div className="text-gray-600 text-sm">{children}</div>
      </div>
    </div>
  );
};

// --- Feature Section Component ---
type FeatureSectionProps = ProductFeature;
const FeatureSection: React.FC<FeatureSectionProps> = ({
  id,
  title,
  description,
  imageUrl,
}) => {
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
            target.src =
              "https://placehold.co/561x495/cccccc/FFFFFF?text=Image+Not+Found";
          }}
        />
      </div>
    </div>
  );
};

// Ratings & reviews removed per request

// --- Main Product Page Component ---
type Props = { productIdOrSlug: string };

export default function App({ productIdOrSlug }: Props) {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [data, setData] = useState<ProductData>(defaultProductData);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [features, setFeatures] = useState<ProductFeature[]>([]);
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [productId, setProductId] = useState<number | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedSizeRemaining, setSelectedSizeRemaining] = useState<number | null>(null);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [wishAdding, setWishAdding] = useState(false);
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);
  const [notifySize, setNotifySize] = useState<string | null>(null);
  // Q&A removed: no longer displayed on product page

  // zoom state (Flipkart-like: lens + external viewer)
  const zoomRef = useRef<HTMLDivElement | null>(null);
  const [zoomActive, setZoomActive] = useState(false);
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 }); // px top/left inside container
  const [zoomPercent, setZoomPercent] = useState({ x: 50, y: 50 }); // percentage for background-position
  // Smaller lens, larger preview for a clearer zoomed-in view
  const lensSize = 100; // px (smaller pointer surface)
  const zoomScale = 3.2; // background scale multiplier (bigger zoom)
  // expected delivery
  const [deliveryWindow, setDeliveryWindow] = useState<{ start: string; end: string } | null>(null);

  // helpers
  const colorNameToClass = (name: string): string => {
    const key = name.trim().toLowerCase();
    const map: Record<string, string> = {
      black: "bg-black",
      white: "bg-white border border-gray-300",
      brown: "bg-yellow-800",
      tan: "bg-amber-800",
      beige: "bg-amber-200",
      green: "bg-green-700",
      blue: "bg-blue-700",
      red: "bg-red-600",
      pink: "bg-pink-500",
      purple: "bg-purple-600",
      yellow: "bg-yellow-400",
      orange: "bg-orange-500",
      grey: "bg-gray-500",
      gray: "bg-gray-500",
    };
    return map[key] || "bg-gray-400";
  };

  const parseCsv = (csv?: string | null): string[] =>
    (csv || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  const currencySymbol = (code?: string) => {
    switch ((code || "INR").toUpperCase()) {
      case "INR":
        return "₹";
      case "USD":
        return "$";
      case "EUR":
        return "€";
      case "GBP":
        return "£";
      default:
        return code || "";
    }
  };

  useEffect(() => {
    // when a size is selected, fetch remaining for that size so main UI can react
    let mounted = true;
    if (!productId || !selectedSize) {
      setSelectedSizeRemaining(null);
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/api/public/products/${productId}/stock-by-size`);
        if (!mounted) return;
        if (res.ok) {
          const j = await res.json();
          const rem = j?.sizes?.[selectedSize];
          setSelectedSizeRemaining(
            typeof rem === 'number' ? rem : (data.stock ?? null)
          );
        }
      } catch (e) {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, [productId, selectedSize, data.stock]);
  useEffect(() => {
  let active = true;
  (async () => {
      try {
        setLoading(true);
        setError(null);
        const [resBasic, resContent] = await Promise.all([
          fetch(`/api/public/products/${encodeURIComponent(productIdOrSlug)}`, {
            cache: "no-store",
          }),
          fetch(
            `/api/public/products/${encodeURIComponent(
              productIdOrSlug
            )}/content`,
            { cache: "no-store" }
          ),
        ]);
        if (!resBasic.ok) throw new Error("Failed to load product");
        const json = await resBasic.json();
        const json2 = resContent.ok ? await resContent.json() : null;
        if (!active) return;
        const p = json.product as any;
        const price =
          typeof p.price === "number" ? p.price : parseFloat(String(p.price));
        const images: string[] = (p.images || [])
          .map((im: any) => im.url)
          .filter(Boolean);
        // build colors from csv or single color
        const colorNames: string[] = parseCsv(p.colors);
        const colorChips: Color[] = colorNames.length
          ? colorNames.map((n) => ({
              name: n,
              hex: "",
              className: colorNameToClass(n),
            }))
          : p.color
          ? [{ name: p.color, hex: "", className: colorNameToClass(p.color) }]
          : [];
        const sizesList: string[] = parseCsv(p.sizes);
        const next: ProductData = {
          ...defaultProductData,
          name: p.title || defaultProductData.name,
          price: Number.isFinite(price) ? price : defaultProductData.price,
          compareAtPrice:
            p.compareAtPrice != null ? Number(p.compareAtPrice) : null,
          currency: p.currency || "INR",
          stock: typeof p.stock === "number" ? p.stock : null,
          description: p.description || "",
          images,
          colors: colorChips,
          csvColors: colorNames,
          csvSizes: sizesList,
          material: p.material ?? null,
          gender: p.gender ?? null,
          attributes:
            p.attributes && typeof p.attributes === "object"
              ? p.attributes
              : null,
        };
        setData(next);
        if (typeof p.id === "number") setProductId(p.id);
        // fetch expected delivery window (independent of basic/content calls)
        try {
          const del = await fetch(`/api/public/products/${encodeURIComponent(p.id ?? productIdOrSlug)}/delivery`, { cache: 'no-store' });
          if (del.ok) {
            const dj = await del.json();
            if (active && dj?.start && dj?.end) setDeliveryWindow({ start: dj.start, end: dj.end });
          }
        } catch {}
        // details from basic (sizes, dimensions may be present there)
        if (p.details) {
          const {
            clothesSize,
            shoesSize,
            dimensions,
            warranty,
            moreInfo,
            heroImageUrl,
          } = p.details as any;
          setData((prev) => ({
            ...prev,
            warranty: (warranty ?? prev.warranty) || prev.warranty,
            moreInfo: (moreInfo ?? prev.moreInfo) || prev.moreInfo,
            detailsClothesSize: Array.isArray(clothesSize) ? clothesSize : [],
            detailsShoesSize: Array.isArray(shoesSize) ? shoesSize : [],
            detailsDimensions: dimensions ?? null,
          }));
          setHeroImageUrl(heroImageUrl ?? null);
        }
        // richer content (features and possibly overrides)
        if (json2?.product?.details) {
          const { warranty, moreInfo, heroImageUrl, dimensions } = json2.product
            .details as {
            warranty?: string | null;
            moreInfo?: string | null;
            heroImageUrl?: string | null;
            dimensions?: any;
          };
          setData((prev) => ({
            ...prev,
            warranty: warranty ?? prev.warranty,
            moreInfo: moreInfo ?? prev.moreInfo,
            detailsDimensions: dimensions ?? prev.detailsDimensions,
          }));
          if (heroImageUrl) setHeroImageUrl(heroImageUrl);
        }
        if (Array.isArray(json2?.product?.features)) {

                {/* subtle inner shadow/gradient to distinguish main image */}
                <div className="pointer-events-none absolute inset-0 rounded-3xl" style={{
                  boxShadow: 'inset 0 -60px 80px rgba(0,0,0,0.15), inset 0 20px 40px rgba(0,0,0,0.05)'
                }} />
          const feats = (json2.product.features as Array<any>).map(
            (f: any, idx: number) => ({
              id: String((f.order ?? idx) + 1).padStart(2, "0"),
              title: String(f.title ?? ""),
              description: String(f.description ?? ""),
              imageUrl: String(
                f.imageUrl ?? "/assets/productspecificatin/wallets.png"
              ),
            })
          );
          setFeatures(feats);
        } else {
          setFeatures([]);
        }
        setSelectedColor(colorChips[0] || null);
        // default size select: prefer clothes sizes, then shoes, then csv sizes
        const sizesFromCsv = Array.isArray(p.sizes)
          ? (p.sizes as any as string[])
          : parseCsv(p.sizes);
        const sizesFromDetailsClothes =
          p.details && Array.isArray((p.details as any).clothesSize)
            ? ((p.details as any).clothesSize as string[])
            : [];
        const sizesFromDetailsShoes =
          p.details && Array.isArray((p.details as any).shoesSize)
            ? ((p.details as any).shoesSize as string[])
            : [];
        const sizesCombined = sizesFromDetailsClothes.length
          ? sizesFromDetailsClothes
          : sizesFromDetailsShoes.length
          ? sizesFromDetailsShoes
          : sizesFromCsv;
        if (sizesCombined && sizesCombined.length)
          setSelectedSize(sizesCombined.includes("S") ? "S" : sizesCombined[0]);
        setCurrentImageIndex(0);
        // Q&A fetching removed from product page
      } catch (err: any) {
        if (!active) return;
        setError(err?.message || "Failed to load product");
        setData(defaultProductData);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [productIdOrSlug]);

  // Derive product-type hints from URL path
  const rawPathname = usePathname() || "";
  const pathname = rawPathname.toLowerCase();
  const isJacketPath = pathname.includes("jacket") || pathname.includes("jackets");
  const isWalletPath = pathname.includes("wallet") || pathname.includes("wallets");
  const bagSynonyms = [
    "bag",
    "bags",
    "luggage",
    "backpack",
    "rucksack",
    "duffel",
    "duffle",
    "suitcase",
    "trolley",
    "carry-on",
    "carryon",
    "briefcase",
    "messenger",
  ];
  const isBagPath = bagSynonyms.some((w) => pathname.includes(w));
  // special-case: duffel/duffle should behave differently (hide size selector, show capacity)
  const isDuffel = pathname.includes("duffel") || pathname.includes("duffle");

  // For non-jacket pages (wallets, bags, etc.), clear any selected size to avoid size-related errors
  useEffect(() => {
    if (!isJacketPath) {
      setSelectedSize(null);
      setSelectedSizeRemaining(null);
    }
  }, [isJacketPath]);

  const [addError, setAddError] = useState<string | null>(null);
  // personalization state: selected option ids
  const [selectedPersonalization, setSelectedPersonalization] = useState<
    Record<string, boolean>
  >({});
  // use personalization options from product data if available, fallback to defaults
  const personalizationOptionsToUse =
    data &&
    Array.isArray(data.personalizationOptions) &&
    data.personalizationOptions.length
      ? data.personalizationOptions
      : defaultProductData.personalizationOptions;

  // ensure checkbox state keys exist when product data loads/changes
  useEffect(() => {
    const next: Record<string, boolean> = {};
    personalizationOptionsToUse.forEach((o) => {
      next[o.id] = !!selectedPersonalization[o.id];
    });
    setSelectedPersonalization(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(personalizationOptionsToUse)]);

  // derived personalization total (from runtime options)
  const personalizationTotal = Object.entries(selectedPersonalization).reduce(
    (sum, [id, on]) => {
      if (!on) return sum;
      const opt = personalizationOptionsToUse.find((o) => o.id === id);
      return sum + (opt?.price || 0);
    },
    0
  );
  const onAddToCart = async () => {
    if (!productId) return;
    setAdding(true);
    setAddError(null);
    try {
      // Preflight: verify selected size availability via stock-by-size API
      // Only relevant for jacket pages (wallets/bags are free-size or not size-driven)
      if (isJacketPath && selectedSize) {
        try {
          const pre = await fetch(`/api/public/products/${productId}/stock-by-size`);
          if (pre.ok) {
            const pj = await pre.json();
            const rem = pj?.sizes?.[selectedSize];
            if (typeof rem === 'number' && rem <= 0) {
              setAddError('Selected size is currently out of order');
              setAdding(false);
              return;
            }
          }
        } catch (e) {
          // ignore preflight errors and allow server-side to validate
        }
      }
      const selectedPersonalizationIds = Object.entries(selectedPersonalization)
        .filter(([_, v]) => v)
        .map(([k]) => k);
      const selectedPersonalizationObjects = selectedPersonalizationIds
        .map((id) => personalizationOptionsToUse.find((o) => o.id === id))
        .filter(Boolean);
      const res = await fetch("/api/public/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          quantity: 1,
          // For duffel bags, persist capacity as the "size" so orders show it
          size:
            isDuffel &&
            ((data.detailsDimensions as any)?.capacityLiters ||
              (data.attributes as any)?.capacityLiters)
              ? String(
                  (data.detailsDimensions as any)?.capacityLiters ??
                    (data.attributes as any)?.capacityLiters
                )
              : selectedSize || undefined,
          color: selectedColor?.name || undefined,
          personalization: selectedPersonalizationObjects,
          personalizationAmount: personalizationTotal,
        }),
      });
      if (!res.ok) {
        if (res.status === 401) {
          // Not logged in → redirect to login, preserve return path
          router.push(`/login?next=${encodeURIComponent(rawPathname || "/")}`);
          return;
        }
        // Try to extract a helpful message
        let message = `Failed to add to cart (${res.status})`;
        try {
          const payload = await res.json();
          if (payload) {
            if (typeof payload.error === "string") message = payload.error;
            else if (typeof payload.message === "string")
              message = payload.message;
            else message = JSON.stringify(payload);
          }
        } catch (e) {
          try {
            const text = await res.text();
            if (text) message = text;
          } catch {}
        }
        setAddError(message);
        return;
      }
      // Animate product image flying to cart icon
      try {
        const imgEl = document.querySelector(
          ".product-main-image"
        ) as HTMLElement | null;
        const target = document.getElementById("nav-cart-btn");
        if (imgEl && target) {
          const rect = imgEl.getBoundingClientRect();
          const tRect = target.getBoundingClientRect();
          const clone = imgEl.cloneNode(true) as HTMLElement;
          clone.style.position = "fixed";
          clone.style.left = rect.left + "px";
          clone.style.top = rect.top + "px";
          clone.style.width = rect.width + "px";
          clone.style.height = rect.height + "px";
          clone.style.transition = "all 0.6s cubic-bezier(0.22, 1, 0.36, 1)";
          clone.style.zIndex = "9999";
          document.body.appendChild(clone);
          requestAnimationFrame(() => {
            clone.style.left = tRect.left + "px";
            clone.style.top = tRect.top + "px";
            clone.style.transform = "scale(0.1)";
            clone.style.opacity = "0.4";
          });
          setTimeout(() => {
            try {
              document.body.removeChild(clone);
            } catch {}
          }, 700);
        }
      } catch {}
    } catch (e) {
      console.error(e);
    } finally {
      setAdding(false);
    }
  };

  const handlePrevImage = (): void => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? data.images.length - 1 : prevIndex - 1
    );
  };

  const handleNextImage = (): void => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === data.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  // responsive helpers
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 1023px)");
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      // Support initial call with MediaQueryList
      // @ts-ignore
      setIsSmallScreen(!!(e.matches ?? e.currentTarget?.matches));
    };
    // initial
    // @ts-ignore
    handler(mq);
    mq.addEventListener("change", handler as any);
    return () => mq.removeEventListener("change", handler as any);
  }, []);

  // zoom position calc (shared by mouse and touch)
  const updateZoomFromPoint = (clientX: number, clientY: number) => {
    if (!zoomRef.current) return;
    const rect = zoomRef.current.getBoundingClientRect();
    const relX = clientX - rect.left;
    const relY = clientY - rect.top;
    const half = lensSize / 2;
    const clampedX = Math.max(half, Math.min(rect.width - half, relX));
    const clampedY = Math.max(half, Math.min(rect.height - half, relY));
    setLensPos({ x: clampedX - half, y: clampedY - half });
    const px = (clampedX / rect.width) * 100;
    const py = (clampedY / rect.height) * 100;
    setZoomPercent({
      x: Math.max(0, Math.min(100, px)),
      y: Math.max(0, Math.min(100, py)),
    });
  };

  // zoom handlers: click/tap to toggle zoom; move updates lens only when active
  const onMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!zoomActive) return;
    updateZoomFromPoint(e.clientX, e.clientY);
  };

  const onImageClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    // toggle zoom on click and set initial position
    if (!zoomActive) {
      updateZoomFromPoint(e.clientX, e.clientY);
      setZoomActive(true);
    } else {
      setZoomActive(false);
    }
  };

  // touch handlers for mobile zoom: tap to open/close, move to update
  const onTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => {
    const target = e.target as HTMLElement;
    if (target && target.closest(".no-zoom")) return;
    if (e.touches && e.touches.length > 0) {
      const t = e.touches[0];
      // prevent the subsequent simulated mouse event
      e.preventDefault();
      if (!zoomActive) {
        updateZoomFromPoint(t.clientX, t.clientY);
        setZoomActive(true);
      } else {
        // if already active, treat touch start as move
        updateZoomFromPoint(t.clientX, t.clientY);
      }
    }
  };

  const onTouchMove: React.TouchEventHandler<HTMLDivElement> = (e) => {
    const target = e.target as HTMLElement;
    if (target && target.closest(".no-zoom")) return;
    if (!zoomActive) return;
    if (e.touches && e.touches.length > 0) {
      // Prevent page scroll while zooming
      e.preventDefault();
      const t = e.touches[0];
      updateZoomFromPoint(t.clientX, t.clientY);
    }
  };

  const onTouchEnd: React.TouchEventHandler<HTMLDivElement> = () => {
    // keep zoom open until user taps again; do not auto-close on touch end
  };

  const symbol = currencySymbol(data.currency);
  const showCompare =
    data.compareAtPrice != null && data.compareAtPrice > data.price;
  const discountPct = showCompare
    ? Math.round(
        ((data.compareAtPrice! - data.price) / data.compareAtPrice!) * 100
      )
    : 0;

  return (
    <div
      className="font-sans p-4 sm:p-6 lg:p-8"
      style={{ background: "var(--site-bg)", color: "var(--site-foreground)" }}
    >
      {/* Product Details Section */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-10 ">
        {/* Image Gallery (simplified) */}
        <div className="flex flex-col items-center w-full">
          <div className="w-full lg:w-[615px] sticky top-24">
            {loading ? (
              <div className="w-full h-96 rounded-3xl bg-gray-200 animate-pulse" />
            ) : data.images.length > 0 ? (
              <div
                className="relative"
                ref={zoomRef}
                onMouseMove={onMouseMove}
                onClick={onImageClick}
                onMouseLeave={() => setZoomActive(false)}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                <img
                  src={data.images[currentImageIndex]}
                  alt={`${data.name} - View ${currentImageIndex + 1}`}
                  className={`product-main-image w-full object-contain bg-white rounded-3xl border-2 border-black shadow-xl ${zoomActive ? 'ring-2 ring-black' : ''}`}
                  style={{ width: 615, height: 383, boxShadow: 'var(--image-shadow)' }}
                  draggable={false}
                />

                {/* Lens overlay */}
                {zoomActive && (
                  <div
                    className="absolute pointer-events-none border-2 border-white rounded"
                    style={{
                      width: lensSize,
                      height: lensSize,
                      left: lensPos.x,
                      top: lensPos.y,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                    }}
                  />
                )}

                {/* Zoom preview on desktop: show only when zoomActive (opened by click) */}
                {zoomActive && (
                  <div className="hidden lg:block absolute right-[-480px] top-0" style={{ width: 420, height: 420 }}>
                    <div className="w-full h-full overflow-hidden rounded-lg shadow-lg bg-white">
                      <div
                        className="w-full h-full bg-center bg-cover"
                        style={{
                          backgroundImage: `url(${data.images[currentImageIndex]})`,
                          backgroundSize: `${100 * zoomScale}%`,
                          backgroundPosition: `${zoomPercent.x}% ${zoomPercent.y}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Mobile: when touched, show a fullscreen zoom preview */}
                {isSmallScreen && zoomActive && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <div className="w-full h-full max-h-[90vh] max-w-[95vw] overflow-hidden bg-white rounded" onClick={() => setZoomActive(false)}>
                      <div
                        className="w-full h-full"
                        style={{
                          backgroundImage: `url(${data.images[currentImageIndex]})`,
                          backgroundSize: `${100 * zoomScale}%`,
                          backgroundPosition: `${zoomPercent.x}% ${zoomPercent.y}%`,
                          backgroundRepeat: 'no-repeat',
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Bottom-right overlay slider (no thumbnails) */}
                {!isSmallScreen && data.images.length > 1 && (
                  <div className="absolute bottom-3 right-3 bg-white rounded-sm shadow-lg px-2 py-1 flex items-center gap-1">
                    <button onClick={handlePrevImage} aria-label="Prev" className="p-1 hover:opacity-80">
                      <svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    <button onClick={handleNextImage} aria-label="Next" className="p-1 hover:opacity-80">
                      <svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-96 rounded-3xl bg-gray-100 flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}
            {!loading && data.images.length > 1 && (
              <div className="mt-4 flex items-center gap-3 overflow-x-auto w-full lg:w-[615px]">
                {data.images.map((src, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`group relative flex-shrink-0 rounded-md overflow-hidden transition-all duration-200 ${
                      idx === currentImageIndex ? 'border-2 border-black ring-2 ring-black scale-[1.02]' : 'border border-transparent hover:border-black/30'
                    }`}
                    style={{ width: 86, height: 64 }}
                    aria-label={`View image ${idx + 1}`}
                  >
                    <img src={src} alt={`thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition">
                      <span className="absolute right-1 bottom-1 text-[10px] bg-white/80 px-1.5 py-0.5 rounded shadow-sm">Zoom</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

  {/* Product Details Right Column (single consolidated section) */}
  <div>
          {loading ? (
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-800">
              <span className="inline-block h-8 w-64 bg-gray-200 rounded animate-pulse" />
            </h1>
          ) : (
            data.name && (
              <>
                <h1 className="text-3xl lg:text-4xl font-bold text-black">
                  {data.name}
                </h1>
                {/* Review stars in yellow */}
                <div className="mt-2 flex items-center gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} viewBox="0 0 20 20" className={`w-5 h-5 ${i < Math.round((data as any).rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  ))}
                  {(data as any).reviewCount ? (
                    <span className="text-xs text-gray-600">{(data as any).reviewCount} reviews</span>
                  ) : null}
                </div>
                {/* Size / capacity line below title: show clothing sizes for jackets only; for bags show capacity; wallets are free-size */}
                <div className="mt-2 text-sm text-gray-700">
                  {isJacketPath && ((data.detailsClothesSize && data.detailsClothesSize.length > 0) || (data.csvSizes && data.csvSizes.length)) ? (
                    <div className="flex items-center gap-2">
                      {(((data.detailsClothesSize && data.detailsClothesSize.length) ? data.detailsClothesSize : data.csvSizes) || []).map((s: any) => {
                        const remLocal = data.stock ?? 0
                        const outLocal = typeof remLocal === 'number' && remLocal <= 0
                        return (
                          <span key={s} className={`px-2 py-1 text-xs rounded border ${selectedSize === s ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 border-gray-300'} ${outLocal ? 'opacity-50 blur-sm' : ''}`}>
                            {s}{outLocal ? ' — Out' : ''}
                          </span>
                        )
                      })}
                    </div>
                  ) : ((isBagPath || isDuffel) && (((data.detailsDimensions as any)?.capacityLiters) || ((data.attributes as any)?.capacityLiters))) ? (
                    <div>Capacity: <span className="font-medium">{(data.detailsDimensions as any)?.capacityLiters ?? (data.attributes as any)?.capacityLiters} L</span></div>
                  ) : (isWalletPath) ? (
                    <div>Size: <span className="font-medium">Free size</span></div>
                  ) : null}
                </div>
                {/* Size selector (moved below title). Show sizes only for jackets. */}
                <div className="mt-3">
                  {/* Show sizes only for jackets */}
                  {isJacketPath && (
                    <ProductSizes
                      productId={productId}
                      isJacketPath={isJacketPath}
                      isBagPath={isBagPath}
                      data={data}
                      selectedSize={selectedSize}
                      onSelectSize={(sz) => setSelectedSize(sz)}
                      onOpenSizeChart={() => setShowSizeChart(true)}
                    />
                  )}
                </div>
                {/* Capacity: show only on bag URLs; for duffel explicitly show capacity and hide sizes above */}
                {(isBagPath || isDuffel) &&
                  ((data.attributes && (data.attributes as any).capacityLiters) ||
                    (data.detailsDimensions &&
                      (data.detailsDimensions as any).capacityLiters) ? (
                    <div className="mt-2 text-sm text-gray-700">
                      Capacity: {" "}
                      <span className="font-medium">
                        {(data.detailsDimensions as any)?.capacityLiters ??
                          (data.attributes as any)?.capacityLiters}{" "}
                        L
                      </span>
                    </div>
                  ) : null)}
              </>
            )
          )}

          {/* Top rating removed — rating overview moved below Specifications as requested */}

          {(deliveryWindow?.start && deliveryWindow?.end) ? (
            <p className="text-sm text-gray-500 mt-4">
              Expected delivery between{" "}
              <span className="font-medium text-gray-700">
                {deliveryWindow.start}
              </span>{" "}
              -{" "}
              <span className="font-medium text-gray-700">
                {deliveryWindow.end}
              </span>
            </p>
          ) : null}

         

          <div className="mt-4 flex items-baseline gap-3">
            <p className="text-4xl lg:text-5xl font-extrabold text-black">
              {loading ? (
                <span className="inline-block h-10 w-40 bg-gray-200 rounded animate-pulse" />
              ) : (
                `${symbol}${data.price.toLocaleString("en-IN")}`
              )}
            </p>
            {!loading && showCompare && (
              <>
                <span className="text-xl text-gray-500 line-through">
                  {symbol}
                  {data.compareAtPrice!.toLocaleString("en-IN")}
                </span>
                <span className="text-sm font-semibold text-green-600">
                  {discountPct}% off
                </span>
              </>
            )}
          </div>

          {!loading && typeof data.stock === "number" && (
            <p
              className={`mt-2 text-sm ${
                data.stock > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {data.stock > 0 ? "In stock" : "Out of stock"}
            </p>
          )}

          {data.colors.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900">
                Color:{" "}
                <span className="font-normal text-gray-600">
                  {selectedColor?.name || ""}
                </span>
              </h3>
              <div className="flex items-center space-x-3 mt-2">
                {data.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full ${
                      color.className
                    } border-2 transition-all duration-200 ${
                      selectedColor?.name === color.name
                        ? "border-blue-500 ring-2 ring-blue-500 ring-offset-1"
                        : "border-gray-300 hover:border-gray-500"
                    }`}
                    aria-label={`Select color ${color.name}`}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          )}

          {(data.material || data.gender) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {data.material && (
                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                  Material: {data.material}
                </span>
              )}
              {data.gender && (
                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                  Gender:{" "}
                  {String(data.gender)
                    .toLowerCase()
                    .replace(/^./, (s) => s.toUpperCase())}
                </span>
              )}
            </div>
          )}

          <div className="mt-8 p-4 rounded-lg" style={{ background: "var(--card-bg)" }}>
            <h3 className="font-semibold text-gray-800">Personalization details</h3>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {defaultProductData.personalizationOptions.map((option) => (
                <label
                  key={option.id}
                  className="flex items-center text-sm text-gray-600 space-x-3 p-2 rounded border border-transparent hover:border-gray-200"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={!!selectedPersonalization[option.id]}
                    onChange={(e) =>
                      setSelectedPersonalization((prev) => ({
                        ...prev,
                        [option.id]: e.target.checked,
                      }))
                    }
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">
                      {option.label}
                    </div>
                    <div className="text-gray-500 text-xs">
                      +{currencySymbol(data.currency)}
                      {option.price}
                    </div>
                  </div>
                </label>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <div className="text-gray-600">Personalization total</div>
              <div className="font-semibold text-gray-800">
                {currencySymbol(data.currency)}
                {personalizationTotal.toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onAddToCart}
              disabled={
                adding ||
                (typeof data.stock === "number" && data.stock <= 0) ||
                !productId
              }
              className={`w-full mt-8 font-bold py-3 px-6 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2`}
              style={{
                background:
                  adding ||
                  (typeof data.stock === "number" && data.stock <= 0) ||
                  (selectedSize && typeof selectedSizeRemaining === 'number' && selectedSizeRemaining <= 0) ||
                  !productId
                    ? "var(--muted)"
                    : "var(--button-bg)",
                color: "var(--button-foreground)",
              }}
            >
              {adding ? (
                "Adding…"
              ) : typeof data.stock === "number" && data.stock <= 0 ? (
                "Out of stock"
              ) : (
                `Add To Cart ${currencySymbol(data.currency)}${(
                  data.price + personalizationTotal
                ).toLocaleString("en-IN")}`
              )}
            </button>
              <button
              onClick={async () => {
                if (!productId) return;
                setWishAdding(true);
                try {
                  const selectedPersonalizationIds = Object.entries(
                    selectedPersonalization
                  )
                    .filter(([_, v]) => v)
                    .map(([k]) => k);
                  const selectedPersonalizationObjects =
                    selectedPersonalizationIds
                      .map((id) =>
                        personalizationOptionsToUse.find((o) => o.id === id)
                      )
                      .filter(Boolean);
                  const res = await fetch("/api/public/wishlist", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      productId,
                      personalization: selectedPersonalizationObjects,
                      personalizationAmount: personalizationTotal,
                    }),
                  });
                  if (res.ok) {
                    // simple fly-to-wishlist animation: clone main image and move to wishlist icon
                    const imgEl = document.querySelector(
                      ".product-main-image"
                    ) as HTMLElement | null;
                    const target = document.getElementById("nav-wishlist-btn");
                    if (imgEl && target) {
                      const rect = imgEl.getBoundingClientRect();
                      const tRect = target.getBoundingClientRect();
                      const clone = imgEl.cloneNode(true) as HTMLElement;
                      clone.style.position = "fixed";
                      clone.style.left = rect.left + "px";
                      clone.style.top = rect.top + "px";
                      clone.style.width = rect.width + "px";
                      clone.style.height = rect.height + "px";
                      clone.style.transition = "all 0.6s ease";
                      clone.style.zIndex = "9999";
                      document.body.appendChild(clone);
                      requestAnimationFrame(() => {
                        clone.style.left = tRect.left + "px";
                        clone.style.top = tRect.top + "px";
                        clone.style.transform = "scale(0.1)";
                        clone.style.opacity = "0.5";
                      });
                      setTimeout(() => {
                        document.body.removeChild(clone);
                      }, 700);
                    }
                  }
                } finally {
                  setWishAdding(false);
                }
              }}
              disabled={wishAdding || !productId}
              className={`w-full mt-8 font-bold py-3 px-6 rounded-lg border transition-colors duration-300 ${
                wishAdding
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:bg-gray-50"
              }`}
            >
              {wishAdding ? "Adding…" : "Add to Wishlist"}
            </button>
            {/* notify button removed to avoid confusion when overall stock is available */}
          </div>
          {addError && (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {addError}
            </p>
          )}

          {!loading && !error && data.description && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900">Description</h3>
              <p className="text-sm text-gray-600 mt-2">{data.description}</p>
            </div>
          )}

          <div className="mt-8">
            {data.description && (
              <AccordionItem title="Description">
                {data.description}
              </AccordionItem>
            )}
            {data.warranty && (
              <AccordionItem title="Warranty & Return">
                {data.warranty}
              </AccordionItem>
            )}
            {data.moreInfo && (
              <AccordionItem title="More Information">
                {data.moreInfo}
              </AccordionItem>
            )}
            {/* Available Sizes moved to the header area; removed from accordion */}
            {((data.detailsClothesSize && data.detailsClothesSize.length > 0) ||
              (data.detailsShoesSize && data.detailsShoesSize.length > 0)) && (
              <AccordionItem title="Size Guides">
                <div className="space-y-3">
                  {data.detailsClothesSize &&
                    data.detailsClothesSize.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-800 mb-1">
                          Clothes
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {data.detailsClothesSize.map((s) => (
                            <span
                              key={s}
                              className="px-2 py-1 text-xs rounded border border-gray-300 text-gray-700"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  {data.detailsShoesSize &&
                    data.detailsShoesSize.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-800 mb-1">
                          Shoes
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {data.detailsShoesSize.map((s) => (
                            <span
                              key={s}
                              className="px-2 py-1 text-xs rounded border border-gray-300 text-gray-700"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </AccordionItem>
            )}
            {data.detailsDimensions &&
              Object.keys(data.detailsDimensions).length > 0 && (
                <AccordionItem title="Dimensions">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(data.detailsDimensions).map(([k, v]) => (
                      <div
                        key={k}
                        className="flex justify-between border-b py-1"
                      >
                        <span className="text-gray-500">{k}</span>
                        <span className="text-gray-800">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </AccordionItem>
              )}
            {data.attributes && Object.keys(data.attributes).length > 0 && (
              <AccordionItem title="Specifications">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(data.attributes).map(([k, v]) => (
                    <div key={k} className="flex justify-between border-b py-1">
                      <span className="text-gray-500">{k}</span>
                      <span className="text-gray-800">
                        {typeof v === "object" ? JSON.stringify(v) : String(v)}
                      </span>
                    </div>
                  ))}
                </div>
              </AccordionItem>
            )}
            {/* Rating overview removed */}
          </div>
        </div>
      </div>

      {/* Section 2: Hero image + Specifications side by side */}
      {heroImageUrl && (
        <Image
          src={heroImageUrl}
          alt="Hero Image"
          width={1560}
          height={407}
          className="rounded-4xl shadow-lg pl-3 mt-2"
        />
      )}

      {/* Optional Product Video Section (below main hero/image) */}
      {(data.attributes && (data.attributes as any).productVideoUrl) && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left column: product thumbnail, price, colors */}
            <div className="lg:col-span-1 bg-white p-4 rounded shadow">
              <img src={(data.images && data.images[0]) || '/assets/Hero/placeholder.png'} alt={data.name} className="w-full h-40 object-cover rounded" />
              <div className="mt-3">
                <div className="text-lg font-bold">{currencySymbol(data.currency)}{data.price}</div>
                <div className="mt-2 flex items-center gap-2">
                  {data.colors && data.colors.length > 0 ? data.colors.slice(0,4).map((c, i) => (
                    <div key={i} className={`w-6 h-6 rounded-full ${c.className} border`} title={c.name} />
                  )) : <div className="text-sm text-gray-500">No colours</div>}
                </div>
              </div>
            </div>

            {/* Spacer */}
            <div className="lg:col-span-2">
              <div className="bg-black rounded-none overflow-hidden">
                <video
                  src={(data.attributes as any).productVideoUrl}
                  poster={(data.images && data.images[0]) || undefined}
                  className="w-full h-80 object-cover rounded-none"
                  controls
                  preload="metadata"
                />
              </div>
              <div className="mt-2 text-sm text-gray-600">Product video (optional)</div>
            </div>
          </div>
        </div>
      )}

  {/* Product Specification and Highlights */}
      {features.length > 0 && (
        <div className="bg-white text-gray-800">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 md:mb-16">Product Specification</h2>
            <div className="space-y-16 md:space-y-24">
              {features
                .filter((f) => f.title || f.description || f.imageUrl)
                .map((feature: ProductFeature) => (
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
      )}

      {/* Product Highlights */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h3 className="text-xl md:text-2xl font-semibold text-center mb-6">Product Highlights</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="mx-auto w-10 h-10 rounded-full border flex items-center justify-center">
              <span role="img" aria-label="weight">⚖️</span>
            </div>
            <div className="mt-2 text-sm text-gray-600">Weight</div>
            <div className="font-medium">{(data.detailsDimensions as any)?.weight ?? '—'}</div>
          </div>
          <div>
            <div className="mx-auto w-10 h-10 rounded-full border flex items-center justify-center">
              <span role="img" aria-label="size">📏</span>
            </div>
            <div className="mt-2 text-sm text-gray-600">Dimensions</div>
            <div className="font-medium">
              {(() => {
                const d: any = data.detailsDimensions || {}
                const unit = d.unit ? ` ${d.unit}` : ''
                const L = d.length ?? '-'
                const W = (d.width ?? d.breadth) ?? '-'
                const H = d.height ?? '-'
                return `${L} x ${W} x ${H}${unit}`
              })()}
            </div>
          </div>
          <div>
            <div className="mx-auto w-10 h-10 rounded-full border flex items-center justify-center">
              <span role="img" aria-label="warranty">🛡️</span>
            </div>
            <div className="mt-2 text-sm text-gray-600">Warranty</div>
            <div className="font-medium">{data.warranty ? 'Yes' : '—'}</div>
          </div>
          <div>
            <div className="mx-auto w-10 h-10 rounded-full border flex items-center justify-center">
              <span role="img" aria-label="material">🧵</span>
            </div>
            <div className="mt-2 text-sm text-gray-600">Material Used</div>
            <div className="font-medium">{Array.isArray((data as any).materials) && (data as any).materials.length ? (data as any).materials.join(', ') : (data.material || '—')}</div>
          </div>
        </div>
      </div>

      {/* Quality after use comparison (6 months vs 6 years) */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Quality After Use</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-lg border p-6 bg-white">
            <h3 className="font-semibold mb-2">After 6 months</h3>
            <p className="text-sm text-gray-600">Natural patina begins to form with regular use. Edges and high-contact areas exhibit a subtle sheen.</p>
          </div>
          <div className="rounded-lg border p-6 bg-white">
            <h3 className="font-semibold mb-2">After 6 years</h3>
            <p className="text-sm text-gray-600">Rich, deep patina with durable aging characteristics. Proper care preserves structure and elevates the leather character.</p>
          </div>
        </div>
      </div>

      {/* Verified customer reviews (placeholder, can be backed by API later) */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">Verified Customer Reviews</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {customerReviews.slice(0,4).map((r) => (
            <div key={r.id} className="rounded-lg border bg-white p-5">
              <div className="flex items-center gap-3">
                <img src={r.avatarUrl} alt={r.author} className="w-8 h-8 rounded-full object-cover" />
                <div>
                  <div className="text-sm font-semibold">{r.author}</div>
                  <div className="text-xs text-gray-500">{r.date}</div>
                </div>
              </div>
              <div className="mt-2 flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} viewBox="0 0 20 20" className={`w-4 h-4 ${i < r.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                ))}
              </div>
              <p className="mt-2 text-sm text-gray-700">{r.text}</p>
            </div>
          ))}
        </div>
      </div>

  {/* Customer reviews removed */}
      {/* Size chart modal */}
      {showSizeChart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-800">
                Size chart
              </h3>
              <button
                onClick={() => setShowSizeChart(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                ✕
              </button>
            </div>
            {data.attributes && (data.attributes as any).sizeChart ? (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2 text-sm font-medium text-gray-700 border-b pb-1">
                  <div>Size</div>
                  <div>Chest (cm)</div>
                  <div>Length (cm)</div>
                </div>
                {Object.entries(
                  (data.attributes as any).sizeChart as Record<string, any>
                ).map(([sz, row]) => (
                  <div key={sz} className="grid grid-cols-3 gap-2 text-sm">
                    <div className="py-1">{sz}</div>
                    <div className="py-1">{row?.chest ?? "—"}</div>
                    <div className="py-1">{row?.length ?? "—"}</div>
                  </div>
                ))}
                {(data.attributes as any).sizeGuidance && (
                  <div className="mt-3 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                    {(data.attributes as any).sizeGuidance}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                No size chart available.
              </div>
            )}
          </div>
        </div>
      )}
      {/* Notify modal */}
      {notifyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-800">Notify me when available</h3>
              <button onClick={() => setNotifyModalOpen(false)} className="text-gray-500">✕</button>
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-600 mb-3">Product: <span className="font-medium">{data.name}</span></p>
              <p className="text-sm text-gray-600 mb-3">Size: <span className="font-medium">{notifySize}</span></p>
              <NotifyForm productId={productId} size={notifySize ?? undefined} />
              <div className="mt-3 text-right">
                <button onClick={() => setNotifyModalOpen(false)} className="px-3 py-1 text-sm text-gray-700">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ProductSizes and NotifyForm moved to components/product/ProductSizes.tsx to keep this file focused
