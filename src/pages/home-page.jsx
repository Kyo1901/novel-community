import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';
import { supabase } from '../lib/supabase';
import PostCard from '../components/ui/post-card';

function withCommentCount(post) {
  return { ...post, comment_count: post.nv_comments?.[0]?.count ?? 0 };
}

function PostSection({ title, posts }) {
  if (!posts.length) return null;
  return (
    <Box sx={{ mb: { xs: 4, md: 5 } }}>
      <Typography sx={{ fontSize: { xs: '1.1rem', md: '1.3rem' }, fontWeight: 700, mb: 2 }}>{title}</Typography>
      <Grid container spacing={2}>
        {posts.map((post) => (
          <Grid key={post.post_id} size={{ xs: 6, sm: 4, md: 3 }}>
            <PostCard post={post} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

/**
 * HomePage 컴포넌트
 *
 * Props: 없음
 *
 * Example usage:
 * <Route path="/" element={<HomePage />} />
 */
function HomePage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function load() {
      const [{ data: categoryRows }, { data: postRows }] = await Promise.all([
        supabase.from('nv_categories').select('*'),
        supabase.from('nv_posts').select('*, nv_comments(count)').order('created_at', { ascending: false }),
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

  const latestPosts = useMemo(() => posts.slice(0, 8), [posts]);

  const popularPosts = useMemo(
    () =>
      [...posts]
        .sort((a, b) => b.avg_rating - a.avg_rating || b.comment_count - a.comment_count)
        .slice(0, 8),
    [posts],
  );

  const topGenreSections = useMemo(() => {
    const grouped = new Map();
    posts.forEach((post) => {
      if (post.category_id == null) return;
      if (!grouped.has(post.category_id)) grouped.set(post.category_id, []);
      grouped.get(post.category_id).push(post);
    });

    return [...grouped.entries()]
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 5)
      .map(([categoryId, categoryPosts]) => ({
        category: categories.find((category) => category.category_id === categoryId),
        posts: [...categoryPosts].sort((a, b) => b.avg_rating - a.avg_rating).slice(0, 6),
      }))
      .filter((section) => section.category);
  }, [posts, categories]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (keyword.trim()) {
      navigate(`/search?q=${encodeURIComponent(keyword.trim())}`);
    }
  };

  return (
    <Box sx={{ width: '100%', flexGrow: 1, bgcolor: 'background.default' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 }, px: { xs: 2, md: 3 } }}>
        <Grid container spacing={{ xs: 3, md: 4 }}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Paper sx={{ p: 2 }}>
              <Typography sx={{ fontWeight: 700, mb: 1, fontSize: '1rem' }}>카테고리</Typography>
              <List dense disablePadding>
                {categories.map((category) => (
                  <ListItemButton
                    key={category.category_id}
                    onClick={() => navigate(`/posts?category=${category.category_id}`)}
                    sx={{ borderRadius: 1 }}
                  >
                    <ListItemText
                      primary={category.name}
                      secondary={category.type === 'magazine' ? '잡지' : '소설'}
                    />
                  </ListItemButton>
                ))}
              </List>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 9 }}>
            <Box
              sx={{
                textAlign: 'center',
                py: { xs: 4, md: 6 },
                mb: { xs: 3, md: 4 },
                borderRadius: 3,
                bgcolor: 'primary.light',
              }}
            >
              <Typography sx={{ fontSize: { xs: '1.4rem', md: '2rem' }, fontWeight: 800, color: 'primary.dark', mb: 1 }}>
                함께 읽고, 함께 평가하는 소설·잡지 놀이터
              </Typography>
              <Box
                component="form"
                onSubmit={handleSearchSubmit}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  bgcolor: 'white',
                  borderRadius: 2,
                  px: 1.5,
                  py: 0.5,
                  maxWidth: 420,
                  mx: 'auto',
                }}
              >
                <InputBase
                  placeholder="읽고 싶은 소설, 잡지를 검색해보세요"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  sx={{ flexGrow: 1, fontSize: '0.9rem' }}
                />
                <IconButton type="submit" aria-label="검색">
                  <SearchIcon />
                </IconButton>
              </Box>
            </Box>

            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <PostSection title="🆕 신간 소설 · 잡지" posts={latestPosts} />
                <PostSection title="🔥 인기 소설 · 잡지" posts={popularPosts} />
                {topGenreSections.map((section) => (
                  <PostSection
                    key={section.category.category_id}
                    title={`${section.category.name} 인기 작품`}
                    posts={section.posts}
                  />
                ))}
                {posts.length === 0 && (
                  <Typography sx={{ textAlign: 'center', color: 'text.secondary', py: 4 }}>
                    아직 등록된 게시물이 없습니다. 신청 게시판에서 원하는 소설·잡지를 신청해보세요.
                  </Typography>
                )}
              </>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default HomePage;
