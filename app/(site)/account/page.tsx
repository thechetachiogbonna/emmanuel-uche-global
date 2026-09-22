import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getMyOrders } from "@/lib/customer/queries";
import AccountView from "@/components/AccountView";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?redirect=/account");
  }

  const orders = await getMyOrders(user.id);

  return (
    <main className="flex-1 bg-[#FAF9F6] min-h-[70vh] flex flex-col justify-center">
      <AccountView
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
        }}
        orders={orders}
      />
    </main>
  );
}
