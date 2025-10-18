"use client";

import React, { useEffect, useState } from "react";

type ProductDataLite = {
  stock?: number | null;
  csvSizes?: string[];
  detailsClothesSize?: string[];
  detailsShoesSize?: string[];
  attributes?: Record<string, any> | null;
  detailsDimensions?: Record<string, any> | null;
};

type ProductSizesProps = {
  productId: number | null;
  isJacketPath: boolean;
  isBagPath: boolean;
  data: ProductDataLite;
  selectedSize: string | null;
  onSelectSize: (sz: string | null) => void;
  onOpenSizeChart: () => void;
  onNotifyClick?: (sz: string) => void;
};

export const NotifyForm: React.FC<{ productId: number | null; size?: string }> = ({ productId, size }) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<'idle'|'loading'|'ok'|'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [autoEmail, setAutoEmail] = useState<string | null>(null);
  const [edit, setEdit] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!mounted) return;
        if (res.ok) {
          const j = await res.json();
          if (j?.email) {
            setAutoEmail(j.email);
            if (!email) setEmail(j.email);
          }
        }
      } catch (e) {}
    })();
    return () => { mounted = false };
  }, []);

  const submitNotify = async () => {
    if (!productId) return;
    if (status === 'loading' || status === 'ok') return;
    if (!email) {
      setMessage('Please enter an email');
      return;
    }
    setStatus('loading');
    setMessage(null);
    try {
      const res = await fetch(`/api/public/products/${productId}/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, size }),
      });
      if (res.ok) {
        setStatus('ok');
        setMessage('You will be notified when this size is back.');
      } else {
        setStatus('error');
        const text = await res.text().catch(() => 'Failed to save');
        setMessage(text || 'Failed to save');
      }
    } catch (e) {
      setStatus('error');
      setMessage('Network error');
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {!autoEmail && (
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="flex-1 px-2 py-1 text-sm border rounded" />
        )}
        {autoEmail && !edit && (
          <div className="text-sm text-gray-700">Using: <span className="font-medium">{autoEmail}</span> <button type="button" onClick={() => setEdit(true)} className="ml-2 text-indigo-600">Edit</button></div>
        )}
        {edit && (
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="flex-1 px-2 py-1 text-sm border rounded" />
        )}
        <button
          onClick={submitNotify}
          disabled={status === 'loading' || status === 'ok'}
          className={`px-2 py-1 rounded text-sm text-white ${status === 'ok' ? 'bg-green-600' : 'bg-indigo-600'}`}
        >
          {status === 'ok' ? 'Saved' : status === 'loading' ? 'Saving…' : 'Notify'}
        </button>
      </div>
      {message && <div className="text-xs text-gray-600">{message}</div>}
    </div>
  );
};

const ProductSizes: React.FC<ProductSizesProps> = ({
  productId,
  isJacketPath,
  isBagPath,
  data,
  selectedSize,
  onSelectSize,
  onOpenSizeChart,
  onNotifyClick,
}) => {
  const [sizes, setSizes] = useState<string[]>([]);
  const [remaining, setRemaining] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fromDetails = Array.isArray(data.detailsClothesSize) && data.detailsClothesSize.length ? data.detailsClothesSize : Array.isArray(data.detailsShoesSize) && data.detailsShoesSize.length ? data.detailsShoesSize : [];
    const fromCsv = Array.isArray(data.csvSizes) && data.csvSizes.length ? data.csvSizes : [];
    let baseSizes: string[] = [];

    if (isJacketPath) {
      baseSizes = fromDetails.length ? fromDetails : fromCsv.length ? fromCsv : ['XS', 'S', 'M', 'L', 'XL'];
    } else if (isBagPath) {
      const csv = fromCsv;
      const laptopSizes = csv.filter(s => /inch|in\b|"/i.test(s) || /14|15|13|16/.test(s));
      if (laptopSizes.length) baseSizes = laptopSizes;
      else if (csv.some(s => /l|lt|litre|liters|ltr/i.test(s) || /\d+\s?l/i.test(s))) baseSizes = csv;
      else baseSizes = csv.length ? csv : ['Free size'];
    } else {
      baseSizes = fromDetails.length ? fromDetails : fromCsv.length ? fromCsv : ['Free size'];
    }

    setSizes(baseSizes);

    if (!productId) return;
    setLoading(true);
    fetch(`/api/public/products/${productId}/stock-by-size`)
      .then((r) => r.json())
      .then((json) => {
        if (json && json.sizes) setRemaining(json.sizes);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productId, data, isJacketPath, isBagPath]);

  if (!sizes || sizes.length === 0) return null;

  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-2 flex-wrap">
        {sizes.map((sz) => {
          const rem = remaining[sz] ?? (data.stock ?? 0);
          const low = typeof rem === 'number' && rem < 10 && rem > 0;
          const out = typeof rem === 'number' && rem <= 0;
          const selected = selectedSize === sz;
          return (
            <div key={sz} className="relative">
              <button
                onClick={() => onSelectSize(sz)}
                disabled={out}
                className={`px-3 py-1 rounded-full text-sm border ${
                  selected ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-800 border-gray-300'
                } ${out ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <span className="inline-flex items-center gap-2">
                  <span>{sz}</span>
                  {!loading && low && <span className="text-xs text-red-600">Low</span>}
                  {!loading && out && <span className="text-xs text-red-800">Out</span>}
                </span>
              </button>
            </div>
          );
        })}
      </div>
      <div>
        <button className="text-sm text-indigo-600 hover:underline" onClick={onOpenSizeChart}>
          View size chart
        </button>
      </div>
    </div>
  );
};

export default ProductSizes;
