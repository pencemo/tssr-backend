// export function excelSerialToDate(value) {
//   const parsed = Number(value);

//   if (!isNaN(parsed) && parsed > 59) {
//     const excelEpoch = new Date(Date.UTC(1899, 11, 30));
//     return new Date(excelEpoch.getTime() + parsed * 24 * 60 * 60 * 1000);
//   }

//   const parsedDate = new Date(value);
//   return isNaN(parsedDate.getTime()) ? null : parsedDate;
// }


export function excelSerialToDate(value) {
  const parsed = Number(value);

  if (!isNaN(parsed) && parsed > 59) {
    // Excel wrongly treats 1900 as a leap year, so we offset by 1 day
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const result = new Date(
      excelEpoch.getTime() + parsed * 24 * 60 * 60 * 1000
    );

    // Ensure time is set to 00:00:00 UTC
    return new Date(
      Date.UTC(
        result.getUTCFullYear(),
        result.getUTCMonth(),
        result.getUTCDate()
      )
    );
  }

  // Handle ISO strings or other formats
  const parsedDate = new Date(value);
  if (isNaN(parsedDate.getTime())) return null;

  // Normalize time to midnight UTC
  return new Date(
    Date.UTC(
      parsedDate.getUTCFullYear(),
      parsedDate.getUTCMonth(),
      parsedDate.getUTCDate()
    )
  );
}
