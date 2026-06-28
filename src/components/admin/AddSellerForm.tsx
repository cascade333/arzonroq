"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AddSellerForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [telegramId, setTelegramId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/admin/sellers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, telegramId: telegramId || undefined }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Не удалось добавить продавца");
      return;
    }

    setName("");
    setPhone("");
    setTelegramId("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="text-sm text-slate-600">Имя</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#2E8B2E]"
        />
      </div>
      <div>
        <label className="text-sm text-slate-600">Телефон</label>
        <input
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+998 90 123 45 67"
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#2E8B2E]"
        />
      </div>
      <div>
        <label className="text-sm text-slate-600">Telegram ID (необязательно)</label>
        <input
          value={telegramId}
          onChange={(e) => setTelegramId(e.target.value)}
          placeholder="123456789"
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#2E8B2E]"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-[#2E8B2E] py-2 text-sm font-medium text-white hover:bg-[#267326] disabled:opacity-60"
      >
        {loading ? "Добавляем..." : "Добавить продавца"}
      </button>
    </form>
  );
}
