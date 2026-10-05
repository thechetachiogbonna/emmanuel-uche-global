import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="auth-page">
      <div className="auth-backdrop" aria-hidden="true">
        <Image
          className="auth-logo"
          src="/images/logo.png"
          alt=""
          width={640}
          height={480}
          priority
        />
      </div>

      <Link href="/" className="auth-home-link">
        <span aria-hidden="true">‹</span>
        Back to Home
      </Link>

      <div className="auth-content">{children}</div>
    </main>
  );
}
