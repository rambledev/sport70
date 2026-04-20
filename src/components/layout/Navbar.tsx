"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Trophy, Calendar, Tv, Vote, PartyPopper, Map,
  Image, Award, Bell, Shield, LogOut, Menu, X, Headset
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "หน้าหลัก", icon: Trophy },
  { href: "/tournament", label: "การแข่งขัน", icon: Trophy },
  { href: "/live", label: "ถ่ายทอดสด", icon: Tv },
  { href: "/vote", label: "โหวต", icon: Vote },
  { href: "/event", label: "กิจกรรม", icon: PartyPopper },
  { href: "/map", label: "แผนที่", icon: Map },
  { href: "/gallery", label: "แกลเลอรี", icon: Image },
  { href: "/certificate", label: "เกียรติบัตร", icon: Award },
  { href: "/support", label: "ติดต่อ", icon: Headset },
];

interface NavbarProps {
  user: { name: string; email: string; role: string } | null;
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            <span className="font-bold text-gray-900 text-lg hidden sm:block">RMU Sports</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <item.icon size={15} />
                {item.label}
              </Link>
            ))}
            {user?.role === "ADMIN" && (
              <Link
                href="/admin"
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === "/admin"
                    ? "bg-red-50 text-red-700"
                    : "text-red-600 hover:bg-red-50"
                )}
              >
                <Shield size={15} />
                Admin
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <>
                <Link href="/notifications" className="relative p-2 text-gray-500 hover:text-gray-700">
                  <Bell size={18} />
                </Link>
                <div className="hidden sm:flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Logout"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </>
            )}
            <button
              className="lg:hidden p-2 text-gray-500"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium",
                  pathname === item.href
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            ))}
            {user?.role === "ADMIN" && (
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <Shield size={16} />
                Admin
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 w-full hover:bg-gray-50"
            >
              <LogOut size={16} />
              ออกจากระบบ
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
