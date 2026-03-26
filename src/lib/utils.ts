export const getDynamicImage = (id: string, title: string) => {
  const keywords = encodeURIComponent(title.split(" ").slice(0, 3).join(","));

  const lockId = id.charCodeAt(0) + id.charCodeAt(1) + id.charCodeAt(2);
  return `https://loremflickr.com/800/800/${keywords}?lock=${lockId}`;
};
