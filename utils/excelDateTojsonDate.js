export function excelSerialToDate(serial) {
  if (typeof serial !== "number") return null;

  const excelEpoch = new Date(Date.UTC(1899, 11, 30)); // Excel starts on Dec 30, 1899
  const date = new Date(excelEpoch.getTime() + serial * 24 * 60 * 60 * 1000);

  return date;
}
