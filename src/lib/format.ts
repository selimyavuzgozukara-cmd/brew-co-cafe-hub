export const money = (n: number) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(Number(n) || 0);

export const dateShort = (d: string | Date) =>
  new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });

// Sipariş ve yorum durumları için Türkçe etiketler (DB değerleri İngilizce kalır)
export const orderStatusLabel = (s: string) =>
  ({ Pending: "Beklemede", Preparing: "Hazırlanıyor", Delivered: "Teslim Edildi", Cancelled: "İptal Edildi" } as Record<string, string>)[s] ?? s;

export const reviewStatusLabel = (s: string) =>
  ({ pending: "Beklemede", approved: "Onaylandı", rejected: "Reddedildi" } as Record<string, string>)[s] ?? s;
