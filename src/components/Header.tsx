import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="flex items-center justify-between mb-12">
      <Link href="/" className="flex items-center gap-3">
        <Image
          src="/logo-formio.png"
          alt=""
          width={40}
          height={40}
          className="h-10 w-10 flex-shrink-0 object-contain"
          priority
        />
        <span className="text-xl font-semibold text-white">Formio</span>
      </Link>

      <nav className="flex items-center gap-6">
        <Link
          href="/qui-sommes-nous"
          className="rounded-lg border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:scale-105 hover:border-white/40 hover:bg-white/20 hover:shadow-md hover:shadow-accent/10 active:scale-[0.98]"
        >
          Qui sommes-nous ?
        </Link>
      </nav>
    </header>
  );
}
