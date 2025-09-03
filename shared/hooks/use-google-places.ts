"use client"

import { useState, useEffect, useCallback } from 'react'

interface PlacePrediction {
  place_id: string
  description: string
  structured_formatting: {
    main_text: string
    secondary_text: string
  }
}

interface PlaceDetails {
  place_id: string
  description: string
  country: string
  city: string
  address: string
  // Добавляем русские варианты для отображения
  displayDescription: string
  displayCountry: string
  displayCity: string
  displayAddress: string
  coordinates?: {
    lat: number
    lng: number
  }
}

interface UseGooglePlacesReturn {
  predictions: PlacePrediction[]
  isLoading: boolean
  error: string | null
  searchPlaces: (query: string) => void
  clearPredictions: () => void
  getPlaceDetails: (placeId: string, displayDescription: string) => Promise<PlaceDetails | null>
}

export function useGooglePlaces(): UseGooglePlacesReturn {
  const [predictions, setPredictions] = useState<PlacePrediction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [service, setService] = useState<google.maps.places.AutocompleteService | null>(null)
  const [placesService, setPlacesService] = useState<google.maps.places.PlacesService | null>(null)

  // Инициализация Google Places API
  useEffect(() => {
    if (typeof window !== 'undefined' && window.google?.maps?.places) {
      const autocompleteService = new window.google.maps.places.AutocompleteService()
      setService(autocompleteService)
      
      // Создаем div для PlacesService
      const div = document.createElement('div')
      const map = new window.google.maps.Map(div)
      const places = new window.google.maps.places.PlacesService(map)
      setPlacesService(places as google.maps.places.PlacesService)
    } else {
      // Загружаем Google Maps API если не загружен
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
      script.async = true
      script.onload = () => {
        if (window.google?.maps?.places) {
          const autocompleteService = new window.google.maps.places.AutocompleteService()
          setService(autocompleteService)
          
          // Создаем div для PlacesService
          const div = document.createElement('div')
          const map = new window.google.maps.Map(div)
          const places = new window.google.maps.places.PlacesService(map)
          setPlacesService(places as google.maps.places.PlacesService)
        }
      }
      document.head.appendChild(script)
    }
  }, [])

  const searchPlaces = useCallback(
    (query: string) => {
      if (!service || !query.trim()) {
        setPredictions([])
        return
      }

      setIsLoading(true)
      setError(null)

      const request: google.maps.places.AutocompletionRequest = {
        input: query,
        types: ['geocode'], // Включает города, районы, улицы и точные адреса
        componentRestrictions: { country: ['ru', 'kz', 'by', 'ua', 'uz', 'az'] }, // Страны СНГ
        language: 'ru', // Показываем результаты на русском для пользователя
      }

      service.getPlacePredictions(request, (predictions, status) => {
        setIsLoading(false)
        
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          setPredictions(predictions.slice(0, 5)) // Ограничиваем 5 результатами
        } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          setPredictions([])
        } else {
          setError('Ошибка при загрузке вариантов')
          setPredictions([])
        }
      })
    },
    [service]
  )

  const clearPredictions = useCallback(() => {
    setPredictions([])
    setError(null)
  }, [])

  const getPlaceDetails = useCallback(
    async (placeId: string, displayDescription: string): Promise<PlaceDetails | null> => {
      if (!placesService) return null

      return new Promise((resolve) => {
        // Сначала получаем английские данные для сохранения
        const requestEn = {
          placeId: placeId,
          fields: ['place_id', 'formatted_address', 'address_components', 'geometry'],
          language: 'en',
        }

        placesService.getDetails(requestEn, (placeEn, statusEn) => {
          if (statusEn === google.maps.places.PlacesServiceStatus.OK && placeEn) {
            // Извлекаем английские компоненты
            let countryEn = ''
            let cityEn = ''
            
            placeEn.address_components?.forEach((component) => {
              const types = component.types
              
              if (types.includes('country')) {
                countryEn = component.long_name
              }
              
              if (types.includes('locality')) {
                cityEn = component.long_name
              } else if (types.includes('administrative_area_level_1') && !cityEn) {
                cityEn = component.long_name
              } else if (types.includes('administrative_area_level_2') && !cityEn) {
                cityEn = component.long_name
              } else if (types.includes('sublocality') && !cityEn) {
                cityEn = component.long_name
              }
            })

            // Теперь получаем русские данные для отображения
            const requestRu = {
              placeId: placeId,
              fields: ['formatted_address', 'address_components'],
              language: 'ru',
            }

            placesService.getDetails(requestRu, (placeRu, statusRu) => {
              let countryRu = ''
              let cityRu = ''
              let addressRu = displayDescription // Используем то что пользователь видел при поиске

              if (statusRu === google.maps.places.PlacesServiceStatus.OK && placeRu) {
                addressRu = placeRu.formatted_address || displayDescription
                
                placeRu.address_components?.forEach((component) => {
                  const types = component.types
                  
                  if (types.includes('country')) {
                    countryRu = component.short_name // Используем короткое название
                  }
                  
                  if (types.includes('locality')) {
                    cityRu = component.short_name // Используем короткое название города
                  } else if (types.includes('administrative_area_level_1') && !cityRu) {
                    cityRu = component.short_name
                  } else if (types.includes('administrative_area_level_2') && !cityRu) {
                    cityRu = component.short_name
                  } else if (types.includes('sublocality') && !cityRu) {
                    cityRu = component.short_name
                  }
                })
              }

              const details: PlaceDetails = {
                place_id: placeId,
                // Английские данные для API
                description: placeEn.formatted_address || '',
                country: countryEn,
                city: cityEn,
                address: placeEn.formatted_address || '',
                // Русские данные для отображения
                displayDescription: addressRu,
                displayCountry: countryRu,
                displayCity: cityRu,
                displayAddress: addressRu,
                coordinates: placeEn.geometry?.location ? {
                  lat: placeEn.geometry.location.lat(),
                  lng: placeEn.geometry.location.lng()
                } : undefined
              }

              console.log('Получены данные места:', {
                english: { country: countryEn, city: cityEn, address: placeEn.formatted_address },
                russian: { country: countryRu, city: cityRu, address: addressRu }
              })

              resolve(details)
            })
          } else {
            resolve(null)
          }
        })
      })
    },
    [placesService]
  )

  return {
    predictions,
    isLoading,
    error,
    searchPlaces,
    clearPredictions,
    getPlaceDetails,
  }
}