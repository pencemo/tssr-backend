
export function excelSerialToDate(value) {
  const parsed = Number(value);

  if (!isNaN(parsed) && parsed > 59) {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const result = new Date(
      excelEpoch.getTime() + parsed * 24 * 60 * 60 * 1000
    );

    return new Date(
      Date.UTC(
        result.getUTCFullYear(),
        result.getUTCMonth(),
        result.getUTCDate()
      )
    );
  }

  const parsedDate = new Date(value);
  if (isNaN(parsedDate.getTime())) return null;

  return new Date(
    Date.UTC(
      parsedDate.getUTCFullYear(),
      parsedDate.getUTCMonth(),
      parsedDate.getUTCDate()
    )
  );
}
