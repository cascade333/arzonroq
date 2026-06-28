"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteCarButton({ carId }: { carId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  // Архивация вместо удаления: фото и техпаспорт удаляются с диска,
  // но текстовая карточка (марка/модель/год/цена) остаётся для SEO.
  async function handleArchive() {
    setLoading(true);
    const res = await fetch(`/api/admin/cars/${carId}/archive`, { method: "POST" });
    setLoading(false);
    if (res.ok) {
      router.refresh();
    } else {
      alert("Не удалось архивировать автомобиль");
    }
  }

  if (confirming) {
    return (
      <span className="flex items-center gap-2">
        <button
          onClick={handleArchive}
          disabled={loading}
          className="text-red-600 hover:underline"
        >
          {loading ? "Архивируем..." : "Точно в архив?"}
        </button>
        <button onClick={() => setConfirming(false)} className="text-slate-400 hover:underline">
          Отмена
        </button>
      </span>
    );
  }

  return (
    <button onClick={() => setConfirming(true)} className="text-red-500 hover:text-red-700">
      В архив
    </button>
  );
}
