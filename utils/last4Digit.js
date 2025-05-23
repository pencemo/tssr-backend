export const getLast4Digits = (value) => {
  if (value === undefined || value === null) return null;

  const str = typeof value === "string" ? value : value.toString();
  const parts = str.split("/");
  const lastPart = parts[parts.length - 1];

  if (!lastPart) return null;

  return lastPart.slice(-4).padStart(4, "0");
};
