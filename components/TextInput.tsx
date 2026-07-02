"use client";

interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  maxLength?: number;
  autoUppercase?: boolean;
  type?: "text" | "number";
}

export default function TextInput({
  label,
  value,
  onChange,
  placeholder,
  error,
  maxLength,
  autoUppercase = false,
  type = "text",
}: TextInputProps) {
  return (
    <div className="w-full">
      <label className="mb-1 block text-sm font-bold text-[var(--color-text)]/70">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => {
          const val = autoUppercase ? e.target.value.toUpperCase() : e.target.value;
          onChange(val);
        }}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full rounded-xl border-2 border-[var(--color-primary)]/20 bg-white px-4 py-3 text-base text-[var(--color-text)] placeholder-[var(--color-text)]/30 outline-none transition-colors focus:border-[var(--color-primary)]"
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}