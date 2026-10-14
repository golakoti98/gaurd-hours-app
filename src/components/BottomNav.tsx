"use client";

import { History, Home, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/history", label: "History", icon: History },
  { href: "/profile", label: "Profile", icon: UserRound },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-200 bg-white/95 backdrop-blur"
      aria-label="Main"
    >
      <div className="mx-auto flex max-w-lg items-center justify-around px-4 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 rounded-lg px-4 py-1 text-xs font-medium ${
                active ? "text-emerald-800" : "text-gray-400"
              }`}
            >
              <Icon className="h-6 w-6" strokeWidth={active ? 2.5 : 2} aria-hidden />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
