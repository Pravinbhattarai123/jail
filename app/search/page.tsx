"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  APIProduct,
  mapToUIProduct,
  ProductCard,
  ProductCardSkeleton,
  FilterSidebar,
} from "@/components/product/productview";

function SearchInner() {
  const router = useRouter();
  const search = useSearchParams();
  const qParam = (search.get("query") || search.get("q") || "").trim();

  const [term, setTerm] = useState(qParam);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState<ReturnType<typeof mapToUIProduct>[]>([]);
  // Filters
  const [inStockOnly, setInStockOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(50000);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  const apiUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (term) params.set("q", term);
    if (inStockOnly) params.set("inStock", "true");
    if (maxPrice) params.set("maxPrice", String(maxPrice));
    if (selectedColors.length > 0) params.set("color", selectedColors[0]);
    params.set("page", "1");
    params.set("pageSize", "24");
    return `/api/public/products?${params.toString()}`;
  }, [term, inStockOnly, maxPrice, selectedColors]);

  useEffect(() => {
    // keep local term in sync when navigating
    setTerm(qParam);
  }, [qParam]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(apiUrl, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load search results");
        const data: { items: APIProduct[]; total: number } = await res.json();
        if (!active) return;
        setItems(data.items.map(mapToUIProduct));
        setTotal(data.total || 0);
      } catch (err: any) {
        if (!active) return;
        setError(err?.message || "Failed to load search results");
        setItems([]);
        setTotal(0);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [apiUrl]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = term.trim();
    router.push(`/search?query=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
              aria-label="Go to home"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 21V9h6v12" />
              </svg>
              Home
            </button>
            <h1 className="text-3xl sm:text-4xl font-bold text-black">Search</h1>
          </div>
          <form onSubmit={onSubmit} className="flex-1 max-w-md ml-auto">
            <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search products…"
                className="flex-1 px-3 py-2 text-sm outline-none"
              />
              <button
                type="submit"
                className="bg-black text-white px-3 py-2 text-sm hover:bg-gray-900"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {qParam && (
          <p className="text-gray-600 mb-6 text-sm">
            Showing results for <span className="font-semibold">“{qParam}”</span> ({total})
          </p>
        )}

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
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {Array.from({ length: 12 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <p className="text-red-500">{error}</p>
              </div>
            ) : items.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {items.map((p) => (
                  <ProductCard key={p.id} product={p} compact />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-gray-500">No products found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
      <SearchInner />
    </Suspense>
  );
}
