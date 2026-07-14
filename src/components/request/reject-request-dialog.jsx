import { useState } from 'react';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import { supabase } from '../../lib/supabase';

/**
 * RejectRequestDialog 컴포넌트
 *
 * Props:
 * @param {boolean} isOpen - 다이얼로그 표시 여부 [Required]
 * @param {function} onClose - 닫기 함수 [Required]
 * @param {object} request - 반려 대상 신청 데이터 [Required]
 * @param {string} adminId - 처리하는 관리자 id [Required]
 * @param {function} onRejected - 반려 완료 후 실행할 함수 [Required]
 *
 * Example usage:
 * <RejectRequestDialog isOpen={open} onClose={handleClose} request={request} adminId={adminId} onRejected={reload} />
 */
function RejectRequestDialog({ isOpen, onClose, request, adminId, onRejected }) {
  const [reason, setReason] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const { error } = await supabase
      .from('nv_requests')
      .update({
        status: '반려됨',
        reject_reason: reason.trim(),
        processed_by: adminId,
        processed_at: new Date().toISOString(),
      })
      .eq('request_id', request.request_id);

    setIsSubmitting(false);
    if (error) {
      setErrorMessage('반려 처리에 실패했습니다.');
      return;
    }

    onRejected();
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>신청 반려</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}
          <TextField
            label="반려 사유 (예: 중복 신청, 정보 부족 등)"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            required
            fullWidth
            multiline
            minRows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>취소</Button>
          <Button type="submit" color="error" variant="contained" disabled={isSubmitting}>
            반려하기
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default RejectRequestDialog;
