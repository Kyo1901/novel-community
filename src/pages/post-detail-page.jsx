import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import RatingStars from '../components/ui/rating-stars';
import CommentForm from '../components/comment/comment-form';
import CommentItem from '../components/comment/comment-item';

function buildCommentTree(rows) {
  const byId = new Map(rows.map((row) => [row.comment_id, { ...row, children: [] }]));
  const roots = [];

  byId.forEach((comment) => {
    if (comment.parent_comment_id && byId.has(comment.parent_comment_id)) {
      byId.get(comment.parent_comment_id).children.push(comment);
    } else if (!comment.parent_comment_id) {
      roots.push(comment);
    }
  });

  const sortByDateAsc = (a, b) => new Date(a.created_at) - new Date(b.created_at);
  byId.forEach((comment) => comment.children.sort(sortByDateAsc));
  roots.sort((a, b) => Number(b.is_best) - Number(a.is_best) || new Date(b.created_at) - new Date(a.created_at));

  return roots;
}

/**
 * PostDetailPage 컴포넌트
 *
 * Props: 없음
 *
 * Example usage:
 * <Route path="/posts/:postId" element={<PostDetailPage />} />
 */
function PostDetailPage() {
  const { postId } = useParams();
  const { user, profile } = useAuth();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [likedCommentIds, setLikedCommentIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const load = useCallback(async () => {
    const [{ data: postRow }, { data: commentRows }] = await Promise.all([
      supabase.from('nv_posts').select('*, nv_categories(name)').eq('post_id', postId).maybeSingle(),
      supabase
        .from('nv_comments')
        .select('*, nv_users(nickname), nv_comment_likes(count)')
        .eq('post_id', postId),
    ]);

    setPost(postRow ?? null);
    const normalized = (commentRows ?? []).map((row) => ({
      ...row,
      like_count: row.nv_comment_likes?.[0]?.count ?? 0,
    }));
    setComments(normalized);

    if (user) {
      const commentIds = normalized.map((row) => row.comment_id);
      if (commentIds.length > 0) {
        const { data: likeRows } = await supabase
          .from('nv_comment_likes')
          .select('comment_id')
          .eq('user_id', user.id)
          .in('comment_id', commentIds);
        setLikedCommentIds(new Set((likeRows ?? []).map((row) => row.comment_id)));
      } else {
        setLikedCommentIds(new Set());
      }
    }

    setIsLoading(false);
  }, [postId, user]);

  useEffect(() => {
    setIsLoading(true);
    load();
  }, [load]);

  const commentTree = useMemo(() => buildCommentTree(comments), [comments]);
  const myTopLevelComment = useMemo(
    () => comments.find((comment) => comment.user_id === user?.id && !comment.parent_comment_id),
    [comments, user],
  );

  const handleMainSubmit = async ({ content, rating }) => {
    setErrorMessage('');
    if (!user) return;

    const payload = myTopLevelComment
      ? supabase
          .from('nv_comments')
          .update({ content, rating, updated_at: new Date().toISOString() })
          .eq('comment_id', myTopLevelComment.comment_id)
      : supabase.from('nv_comments').insert({ post_id: Number(postId), user_id: user.id, content, rating });

    const { error } = await payload;
    if (error) {
      setErrorMessage('댓글/평점 등록에 실패했습니다.');
      return;
    }
    await load();
  };

  const handleReply = async (parentCommentId, content) => {
    const { error } = await supabase
      .from('nv_comments')
      .insert({ post_id: Number(postId), user_id: user.id, parent_comment_id: parentCommentId, content });
    if (error) {
      setErrorMessage('답글 등록에 실패했습니다.');
      return;
    }
    await load();
  };

  const handleEdit = async (commentId, content) => {
    const { error } = await supabase
      .from('nv_comments')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('comment_id', commentId);
    if (error) {
      setErrorMessage('댓글 수정에 실패했습니다.');
      return;
    }
    await load();
  };

  const handleDelete = async (commentId) => {
    const { error } = await supabase.from('nv_comments').delete().eq('comment_id', commentId);
    if (error) {
      setErrorMessage('댓글 삭제에 실패했습니다.');
      return;
    }
    await load();
  };

  const handleLikeToggle = async (comment) => {
    if (!user) return;
    if (likedCommentIds.has(comment.comment_id)) {
      await supabase.from('nv_comment_likes').delete().eq('comment_id', comment.comment_id).eq('user_id', user.id);
    } else {
      await supabase.from('nv_comment_likes').insert({ comment_id: comment.comment_id, user_id: user.id });
    }
    await load();
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!post) {
    return (
      <Container maxWidth="sm" sx={{ py: 6, textAlign: 'center' }}>
        <Typography>게시물을 찾을 수 없습니다.</Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ width: '100%', flexGrow: 1, bgcolor: 'background.default' }}>
      <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 }, px: { xs: 2, md: 3 } }}>
        <Paper sx={{ p: { xs: 2, md: 3 }, mb: { xs: 3, md: 4 } }}>
          <Grid container spacing={{ xs: 2, md: 3 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box
                component="img"
                src={post.cover_image || 'https://placehold.co/300x400?text=No+Image'}
                alt={post.title}
                sx={{ width: '100%', borderRadius: 2, objectFit: 'cover' }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 8 }}>
              {post.nv_categories?.name && <Chip label={post.nv_categories.name} size="small" sx={{ mb: 1 }} />}
              <Typography sx={{ fontSize: { xs: '1.3rem', md: '1.6rem' }, fontWeight: 800, mb: 1 }}>
                {post.title}
              </Typography>
              <Typography sx={{ fontSize: '0.9rem', color: 'text.secondary', mb: 1 }}>
                {[post.author, post.publisher].filter(Boolean).join(' · ') || '정보 없음'}
              </Typography>
              <RatingStars value={post.avg_rating} />
              <Typography sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, fontWeight: 700, color: 'primary.dark', my: 1.5 }}>
                {post.price != null ? `${Number(post.price).toLocaleString()}원` : '가격 정보 없음'}
              </Typography>
              {post.summary && (
                <Typography sx={{ fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{post.summary}</Typography>
              )}
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: { xs: 2, md: 3 } }}>
          <Typography sx={{ fontSize: { xs: '1.05rem', md: '1.2rem' }, fontWeight: 700, mb: 2 }}>
            댓글 {comments.filter((comment) => !comment.parent_comment_id).length}
          </Typography>

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage('')}>
              {errorMessage}
            </Alert>
          )}

          {user ? (
            <Box sx={{ mb: 3 }}>
              <CommentForm
                hasRating
                initialContent={myTopLevelComment?.content ?? ''}
                initialRating={myTopLevelComment?.rating ?? 0}
                submitLabel={myTopLevelComment ? '평점/댓글 수정' : '댓글 등록'}
                placeholder={`${profile?.nickname ?? '회원'}님, 평점과 함께 댓글을 남겨주세요.`}
                onSubmit={handleMainSubmit}
              />
            </Box>
          ) : (
            <Alert severity="info" sx={{ mb: 3 }}>
              <Link component={RouterLink} to="/login">
                로그인
              </Link>{' '}
              후 댓글과 평점을 남길 수 있습니다.
            </Alert>
          )}

          <Divider sx={{ mb: 1 }} />

          {commentTree.length === 0 ? (
            <Typography sx={{ textAlign: 'center', color: 'text.secondary', py: 4 }}>
              아직 댓글이 없습니다. 첫 댓글을 남겨보세요!
            </Typography>
          ) : (
            commentTree.map((comment) => (
              <CommentItem
                key={comment.comment_id}
                comment={comment}
                currentUserId={user?.id}
                likedCommentIds={likedCommentIds}
                onReply={handleReply}
                onLikeToggle={handleLikeToggle}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isLoggedIn={Boolean(user)}
              />
            ))
          )}
        </Paper>
      </Container>
    </Box>
  );
}

export default PostDetailPage;
