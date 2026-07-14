import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import { supabase } from '../lib/supabase';

/**
 * LoginPage 컴포넌트
 *
 * Props: 없음
 *
 * Example usage:
 * <Route path="/login" element={<LoginPage />} />
 */
function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isResetMode, setIsResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setIsSubmitting(false);
    if (error) {
      setErrorMessage('이메일 또는 비밀번호가 올바르지 않습니다.');
      return;
    }
    navigate('/');
  };

  const handleResetSubmit = async (event) => {
    event.preventDefault();
    setResetMessage('');
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail);
    setResetMessage(
      error ? '재설정 메일 발송에 실패했습니다. 이메일을 확인해주세요.' : '비밀번호 재설정 메일을 발송했습니다.',
    );
  };

  return (
    <Box
      sx={{
        width: '100%',
        flexGrow: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        py: { xs: 4, md: 8 },
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="xs">
        <Paper sx={{ p: { xs: 3, md: 4 } }}>
          <Typography sx={{ fontSize: { xs: '1.3rem', md: '1.5rem' }, fontWeight: 800, textAlign: 'center', mb: 3 }}>
            로그인
          </Typography>

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              type="email"
              label="이메일"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type="password"
              label="비밀번호"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              sx={{ mb: 2 }}
            />
            <Button fullWidth type="submit" variant="contained" size="large" disabled={isSubmitting}>
              로그인
            </Button>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography sx={{ fontSize: '0.85rem' }}>
              아직 계정이 없으신가요?{' '}
              <Link component={RouterLink} to="/signup">
                회원가입
              </Link>
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 1 }}>
            <Link component="button" type="button" sx={{ fontSize: '0.8rem' }} onClick={() => setIsResetMode((prev) => !prev)}>
              비밀번호를 잊으셨나요?
            </Link>
          </Box>

          {isResetMode && (
            <Box component="form" onSubmit={handleResetSubmit} sx={{ mt: 2 }}>
              {resetMessage && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  {resetMessage}
                </Alert>
              )}
              <TextField
                fullWidth
                type="email"
                label="가입한 이메일"
                value={resetEmail}
                onChange={(event) => setResetEmail(event.target.value)}
                required
                size="small"
                sx={{ mb: 1.5 }}
              />
              <Button fullWidth type="submit" variant="outlined" size="small">
                재설정 링크 받기
              </Button>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}

export default LoginPage;
