import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import RatingStars from './rating-stars';

/**
 * PostCard 컴포넌트
 *
 * Props:
 * @param {object} post - 게시물 데이터 [Required]
 *
 * Example usage:
 * <PostCard post={post} />
 */
function PostCard({ post }) {
  const navigate = useNavigate();

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea
        onClick={() => navigate(`/posts/${post.post_id}`)}
        sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
      >
        <CardMedia
          component="img"
          image={post.cover_image || 'https://placehold.co/300x400?text=No+Image'}
          alt={post.title}
          sx={{ height: { xs: 180, md: 220 }, objectFit: 'cover' }}
        />
        <CardContent sx={{ flexGrow: 1, width: '100%' }}>
          <Typography
            sx={{
              fontSize: { xs: '0.95rem', md: '1.05rem' },
              fontWeight: 700,
              mb: 0.5,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {post.title}
          </Typography>
          <Typography sx={{ fontSize: { xs: '0.8rem', md: '0.85rem' }, color: 'text.secondary', mb: 1 }}>
            {[post.author, post.publisher].filter(Boolean).join(' · ') || '정보 없음'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <RatingStars value={post.avg_rating} size="small" />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
              <ChatBubbleOutlineIcon sx={{ fontSize: '1rem' }} />
              <Typography sx={{ fontSize: '0.8rem' }}>{post.comment_count ?? 0}</Typography>
            </Box>
          </Box>
          <Typography sx={{ fontSize: { xs: '0.85rem', md: '0.9rem' }, fontWeight: 700, mt: 1, color: 'primary.dark' }}>
            {post.price != null ? `${Number(post.price).toLocaleString()}원` : '가격 정보 없음'}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default PostCard;
