import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import ListItemText from '@mui/material/ListItemText';
import { searchNaverBooks } from '../../lib/supabase';
import { stripHtml } from '../../utils/strip-html';

/**
 * NaverBookSearchPanel 컴포넌트
 *
 * Props:
 * @param {string} initialQuery - 검색창 초기값 [Optional, 기본값: '']
 * @param {function} onSelect - 검색 결과 선택 시 실행할 함수, (book) => void [Required]
 *
 * Example usage:
 * <NaverBookSearchPanel initialQuery={request.book_title} onSelect={handleSelect} />
 */
function NaverBookSearchPanel({ initialQuery = '', onSelect }) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSearch = async (event) => {
    event.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setErrorMessage('');
    try {
      const items = await searchNaverBooks(query.trim());
      setResults(items);
      if (items.length === 0) {
        setErrorMessage('검색 결과가 없습니다.');
      }
    } catch {
      setErrorMessage('네이버 책 검색에 실패했습니다.');
    } finally {
      setIsSearching(false);
    }
  };

  const handlePick = (item) => {
    onSelect({
      title: stripHtml(item.title),
      author: stripHtml(item.author).replace(/\^/g, ', '),
      publisher: stripHtml(item.publisher),
      price: item.discount || item.price || '',
      coverImage: item.image || '',
      summary: stripHtml(item.description),
    });
  };

  return (
    <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
      <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', mb: 1 }}>네이버 책 검색으로 자동 입력</Typography>
      <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: 1, mb: 1 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="도서명을 입력해주세요"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <Button type="submit" variant="outlined" disabled={isSearching} sx={{ whiteSpace: 'nowrap' }}>
          검색
        </Button>
      </Box>

      {isSearching && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {errorMessage && (
        <Alert severity="info" sx={{ mb: 1 }}>
          {errorMessage}
        </Alert>
      )}

      {results.length > 0 && (
        <List dense sx={{ maxHeight: 280, overflowY: 'auto', bgcolor: 'background.paper', borderRadius: 1 }}>
          {results.map((item) => (
            <ListItemButton key={item.isbn || item.link} onClick={() => handlePick(item)} alignItems="flex-start">
              <ListItemAvatar>
                <Avatar variant="rounded" src={item.image} alt={stripHtml(item.title)} />
              </ListItemAvatar>
              <ListItemText
                primary={stripHtml(item.title)}
                secondary={[stripHtml(item.author), stripHtml(item.publisher)].filter(Boolean).join(' · ')}
              />
            </ListItemButton>
          ))}
        </List>
      )}
    </Box>
  );
}

export default NaverBookSearchPanel;
