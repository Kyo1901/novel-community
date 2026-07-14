import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

/**
 * Supabase Edge Function을 통해 네이버 책 검색 API를 호출한다.
 * @param {string} query - 검색할 도서명 [Required]
 * @returns {Promise<Array>} 검색된 도서 목록 (items)
 */
export async function searchNaverBooks(query) {
  const { data, error } = await supabase.functions.invoke(
    `naver-book-search?query=${encodeURIComponent(query)}`,
    { method: 'GET' },
  );

  if (error) {
    throw error;
  }
  return data.items ?? [];
}
