import Link from "next/link";
import AuthButtons from "./AuthButtons";

export default function Header() {
  return (
    <header className="flex items-center justify-between mb-12">
      <Link href="/" className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-lg font-bold text-white">
          F
        </div>
        <span className="text-xl font-semibold text-white">Formio</span>
      </Link>

      <AuthButtons />
    </header>
  );
}
