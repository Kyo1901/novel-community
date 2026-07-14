import { HashRouter, Routes, Route } from 'react-router-dom';
import Box from '@mui/material/Box';
import { AuthProvider } from './hooks/useAuth';
import Header from './components/common/header';
import HomePage from './pages/home-page';
import LoginPage from './pages/login-page';
import SignupPage from './pages/signup-page';
import PostListPage from './pages/post-list-page';
import PostDetailPage from './pages/post-detail-page';
import SearchResultsPage from './pages/search-results-page';
import RequestBoardPage from './pages/request-board-page';

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Box sx={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/posts" element={<PostListPage />} />
            <Route path="/posts/:postId" element={<PostDetailPage />} />
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path="/requests" element={<RequestBoardPage />} />
          </Routes>
        </Box>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
