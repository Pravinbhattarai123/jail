import React from "react";
import Image from "next/image";
import Link from "next/link";

// small slugify helper
function slugify(str: string) {
  return str
    .toString()
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// Define the structure for the collection data
interface CollectionItem {
  id: number;
  title: string;
  imageUrl: string;
  imageAlt: string;
}

// Updated data with the specified image paths and order
const collections: CollectionItem[] = [
  {
    id: 1,
    title: "TRAVEL ESSENTIALS",
    imageUrl: "/assets/Hero/travel-essentials.png",
    imageAlt: "Black cylindrical travel bag on stone steps",
  },
  {
    id: 2,
    title: "HYDRO COLLECTION",
    imageUrl: "/assets/Hero/suitcaseboys.png",
    imageAlt: "Two men standing on a rocky outcrop",
  },
  {
    id: 3,
    title: "NEW ARRIVAL",
    imageUrl: "/assets/Hero/knife.png",
    imageAlt: "A multi-tool knife and leather pouch on a wooden surface",
  },
];

const CollectionDisplay: React.FC = () => {
  return (
    <div className="mx-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6 place-items-center max-w-[1240px]">
      {collections.map((collection) => (
        <div
          key={collection.id}
          className="relative w-[382px] h-[455px] cursor-pointer overflow-hidden group rounded"
        >
          {/* Image */}
          <Image
            src={collection.imageUrl}
            alt={collection.imageAlt}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.02]"
            priority={true}
          />

          {/* Top ribbon on first card - appears only on hover */}
          {collection.id === 1 && (
            <div className="absolute top-2 left-2 right-2 bg-white/95 text-black text-[12px] leading-tight text-center py-1 tracking-wide shadow-sm opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
              30 % off on gym essentials
            </div>
          )}

          {/* No gradient overlay: keep image fully visible */}

          {/* Bottom overlay content */}
          <div className="absolute bottom-0 left-5 bg-transparent right-0 p-4 sm:p-5 text-white z-10">
            <h2 className="uppercase tracking-[0.35em] text-base sm:text-lg font-medium mb-3 text-white">
              {collection.title}
            </h2>
            <Link
              href={`/leather-goods/${slugify(collection.title)}`}
              className="inline-flex  items-center justify-center w-[178px] 
              h-[33px] text-[12px] font-medium uppercase tracking-wide rounded-sm 
              border  text-white bg-transparent hover:bg-white/10 transition duration-200"
            >
              View Collection
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CollectionDisplay;
