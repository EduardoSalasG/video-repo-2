import Box from '@mui/material/Box';
import { Typography } from './Typography';

interface MarkdownProps {
  source: string;
}

export const Markdown = ({ source }: MarkdownProps) => (
  <Box>
    {source.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return (
          <Typography key={index} variant="h4" component="h1" gutterBottom>
            {line.slice(2)}
          </Typography>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <Typography key={index} variant="h5" component="h2" gutterBottom>
            {line.slice(3)}
          </Typography>
        );
      }
      if (line.startsWith('- ')) {
        return (
          <Typography key={index} component="li" variant="body1" sx={{ ml: 2 }}>
            {line.slice(2)}
          </Typography>
        );
      }
      if (line.trim() === '') {
        return <Box key={index} component="br" />;
      }
      return (
        <Typography key={index} variant="body1" paragraph>
          {line}
        </Typography>
      );
    })}
  </Box>
);
