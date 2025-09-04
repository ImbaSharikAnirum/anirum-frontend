/**
 * Единый загрузчик Google Maps API для всего приложения
 * Предотвращает множественную загрузку скрипта
 */

let isLoading = false;
let isLoaded = false;
let loadPromise: Promise<void> | null = null;

export async function loadGoogleMaps(): Promise<void> {
  // Если уже загружен
  if (isLoaded && window.google?.maps) {
    return;
  }

  // Если уже загружается
  if (isLoading && loadPromise) {
    return loadPromise;
  }

  // Проверяем существующий скрипт
  const existingScript = document.querySelector(
    'script[src*="maps.googleapis.com/maps/api/js"]'
  );

  if (existingScript && window.google?.maps) {
    isLoaded = true;
    return;
  }

  // Начинаем загрузку
  isLoading = true;
  
  loadPromise = new Promise((resolve, reject) => {
    // Если Google Maps уже загружен
    if (window.google?.maps) {
      isLoaded = true;
      isLoading = false;
      resolve();
      return;
    }

    // Создаем скрипт
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&language=ru`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      isLoaded = true;
      isLoading = false;
      resolve();
    };

    script.onerror = () => {
      isLoading = false;
      reject(new Error('Не удалось загрузить Google Maps API'));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}

export function isGoogleMapsLoaded(): boolean {
  return isLoaded && !!window.google?.maps;
}