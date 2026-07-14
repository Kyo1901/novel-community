import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Rating from '@mui/material/Rating';
import Typography from '@mui/material/Typography';

/**
 * CommentForm 컴포넌트
 *
 * Props:
 * @param {function} onSubmit - 제출 시 실행할 함수, ({content, rating}) => Promise [Required]
 * @param {boolean} hasRating - 평점 입력을 포함할지 여부 [Optional, 기본값: false]
 * @param {string} initialContent - 초기 내용 (수정 모드) [Optional, 기본값: '']
 * @param {number} initialRating - 초기 평점 (수정 모드) [Optional, 기본값: 0]
 * @param {string} submitLabel - 제출 버튼 텍스트 [Optional, 기본값: '등록']
 * @param {function} onCancel - 취소 시 실행할 함수 [Optional]
 * @param {string} placeholder - 입력창 placeholder [Optional]
 *
 * Example usage:
 * <CommentForm onSubmit={handleSubmit} hasRating />
 */
function CommentForm({
  onSubmit,
  hasRating = false,
  initialContent = '',
  initialRating = 0,
  submitLabel = '등록',
  onCancel,
  placeholder = '댓글을 입력해주세요.',
}) {
  const [content, setContent] = useState(initialContent);
  const [rating, setRating] = useState(initialRating);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!content.trim()) return;
    if (hasRating && !rating) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ content: content.trim(), rating: hasRating ? rating : null });
      setContent('');
      if (hasRating) setRating(0);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {hasRating && (
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>평점</Typography>
          <Rating value={rating} onChange={(_event, value) => setRating(value)} />
        </Stack>
      )}
      <TextField
        fullWidth
        multiline
        minRows={2}
        placeholder={placeholder}
        value={content}
        onChange={(event) => setContent(event.target.value)}
        sx={{ mb: 1 }}
      />
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        {onCancel && (
          <Button size="small" onClick={onCancel}>
            취소
          </Button>
        )}
        <Button type="submit" size="small" variant="contained" disabled={isSubmitting}>
          {submitLabel}
        </Button>
      </Stack>
    </Box>
  );
}

export default CommentForm;
