import IntroLoader from "@/components/IntroLoader";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import SignupPrompt from "@/components/SignupPrompt";
import CartDrawer from "@/components/CartDrawer";
import { getCurrentUser } from "@/lib/auth";
import { getCartRecommendations, getCollectionLinks } from "@/lib/data";
import { CartProvider } from "@/lib/cart/CartContext";
import { CartDrawerProvider } from "@/lib/cart/CartDrawerContext";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, collections, recommendations] = await Promise.all([
    getCurrentUser(),
    getCollectionLinks(),
    getCartRecommendations(),
  ]);
  const session = user ? { name: user.name, email: user.email } : null;

  return (
    <CartProvider>
      <CartDrawerProvider>
        <Nav session={session} collections={collections} />
        <IntroLoader>{children}</IntroLoader>
        <Footer />
        <SignupPrompt session={session} />
        <CartDrawer recommendations={recommendations} />
      </CartDrawerProvider>
    </CartProvider>
  );
}
