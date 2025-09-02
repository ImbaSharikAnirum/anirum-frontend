import { Monitor, MapPin } from "lucide-react"
import { Direction } from './types'

// Направления курсов
export const courseDirections: Direction[] = [
  {
    id: "sketching",
    name: "Скетчинг",
    image: "https://cdnb.artstation.com/p/assets/images/images/091/248/689/large/liang-mark-oil-3.jpg?1756260267"
  },
  {
    id: "2d-drawing", 
    name: "2D рисование",
    image: "https://cdna.artstation.com/p/assets/images/images/091/245/334/large/horace-hsu-t1-final.jpg?1756246948"
  },
  {
    id: "3d-modeling",
    name: "3D моделирование", 
    image: "https://cdnb.artstation.com/p/assets/images/images/091/217/307/4k/wu-shenyou-2025-lin.jpg?1756177199"
  },
  {
    id: "animation",
    name: "Анимация",
    image: "https://cdnb.artstation.com/p/assets/images/images/091/201/023/large/baz-2.jpg?1756136309"
  }
]

// Форматы курсов
export const courseFormats = [
  {
    id: "online",
    name: "Онлайн",
    description: "Изучайте из любой точки мира",
    icon: Monitor
  },
  {
    id: "offline", 
    name: "Оффлайн", 
    description: "Очные занятия в учебном центре",
    icon: MapPin
  }
] as const

// Доступные города
export const availableCities = [
  "Якутск, Россия",
  "Москва, Россия",
  "Санкт-Петербург, Россия",
  "Екатеринбург, Россия",
  "Новосибирск, Россия",
  "Казань, Россия",
] as const

// Преподаватели курсов
export const courseTeachers = [
  { value: "anna-petrova", label: "Анна Петрова" },
  { value: "mikhail-ivanov", label: "Михаил Иванов" },
  { value: "elena-sidorova", label: "Елена Сидорова" },
  { value: "dmitry-kozlov", label: "Дмитрий Козлов" },
  { value: "olga-morozova", label: "Ольга Морозова" },
  { value: "artem-volkov", label: "Артем Волков" },
  { value: "maria-novikova", label: "Мария Новикова" },
  { value: "sergey-fedorov", label: "Сергей Федоров" },
] as const

// Типы
export type CourseDirection = typeof courseDirections[number]
export type CourseFormat = typeof courseFormats[number]
export type AvailableCity = typeof availableCities[number]
export type CourseTeacher = typeof courseTeachers[number]