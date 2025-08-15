export function excelSerialToDate(value) {
  
  const toUTCStringWithOffset = (year, month, day) => {
    const date = new Date(Date.UTC(year, month, day));
    // Convert to desired format: YYYY-MM-DDT00:00:00.000+00:00
    return date.toISOString()
  };

  const parsed = Number(value);

  // ✅ Handle Excel serial numbers
  if (!isNaN(parsed) && parsed > 59) {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30)); // Dec 30, 1899
    const result = new Date(excelEpoch.getTime() + parsed * 86400000);
    return toUTCStringWithOffset(
      result.getUTCFullYear(),
      result.getUTCMonth(),
      result.getUTCDate()
    );
  }

  // ✅ Handle string inputs manually to avoid timezone shift
  if (typeof value === "string") {
    const parts = value.includes("-") ? value.split("-") : value.split("/");
    let year, month, day;

    if (parts[0].length === 4) {
      // YYYY-MM-DD
      [year, month, day] = parts.map(Number);
    } else {
      // MM-DD-YYYY
      [month, day, year] = parts.map(Number);
    }

    return toUTCStringWithOffset(year, month - 1, day);
  }

  // ✅ Handle Date objects
  if (value instanceof Date && !isNaN(value)) {
    return toUTCStringWithOffset(
      value.getUTCFullYear(),
      value.getUTCMonth(),
      value.getUTCDate()
    );
  }

  // ❌ Invalid date
  return null;
}
