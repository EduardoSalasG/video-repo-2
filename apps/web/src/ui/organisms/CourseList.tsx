import Grid from '@mui/material/Grid';
import { VideoCard } from '../molecules/VideoCard';
import type { Course } from '../../types';

interface CourseListProps {
  courses: Course[];
}

export const CourseList = ({ courses }: CourseListProps) => (
  <Grid container spacing={2}>
    {courses.map((course) => (
      <Grid key={course.id} item xs={12} sm={6} md={4}>
        <VideoCard course={course} />
      </Grid>
    ))}
  </Grid>
);
