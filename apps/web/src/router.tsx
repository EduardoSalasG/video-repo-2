import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from './ui/templates/MainLayout';
import { AdminLayout } from './ui/templates/AdminLayout';
import { Landing } from './ui/pages/Landing';
import { Login } from './ui/pages/Login';
import { Library } from './ui/pages/Library';
import { Course } from './ui/pages/Course';
import { Section } from './ui/pages/Section';
import { Admin } from './ui/pages/Admin';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/app',
    element: <MainLayout />,
    children: [
      { index: true, element: <Library /> },
      { path: 'courses/:courseId', element: <Course /> },
      { path: 'sections/:sectionId', element: <Section /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <Admin /> },
      { path: ':tab', element: <Admin /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
