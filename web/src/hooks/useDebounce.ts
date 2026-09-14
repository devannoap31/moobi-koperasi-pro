import { useState, useEffect } from "react";

/**
 * Custom hook untuk men-debounce nilai input (misal: search bar).
 * Menunda update nilai sampai user berhenti mengetik selama durasi `delay` (default: 300ms).
 *
 * @param value Nilai yang ingin di-debounce
 * @param delay Waktu tunda dalam milidetik (default: 300ms)
 * @returns Nilai yang telah di-debounce
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
