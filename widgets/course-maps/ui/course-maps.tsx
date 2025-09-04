/**
 * Виджет для отображения карты курса
 * @layer widgets
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { Course } from "@/entities/course/model/types";
import { Separator } from "@/components/ui/separator";
import { MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CourseMapsProps {
  course: Course;
}

interface GoogleMaps {
  Map: any;
  Marker: any;
  InfoWindow: any;
  maps: {
    Map: any;
    Marker: any;
    InfoWindow: any;
  };
}

export function CourseMaps({ course }: CourseMapsProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Если курс онлайн, не показываем карту
  if (course.isOnline) {
    return null;
  }

  const loadGoogleMaps = async () => {
    try {
      setIsLoading(true);
      setMapError(null);

      // Проверяем, загружен ли уже Google Maps
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      // Проверяем, нет ли уже загружающегося скрипта Google Maps
      const existingScript = document.querySelector(
        'script[src*="maps.googleapis.com/maps/api/js"]'
      );
      
      if (existingScript) {
        // Если скрипт уже загружается, ждем его загрузки
        const checkGoogleMaps = () => {
          if (window.google && window.google.maps) {
            initializeMap();
          } else {
            // Повторяем проверку через 100ms
            setTimeout(checkGoogleMaps, 100);
          }
        };
        checkGoogleMaps();
        return;
      }

      // Загружаем Google Maps API
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        initializeMap();
      };

      script.onerror = () => {
        setMapError("Не удалось загрузить карту");
        setIsLoading(false);
      };

      document.head.appendChild(script);
    } catch (error) {
      setMapError("Ошибка при загрузке карты");
      setIsLoading(false);
    }
  };

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    try {
      let map: any;
      let location: { lat: number; lng: number };

      // Определяем координаты
      if (course.coordinates) {
        location = {
          lat: course.coordinates.lat,
          lng: course.coordinates.lng,
        };
      } else {
        // Если нет координат, но есть googlePlaceId, используем его
        // Для простоты пока используем центр Москвы по умолчанию
        location = { lat: 55.7558, lng: 37.6176 };
      }

      // Создаем карту
      map = new window.google.maps.Map(mapRef.current, {
        zoom: 15,
        center: location,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });

      // Добавляем маркер
      const marker = new window.google.maps.Marker({
        position: location,
        map: map,
        title: course.address,
      });

      // Добавляем информационное окно
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <h4 class="font-medium text-sm mb-1">Место проведения</h4>
            <p class="text-xs text-gray-600">${course.address}</p>
            <p class="text-xs text-gray-500">${course.city}, ${course.country}</p>
          </div>
        `,
      });

      marker.addListener("click", () => {
        infoWindow.open(map, marker);
      });

      setIsLoading(false);
    } catch (error) {
      setMapError("Ошибка при инициализации карты");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGoogleMaps();
  }, [course.coordinates, course.googlePlaceId]);

  return (
    <div className="space-y-4">
      {/* Карта */}
      <div className="relative">
        {mapError ? (
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 mb-2">{mapError}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const query = encodeURIComponent(
                    `${course.address}, ${course.city}, ${course.country}`
                  );
                  window.open(
                    `https://www.google.com/maps/search/?api=1&query=${query}`,
                    "_blank"
                  );
                }}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Открыть в Google Maps
              </Button>
            </div>
          </div>
        ) : (
          <>
            {isLoading && (
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Загрузка карты...</p>
              </div>
            )}
            <div
              ref={mapRef}
              className={`h-64 w-full rounded-lg ${isLoading ? "hidden" : ""}`}
              style={{ minHeight: "256px" }}
            />
          </>
        )}
      </div>
    </div>
  );
}
