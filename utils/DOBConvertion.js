export const normalizeDobToUTC = (inputDate) => {
  const selectedDate = new Date(inputDate);

  const dob = new Date(
    Date.UTC(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate()
    )
  );

  return dob;
};
