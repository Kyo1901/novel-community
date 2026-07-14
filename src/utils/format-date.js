/**
 * ISO 날짜 문자열을 'YYYY.MM.DD' 형식으로 변환한다.
 * @param {string} isoString - ISO 8601 날짜 문자열 [Required]
 * @returns {string} 'YYYY.MM.DD' 형식 문자열
 */
export function formatDate(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}
