import IntroLoader from "@/components/IntroLoader";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import SignupPrompt from "@/components/SignupPrompt";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav />
      <IntroLoader>{children}</IntroLoader>
      <Footer />
      <SignupPrompt />
    </>
  );
}
