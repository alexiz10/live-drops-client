export const getDynamicImage = (id: string, title: string) => {
  const keywords = encodeURIComponent(title.split(" ").slice(0, 3).join(","));

  const lockId = id.charCodeAt(0) + id.charCodeAt(1) + id.charCodeAt(2);
  return `https://loremflickr.com/800/800/${keywords}?lock=${lockId}`;
};

export const formatTime = (seconds: number | null): string => {
  if (seconds === null) return "--:--";
  if (seconds <= 0) return "00:00";

  const y = Math.floor(seconds / 31_536_000);
  const mo = Math.floor((seconds % 31_536_000) / 2_592_000);
  const w = Math.floor((seconds % 2_592_000) / 604_800);
  const d = Math.floor((seconds % 604_800) / 86_400);
  const h = Math.floor((seconds % 86_400) / 3_600);
  const m = Math.floor((seconds % 3_600) / 60);
  const s = Math.floor(seconds % 60);

  const parts = [];
  if (y > 0) parts.push(`${y}y`);
  if (mo > 0) parts.push(`${mo}mo`);
  if (w > 0) parts.push(`${w}w`);
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);

  const mStr = m.toString().padStart(2, "0");
  const sStr = s.toString().padStart(2, "0");

  if (parts.length > 0) {
    return `${parts.join(" ")} ${mStr}m ${sStr}s`;
  }

  return `${mStr}:${sStr}`;
};

export const getQuickBidIncrements = (basePrice: number, hasBids: boolean): number[] => {
  if (!hasBids) {
    // No bids yet, start from 0 increment
    if (basePrice < 100) return [0, 1, 2];
    if (basePrice < 1000) return [0, 10, 20];
    if (basePrice < 10000) return [0, 100, 200];
    return [0, 1000, 2000];
  }

  // There are bids, use standard increments
  if (basePrice < 100) return [1, 2, 3];
  if (basePrice < 1000) return [10, 20, 30];
  if (basePrice < 10000) return [100, 200, 300];
  return [1000, 2000, 3000];
};
