"use client";

import { useState } from "react";
import { useAdminCustomers } from "@/lib/admin/useAdminData";
import { formatDate } from "@/lib/admin/format";

export default function CustomersPage() {
  const { customers } = useAdminCustomers();
  const [query, setQuery] = useState("");

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.email.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <h1 className="font-display text-2xl md:text-3xl mb-1">Customers</h1>
      <p className="text-[13px] text-ink-soft mb-2">
        {customers.length} customer{customers.length !== 1 ? "s" : ""} total
      </p>
      <p className="text-[12px] text-ink-soft mb-6 bg-sand/30 border border-ink/10 px-3 py-2 inline-block">
        Preview data — not connected to real accounts yet.
      </p>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search customers..."
        className="w-full max-w-xs border border-ink/20 px-3 py-2 text-[13px] mb-5 outline-none focus:border-clay transition-colors"
      />

      <div className="border border-ink/10 bg-white overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-ink/10 text-left text-ink-soft">
              <th className="px-4 py-3 font-normal">Customer</th>
              <th className="px-4 py-3 font-normal">Joined</th>
              <th className="px-4 py-3 font-normal">Orders</th>
              <th className="px-4 py-3 font-normal">Total Spent</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b border-ink/5 last:border-0">
                <td className="px-4 py-3">
                  <div>{c.name}</div>
                  <div className="text-[11px] text-ink-soft">{c.email}</div>
                </td>
                <td className="px-4 py-3 text-ink-soft">
                  {formatDate(c.joined)}
                </td>
                <td className="px-4 py-3">{c.orders}</td>
                <td className="px-4 py-3">{c.totalSpent}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-ink-soft">
                  No customers match &ldquo;{query}&rdquo;.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
