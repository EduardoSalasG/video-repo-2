import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { Typography } from '../atoms/Typography';
import { MOCK_COURSES } from '../../data/mock';

export const Course = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const course = useMemo(
    () => MOCK_COURSES.find((c) => c.id === courseId),
    [courseId]
  );

  if (!course) {
    return <Typography>Curso no encontrado</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {course.title}
      </Typography>
      <Typography color="text.secondary" paragraph>
        {course.description}
      </Typography>
      {course.modules.map((module) => (
        <Box key={module.id} sx={{ mb: 3 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            {module.title}
          </Typography>
          <List disablePadding>
            {module.sections.map((section) => (
              <ListItemButton
                key={section.id}
                component={Link}
                to={`/app/sections/${section.id}`}
              >
                <ListItemText primary={section.title} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      ))}
    </Box>
  );
};
