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
import Stack from '@mui/material/Stack';
import { supabase } from '../lib/supabase';

/**
 * SignupPage 컴포넌트
 *
 * Props: 없음
 *
 * Example usage:
 * <Route path="/signup" element={<SignupPage />} />
 */
function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');

  const [nicknameCheckMessage, setNicknameCheckMessage] = useState('');
  const [isNicknameAvailable, setIsNicknameAvailable] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckNickname = async () => {
    if (!nickname.trim()) return;
    const { count } = await supabase
      .from('nv_users')
      .select('user_id', { count: 'exact', head: true })
      .eq('nickname', nickname.trim());

    if (count && count > 0) {
      setIsNicknameAvailable(false);
      setNicknameCheckMessage('이미 사용 중인 닉네임입니다.');
    } else {
      setIsNicknameAvailable(true);
      setNicknameCheckMessage('사용 가능한 닉네임입니다.');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (isSubmitting) return;

    if (password.length < 6) {
      setErrorMessage('비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!isNicknameAvailable) {
      setErrorMessage('닉네임 중복확인을 완료해주세요.');
      return;
    }

    setIsSubmitting(true);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { nickname: nickname.trim() } },
    });
    if (error || (data.user && data.user.identities?.length === 0)) {
      setIsSubmitting(false);
      setErrorMessage('이미 가입된 이메일이거나 회원가입에 실패했습니다.');
      return;
    }
    const user = data.user;

    const { data: sessionData } = await supabase.auth.getSession();

    if (sessionData.session) {
      const { error: profileError } = await supabase
        .from('nv_users')
        .insert({ user_id: user.id, nickname: nickname.trim() });

      setIsSubmitting(false);
      if (profileError) {
        setErrorMessage('프로필 생성에 실패했습니다. 닉네임을 다시 확인해주세요.');
        return;
      }
      navigate('/');
      return;
    }

    setIsSubmitting(false);
    setSuccessMessage('가입 확인 이메일을 발송했습니다. 이메일의 링크를 클릭한 후 로그인해주세요.');
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
            회원가입
          </Typography>

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
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
              label="비밀번호 (6자 이상)"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type="password"
              label="비밀번호 확인"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              sx={{ mb: 2 }}
            />

            <Stack direction="row" spacing={1} sx={{ mb: 0.5 }}>
              <TextField
                fullWidth
                label="닉네임"
                value={nickname}
                onChange={(event) => {
                  setNickname(event.target.value);
                  setIsNicknameAvailable(false);
                }}
                required
              />
              <Button variant="outlined" sx={{ whiteSpace: 'nowrap' }} onClick={handleCheckNickname}>
                중복확인
              </Button>
            </Stack>
            {nicknameCheckMessage && (
              <Typography sx={{ fontSize: '0.78rem', color: isNicknameAvailable ? 'success.main' : 'error.main', mb: 1.5 }}>
                {nicknameCheckMessage}
              </Typography>
            )}

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={isSubmitting}
              sx={{ mt: 1 }}
            >
              회원가입
            </Button>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography sx={{ fontSize: '0.85rem' }}>
              이미 계정이 있으신가요?{' '}
              <Link component={RouterLink} to="/login">
                로그인
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default SignupPage;
