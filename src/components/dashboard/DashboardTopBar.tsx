import Link from "next/link";

export default function DashboardTopBar({
  userName,
  userAvatarUrl,
  notificationCount = 0,
}: {
  userName: string;
  userAvatarUrl?: string | null;
  notificationCount?: number;
}) {
  const initial = (userName.charAt(0) ?? "?").toUpperCase();
  return (
    <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div />
      <div className="flex items-center gap-3">
        <form action="/search" method="GET" className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40">Q</span>
          <input
            type="search"
            name="q"
            placeholder="Search..."
            className="w-44 rounded-lg border border-white/10 bg-white/5 py-2 pl-8 pr-3 text-sm text-white placeholder:text-white/40 focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/50 sm:w-52"
          />
        </form>
        <Link
          href="/dashboard/messages"
          className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10 hover:text-white"
          aria-label="Messages"
        >
          <span className="text-lg">🔔</span>
          {notificationCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {notificationCount > 99 ? "99+" : notificationCount}
            </span>
          )}
        </Link>
        <Link
          href="/dashboard/settings"
          className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-white/20 bg-accent/80 text-lg font-semibold text-white"
        >
          {userAvatarUrl ? (
            <img src={userAvatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            initial
          )}
        </Link>
      </div>
    </div>
  );
}
