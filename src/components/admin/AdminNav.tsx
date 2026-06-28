"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import LogoutButton from "./LogoutButton";

const LINKS = [
  { href: "/admin/moderation", label: "Проверка заявок" },
  { href: "/admin/cars", label: "Автомобили" },
  { href: "/admin/sellers", label: "Продавцы" },
];

export default function AdminNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden items-center gap-4 text-sm font-medium text-slate-600 sm:flex">
        {LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="hover:text-slate-900">
            {link.label}
          </Link>
        ))}
        <LogoutButton />
      </nav>

      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-slate-200 sm:hidden"
        aria-label="Меню"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-20 border-b border-slate-200 bg-white px-4 py-3 shadow-md sm:hidden">
          <nav className="flex flex-col gap-3 text-sm font-medium text-slate-600">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="hover:text-slate-900"
              >
                {link.label}
              </Link>
            ))}
            <LogoutButton />
          </nav>
        </div>
      )}
    </>
  );
}
