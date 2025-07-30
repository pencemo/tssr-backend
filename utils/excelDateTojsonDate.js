export function excelSerialToDate(value) {
  const parsed = Number(value);

  if (!isNaN(parsed) && parsed > 59) {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    return new Date(excelEpoch.getTime() + parsed * 24 * 60 * 60 * 1000);
  }

  const parsedDate = new Date(value);
  return isNaN(parsedDate.getTime()) ? null : parsedDate;
}
