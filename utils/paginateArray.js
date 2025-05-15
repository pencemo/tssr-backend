// utils/paginateArray.js
export function paginateArray(array, page = 1, limit = 10) {
  const start = (page - 1) * limit;
  const end = page * limit;
  return array.slice(start, end);
}
