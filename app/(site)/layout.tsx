import IntroLoader from "@/components/IntroLoader";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import SignupPrompt from "@/components/SignupPrompt";
import CartDrawer from "@/components/CartDrawer";
import { getCurrentUser } from "@/lib/auth";
import { getCollectionLinks } from "@/lib/data";
import { CartProvider } from "@/lib/cart/CartContext";
import { CartDrawerProvider } from "@/lib/cart/CartDrawerContext";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, collections] = await Promise.all([
    getCurrentUser(),
    getCollectionLinks(),
  ]);
  const session = user ? { name: user.name, email: user.email } : null;

  return (
    <CartProvider>
      <CartDrawerProvider>
        <Nav session={session} collections={collections} />
        <IntroLoader>{children}</IntroLoader>
        <Footer />
        <SignupPrompt session={session} />
        <CartDrawer />
      </CartDrawerProvider>
    </CartProvider>
  );
}
