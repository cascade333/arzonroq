import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/adminAuth";
import AdminNav from "@/components/admin/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const adminId = verifyAdminToken(token);

  if (!adminId) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="relative border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/admin/cars" className="flex-shrink-0 font-bold text-slate-900">
            ENG <span className="text-[#2E8B2E]">ARZON</span>{" "}
            <span className="text-sm font-normal text-slate-400">admin</span>
          </Link>
          <AdminNav />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
