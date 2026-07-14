import Rating from '@mui/material/Rating';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/**
 * RatingStars 컴포넌트
 *
 * Props:
 * @param {number} value - 평점 값 (0~5) [Required]
 * @param {function} onChange - 평점 변경 시 실행할 함수 [Optional]
 * @param {boolean} isReadOnly - 읽기 전용 여부 [Optional, 기본값: true]
 * @param {string} size - 별 크기 ('small' | 'medium' | 'large') [Optional, 기본값: 'medium']
 *
 * Example usage:
 * <RatingStars value={4} isReadOnly={false} onChange={setRating} />
 */
function RatingStars({ value, onChange, isReadOnly = true, size = 'medium' }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Rating
        value={Number(value) || 0}
        onChange={(_event, newValue) => onChange && onChange(newValue)}
        readOnly={isReadOnly}
        size={size}
      />
      <Typography sx={{ fontSize: { xs: '0.85rem', md: '0.95rem' }, color: 'text.secondary' }}>
        {Number(value ?? 0).toFixed(1)}
      </Typography>
    </Box>
  );
}

export default RatingStars;
