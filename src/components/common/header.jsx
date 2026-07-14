import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import SearchIcon from '@mui/icons-material/Search';
import { useAuth } from '../../hooks/useAuth';

/**
 * Header 컴포넌트
 *
 * Props: 없음 (전역 인증 상태는 useAuth 훅에서 직접 읽음)
 *
 * Example usage:
 * <Header />
 */
function Header() {
  const navigate = useNavigate();
  const { user, profile, isAdmin, signOut } = useAuth();
  const [keyword, setKeyword] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (keyword.trim()) {
      navigate(`/search?q=${encodeURIComponent(keyword.trim())}`);
    }
  };

  const handleLogout = async () => {
    setAnchorEl(null);
    await signOut();
    navigate('/');
  };

  return (
    <AppBar position="static" color="primary" elevation={0}>
      <Toolbar
        sx={{
          flexWrap: 'wrap',
          gap: { xs: 1, md: 2 },
          py: { xs: 1, md: 1 },
          px: { xs: 2, md: 3 },
        }}
      >
        <Typography
          component={RouterLink}
          to="/"
          sx={{
            fontSize: { xs: '1.2rem', md: '1.4rem' },
            fontWeight: 800,
            color: 'inherit',
            textDecoration: 'none',
            mr: { xs: 1, md: 3 },
          }}
        >
          📚 Novel_Community
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button component={RouterLink} to="/posts" color="inherit" sx={{ fontSize: { xs: '0.8rem', md: '0.9rem' } }}>
            게시물 목록
          </Button>
          <Button component={RouterLink} to="/requests" color="inherit" sx={{ fontSize: { xs: '0.8rem', md: '0.9rem' } }}>
            신청 게시판
          </Button>
        </Box>

        <Box
          component="form"
          onSubmit={handleSearchSubmit}
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: 'rgba(255,255,255,0.85)',
            borderRadius: 2,
            px: 1.5,
            py: 0.25,
            flexGrow: 1,
            maxWidth: { xs: '100%', md: 320 },
            order: { xs: 4, md: 0 },
          }}
        >
          <InputBase
            placeholder="제목, 저자, 출판사 검색"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            sx={{ flexGrow: 1, fontSize: '0.85rem' }}
          />
          <IconButton type="submit" size="small" aria-label="검색">
            <SearchIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
          {user ? (
            <>
              <Button
                color="inherit"
                onClick={(event) => setAnchorEl(event.currentTarget)}
                sx={{ fontSize: { xs: '0.8rem', md: '0.9rem' } }}
              >
                {profile?.nickname ?? '회원'}님{isAdmin ? ' (관리자)' : ''}
              </Button>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                <MenuItem
                  component={RouterLink}
                  to="/requests?mine=true"
                  onClick={() => setAnchorEl(null)}
                >
                  내 신청 현황
                </MenuItem>
                <MenuItem onClick={handleLogout}>로그아웃</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button component={RouterLink} to="/login" color="inherit" sx={{ fontSize: { xs: '0.8rem', md: '0.9rem' } }}>
                로그인
              </Button>
              <Button
                component={RouterLink}
                to="/signup"
                variant="contained"
                sx={{ bgcolor: 'white', color: 'primary.main', fontSize: { xs: '0.8rem', md: '0.9rem' }, '&:hover': { bgcolor: '#f0f6ff' } }}
              >
                회원가입
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
