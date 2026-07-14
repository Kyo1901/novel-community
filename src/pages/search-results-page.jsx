import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { supabase } from '../lib/supabase';
import PostCard from '../components/ui/post-card';

function withCommentCount(post) {
  return { ...post, comment_count: post.nv_comments?.[0]?.count ?? 0 };
}

/**
 * SearchResultsPage 컴포넌트
 *
 * Props: 없음
 *
 * Example usage:
 * <Route path="/search" element={<SearchResultsPage />} />
 */
function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('q') ?? '';
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setIsLoading(true);
      if (!keyword.trim()) {
        setPosts([]);
        setIsLoading(false);
        return;
      }

      const escaped = keyword.trim().replace(/[%_]/g, '\\$&');
      const { data } = await supabase
        .from('nv_posts')
        .select('*, nv_comments(count)')
        .or(`title.ilike.%${escaped}%,author.ilike.%${escaped}%,publisher.ilike.%${escaped}%`);

      if (!isMounted) return;
      setPosts((data ?? []).map(withCommentCount));
      setIsLoading(false);
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [keyword]);

  return (
    <Box sx={{ width: '100%', flexGrow: 1, bgcolor: 'background.default' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 }, px: { xs: 2, md: 3 } }}>
        <Typography sx={{ fontSize: { xs: '1.1rem', md: '1.3rem' }, fontWeight: 700, mb: 3 }}>
          &lsquo;{keyword}&rsquo; 검색 결과 {posts.length > 0 ? `(${posts.length}건)` : ''}
        </Typography>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : posts.length === 0 ? (
          <Typography sx={{ textAlign: 'center', color: 'text.secondary', py: 6 }}>
            &lsquo;{keyword}&rsquo;에 대한 검색 결과가 없어요. 다른 검색어로 다시 시도해보세요 🔍
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {posts.map((post) => (
              <Grid key={post.post_id} size={{ xs: 6, sm: 4, md: 3 }}>
                <PostCard post={post} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}

export default SearchResultsPage;
