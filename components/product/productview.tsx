"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

// --- Type Definitions ---
interface ProductColor {
  name: string;
  hex: string;
}

export interface APIImage { id: number; url: string; alt?: string | null; position?: number | null }
export interface APIProduct {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  price: number;
  compareAtPrice?: number | null;
  currency: string;
  stock: number;
  color?: string | null;
  subcategory?: { id: number; name: string; slug: string; category: { id: number; name: string; slug: string } } | null;
  brand?: { id: number; name: string; slug: string } | null;
  images: APIImage[];
}
export interface UIProductCard {
  id: number;
  slug: string;
  name: string;
  category: string;
  categorySlug?: string;
  subcategorySlug?: string;
  price: number;
  inStock: boolean;
  colors: ProductColor[];
  imageUrl: string;
}

// --- Helper Components for Icons ---
const FilterIcon: React.FC = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M3 4h18M3 10h12M3 16h6"
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

const AddToBagIcon: React.FC = () => (
  <svg
    className="w-4 h-4 mr-2"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
    ></path>
  </svg>
);
// --- Skeletons ---
export const ProductCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100/50 animate-pulse">
    <div className="bg-gray-200 rounded-lg mb-4 w-full aspect-[4/3]" />
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
    <div className="h-5 bg-gray-300 rounded w-1/3 mb-4" />
    <div className="flex items-center justify-between">
      <div className="flex space-x-2">
        <span className="w-5 h-5 rounded-full bg-gray-200" />
        <span className="w-5 h-5 rounded-full bg-gray-200" />
        <span className="w-5 h-5 rounded-full bg-gray-200" />
      </div>
      <div className="h-8 bg-gray-300 rounded w-24" />
    </div>
  </div>
);

// --- Data state ---
export const mapToUIProduct = (p: APIProduct): UIProductCard => ({
  id: p.id,
  slug: p.slug,
  name: p.title,
  category: p.subcategory?.name || p.subcategory?.category?.name || 'Products',
  categorySlug: p.subcategory?.category?.slug,
  subcategorySlug: p.subcategory?.slug,
  price: typeof p.price === 'number' ? p.price : parseFloat(String(p.price)),
  inStock: (p.stock ?? 0) > 0,
  colors: p.color ? [{ name: p.color, hex: '#000000' }] : [],
  imageUrl: p.images?.[0]?.url || '/assets/productspecificatin/wallets.png',
});

const availableColors: ProductColor[] = [
  { name: "Brown", hex: "#8B4513" },
  { name: "Red", hex: "#B22222" },
  { name: "Black", hex: "#000000" },
  { name: "Gray", hex: "#808080" },
  { name: "Green", hex: "#228B22" },
  { name: "Yellow", hex: "#DAA520" },
];

