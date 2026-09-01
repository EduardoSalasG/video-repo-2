import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import { Typography } from '../atoms/Typography';
import type { Course } from '../../types';
import { Link } from 'react-router-dom';

interface VideoCardProps {
  course: Course;
}

export const VideoCard = ({ course }: VideoCardProps) => (
  <Card
    component={Link}
    to={`/app/courses/${course.id}`}
    sx={{ textDecoration: 'none', color: 'inherit' }}
  >
    <Box
      component="img"
      src="/icon.svg"
      alt={course.name}
      sx={{ width: '100%', height: 160, objectFit: 'cover' }}
    />
    <CardContent>
      <Typography variant="h6" noWrap>
        {course.name}
      </Typography>
      <Typography variant="body2" color="text.secondary" noWrap>
        {course.description}
      </Typography>
    </CardContent>
  </Card>
);
