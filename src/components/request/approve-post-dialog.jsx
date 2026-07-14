import { useState } from 'react';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import { supabase } from '../../lib/supabase';

/**
 * ApprovePostDialog 컴포넌트
 *
 * Props:
 * @param {boolean} isOpen - 다이얼로그 표시 여부 [Required]
 * @param {function} onClose - 닫기 함수 [Required]
 * @param {object} request - 승인 대상 신청 데이터 [Required]
 * @param {array} categories - 카테고리 목록 [Required]
 * @param {string} adminId - 처리하는 관리자 id [Required]
 * @param {function} onApproved - 승인 완료 후 실행할 함수 [Required]
 *
 * Example usage:
 * <ApprovePostDialog isOpen={open} onClose={handleClose} request={request} categories={categories} adminId={adminId} onApproved={reload} />
 */
function ApprovePostDialog({ isOpen, onClose, request, categories, adminId, onApproved }) {
  const [title, setTitle] = useState(request?.book_title ?? '');
  const [author, setAuthor] = useState('');
  const [publisher, setPublisher] = useState('');
  const [price, setPrice] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [summary, setSummary] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const { data: newPost, error: postError } = await supabase
      .from('nv_posts')
      .insert({
        title: title.trim(),
        author: author.trim() || null,
        publisher: publisher.trim() || null,
        price: price ? Number(price) : null,
        cover_image: coverImage.trim() || null,
        summary: summary.trim() || null,
        category_id: categoryId || null,
        created_by: adminId,
      })
      .select()
      .single();

    if (postError) {
      setIsSubmitting(false);
      setErrorMessage('게시물 등록에 실패했습니다.');
      return;
    }

    const { error: requestError } = await supabase
      .from('nv_requests')
      .update({
        status: '승인됨',
        linked_post_id: newPost.post_id,
        processed_by: adminId,
        processed_at: new Date().toISOString(),
      })
      .eq('request_id', request.request_id);

    setIsSubmitting(false);
    if (requestError) {
      setErrorMessage('신청 상태 갱신에 실패했습니다.');
      return;
    }

    onApproved();
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>게시물로 등록 (신청 승인)</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}
          <Stack spacing={2}>
            <TextField label="제목" value={title} onChange={(event) => setTitle(event.target.value)} required fullWidth />
            <TextField label="저자" value={author} onChange={(event) => setAuthor(event.target.value)} fullWidth />
            <TextField label="출판사" value={publisher} onChange={(event) => setPublisher(event.target.value)} fullWidth />
            <TextField
              label="가격"
              type="number"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              fullWidth
            />
            <TextField
              label="표지 이미지 URL"
              value={coverImage}
              onChange={(event) => setCoverImage(event.target.value)}
              fullWidth
            />
            <TextField
              label="카테고리"
              select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              fullWidth
            >
              {categories.map((category) => (
                <MenuItem key={category.category_id} value={category.category_id}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="줄거리"
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              multiline
              minRows={3}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>취소</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            승인 및 등록
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default ApprovePostDialog;
