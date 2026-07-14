import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import StarIcon from '@mui/icons-material/Star';
import { formatDate } from '../../utils/format-date';
import CommentForm from './comment-form';

/**
 * CommentItem 컴포넌트
 *
 * Props:
 * @param {object} comment - 댓글 데이터 (children 배열 포함) [Required]
 * @param {string} currentUserId - 현재 로그인한 사용자 id [Optional]
 * @param {Set} likedCommentIds - 현재 사용자가 좋아요 누른 댓글 id 집합 [Required]
 * @param {function} onReply - 대댓글 작성 함수, (parentId, content) => Promise [Required]
 * @param {function} onLikeToggle - 좋아요 토글 함수, (comment) => Promise [Required]
 * @param {function} onEdit - 댓글 수정 함수, (commentId, content) => Promise [Required]
 * @param {function} onDelete - 댓글 삭제 함수, (commentId) => Promise [Required]
 * @param {boolean} isLoggedIn - 로그인 여부 [Required]
 *
 * Example usage:
 * <CommentItem comment={comment} currentUserId={userId} likedCommentIds={likedSet} ... />
 */
function CommentItem({
  comment,
  currentUserId,
  likedCommentIds,
  onReply,
  onLikeToggle,
  onEdit,
  onDelete,
  isLoggedIn,
}) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const isOwner = currentUserId && comment.user_id === currentUserId;
  const isLiked = likedCommentIds.has(comment.comment_id);

  return (
    <Box sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
        {comment.is_best && <Chip label="베스트" size="small" color="secondary" />}
        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
          {comment.nv_users?.nickname ?? '알 수 없음'}
        </Typography>
        {comment.rating != null && (
          <Stack direction="row" alignItems="center" spacing={0.25}>
            <StarIcon sx={{ fontSize: '1rem', color: '#F7B267' }} />
            <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{comment.rating}</Typography>
          </Stack>
        )}
        <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
          {formatDate(comment.created_at)}
        </Typography>
      </Stack>

      {isEditing ? (
        <CommentForm
          initialContent={comment.content}
          submitLabel="수정 완료"
          onCancel={() => setIsEditing(false)}
          onSubmit={async ({ content }) => {
            await onEdit(comment.comment_id, content);
            setIsEditing(false);
          }}
        />
      ) : (
        <Typography sx={{ fontSize: '0.9rem', whiteSpace: 'pre-wrap', mb: 0.5 }}>{comment.content}</Typography>
      )}

      <Stack direction="row" spacing={1} alignItems="center">
        <IconButton
          size="small"
          disabled={!isLoggedIn}
          onClick={() => onLikeToggle(comment)}
          aria-label="좋아요"
        >
          {isLiked ? <ThumbUpAltIcon fontSize="small" color="primary" /> : <ThumbUpOffAltIcon fontSize="small" />}
        </IconButton>
        <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{comment.like_count ?? 0}</Typography>

        {isLoggedIn && (
          <Button size="small" onClick={() => setIsReplying((prev) => !prev)}>
            답글
          </Button>
        )}
        {isOwner && !isEditing && (
          <>
            <Button size="small" onClick={() => setIsEditing(true)}>
              수정
            </Button>
            <Button size="small" color="error" onClick={() => onDelete(comment.comment_id)}>
              삭제
            </Button>
          </>
        )}
      </Stack>

      {isReplying && (
        <Box sx={{ mt: 1, ml: { xs: 2, md: 4 } }}>
          <CommentForm
            placeholder="답글을 입력해주세요."
            submitLabel="답글 등록"
            onCancel={() => setIsReplying(false)}
            onSubmit={async ({ content }) => {
              await onReply(comment.comment_id, content);
              setIsReplying(false);
            }}
          />
        </Box>
      )}

      {comment.children?.length > 0 && (
        <Box sx={{ mt: 1, ml: { xs: 2, md: 4 }, borderLeft: '2px solid', borderColor: 'divider', pl: 2 }}>
          {comment.children.map((child) => (
            <CommentItem
              key={child.comment_id}
              comment={child}
              currentUserId={currentUserId}
              likedCommentIds={likedCommentIds}
              onReply={onReply}
              onLikeToggle={onLikeToggle}
              onEdit={onEdit}
              onDelete={onDelete}
              isLoggedIn={isLoggedIn}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

export default CommentItem;
