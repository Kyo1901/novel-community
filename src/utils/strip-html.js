/**
 * 네이버 검색 API 응답에 포함된 HTML 태그(<b> 등)와 엔티티를 제거한다.
 * @param {string} value - 원본 문자열 [Required]
 * @returns {string} 태그가 제거된 문자열
 */
export function stripHtml(value) {
  if (!value) return '';
  return value
    .replace(/<\/?b>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}
