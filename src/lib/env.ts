function required(key: string): string {
  const v = import.meta.env[key];
  if (!v || typeof v !== "string") throw new Error(`Missing ${key} in environment variables`);
  return v;
}

export const env = {
  apiBaseUrl: required("VITE_API_BASE_URL"),
  wsBaseUrl: required("VITE_WS_BASE_URL"),
};
