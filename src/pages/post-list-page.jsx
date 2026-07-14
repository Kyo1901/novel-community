import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Pagination from '@mui/material/Pagination';
import CircularProgress from '@mui/material/CircularProgress';
import { supabase } from '../lib/supabase';
import PostCard from '../components/ui/post-card';

const PAGE_SIZE = 12;

const SORT_OPTIONS = [
  { value: 'popular', label: '인기순' },
  { value: 'newest', label: '신간순' },
  { value: 'rating', label: '평점순' },
  { value: 'comments', label: '댓글많은순' },
];

function withCommentCount(post) {
  return { ...post, comment_count: post.nv_comments?.[0]?.count ?? 0 };
}

function sortPosts(posts, sortKey) {
  const sorted = [...posts];
  switch (sortKey) {
    case 'newest':
      return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    case 'rating':
      return sorted.sort((a, b) => b.avg_rating - a.avg_rating);
    case 'comments':
      return sorted.sort((a, b) => b.comment_count - a.comment_count);
    case 'popular':
    default:
      return sorted.sort((a, b) => b.avg_rating - a.avg_rating || b.comment_count - a.comment_count);
  }
}

/**
 * PostListPage 컴포넌트
 *
 * Props: 없음
 *
 * Example usage:
 * <Route path="/posts" element={<PostListPage />} />
 */
function PostListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryId = searchParams.get('category');
  const sortKey = searchParams.get('sort') ?? 'popular';
  const page = Number(searchParams.get('page') ?? '1');

  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setIsLoading(true);
      const [{ data: categoryRows }, { data: postRows }] = await Promise.all([
        supabase.from('nv_categories').select('*'),
        supabase.from('nv_posts').select('*, nv_comments(count)'),
      ]);

      if (!isMounted) return;
      setCategories(categoryRows ?? []);
      setPosts((postRows ?? []).map(withCommentCount));
      setIsLoading(false);
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredPosts = useMemo(() => {
    const base = categoryId ? posts.filter((post) => String(post.category_id) === categoryId) : posts;
    return sortPosts(base, sortKey);
  }, [posts, categoryId, sortKey]);

  const pageCount = Math.max(1, Math.ceil(filteredPosts.length / PAGE_SIZE));
  const pagedPosts = filteredPosts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const activeCategory = categories.find((category) => String(category.category_id) === categoryId);

  const updateParams = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });
    setSearchParams(next);
  };

  return (
    <Box sx={{ width: '100%', flexGrow: 1, bgcolor: 'background.default' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 }, px: { xs: 2, md: 3 } }}>
        <Grid container spacing={{ xs: 3, md: 4 }}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Paper sx={{ p: 2 }}>
              <Typography sx={{ fontWeight: 700, mb: 1, fontSize: '1rem' }}>카테고리</Typography>
              <List dense disablePadding>
                <ListItemButton selected={!categoryId} onClick={() => updateParams({ category: null, page: null })}>
                  <ListItemText primary="전체" />
                </ListItemButton>
                {categories.map((category) => (
                  <ListItemButton
                    key={category.category_id}
                    selected={String(category.category_id) === categoryId}
                    onClick={() => updateParams({ category: category.category_id, page: null })}
                  >
                    <ListItemText primary={category.name} secondary={category.type === 'magazine' ? '잡지' : '소설'} />
                  </ListItemButton>
                ))}
              </List>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 9 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Typography sx={{ fontSize: { xs: '1.1rem', md: '1.3rem' }, fontWeight: 700 }}>
                {activeCategory ? activeCategory.name : '전체 게시물'}
                <Typography component="span" sx={{ fontSize: '0.85rem', color: 'text.secondary', ml: 1 }}>
                  {filteredPosts.length}건
                </Typography>
              </Typography>
              <Select
                size="small"
                value={sortKey}
                onChange={(event) => updateParams({ sort: event.target.value, page: null })}
              >
                {SORT_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </Box>

            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress />
              </Box>
            ) : pagedPosts.length === 0 ? (
              <Typography sx={{ textAlign: 'center', color: 'text.secondary', py: 6 }}>
                등록된 게시물이 없습니다.
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {pagedPosts.map((post) => (
                  <Grid key={post.post_id} size={{ xs: 6, sm: 4, md: 3 }}>
                    <PostCard post={post} />
                  </Grid>
                ))}
              </Grid>
            )}

            {pageCount > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={pageCount}
                  page={page}
                  onChange={(_event, value) => updateParams({ page: value === 1 ? null : value })}
                />
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default PostListPage;
