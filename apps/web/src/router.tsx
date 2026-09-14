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
import { Register } from './ui/pages/Register';
import { NotFound } from './ui/pages/NotFound';
import { DashboardPage } from './ui/pages/admin/DashboardPage';
import { UsersPage } from './ui/pages/admin/UsersPage';
import { CoursesPage } from './ui/pages/admin/CoursesPage';
import { ModulesPage } from './ui/pages/admin/ModulesPage';
import { SectionsPage } from './ui/pages/admin/SectionsPage';
import { VideosPage } from './ui/pages/admin/VideosPage';
import { StepsPage } from './ui/pages/admin/StepsPage';
import { ParamPage } from './ui/pages/admin/ParamPage';
import { PermissionsPage } from './ui/pages/admin/PermissionsPage';

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
      { path: '*', element: <NotFound /> },
    ],
  },
  {
    path: '/admin',
    element: (
      <RequireAuth requirePermission="admin.panel.access">
        <AdminLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'usuarios', element: <UsersPage /> },
      { path: 'cursos', element: <CoursesPage /> },
      { path: 'modulos', element: <ModulesPage /> },
      { path: 'secciones', element: <SectionsPage /> },
      { path: 'videos', element: <VideosPage /> },
      { path: 'parametros/pasos', element: <StepsPage /> },
      { path: 'parametros/estilos', element: <ParamPage kind="estilos" /> },
      { path: 'parametros/dificultades', element: <ParamPage kind="dificultades" /> },
      { path: 'parametros/tipos-video', element: <ParamPage kind="tipos-video" /> },
      { path: 'parametros/tipos-etiqueta', element: <ParamPage kind="tipos-etiqueta" /> },
      { path: 'parametros/niveles-acceso', element: <ParamPage kind="niveles-acceso" /> },
      { path: 'parametros/roles', element: <ParamPage kind="roles" /> },
      { path: 'parametros/permisos', element: <PermissionsPage /> },
      { path: '*', element: <Navigate to="/admin" replace /> },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
