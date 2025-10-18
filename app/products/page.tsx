import React from "react";
import Naavbar from "@/components/Naavbar";
import ProductListingPage from "@/components/product/productview";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = (await searchParams) ?? {}
  const showBest = sp.bestsellers === "true";
  const gender = typeof sp.gender === 'string' ? sp.gender : undefined;

  return (
    <div>
      <Naavbar />
      <ProductListingPage showBestSellers={showBest} gender={gender} />
    </div>
  );
}
