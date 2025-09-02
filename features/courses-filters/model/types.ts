export interface Direction {
  id: string
  name: string
  image: string
}

export interface Format {
  id: 'online' | 'offline'
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

export interface Teacher {
  value: string
  label: string
}

export interface CoursesFilters {
  direction: Direction | null
  format: Format | null
  location: string
  age: string
  teacher: Teacher | null
  advanced: {
    days: string[]
    price: number[]
    timeSlot: string
  }
}