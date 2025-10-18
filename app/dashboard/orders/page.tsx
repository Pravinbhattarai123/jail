"use client"
import React, { useState } from "react";
import { Search } from "lucide-react";

// --- Type Definitions for Data ---

interface OrderItem { id: string; image: string }
interface Order {
  id: string;
  customerName: string;
  address: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  total: string;
  currency: string;
  details: OrderItem[];
}

// --- Data Fetch ---
async function fetchOrders(): Promise<Order[]> {
  try {
    const res = await fetch('/api/admin/orders', { cache: 'no-store' })
    const data = await res.json()
    if (!res.ok) return []
    return (data.orders || []).map((o: any) => ({
      id: o.id,
      customerName: o.customerName,
      address: o.address,
      orderNumber: String(o.orderNumber),
      status: o.status,
      paymentStatus: o.paymentStatus,
      createdAt: o.createdAt,
      total: String(o.total),
      currency: o.currency,
      details: o.details,
    }))
  } catch {
    return []
  }
}

/**
 * Renders a single row in the Order List table.
 */
const OrderRow: React.FC<{ order: Order }> = ({ order }) => (
  <tr className="border-b border-gray-100 hover:bg-indigo-50/50 transition-colors">
    {/* Customer Name and Address */}
    <td className="px-4 py-3 text-sm">
      <div className="font-semibold text-gray-900">{order.customerName}</div>
      <div className="text-xs text-gray-500 w-64 whitespace-normal">
        {order.address}
      </div>
    </td>
    {/* Order No. */}
    <td className="px-4 py-3 text-sm text-gray-700 font-medium">
      {order.orderNumber}
    </td>
    {/* Order Status */}
    <td className="px-4 py-3 text-sm">
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
          order.status === "In Process"
            ? "bg-yellow-100 text-yellow-800"
            : order.status === "Delivered"
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }`}
      >
        {order.status}
      </span>
    </td>
  {/* Created At */}
  <td className="px-4 py-3 text-sm text-gray-700">{new Date(order.createdAt).toLocaleDateString()}</td>
    {/* Details (Product Images) */}
    <td className="px-4 py-3">
      <div className="flex -space-x-2">
        {order.details.map((item, index) => (
          <img
            key={item.id}
            src={item.image}
            alt={`Product ${index + 1}`}
            className="w-8 h-8 rounded-md border-2 border-white shadow-sm"
          />
        ))}
      </div>
    </td>
  </tr>
);

/**
 * Main component rendering the entire page layout and order list.
 */
const App: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  React.useEffect(() => {
    let active = true
    fetchOrders().then((o) => { if (active) setOrders(o) })
    return () => { active = false }
  }, [])

  const filteredOrders = orders.filter(
    (order) =>
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(order.orderNumber).includes(searchTerm)
  );

  return (
    <div className="w-full">
      <div className="bg-white p-6 rounded-2xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center mb-4 sm:mb-0">
            Order List
            <span className="ml-3 inline-flex items-center px-3 py-1 text-xs font-medium bg-gray-200 text-gray-800 rounded-full">
              {orders.length} Orders
            </span>
          </h1>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => fetchOrders().then(setOrders)}
              className="px-3 py-2 text-sm rounded bg-black text-white hover:opacity-90"
            >
              Refresh
            </button>
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search User"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order no.
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <OrderRow key={order.id} order={order} />
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-center text-gray-500">
                    No orders found matching "{searchTerm}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-center text-sm text-gray-500">
          Displaying {filteredOrders.length} orders
        </div>
      </div>
    </div>
  );
};

export default App;
