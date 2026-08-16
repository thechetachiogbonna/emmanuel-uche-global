import { getAdminCustomers } from "@/lib/admin/queries";
import CustomersTable from "@/components/admin/CustomersTable";

export default async function CustomersPage() {
  const customers = await getAdminCustomers();

  return (
    <div>
      <h1 className="font-display text-2xl md:text-3xl mb-1">Customers</h1>
      <p className="text-[13px] text-ink-soft mb-6">
        {customers.length} customer{customers.length !== 1 ? "s" : ""} total
        — real signups from /signup.
      </p>
      <CustomersTable customers={customers} />
    </div>
  );
}
