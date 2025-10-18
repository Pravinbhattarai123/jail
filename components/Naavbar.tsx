"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FiX } from "react-icons/fi";
import { MenuIcon, SearchIcon, CartIcon, UserIcon, HeartIcon } from "@/components/icons/TightIcons";
import { useWishlist } from "@/components/contexts/WishlistContext";

	// Minimal types to keep this component type-safe
	interface NavItem {
	  name: string;
	  href: string;
	}
	
	interface ProductImageSnap { id: number; url: string; position: number | null }
	interface ProductSnap {
	  id: number; title: string; slug: string | null; price: number | string;
	  currency: string; images: ProductImageSnap[]
	}
	interface CartItemSnap {
	  id: string; productId: number; quantity: number; unitPrice: number | string;
	  currency: string; product: ProductSnap | null
	}
	interface CartSnap {
	  id: string; status: string; subtotal: number | string; discount: number | string;
	  tax: number | string; shipping: number | string; total: number | string;
	  currency: string; items: CartItemSnap[]
	}
	
	const primaryMenu: NavItem[] = [
	  { name: "Collection", href: "/products/collection" },
	  { name: "Wallets", href: "/products/wallets" },
	  { name: "Bag", href: "/products/bag" },
	  { name: "Belts", href: "/products/belts" },
	  { name: "Jackets", href: "/products/jackets" },
	  { name: "Shoes", href: "/products/shoes" },
	  { name: "Gloves", href: "/products/gloves" },
	  { name: "Women", href: "/products/women" },
	];
	const aboutLink: NavItem = { name: "About us", href: "/about-us" };
	const allMenu: NavItem[] = [...primaryMenu, aboutLink];
	
	const Naavbar: React.FC = () => {
	  const router = useRouter();
	  const { toggleWishlist, state: wishlistState } = useWishlist();
	
	  // UI state
	  const [query, setQuery] = useState("");
	  const [searchOpen, setSearchOpen] = useState(false);
	  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	  const [cartOpen, setCartOpen] = useState(false);
	  const [cartLoading, setCartLoading] = useState(false);
	  const [cartData, setCartData] = useState<CartSnap | null>(null);
	  const [cartError, setCartError] = useState<string | null>(null);
	
	  const inputRef = useRef<HTMLInputElement | null>(null);
	  const searchRef = useRef<HTMLDivElement | null>(null);
	  const cartRef = useRef<HTMLDivElement | null>(null);
	
	  // Focus input when search opens
	  useEffect(() => { if (searchOpen && inputRef.current) inputRef.current.focus(); }, [searchOpen]);
	
	  // Close search on outside click
	  useEffect(() => {
		const onDoc = (e: MouseEvent) => {
		  if (!searchOpen) return;
		  if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
		};
		document.addEventListener("mousedown", onDoc);
		return () => document.removeEventListener("mousedown", onDoc);
	  }, [searchOpen]);
	
	  // Close cart on outside click
	  useEffect(() => {
		const onDoc = (e: MouseEvent) => {
		  if (!cartOpen) return;
		  if (cartRef.current && !cartRef.current.contains(e.target as Node)) setCartOpen(false);
		};
		document.addEventListener("mousedown", onDoc);
		return () => document.removeEventListener("mousedown", onDoc);
	  }, [cartOpen]);
	
	  // Fetch cart when opened
	  useEffect(() => {
		if (!cartOpen) return;
		let active = true;
		(async () => {
		  try {
			setCartLoading(true);
			setCartError(null);
			const res = await fetch("/api/public/cart", { cache: "no-store" });
			if (!res.ok) throw new Error("Failed to load cart");
			const data = (await res.json()) as { cart?: CartSnap | null };
			if (!active) return;
			setCartData(data.cart ?? null);
		  } catch (err) {
			setCartError(err instanceof Error ? err.message : "Failed to load cart");
			setCartData(null);
		  } finally {
			setCartLoading(false);
		  }
		})();
		return () => { active = false };
	  }, [cartOpen]);
	
	  // Search submit
	  const onSearchSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const q = query.trim();
		if (!q) return;
		router.push(`/search?query=${encodeURIComponent(q)}`);
		setSearchOpen(false);
		setQuery("");
	  };
	
	
	// Track scroll to switch styles
	const [scrolled, setScrolled] = useState(false);
	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 10);
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	// Always black icons/text in light mode
	const iconBtn = "m-0 p-0 inline-flex h-7 w-7 md:h-11 md:w-11 items-center justify-center text-[14px] md:text-2xl text-black hover:text-gray-700 active:text-black rounded-full transition duration-150";

	return (
		<>
		<nav className={`fixed top-0 z-50 w-full text-black border-b transition-all duration-300 ${
				scrolled
					? "border-gray-200 opacity-90 backdrop-blur-md"
					: "border-gray-200"
			}`}
			style={
				scrolled
					? {
						backgroundImage:
							"url('/assets/Hero/herobanner.gif'), url('/assets/Hero/herobanner.png')",
						backgroundSize: "cover",
						backgroundPosition: "center",
					}
					: { backgroundColor: "rgba(255,255,255,0.98)" }
			}
		>
			<div className="mx-auto grid grid-cols-3 items-center w-full max-w-[1280px] px-3 h-[76px]">
			  {/* Left: hamburger (mobile) + desktop logo */}
			  <div className="flex items-center gap-2 md:gap-3 justify-self-start">
				<button type="button" aria-label="Open menu" className={`${iconBtn} md:hidden border border-black/10 bg-white/80 backdrop-blur-[2px] hover:bg-white text-black`} onClick={() => setMobileMenuOpen(true)}>
				  <MenuIcon className="h-5 w-5" />
				</button>
				<Link href="/" className="hidden md:inline-flex">
				  <Image src="/assets/Hero/jail.png" alt="Logo" width={120} height={40} className="h-8 w-auto object-contain" />
				</Link>
	
			  </div>
	
			  {/* Center column: mobile logo OR desktop primary menu */}
			  <div className="justify-self-center">
				{/* Mobile: centered logo */}
				<Link href="/" className="flex justify-center md:hidden">
				  <Image src="/assets/Hero/jail.png" alt="Logo" width={120} height={40} className="h-8 w-auto object-contain" />
				</Link>
				{/* Desktop: centered primary menu */}
        <div className="flex flex-col items-center">
 
				<div className="hidden md:flex items-center gap-12">
				  {primaryMenu.map((item) => (
					<Link
					  key={item.name}
					  href={item.href}
					  className="text-[18px] font-medium text-black hover:text-gray-700 hover:underline underline-offset-4 decoration-1 decoration-black/60 transition-colors"
					>
					  {item.name}
					</Link>
				  ))}
				</div>
        <div className="mx-auto  items-center justify-center px-0 hidden md:block" style={{ width: 1280 }}>
			<p className="w-full py-2 text-center text-[18px] font-semibold text-black">Get discount on sling bags</p>
			</div>
        </div>
       
			  </div>
	
			  {/* Right: About Us (above on md+) + icons inline */}
			  <div className="flex items-center justify-end gap-1 md:gap-3 md:flex-col md:items-end justify-self-end">
				<Link href={aboutLink.href} className="hidden text-[18px] font-medium text-black md:inline">
				  {aboutLink.name}
				</Link>
				<div className="flex items-center gap-0 md:gap-0">
				  <div ref={searchRef} className="relative">
					<button type="button" aria-label="Search" className={iconBtn + " transform transition-transform hover:scale-110"} onClick={() => setSearchOpen((p) => !p)} >
					  <SearchIcon className="h-4 w-4 md:h-5 md:w-5" />
					</button>
					{searchOpen && (
					  <form onSubmit={onSearchSubmit} className="absolute right-0 mt-2 w-64 max-w-[85vw] md:w-80">
						<div className="flex items-center overflow-hidden rounded-lg bg-white text-black shadow-lg ring-1 ring-black/10">
						  <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products" className="flex-1 bg-transparent px-3 py-2 text-sm outline-none" />
						  <button type="submit" className="bg-neutral-900 px-3 py-2 text-sm text-white">Search</button>
						  <button type="button" className="px-2 text-gray-500" onClick={() => setSearchOpen(false)}>✕</button>
						</div>
					  </form>
					)}
				  </div>
	
					<Link href="/profilepage" aria-label="Account" className={`${iconBtn} transform transition-transform hover:scale-110`}>
					<UserIcon className="h-4 w-4 md:h-5 md:w-5" />
				  </Link>
	
				  <button type="button" aria-label="Wishlist" onClick={toggleWishlist} className={`${iconBtn} relative transform transition-transform hover:scale-110`}>
					<HeartIcon className="h-4 w-4 md:h-5 md:w-5" />
					{wishlistState.totalItems > 0 && (
					  <span className="absolute -top-1 -right-1 min-w-[16px] rounded-full bg-red-600 px-1.5 py-1 text-center text-[10px] leading-none text-white">
						{Math.min(99, wishlistState.totalItems)}
					  </span>
					)}
				  </button>
	
				  <div ref={cartRef} className="relative">
					<button type="button" aria-label="Cart" className={iconBtn + " transform transition-transform hover:scale-110"} onClick={() => setCartOpen((p) => !p)}>
					  <CartIcon className="h-4 w-4 md:h-5 md:w-5" />
					</button>
					{cartOpen && (
					  <div className="absolute right-0 mt-2 h-[503px] w-[318px] max-w-[90vw] overflow-auto rounded-lg bg-white text-black shadow-lg ring-1 ring-black/10">
						<div className="p-3"><h4 className="text-sm font-semibold">Your Cart</h4></div>
						<div className="px-3 pb-3">
						  {cartLoading && <div className="py-6 text-center text-sm text-gray-600">Loading...</div>}
						  {cartError && <div className="py-6 text-center text-sm text-red-600">{cartError}</div>}
						  {!cartLoading && !cartError && !cartData && (
							<div className="py-6 text-center text-sm text-gray-600">
							  <p>Your cart is empty.</p>
							  <Link href="/leather-goods" className="text-sm text-blue-600 underline">Start shopping</Link>
							</div>
						  )}
						  {!cartLoading && !cartError && cartData && cartData.items.length > 0 && (
							<div className="space-y-3">
															{cartData.items.map((item) => (
																<div key={item.id} className="flex items-center rounded-md p-2 hover:bg-gray-50">
																	<Link href={item.product?.slug ? `/leather-goods/${item.product.slug}` : "/leather-goods"} className="flex flex-1 items-center">
																		<Image src={item.product?.images?.[0]?.url || "/assets/Hero/jail.png"} alt={item.product?.title || "Product"} width={48} height={48} className="mr-3 h-12 w-12 flex-shrink-0 rounded object-cover" />
																		<div className="min-w-0">
																			<p className="truncate text-xs font-medium text-gray-900">{item.product?.title}</p>
																			<p className="text-xs text-gray-600">Qty: {item.quantity} • ₹{Number(item.unitPrice || 0).toLocaleString("en-IN")}</p>
																		</div>
																	</Link>
																	<div className="ml-3 flex-shrink-0">
																		<button type="button" className="text-[11px] text-red-600 hover:underline" onClick={async (e) => {
									  e.preventDefault();
									  setCartData((prev) => prev ? { ...prev, items: prev.items.filter(x => x.id !== item.id) } : prev);
									  try {
										await fetch("/api/public/cart", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: item.productId }) });
									  } catch {}
									}}>Remove</button>
								  </div>
								</div>
							  ))}
							  <div className="mt-2 border-t pt-2">
								<div className="flex items-center justify-between px-3 py-2">
								  <div>
									<p className="text-sm text-gray-700">Subtotal</p>
									<p className="text-lg font-bold">₹{Number(cartData.total || 0).toLocaleString("en-IN")}</p>
								  </div>
								  <div className="space-x-2">
									<Link href="/cart" className="inline-block rounded border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50">View Cart</Link>
									<Link href="/checkout" className="inline-block rounded bg-black px-3 py-2 text-sm text-white hover:bg-gray-900">Checkout</Link>
								  </div>
								</div>
							  </div>
							</div>
						  )}
						</div>
					  </div>
					)}
				  </div>
				</div>
			  </div>
			</div>
			{/* Promo line under the top row */}
			
		  </nav>
	
		  {/* Mobile drawer */}
		  {mobileMenuOpen && (
			<div className="fixed inset-0 z-[60] md:hidden">
			  <div className="absolute inset-0 bg-black/20" onClick={() => setMobileMenuOpen(false)} aria-hidden="true" />
			  <aside className="absolute left-0 top-0 flex h-full w-80 max-w-[85vw] flex-col bg-white text-black shadow-xl">
				<div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
				  <span className="font-semibold tracking-wider">Menu</span>
				  <button aria-label="Close menu" className="text-2xl" onClick={() => setMobileMenuOpen(false)}>
					<FiX />
				  </button>
				</div>
				<form onSubmit={(e) => { e.preventDefault(); const q=query.trim(); if (!q) return; router.push(`/search?query=${encodeURIComponent(q)}`); setMobileMenuOpen(false); setQuery(""); }} className="border-b border-gray-200 px-4 py-3">
				  <div className="flex items-center overflow-hidden rounded-lg bg-white text-black">
					<input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products…" className="flex-1 px-3 py-2 text-sm outline-none" aria-label="Search products" />
					<button type="submit" className="bg-black px-3 py-2 text-sm text-white"><SearchIcon className="inline h-4 w-4" /></button>
				  </div>
				</form>
				<div className="flex-1 overflow-y-auto px-2 py-2">
				  <ul className="space-y-1">
					{allMenu.map((item) => (
					  <li key={item.name}>
						<Link href={item.href} onClick={() => setMobileMenuOpen(false)} className="block rounded px-3 py-3 hover:bg-gray-100">
						  {item.name}
						</Link>
					  </li>
					))}
				  </ul>
				  <div className="mt-4 border-t border-gray-200 pt-2">
					<Link href="/profilepage" onClick={() => setMobileMenuOpen(false)} className="block rounded px-3 py-3 hover:bg-gray-100">
					  <span className="inline-flex items-center gap-2"><UserIcon className="h-4 w-4" /> Profile</span>
					</Link>
					<button className="w-full rounded px-3 py-3 text-left hover:bg-gray-100" onClick={() => { toggleWishlist(); setMobileMenuOpen(false); }}>
					  <span className="inline-flex items-center gap-2">❤ Wishlist</span>
					</button>
					<button className="w-full rounded px-3 py-3 text-left hover:bg-gray-100" onClick={() => { setCartOpen(true); setMobileMenuOpen(false); }}>
					  <span className="inline-flex items-center gap-2"><CartIcon className="h-4 w-4" /> Cart</span>
					</button>
				  </div>
				</div>
			  </aside>
			</div>
		  )}
		</>
	  );
	};
	
	export default Naavbar;
