import { Monitor, MapPin } from "lucide-react"
import { Direction } from './types'

// Направления курсов
export const courseDirections: Direction[] = [
  {
    id: "sketching",
    name: "Скетчинг",
    image: "/directions/scetching.jpg"
  },
  {
    id: "drawing2d", 
    name: "2D рисование",
    image: "/directions/2D.png"
  },
  {
    id: "modeling3d",
    name: "3D моделирование", 
    image: "/directions/3D.png"
  },
  {
    id: "animation",
    name: "Анимация",
    image: "/directions/animation.jpg"
  },
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