import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from './ui/templates/MainLayout';
import { AdminLayout } from './ui/templates/AdminLayout';
import { RequireAuth } from './ui/templates/RequireAuth';
import { Landing } from './ui/pages/Landing';
import { Login } from './ui/pages/Login';
import { Library } from './ui/pages/Library';
import { Course } from './ui/pages/Course';
import { Section } from './ui/pages/Section';
import { Search } from './ui/pages/Search';
import { Profile } from './ui/pages/Profile';
import { Settings } from './ui/pages/Settings';
import { More } from './ui/pages/More';
import { Register } from './ui/pages/Register';
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
    path: '/register',
    element: <Register />,
  },
  {
    path: '/app',
    element: (
      <RequireAuth>
        <MainLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Library /> },
      { path: 'courses/:courseId', element: <Course /> },
      { path: 'sections/:sectionId', element: <Section /> },
      { path: 'search', element: <Search /> },
      { path: 'profile', element: <Profile /> },
      { path: 'settings', element: <Settings /> },
      { path: 'more', element: <More /> },
    ],
  },
  {
    path: '/admin',
    element: (
      <RequireAuth requireAdmin>
        <AdminLayout />
      </RequireAuth>
    ),
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
