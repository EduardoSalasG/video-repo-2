import Box from '@mui/material/Box';
import { VideoCard } from '../molecules/VideoCard';
import type { Course } from '../../types';

interface CourseListProps {
  courses: Course[];
}

export const CourseList = ({ courses }: CourseListProps) => (
  <Box
    sx={{
      display: 'grid',
      gap: 2,
      gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
    }}
  >
    {courses.map((course, index) => (
      <Box key={course.id} {...(index === 0 ? { 'data-tour': 'course-card' } : {})}>
        <VideoCard course={course} />
      </Box>
    ))}
  </Box>
);
