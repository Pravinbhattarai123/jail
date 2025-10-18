import React from "react";
import Naavbar from "@/components/Naavbar";
import ProductListingPage from "@/components/product/productview";

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string; subcategory: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { category, subcategory } = await params
  const sp = (await searchParams) ?? {}
  const showBest = sp.bestsellers === "true";

  return (
    <div>
      <Naavbar />
      <ProductListingPage category={`${category}/${subcategory}`} showBestSellers={showBest} />
    </div>
  );
}