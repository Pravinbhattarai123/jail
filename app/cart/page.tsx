"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  currency: string;
  product: {
    id: number;
    title: string;
    slug: string;
    price: number;
    currency: string;
    images: { id: number; url: string; position: number | null }[];
  };
  // optional personalization data (sent from add-to-cart)
  personalization?: { id: string; label?: string; price?: number }[];
  personalizationAmount?: number | string;
}

interface Cart {
  id: string;
  status: string;
  subtotal: number | string;
  discount: number | string;
  tax: number | string;
  shipping: number | string;
  total: number | string;
  currency: string;
  items: CartItem[];
}

const asNumber = (v: any) =>
  typeof v === "number" ? v : parseFloat(String(v || 0));

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const symbol = useMemo(() => {
    const code = cart?.currency || "INR";
    switch (code) {
      case "INR":
        return "₹";
      case "USD":
        return "$";
      case "EUR":
        return "€";
      case "GBP":
        return "£";
      default:
        return code;
    }
  }, [cart?.currency]);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/public/cart", { cache: "no-store" });
      if (!r.ok) throw new Error("Failed to load cart");
      const json = await r.json();
      setCart(json.cart);
    } catch (e: any) {
      setError(e?.message || "Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const updateQty = async (productId: number, quantity: number) => {
    setLoading(true);
    try {
      const r = await fetch("/api/public/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
      if (!r.ok) throw new Error("Failed to update quantity");
      await refresh();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const removeItem = async (productId: number) => {
    setLoading(true);
    try {
      const r = await fetch("/api/public/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (!r.ok) throw new Error("Failed to remove item");
      await refresh();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  if (loading && !cart) {
    return <div className="max-w-5xl mx-auto p-6">Loading cart…</div>;
  }
  if (error) {
    return <div className="max-w-5xl mx-auto p-6 text-red-600">{error}</div>;
  }

  const items = cart?.items || [];

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

      {items.length === 0 ? (
        <div className="bg-white shadow rounded p-6 text-center">
          <p className="text-gray-600">Your cart is empty.</p>
          <Link
            href="/leather-goods"
            className="inline-block mt-4 px-4 py-2 bg-black text-white rounded"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((it) => {
              const img =
                it.product.images?.[0]?.url || "/assets/Hero/heroone.png";
              const price = asNumber(it.unitPrice);
              const personalizationAmount = asNumber(
                (it as any).personalizationAmount
              );
              const line = price * it.quantity + personalizationAmount;
              return (
                <div
                  key={it.id}
                  className="flex gap-4 bg-white shadow rounded p-4"
                >
                  <div className="w-24 h-24 relative flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt={it.product.title}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <Link
                      href={`/leather-goods/${it.product.slug}`}
                      className="font-semibold hover:underline line-clamp-2"
                    >
                      {it.product.title}
                    </Link>
                    <div className="text-gray-500 text-sm mt-1">
                      {symbol}
                      {price.toLocaleString("en-IN")}
                    </div>

                    {/* Personalization breakdown (if present) */}
                    {(it as any).personalization &&
                      Array.isArray((it as any).personalization) &&
                      (it as any).personalization.length > 0 && (
                        <div className="mt-2 text-sm text-gray-600">
                          <div className="font-medium text-gray-700">
                            Personalization
                          </div>
                          <ul className="mt-1 space-y-1">
                            {(it as any).personalization.map((p: any) => (
                              <li key={p.id} className="flex justify-between">
                                <span className="text-sm">
                                  {p.label || p.id}
                                </span>
                                <span className="text-sm">
                                  +{symbol}
                                  {asNumber(p.price).toLocaleString("en-IN")}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          updateQty(it.productId, Math.max(0, it.quantity - 1))
                        }
                        className="w-8 h-8 border rounded"
                      >
                        -
                      </button>
                      <span className="min-w-8 text-center">{it.quantity}</span>
                      <button
                        onClick={() => updateQty(it.productId, it.quantity + 1)}
                        className="w-8 h-8 border rounded"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(it.productId)}
                        className="ml-4 text-sm text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="text-right font-semibold">
                    <div>
                      {symbol}
                      {line.toLocaleString("en-IN")}
                    </div>
                    {personalizationAmount > 0 && (
                      <div className="text-xs text-gray-500">
                        (incl. personalization {symbol}
                        {personalizationAmount.toLocaleString("en-IN")})
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="bg-white shadow rounded p-4 h-fit">
            <h2 className="font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              {/* prefer server-provided totals; if missing or not numeric, compute from items */}
              {typeof cart?.subtotal === "number" ? (
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>
                    {symbol}
                    {asNumber(cart?.subtotal).toLocaleString("en-IN")}
                  </span>
                </div>
              ) : (
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>
                    {symbol}
                    {items
                      .reduce(
                        (s, it) =>
                          s +
                          asNumber(it.unitPrice) * it.quantity +
                          asNumber((it as any).personalizationAmount),
                        0
                      )
                      .toLocaleString("en-IN")}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Discount</span>
                <span>
                  - {symbol}
                  {asNumber(cart?.discount).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>
                  {symbol}
                  {asNumber(cart?.tax).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {symbol}
                  {asNumber(cart?.shipping).toLocaleString("en-IN")}
                </span>
              </div>
              {typeof cart?.total === "number" ? (
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>
                    {symbol}
                    {asNumber(cart?.total).toLocaleString("en-IN")}
                  </span>
                </div>
              ) : (
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>
                    {symbol}
                    {(
                      items.reduce(
                        (s, it) =>
                          s +
                          asNumber(it.unitPrice) * it.quantity +
                          asNumber((it as any).personalizationAmount),
                        0
                      ) -
                      asNumber(cart?.discount) +
                      asNumber(cart?.tax) +
                      asNumber(cart?.shipping)
                    ).toLocaleString("en-IN")}
                  </span>
                </div>
              )}
            </div>
            <Link
              href="/checkout?from=cart"
              className="mt-4 block w-full text-center bg-black text-white rounded py-2"
            >
              Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
