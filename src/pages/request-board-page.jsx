import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../utils/format-date';
import ApprovePostDialog from '../components/request/approve-post-dialog';
import RejectRequestDialog from '../components/request/reject-request-dialog';

const STATUS_COLOR = {
  대기중: 'warning',
  승인됨: 'success',
  반려됨: 'error',
};

/**
 * RequestBoardPage 컴포넌트
 *
 * Props: 없음
 *
 * Example usage:
 * <Route path="/requests" element={<RequestBoardPage />} />
 */
function RequestBoardPage() {
  const { user, isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const showMineOnly = searchParams.get('mine') === 'true';

  const [requests, setRequests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bookTitle, setBookTitle] = useState('');
  const [reason, setReason] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [approveTarget, setApproveTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);

  const load = useCallback(async () => {
    const [{ data: requestRows }, { data: categoryRows }] = await Promise.all([
      supabase
        .from('nv_requests')
        .select('*, nv_users(nickname)')
        .order('created_at', { ascending: false }),
      supabase.from('nv_categories').select('*'),
    ]);
    setRequests(requestRows ?? []);
    setCategories(categoryRows ?? []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    load();
  }, [load]);

  const visibleRequests = useMemo(
    () => (showMineOnly && user ? requests.filter((request) => request.user_id === user.id) : requests),
    [requests, showMineOnly, user],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    if (!bookTitle.trim()) return;

    const { error } = await supabase
      .from('nv_requests')
      .insert({ user_id: user.id, book_title: bookTitle.trim(), reason: reason.trim() || null });

    if (error) {
      setErrorMessage('신청 등록에 실패했습니다.');
      return;
    }
    setBookTitle('');
    setReason('');
    await load();
  };

  return (
    <Box sx={{ width: '100%', flexGrow: 1, bgcolor: 'background.default' }}>
      <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 }, px: { xs: 2, md: 3 } }}>
        <Typography sx={{ fontSize: { xs: '1.2rem', md: '1.4rem' }, fontWeight: 800, mb: 3 }}>
          신청 게시판
        </Typography>

        <Paper sx={{ p: { xs: 2, md: 3 }, mb: { xs: 3, md: 4 } }}>
          {user ? (
            <Box component="form" onSubmit={handleSubmit}>
              {errorMessage && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {errorMessage}
                </Alert>
              )}
              <Stack spacing={2}>
                <TextField
                  label="신청할 도서명"
                  value={bookTitle}
                  onChange={(event) => setBookTitle(event.target.value)}
                  required
                  fullWidth
                />
                <TextField
                  label="신청 사유 (선택)"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  fullWidth
                  multiline
                  minRows={2}
                />
                <Button type="submit" variant="contained" sx={{ alignSelf: 'flex-start' }}>
                  신청하기
                </Button>
              </Stack>
            </Box>
          ) : (
            <Alert severity="info">
              <Link component={RouterLink} to="/login">
                로그인
              </Link>{' '}
              후 소설·잡지를 신청할 수 있습니다.
            </Alert>
          )}
        </Paper>

        {user && (
          <FormControlLabel
            sx={{ mb: 1 }}
            control={
              <Checkbox
                checked={showMineOnly}
                onChange={(event) => {
                  const next = new URLSearchParams(searchParams);
                  if (event.target.checked) next.set('mine', 'true');
                  else next.delete('mine');
                  setSearchParams(next);
                }}
              />
            }
            label="내 신청만 보기"
          />
        )}

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : visibleRequests.length === 0 ? (
          <Typography sx={{ textAlign: 'center', color: 'text.secondary', py: 4 }}>
            신청 내역이 없습니다.
          </Typography>
        ) : (
          <Paper>
            {visibleRequests.map((request, index) => (
              <Box key={request.request_id}>
                {index > 0 && <Divider />}
                <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                  <Box sx={{ flexGrow: 1, minWidth: 200 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>{request.book_title}</Typography>
                    <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                      {request.nv_users?.nickname ?? '알 수 없음'} · {formatDate(request.created_at)}
                    </Typography>
                    {request.reason && (
                      <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', mt: 0.5 }}>
                        사유: {request.reason}
                      </Typography>
                    )}
                    {request.status === '반려됨' && request.reject_reason && (
                      <Typography sx={{ fontSize: '0.8rem', color: 'error.main', mt: 0.5 }}>
                        반려 사유: {request.reject_reason}
                      </Typography>
                    )}
                    {request.status === '승인됨' && request.linked_post_id && (
                      <Link component={RouterLink} to={`/posts/${request.linked_post_id}`} sx={{ fontSize: '0.8rem' }}>
                        등록된 게시물 보기
                      </Link>
                    )}
                  </Box>
                  <Chip label={request.status} color={STATUS_COLOR[request.status]} size="small" />
                  {isAdmin && request.status === '대기중' && (
                    <Stack direction="row" spacing={1}>
                      <Button size="small" variant="contained" onClick={() => setApproveTarget(request)}>
                        승인
                      </Button>
                      <Button size="small" color="error" variant="outlined" onClick={() => setRejectTarget(request)}>
                        반려
                      </Button>
                    </Stack>
                  )}
                </Box>
              </Box>
            ))}
          </Paper>
        )}
      </Container>

      {approveTarget && (
        <ApprovePostDialog
          isOpen={Boolean(approveTarget)}
          onClose={() => setApproveTarget(null)}
          request={approveTarget}
          categories={categories}
          adminId={user?.id}
          onApproved={load}
        />
      )}
      {rejectTarget && (
        <RejectRequestDialog
          isOpen={Boolean(rejectTarget)}
          onClose={() => setRejectTarget(null)}
          request={rejectTarget}
          adminId={user?.id}
          onRejected={load}
        />
      )}
    </Box>
  );
}

export default RequestBoardPage;
