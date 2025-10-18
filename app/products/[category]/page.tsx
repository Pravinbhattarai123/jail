import React from "react";
import Naavbar from "@/components/Naavbar";
import ProductListingPage from "@/components/product/productview";

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { category } = await params
  const sp = (await searchParams) ?? {}
  const showBest = sp.bestsellers === "true";
  const gender = typeof sp.gender === 'string' ? sp.gender : undefined;

  return (
    <div>
      <Naavbar />
      <ProductListingPage category={category} showBestSellers={showBest} gender={gender} />
    </div>
  );
}
