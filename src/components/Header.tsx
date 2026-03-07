import Link from "next/link";
import Image from "next/image";
import AuthButtons from "./AuthButtons";

export default function Header() {
  return (
    <header className="flex items-center justify-between mb-12">
      <Link href="/" className="flex items-center gap-3">
        <Image
          src="/logo-formio.png"
          alt="Formio"
          width={120}
          height={40}
          className="h-10 w-auto object-contain"
          priority
        />
      </Link>

      <nav className="flex items-center gap-6">
        <Link
          href="/qui-sommes-nous"
          className="text-sm font-medium text-white/80 transition hover:text-white"
        >
          Qui sommes-nous
        </Link>
        <AuthButtons />
      </nav>
    </header>
  );
}
