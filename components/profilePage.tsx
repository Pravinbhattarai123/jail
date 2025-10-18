"use client";

import React, { useEffect, useMemo, useState } from 'react';

import { useRouter } from 'next/navigation';

// --- Type Definitions ---
interface User {
  id: string;
  name: string;
  email: string;
  memberSince: string;
  avatarUrl: string;
  address: string[];
}

interface Order {
  id: string;
  date: string;
  status: 'Delivered' | 'Shipped' | 'Processing' | 'Cancelled';
  total: number;
  items: number;
  itemTitles?: string[];
}

interface WishlistItem {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  inStock: boolean;
}

type CurrentView = 'profile' | 'orders' | 'wishlist' | 'settings';

// --- Helpers ---
function formatAddressLines(addr?: {
  line1?: string | null
  line2?: string | null
  city?: string | null
  state?: string | null
  postalCode?: string | null
  countryCode?: string | null
}): string[] {
  if (!addr) return []
  const lines: string[] = []
  if (addr.line1) lines.push(addr.line1)
  if (addr.line2) lines.push(addr.line2)
  const cityLine = [addr.city, addr.state, addr.postalCode].filter(Boolean).join(', ')
  if (cityLine) lines.push(cityLine)
  if (addr.countryCode) lines.push(addr.countryCode)
  return lines
}

