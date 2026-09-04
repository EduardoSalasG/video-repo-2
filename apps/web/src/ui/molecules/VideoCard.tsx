import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import { motion, useReducedMotion } from 'framer-motion';
import { Typography } from '../atoms/Typography';
import { API_BASE_URL } from '../../lib/api';
import type { Course } from '../../types';
import { Link } from 'react-router-dom';

interface VideoCardProps {
  course: Course;
}

export const VideoCard = ({ course }: VideoCardProps) => {
  const shouldReduceMotion = useReducedMotion();
  return (
    <Card
      component={Link}
      to={`/app/courses/${course.id}`}
      sx={{
        textDecoration: 'none',
        color: 'inherit',
        display: 'block',
        overflow: 'hidden',
        transition: shouldReduceMotion ? 'none' : 'box-shadow 200ms ease, transform 200ms ease',
        '&:hover': {
          boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
          transform: shouldReduceMotion ? 'none' : 'translateY(-3px)',
        },
      }}
    >
      <Box
        component="img"
        src={course.imageUrl ? (course.imageUrl.startsWith('http') ? course.imageUrl : `${API_BASE_URL}${course.imageUrl}`) : '/icon.svg'}
        alt={course.name}
        sx={{ width: '100%', height: 180, objectFit: 'cover' }}
      />
      <CardContent>
        <Typography variant="h6" noWrap sx={{ fontWeight: 600 }}>
          {course.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {course.description}
        </Typography>
      </CardContent>
      <motion.div
        layout
        style={{ height: 2, background: '#111111', transformOrigin: 'left' }}
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
      />
    </Card>
  );
};
