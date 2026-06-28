"use client";

/**
 * Поле ввода телефона с фиксированным префиксом +998 и маской для
 * узбекского номера: XX XXX XX XX (9 цифр после кода страны).
 * Значение наружу всегда уходит в формате "+998XXXXXXXXX" (без пробелов).
 */
export default function PhoneInput({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  // Извлекаем только цифры после +998 из текущего значения для отображения.
  const digitsOnly = value.replace(/^\+?998/, "").replace(/\D/g, "").slice(0, 9);

  function formatForDisplay(digits: string): string {
    const parts = [
      digits.slice(0, 2),
      digits.slice(2, 5),
      digits.slice(5, 7),
      digits.slice(7, 9),
    ].filter(Boolean);
    return parts.join(" ");
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 9);
    onChange(`+998${digits}`);
  }

  return (
    <div className={`flex items-center rounded-lg border border-slate-200 ${className ?? ""}`}>
      <span className="flex-shrink-0 border-r border-slate-200 px-3 py-2 text-slate-500">
        +998
      </span>
      <input
        type="tel"
        inputMode="numeric"
        required
        value={formatForDisplay(digitsOnly)}
        onChange={handleChange}
        placeholder="90 123 45 67"
        className="w-full bg-transparent px-3 py-2 outline-none"
      />
    </div>
  );
}
