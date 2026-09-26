import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeWhatsAppNumber(rawInput: string): string {
  let digits = (rawInput || "").replace(/\D/g, ""); // Sadece rakamları ayıkla
  if (digits.startsWith("0090")) {
    digits = digits.substring(4);
  } else if (digits.startsWith("90")) {
    digits = digits.substring(2);
  } else if (digits.startsWith("0")) {
    digits = digits.substring(1);
  }
  // Kalan 10 haneli saf cep numarası (5XXXXXXXXX veya 4XXXXXXXXX)
  return digits ? "90" + digits : "";
}

