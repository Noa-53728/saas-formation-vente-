import Link from "next/link";
import AuthButtons from "./AuthButtons";

export default function Header() {
  return (
    <header className="flex items-center justify-between mb-12">
      <Link href="/" className="flex items-center">
        <img src="/logo-formio.png" alt="Formio" className="h-10 w-auto" />
      </Link>

      <AuthButtons />
    </header>
  );
}
