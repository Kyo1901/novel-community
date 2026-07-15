import { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { supabase, searchNaverBooks } from '../../lib/supabase';
import { stripHtml } from '../../utils/strip-html';

const getResultKey = (item) => item.isbn || item.link;

/**
 * BulkBookImportPanel 컴포넌트
 *
 * Props:
 * @param {array} categories - 카테고리 목록 [Required]
 * @param {string} adminId - 등록 처리하는 관리자 id [Required]
 *
 * Example usage:
 * <BulkBookImportPanel categories={categories} adminId={user.id} />
 */
function BulkBookImportPanel({ categories, adminId }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSearch = async (event) => {
    event.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const items = await searchNaverBooks(query.trim());
      setResults(items);
      setSelectedKeys([]);
      if (items.length === 0) {
        setErrorMessage('검색 결과가 없습니다.');
      }
    } catch {
      setErrorMessage('네이버 책 검색에 실패했습니다.');
    } finally {
      setIsSearching(false);
    }
  };

  const toggleSelect = (key) => {
    setSelectedKeys((prev) => (prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]));
  };

  const toggleSelectAll = () => {
    setSelectedKeys((prev) => (prev.length === results.length ? [] : results.map(getResultKey)));
  };

  const handleBulkRegister = async () => {
    if (selectedKeys.length === 0 || !categoryId) return;

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    const selectedBooks = results.filter((item) => selectedKeys.includes(getResultKey(item)));
    const rows = selectedBooks.map((item) => {
      const rawPrice = item.discount || item.price;
      return {
        title: stripHtml(item.title),
        author: stripHtml(item.author).replace(/\^/g, ', ') || null,
        publisher: stripHtml(item.publisher) || null,
        price: rawPrice ? Number(rawPrice) : null,
        cover_image: item.image || null,
        summary: stripHtml(item.description) || null,
        category_id: categoryId,
        created_by: adminId,
      };
    });

    const { error } = await supabase.from('nv_posts').insert(rows);

    setIsSubmitting(false);
    if (error) {
      setErrorMessage('일괄 등록에 실패했습니다.');
      return;
    }

    setSuccessMessage(`${rows.length}권을 등록했습니다.`);
    setResults((prev) => prev.filter((item) => !selectedKeys.includes(getResultKey(item))));
    setSelectedKeys([]);
  };

  return (
    <Paper sx={{ p: { xs: 2, md: 3 }, mb: { xs: 3, md: 4 }, bgcolor: 'background.default' }}>
      <Typography sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, fontWeight: 800, mb: 2 }}>
        도서 일괄 등록 (관리자)
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

      <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="검색어 (도서명, 저자, 장르 등)"
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

      {results.length > 0 && (
        <>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Checkbox
              size="small"
              checked={selectedKeys.length === results.length}
              indeterminate={selectedKeys.length > 0 && selectedKeys.length < results.length}
              onChange={toggleSelectAll}
            />
            <Typography sx={{ fontSize: '0.85rem' }}>
              전체 선택 ({selectedKeys.length}/{results.length})
            </Typography>
          </Stack>

          <List dense sx={{ maxHeight: 320, overflowY: 'auto', bgcolor: 'background.paper', borderRadius: 1, mb: 2 }}>
            {results.map((item) => {
              const key = getResultKey(item);
              return (
                <ListItem key={key} disablePadding>
                  <ListItemButton dense onClick={() => toggleSelect(key)}>
                    <Checkbox
                      edge="start"
                      size="small"
                      checked={selectedKeys.includes(key)}
                      tabIndex={-1}
                      disableRipple
                      sx={{ mr: 1 }}
                    />
                    <ListItemAvatar>
                      <Avatar variant="rounded" src={item.image} alt={stripHtml(item.title)} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={stripHtml(item.title)}
                      secondary={[stripHtml(item.author), stripHtml(item.publisher)].filter(Boolean).join(' · ')}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>

          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            <TextField
              select
              size="small"
              label="카테고리"
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              sx={{ minWidth: 160 }}
            >
              {categories.map((category) => (
                <MenuItem key={category.category_id} value={category.category_id}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>
            <Button
              variant="contained"
              disabled={isSubmitting || selectedKeys.length === 0 || !categoryId}
              onClick={handleBulkRegister}
            >
              선택한 {selectedKeys.length}권 일괄 등록
            </Button>
          </Stack>
        </>
      )}
    </Paper>
  );
}

export default BulkBookImportPanel;