// --- Sub-Components ---
export const ProductCard: React.FC<{ product: UIProductCard; compact?: boolean }> = ({ product, compact = false }) => {
  const href = product.categorySlug && product.subcategorySlug
    ? `/leather-goods/${product.categorySlug}/${product.subcategorySlug}/${product.slug}`
    : product.subcategorySlug
      ? `/leather-goods/${product.subcategorySlug}/${product.slug}`
      : product.slug
        ? `/leather-goods/${product.slug}`
        : '#';
  return (
    <div className={`bg-white rounded-2xl ${compact ? 'p-3' : 'p-4'} shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-100/50`}>
      <div className={`bg-gray-100 rounded-lg ${compact ? 'mb-3' : 'mb-4'}`}>
        <Link href={href} aria-label={product.name}>
          <img
            src={product.imageUrl}
            alt={product.name}
            className={`w-full ${compact ? 'aspect-[4/3]' : 'h-auto'} object-cover rounded-lg`}
          />
        </Link>
      </div>
      <Link href={href} className="block">
        <p className={`text-gray-600 ${compact ? 'text-xs' : 'text-sm'}`}>{product.name} | Black</p>
      </Link>
      <p className={`font-bold ${compact ? 'text-base my-1.5' : 'text-lg my-2'} text-black`}>
        Rs. {product.price.toLocaleString("en-IN")}
      </p>
      <div className="flex items-center justify-between">
        <div className={`flex ${compact ? 'space-x-1.5' : 'space-x-2'}`}>
          {product.colors.map((color) => (
            <span
              key={color.name}
              className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} rounded-full border border-gray-200`}
              style={{ backgroundColor: color.hex }}
            ></span>
          ))}
        </div>
        <button className={`bg-black text-white ${compact ? 'text-[10px] px-3 py-1.5' : 'text-xs px-4 py-2'} font-semibold rounded-lg flex items-center hover:bg-gray-800 transition-colors`}>
          <AddToBagIcon />
          Add to bag
        </button>
      </div>
    </div>
  );
};

export const FilterSidebar: React.FC<{
  inStockOnly: boolean;
  setInStockOnly: (val: boolean) => void;
  maxPrice: number;
  setMaxPrice: (price: number) => void;
  selectedColors: string[];
  setSelectedColors: (colors: string[]) => void;
}> = ({
  inStockOnly,
  setInStockOnly,
  maxPrice,
  setMaxPrice,
  selectedColors,
  setSelectedColors,
}) => {
  const [priceOpen, setPriceOpen] = useState(true);
  const [colorOpen, setColorOpen] = useState(true);

  const handleColorToggle = (colorName: string) => {
    const newColors = selectedColors.includes(colorName)
      ? selectedColors.filter((c) => c !== colorName)
      : [...selectedColors, colorName];
    setSelectedColors(newColors);
  };

  const SLIDER_MAX = 100000;
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
            <label htmlFor="in-stock" className="text-gray-700">
              In stock only
            </label>
            <button
              id="in-stock"
              onClick={() => setInStockOnly(!inStockOnly)}
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                inStockOnly ? "bg-black" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                  inStockOnly ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <button
            onClick={() => setPriceOpen(!priceOpen)}
            className="w-full flex justify-between items-center mb-4"
          >
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
          <button
            onClick={() => setColorOpen(!colorOpen)}
            className="w-full flex justify-between items-center mb-4"
          >
            <h3 className="font-semibold text-gray-800">Color</h3>
            <ChevronDownIcon open={colorOpen} />
          </button>
          {colorOpen && (
            <div className="flex flex-wrap gap-3">
              {availableColors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => handleColorToggle(color.name)}
                  className={`w-8 h-8 rounded-md border-2 p-0.5 ${
                    selectedColors.includes(color.name)
                      ? "border-black"
                      : "border-transparent"
                  }`}
                >
                  <div
                    className="w-full h-full rounded-sm"
                    style={{ backgroundColor: color.hex }}
                  ></div>
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
interface ProductListingProps {
  category?: string;
  showBestSellers?: boolean;
  gender?: string;
}

// Format category/slug into a display-friendly string (e.g. "duffle-bags" -> "Duffle Bags")
function formatCategoryDisplay(cat?: string) {
  if (!cat) return "Products";
  const cleaned = cat.replace(/[-_]/g, " ").toLowerCase().trim();
  return cleaned
    .split(/\s+/)
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : ""))
    .join(" ");
}

export default function ProductListingPage({
  category,
  showBestSellers,
  gender,
}: ProductListingProps) {
  const [inStockOnly, setInStockOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(50000);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<UIProductCard[]>([]);

  // Build query params from filters and route context
  const query = useMemo(() => {
    const params = new URLSearchParams();
    // category may be like "cat" or "cat/subcat"; map to API
    if (category) {
      const parts = category.split('/').filter(Boolean);
      if (parts.length === 1) params.set('category', parts[0]);
      if (parts.length >= 2) params.set('subcategory', parts[1]);
    }
  if (inStockOnly) params.set('inStock', 'true');
  if (gender) params.set('gender', gender.toLowerCase());
    if (maxPrice) params.set('maxPrice', String(maxPrice));
    if (selectedColors.length > 0) params.set('color', selectedColors[0]); // API supports single color
    params.set('page', '1');
    params.set('pageSize', '24');
    return params.toString();
  }, [category, inStockOnly, maxPrice, selectedColors]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const url = query ? `/api/public/products?${query}` : '/api/public/products?page=1&pageSize=24';
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load products');
        const data: { items: APIProduct[] } = await res.json();
        if (!active) return;
        const mapped = data.items.map(mapToUIProduct);
        // Best sellers: if requested, take top 6 from results (as placeholder)
        setProducts(showBestSellers ? mapped.slice(0, 6) : mapped);
      } catch (err: any) {
        if (!active) return;
        setError(err?.message || 'Failed to load products');
        setProducts([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false };
  }, [query, showBestSellers]);

  return (
    <div className="bg-gray-50 min-h-screen font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-10 text-black">
          {showBestSellers ? "Best Sellers" : formatCategoryDisplay(category)}
        </h1>
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
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-16"><p className="text-red-500">{error}</p></div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
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
