"use client";

import Link from "next/link";
import { useState } from "react";
import { formatDate } from "@/lib/admin/format";

type Order = {
  id: string;
  status: string;
  paymentStatus: string;
  total: string;
  itemCount: number;
  date: string;
  items: {
    name: string;
    price: string;
    quantity: number;
    img1: string;
  }[];
};

type AccountViewProps = {
  user: {
    id: string;
    name: string;
    email: string;
  };
  orders: Order[];
  initialAddress?: string;
};

export default function AccountView({
  user,
  orders,
  initialAddress = "58 Mbieri street, Aba, Nigeria",
}: AccountViewProps) {
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [addresses, setAddresses] = useState<string[]>([initialAddress]);
  const [isEditing, setIsEditing] = useState(false);
  const [editAddressText, setEditAddressText] = useState(initialAddress);

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAddressText.trim()) return;
    setAddresses([editAddressText.trim()]);
    setIsEditing(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-6 md:px-12 py-16 md:py-24 font-sans">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-start">
        {/* Left Column: Order History */}
        <div className="flex flex-col justify-center items-center">
          <h2 className="text-[17px] font-normal tracking-normal text-black mb-4">
            Order History
          </h2>
          <p className="text-[13.5px] text-neutral-600 leading-relaxed max-w-sm mb-6">
            View and track your recent and past orders here
          </p>

          {orders.length === 0 ? (
            <Link
              href="/collections"
              className="inline-block border border-black bg-transparent px-8 py-2.5 text-[13px] font-normal text-black hover:bg-black hover:text-white transition-colors"
            >
              Shop Now
            </Link>
          ) : (
            <div className="w-full space-y-4">
              <div className="border-t border-b border-black/10 divide-y divide-black/10">
                {orders.slice(0, 3).map((o) => (
                  <Link
                    key={o.id}
                    href={`/orders/${o.id}`}
                    className="flex items-center justify-between py-3 hover:bg-black/5 transition-colors px-1"
                  >
                    <div>
                      <span className="text-[13px] font-mono block text-black">
                        #{o.id.slice(0, 10)}
                      </span>
                      <span className="text-[12px] text-neutral-500">
                        {formatDate(o.date)} · {o.itemCount} item
                        {o.itemCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[13px] font-medium text-black block">
                        {o.total}
                      </span>
                      <span
                        className={`text-[11px] uppercase tracking-wider ${
                          o.paymentStatus === "paid"
                            ? "text-green-700"
                            : "text-amber-700"
                        }`}
                      >
                        {o.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <Link
                  href="/orders"
                  className="inline-block border border-black/30 px-5 py-2 text-[12px] font-normal text-black hover:border-black transition-colors"
                >
                  View All Orders ({orders.length})
                </Link>
                <Link
                  href="/collections"
                  className="inline-block border border-black bg-black text-white px-5 py-2 text-[12px] font-normal hover:bg-neutral-800 transition-colors"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Account Details */}
        <div className="flex flex-col items-start md:border-l md:border-black/15 md:pl-16">
          <h2 className="text-[17px] font-normal tracking-normal text-black mb-4">
            Account Details
          </h2>
          <div className="text-[13.5px] text-black leading-relaxed mb-6">
            <p className="font-normal text-black">{user.name}</p>
            <p className="text-neutral-600 mt-0.5">{addresses[0] || "No address on file"}</p>
          </div>

          <button
            onClick={() => setAddressModalOpen(true)}
            className="border border-black bg-transparent px-6 py-2.5 text-[13px] font-normal text-black hover:bg-black hover:text-white transition-colors"
          >
            View Addresses ({addresses.length})
          </button>
        </div>
      </div>

      {/* Addresses Modal */}
      {addressModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-[#FAF9F6] border border-black/10 p-8 shadow-2xl"
            style={{ backgroundColor: "#FAF9F6" }}
          >
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-black/10">
              <h3 className="text-[17px] font-normal text-black">Your Addresses</h3>
              <button
                onClick={() => {
                  setAddressModalOpen(false);
                  setIsEditing(false);
                }}
                className="p-1 text-black hover:opacity-60 transition-opacity"
                aria-label="Close addresses modal"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m6 6 12 12M18 6 6 18"
                  />
                </svg>
              </button>
            </div>

            {!isEditing ? (
              <div>
                <div className="p-4 bg-white/70 border border-black/10 mb-6">
                  <span className="text-[11px] uppercase tracking-wider text-neutral-500 block mb-1">
                    Default Address
                  </span>
                  <p className="text-[14px] font-medium text-black">{user.name}</p>
                  <p className="text-[13.5px] text-neutral-700 mt-1">{addresses[0]}</p>
                  <p className="text-[13px] text-neutral-500 mt-1">{user.email}</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setEditAddressText(addresses[0]);
                      setIsEditing(true);
                    }}
                    className="flex-1 border border-black py-2.5 text-[13px] font-normal text-black hover:bg-black hover:text-white transition-colors text-center"
                  >
                    Edit Address
                  </button>
                  <button
                    onClick={() => setAddressModalOpen(false)}
                    className="flex-1 bg-black text-white py-2.5 text-[13px] font-normal hover:bg-neutral-800 transition-colors text-center"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveAddress} className="space-y-4">
                <div>
                  <label className="block text-[12px] uppercase tracking-wider text-neutral-600 mb-1">
                    Street Address & City
                  </label>
                  <input
                    type="text"
                    value={editAddressText}
                    onChange={(e) => setEditAddressText(e.target.value)}
                    required
                    className="w-full border border-black/20 bg-white px-3 py-2 text-[13.5px] text-black outline-none focus:border-black"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 border border-black/30 py-2.5 text-[13px] text-black hover:border-black transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-black text-white py-2.5 text-[13px] hover:bg-neutral-800 transition-colors"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
