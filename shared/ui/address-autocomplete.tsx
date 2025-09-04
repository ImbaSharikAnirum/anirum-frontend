"use client"

import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loadGoogleMaps } from '@/shared/lib/google-maps-loader'

interface AddressAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onPlaceSelected?: (place: google.maps.places.PlaceResult) => void
  placeholder?: string
  label?: string
  className?: string
}

export function AddressAutocomplete({
  value,
  onChange,
  onPlaceSelected,
  placeholder = "Введите адрес...",
  label,
  className
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  useEffect(() => {
    const initAutocomplete = async () => {
      try {
        // Используем единый загрузчик
        await loadGoogleMaps()
        setIsLoaded(true)

        if (inputRef.current && !autocompleteRef.current) {
          const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
            types: ['address'],
            componentRestrictions: { country: ['ru', 'kz', 'by', 'ua'] },
            fields: ['formatted_address', 'address_components', 'geometry']
          })

          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace()
            if (place.formatted_address) {
              onChange(place.formatted_address)
              onPlaceSelected?.(place)
            }
          })

          // Разрешаем обычный ввод текста даже с автокомплитом
          inputRef.current.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement
            onChange(target.value)
          })

          autocompleteRef.current = autocomplete
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error)
      }
    }

    if (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      initAutocomplete()
    }

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current)
        autocompleteRef.current = null
      }
    }
  }, [onChange, onPlaceSelected])

  return (
    <div className={className}>
      {label && <Label className="mb-2 block">{label}</Label>}
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={!isLoaded && !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
      />
    </div>
  )
}