/** Renders a minimal button for the sidebar navigation. */
const NavItem: React.FC<{
  view: CurrentView;
  activeView: CurrentView;
  setView: (v: CurrentView) => void;
  children: React.ReactNode;
}> = ({ view, activeView, setView, children }) => {
  const isActive = view === activeView;
  return (
    <button
      onClick={() => setView(view)}
      className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 focus:outline-none ${
        isActive ? 'bg-black text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );
};

/** Renders the Wishlist Content View */
const WishlistContent: React.FC<{ wishlist: WishlistItem[]; handleRemove: (id: number) => void }>
  = ({ wishlist, handleRemove }) => {
  if (wishlist.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Your Wishlist is Empty</h3>
        <p className="text-gray-500">Start browsing products to save your favorites!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {wishlist.map((item) => (
        <div
          key={item.id}
          className="flex items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
        >
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-20 h-20 object-cover rounded-lg mr-4 flex-shrink-0"
          />
          <div className="flex-grow min-w-0">
            <p className="font-semibold text-gray-800 truncate">{item.name}</p>
            <p className="text-xl font-bold text-red-600 mt-1">₹{item.price.toLocaleString('en-IN')}</p>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${
                item.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}
            >
              {item.inStock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
          <div className="flex flex-col items-end space-y-2 ml-4">
            <button
              onClick={() => handleRemove(item.id)}
              className="text-gray-500 hover:text-red-600 transition-colors duration-200 text-sm"
            >
              Remove
            </button>
            {item.inStock && (
              <button className="bg-blue-600 text-white text-sm px-3 py-1.5 rounded-full hover:bg-blue-700 transition-colors duration-200">
                Add to Cart
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

/** Renders the Orders Content View */
const OrdersContent: React.FC<{ orders: Order[]; loading?: boolean }>
  = ({ orders, loading }) => {
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-24 bg-gray-100 animate-pulse rounded-xl" />
        <div className="h-24 bg-gray-100 animate-pulse rounded-xl" />
      </div>
    );
  }
  if (!orders.length) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Orders Yet</h3>
        <p className="text-gray-500">Your recent orders will appear here once you place one.</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center transition-shadow hover:shadow-md"
        >
          <div>
            <p className="font-semibold text-gray-900">Order #{order.id}</p>
            <p className="text-sm text-gray-500">Placed on: {order.date}</p>
            <p className="text-sm text-gray-500">{order.items} item(s)</p>
            {order.itemTitles && order.itemTitles.length > 0 && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                {order.itemTitles.join(', ')}
                {order.items > order.itemTitles.length && `, +${order.items - order.itemTitles.length} more`}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-800">₹{order.total.toLocaleString('en-IN')}</p>
            <span
              className={`text-xs font-medium px-3 py-1 rounded-full mt-1 inline-block ${
                order.status === 'Delivered'
                  ? 'bg-green-100 text-green-700'
                  : order.status === 'Shipped'
                  ? 'bg-blue-100 text-blue-700'
                  : order.status === 'Processing'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {order.status}
            </span>
            <button className="block text-blue-600 hover:text-blue-800 text-sm mt-2">View Details</button>
          </div>
        </div>
      ))}
    </div>
  );
};

/** Renders the Profile Info Content View */
const ProfileInfoContent: React.FC<{ user: User }> = ({ user }) => (
  <div className="space-y-6 bg-white p-6 rounded-xl shadow-md border border-gray-100">
    <h3 className="text-2xl font-semibold text-gray-800 border-b pb-3 mb-4">Basic Information</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-600">
      <div>
        <p className="font-medium text-gray-800">Full Name</p>
        <p className="text-gray-700 p-2 bg-gray-50 rounded-md border border-gray-200">{user.name}</p>
      </div>
      <div>
        <p className="font-medium text-gray-800">Email Address</p>
        <p className="text-gray-700 p-2 bg-gray-50 rounded-md border border-gray-200">{user.email}</p>
      </div>
      <div className="sm:col-span-2">
        <p className="font-medium text-gray-800">Primary Address</p>
        <div className="text-gray-700 p-2 bg-gray-50 rounded-md border border-gray-200 space-y-0.5">
          {user.address.map((line, index) => (
            <p key={index} className="text-sm">{line}</p>
          ))}
        </div>
      </div>
      <div>
        <p className="font-medium text-gray-800">Member Since</p>
        <p className="text-gray-700 p-2 bg-gray-50 rounded-md border border-gray-200">{user.memberSince}</p>
      </div>
      <div>
        <p className="font-medium text-gray-800">User ID</p>
        <p className="text-gray-700 p-2 bg-gray-50 rounded-md border border-gray-200">{user.id}</p>
      </div>
    </div>
    <button className="mt-4 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm">
      Edit Profile
    </button>
  </div>
);

// --- Main Component ---
export default function UserProfilePage() {
  const [currentView, setCurrentView] = useState<CurrentView>('profile');
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  // Fetch current user profile with addresses
  useEffect(() => {
    let active = true;
    (async () => {
      setUserLoading(true);
      try {
        const res = await fetch('/api/auth/myself', { cache: 'no-store' });
        if (!res.ok) throw new Error('unauthorized');
        const data = await res.json();
        const u = data.user as {
          id: number;
          email: string;
          name?: string | null;
          createdAt: string;
          addresses?: Array<{
            line1?: string | null;
            line2?: string | null;
            city?: string | null;
            state?: string | null;
            postalCode?: string | null;
            countryCode?: string | null;
            isDefaultShipping?: boolean | null;
          }>;
        };
        const defaultAddr = (u.addresses || []).find(a => a.isDefaultShipping) || (u.addresses || [])[0];
        const mapped: User = {
          id: String(u.id),
          name: u.name || 'User',
          email: u.email,
          memberSince: new Date(u.createdAt).toLocaleString('en-IN', { month: 'long', year: 'numeric' }),
          avatarUrl: `https://placehold.co/100x100/A3A3A3/FFFFFF?text=${(u.name || u.email || 'U').slice(0, 2).toUpperCase()}`,
          address: formatAddressLines(defaultAddr),
        };
        if (active) setUser(mapped);
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setUserLoading(false);
      }
    })();
    return () => { active = false };
  }, []);

  // Fetch wishlist
  useEffect(() => {
    let active = true;
    (async () => {
      setWishlistLoading(true);
      try {
        const res = await fetch('/api/public/wishlist', { cache: 'no-store' });
        if (!res.ok) throw new Error('unauthorized');
        const data = await res.json();
        const items = (data.items || []) as Array<{
          productId: number;
          product: {
            id: number;
            title: string;
            price: number;
            images?: Array<{ url: string | null; position?: number | null }>
          }
        }>;
        const mapped: WishlistItem[] = items.map((it) => ({
          id: it.product?.id || it.productId,
          name: it.product?.title || 'Product',
          price: it.product?.price || 0,
          imageUrl: it.product?.images?.[0]?.url || 'https://placehold.co/100x100',
          inStock: true,
        }));
        if (active) setWishlist(mapped);
      } catch {
        if (active) setWishlist([]);
      } finally {
        if (active) setWishlistLoading(false);
      }
    })();
    return () => { active = false };
  }, []);

  // Fetch orders list (no existing public list endpoint found). Keep empty for now.
  useEffect(() => {
    let active = true;
    (async () => {
      setOrdersLoading(true);
      try {
        const res = await fetch('/api/public/orders', { cache: 'no-store' })
        if (!res.ok) throw new Error('unauthorized')
        const data = await res.json()
        const items = (data.orders || []) as Array<{
          id: string
          createdAt: string
          status: string
          total: number
          items: number
          itemTitles?: string[]
        }>
        const mapped: Order[] = items.map(o => ({
          id: o.id,
          date: new Date(o.createdAt).toLocaleDateString('en-IN'),
          status: (o.status as any) as Order['status'],
          total: o.total,
          items: o.items,
          itemTitles: o.itemTitles || [],
        }))
        if (active) setOrders(mapped)
      } finally {
        if (active) setOrdersLoading(false);
      }
    })();
    return () => { active = false };
  }, []);

  const handleRemoveFromWishlist = async (productId: number) => {
    try {
      await fetch('/api/public/wishlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
    } catch {}
    setWishlist(prev => prev.filter(item => item.id !== productId));
  };

  const ContentArea = useMemo(() => {
    switch (currentView) {
      case 'profile':
        return user ? (
          <ProfileInfoContent user={user} />
        ) : (
          <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100 text-gray-700">
            {userLoading ? 'Loading profile…' : 'Please sign in to view your profile.'}
          </div>
        );
      case 'orders':
        return <OrdersContent orders={orders} loading={ordersLoading} />;
      case 'wishlist':
        return wishlistLoading ? (
          <div className="space-y-3">
            <div className="h-24 bg-gray-100 animate-pulse rounded-xl" />
            <div className="h-24 bg-gray-100 animate-pulse rounded-xl" />
          </div>
        ) : (
          <WishlistContent wishlist={wishlist} handleRemove={handleRemoveFromWishlist} />
        );
      case 'settings':
        return <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100 text-gray-700">Settings coming soon...</div>;
      default:
        return null;
    }
  }, [currentView, user, userLoading, wishlist, wishlistLoading, orders, ordersLoading]);
  const router = useRouter()

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to logout');
      // Redirect to login (or home) after successful logout
      router.push('/login');
    } catch (e) {
      // Fallback: still navigate to login to force re-auth
      router.push('/login');
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div className="font-sans bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <button className='bg-black px-3 py-2 rounded-xl text-white mb-10 cursor-pointer'onClick={()=>{
          router.push('/')
        }}>Back To HomePage</button>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8">My Account</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 sticky top-4">
              {/* User Info Card in Sidebar */}
              <div className="flex flex-col items-center border-b pb-4 mb-4">
                <img
                  src={user?.avatarUrl || 'https://placehold.co/64x64'}
                  alt={user?.name || 'Avatar'}
                  className="w-16 h-16 rounded-full object-cover mb-2 border-2 border-gray-300"
                />
                <p className="font-bold text-lg text-gray-800">{user?.name || (userLoading ? 'Loading…' : 'Guest')}</p>
                <p className="text-sm text-gray-500">{user?.email || ''}</p>
              </div>

              <nav className="space-y-1">
                <NavItem view="profile" activeView={currentView} setView={setCurrentView}>
                  Profile Info
                </NavItem>
                <NavItem view="orders" activeView={currentView} setView={setCurrentView}>
                  My Orders
                </NavItem>
                <NavItem view="wishlist" activeView={currentView} setView={setCurrentView}>
                  Wishlist ({wishlist.length})
                </NavItem>
                <NavItem view="settings" activeView={currentView} setView={setCurrentView}>
                  Settings
                </NavItem>
              </nav>

              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className={`w-full mt-4 text-left px-4 py-3 rounded-lg transition-colors duration-200 text-sm ${
                  signingOut ? 'text-red-300 cursor-not-allowed' : 'text-red-500 hover:bg-red-50'
                }`}
              >
                {signingOut ? 'Signing out…' : 'Sign Out'}
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-grow">
            <h2 className="text-3xl font-semibold text-gray-800 mb-6 capitalize">
              {currentView === 'profile' ? 'Profile Information' : currentView}
            </h2>
            {ContentArea}
          </div>
        </div>
      </div>
    </div>
  );
}
