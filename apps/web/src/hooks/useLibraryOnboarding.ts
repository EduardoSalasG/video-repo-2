import { useEffect } from 'react';
import { driver, type DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';

const STORAGE_KEY = 'onboarding:library:v1';

export const useLibraryOnboarding = (enabled: boolean) => {
  useEffect(() => {
    if (!enabled) return;
    if (localStorage.getItem(STORAGE_KEY)) return;

    const steps: DriveStep[] = [
      {
        popover: {
          title: 'Bienvenido a tu biblioteca de baile',
          description: 'Te mostramos lo esencial en menos de un minuto.',
        },
      },
      {
        element: '[data-tour="library"]',
        popover: {
          title: 'Tus cursos',
          description: 'Aquí aparecen los cursos a los que tienes acceso.',
        },
      },
      {
        element: '[data-tour="course-card"]',
        popover: {
          title: 'Entra a un curso',
          description: 'Toca una tarjeta para ver sus módulos, secciones y videos.',
        },
      },
      {
        element: '[data-tour="nav-search"]',
        popover: {
          title: 'Búsqueda',
          description: 'Encuentra pasos, estilos y tags en todo tu contenido.',
        },
      },
      {
        element: '[data-tour="nav-profile"]',
        popover: {
          title: 'Tu perfil',
          description: 'Gestiona tu cuenta, tu contraseña y cierra sesión.',
        },
      },
    ];

    const available = steps.filter((step) => {
      if (!step.element) return true;
      const selector = typeof step.element === 'string' ? step.element : null;
      return selector ? Boolean(document.querySelector(selector)) : true;
    });

    const tour = driver({
      showProgress: true,
      popoverClass: 'dance-onboarding',
      nextBtnText: 'Siguiente',
      prevBtnText: 'Atrás',
      doneBtnText: 'Entendido',
      progressText: '{{current}} de {{total}}',
      steps: available,
      onDestroyed: () => localStorage.setItem(STORAGE_KEY, '1'),
    });

    const timer = setTimeout(() => tour.drive(), 400);
    return () => {
      clearTimeout(timer);
      tour.destroy();
    };
  }, [enabled]);
};
