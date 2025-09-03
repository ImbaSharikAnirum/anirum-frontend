declare global {
  interface Window {
    google: typeof google
  }
}

declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: HTMLElement, opts?: any)
    }

    class LatLng {
      lat(): number
      lng(): number
    }

    namespace places {
      class AutocompleteService {
        getPlacePredictions(
          request: AutocompletionRequest,
          callback: (
            predictions: QueryAutocompletePrediction[] | null,
            status: PlacesServiceStatus
          ) => void
        ): void
      }

      class PlacesService {
        constructor(attrContainer: HTMLElement | Map)
        getDetails(
          request: PlaceDetailsRequest,
          callback: (place: PlaceResult | null, status: PlacesServiceStatus) => void
        ): void
      }

      interface AutocompletionRequest {
        input: string
        types?: string[]
        componentRestrictions?: ComponentRestrictions
        language?: string
      }

      interface PlaceDetailsRequest {
        placeId: string
        fields?: string[]
        language?: string
      }

      interface ComponentRestrictions {
        country?: string | string[]
      }

      interface QueryAutocompletePrediction {
        place_id: string
        description: string
        structured_formatting: {
          main_text: string
          secondary_text: string
        }
      }

      interface PlaceResult {
        place_id?: string
        formatted_address?: string
        address_components?: AddressComponent[]
        geometry?: {
          location?: LatLng
        }
      }

      interface AddressComponent {
        long_name: string
        short_name: string
        types: string[]
      }

      enum PlacesServiceStatus {
        OK = 'OK',
        ZERO_RESULTS = 'ZERO_RESULTS',
        OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
        REQUEST_DENIED = 'REQUEST_DENIED',
        INVALID_REQUEST = 'INVALID_REQUEST',
        NOT_FOUND = 'NOT_FOUND',
      }
    }
  }
}

export {}