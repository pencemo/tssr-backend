const parseTime = (timeStr) => {
  const [time, modifier] = timeStr.split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

export const getDurationFromTimeRange = (fromTimeStr, toTimeStr) => {
  try {
    const from = parseTime(fromTimeStr);
    const to = parseTime(toTimeStr);

    if (to.getTime() === from.getTime()) {
      return "0 hour"; // ✅ Same time = 0 hr
    }

    // If 'to' is before 'from', assume next day
    if (to < from) {
      to.setDate(to.getDate() + 1);
    }

    const diffMs = to - from;
    const totalMinutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    const hourStr = hours > 0 ? `${hours} hour${hours > 1 ? "s" : ""}` : "";
    const minuteStr = minutes > 0 ? ` ${minutes} min` : "";

    return `${hourStr}${minuteStr}`.trim();
  } catch (err) {
    return "Error calculating duration";
  }
};
