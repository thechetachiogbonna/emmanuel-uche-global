import IntroLoader from "@/components/IntroLoader";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import SignupPrompt from "@/components/SignupPrompt";
import { getCurrentUser } from "@/lib/auth";
import { CartProvider } from "@/lib/cart/CartContext";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const session = user ? { name: user.name, email: user.email } : null;

  return (
    <CartProvider>
      <Nav session={session} />
      <IntroLoader>{children}</IntroLoader>
      <Footer />
      <SignupPrompt session={session} />
    </CartProvider>
  );
}
