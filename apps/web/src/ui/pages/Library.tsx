import { Typography } from '../atoms/Typography';
import { CourseList } from '../organisms/CourseList';
import { MOCK_COURSES } from '../../data/mock';

export const Library = () => (
  <>
    <Typography variant="h4" component="h1" gutterBottom>
      Biblioteca de cursos
    </Typography>
    <CourseList courses={MOCK_COURSES} />
  </>
);
