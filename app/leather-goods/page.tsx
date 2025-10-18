import React from "react";
import Link from "next/link";
import Naavbar from "@/components/Naavbar";
import prisma from "@/lib/prisma";
import CategoryGrid, { GridCategory, GridProduct } from "@/components/product/CategoryGrid";

type ProductRow = {
  id: number;
  title: string;
  slug: string;
  price: any;
  stock: number;
  imageUrls: string[];
  categoryName?: string | null;
  categorySlug?: string | null;
  subcategorySlug?: string | null;
  colorsHex?: string[];
};

export default async function LeatherGoodsRootPage() {
  // Fetch all active products with their category/subcategory and first image.
  const items = await prisma.product.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      price: true,
      stock: true,
      images: { select: { url: true, position: true }, orderBy: { position: "asc" }, take: 5 },
      colors: true,
      colorsRel: { select: { name: true, hex: true } },
      subcategory: {
        select: {
          slug: true,
          category: { select: { name: true, slug: true } },
        },
      },
    },
  });

  // Map to a simpler shape and group by category.
  // Basic name->hex fallback map when Color.hex is missing or when using legacy CSV colors
  const fallbackHex: Record<string, string> = {
    black: "#000000",
    white: "#FFFFFF",
    brown: "#6B4F4F",
    tan: "#D2B48C",
    camel: "#C19A6B",
    beige: "#F5F5DC",
    red: "#D32F2F",
    blue: "#1976D2",
    green: "#2E7D32",
    gray: "#9E9E9E",
    grey: "#9E9E9E",
    navy: "#001F3F",
    maroon: "#800000",
    burgundy: "#800020",
    cognac: "#9A463D",
    coffee: "#6F4E37",
    charcoal: "#36454F",
  };

  const mapped: ProductRow[] = items.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    price: p.price as any,
    stock: p.stock,
    imageUrls: (p.images || []).map(i => i.url).filter(Boolean),
    categoryName: p.subcategory?.category?.name ?? null,
    categorySlug: p.subcategory?.category?.slug ?? null,
    subcategorySlug: p.subcategory?.slug ?? null,
    colorsHex: (() => {
      const rel = (p as any).colorsRel as { name: string; hex: string | null }[] | undefined
      if (rel && rel.length) {
        return rel.map(c => (c.hex && /^#?[0-9A-Fa-f]{3,8}$/.test(c.hex) ? (c.hex.startsWith('#') ? c.hex : `#${c.hex}`) : fallbackHex[(c.name || '').toLowerCase()] || "#000000")).slice(0, 8)
      }
      const csv = (p as any).colors as string | null | undefined
      if (csv) {
        return csv.split(',').map(s => s.trim().toLowerCase()).filter(Boolean).map(n => fallbackHex[n] || "#000000").slice(0, 8)
      }
      return []
    })(),
  }));

  const byCategory = new Map<string, { name: string; slug: string; products: ProductRow[] }>();
  for (const p of mapped) {
    if (!p.categorySlug) continue;
    const key = p.categorySlug;
    if (!byCategory.has(key)) {
      byCategory.set(key, { name: p.categoryName || key, slug: key, products: [] });
    }
    byCategory.get(key)!.products.push(p);
  }

  const categories = Array.from(byCategory.values());
  const gridData: GridCategory[] = categories.map(c => ({
    name: c.name,
    slug: c.slug,
    products: c.products.map<GridProduct>((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      price: typeof p.price === 'number' ? p.price : parseFloat(String(p.price)),
      stock: p.stock,
      images: p.imageUrls && p.imageUrls.length ? p.imageUrls : [],
      categorySlug: p.categorySlug,
      subcategorySlug: p.subcategorySlug,
      colorsHex: p.colorsHex || [],
    })),
  }));

  return (
    <div>
      <Naavbar />

      <main className="bg-gray-50 min-h-screen font-sans p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-10 text-black">
            Leather Goods
          </h1>

          {gridData.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500">No products available.</p>
            </div>
          ) : (
            <CategoryGrid categories={gridData} titleClassName="lux-serif" />
          )}
        </div>
      </main>
    </div>
  );
}
