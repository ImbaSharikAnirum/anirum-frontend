"use client"

import { useEffect, useRef, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
          version: 'weekly',
          libraries: ['places'],
          language: 'ru',
          region: 'RU'
        })

        await loader.load()
        setIsLoaded(true)

        if (inputRef.current && !autocompleteRef.current) {
          const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
            types: ['address'],
            language: 'ru',
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