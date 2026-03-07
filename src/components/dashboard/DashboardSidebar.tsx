"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/dashboard", label: "Tableau de bord", icon: "📊" },
  { href: "/dashboard/courses", label: "Mes formations", icon: "📚" },
  { href: "/dashboard/sales", label: "Ventes", icon: "💰" },
  { href: "/dashboard/messages", label: "Messages", icon: "✉️", badge: true },
  { href: "/dashboard/billing", label: "Facturation", icon: "📄" },
  { href: "/dashboard/settings", label: "Paramètres", icon: "⚙️" },
  { href: "/dashboard/support", label: "Support", icon: "❓" },
];

export default function DashboardSidebar({
  unreadCount = 0,
}: {
  unreadCount?: number;
}) {
  const pathname = usePathname();

  return (
    <aside className="flex w-full flex-col md:w-64 md:flex-shrink-0">
      <div className="sticky top-6 flex flex-col gap-6 rounded-2xl border border-white/10 bg-primary p-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo-formio.svg"
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 flex-shrink-0 object-contain"
          />
          <span className="text-xl font-semibold text-white">Formio</span>
        </Link>

        <nav className="flex flex-col gap-1">
          {nav.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const showBadge = item.badge && unreadCount > 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-accent text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="text-lg opacity-90">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {showBadge && (
                  <span className="min-w-[1.25rem] rounded-full bg-red-500 px-1.5 py-0.5 text-center text-xs font-semibold text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
