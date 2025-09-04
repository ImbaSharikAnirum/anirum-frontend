/**
 * Виджет для отображения изображений курса
 * @layer widgets
 */

'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import { ChevronLeft, ChevronRight, X, Share2 } from 'lucide-react'
import { Media } from '@/entities/course/model/types'
import { getStrapiImageUrl } from '@/shared/lib/course-utils'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

interface CourseImagesProps {
  images?: (string | Media)[]
  courseName?: string
}

export function CourseImages({ images, courseName }: CourseImagesProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-[500px] bg-gray-200 rounded-2xl flex items-center justify-center">
        <span className="text-gray-500">Нет изображений</span>
      </div>
    )
  }

  const getImageUrl = (image: string | Media) => {
    if (typeof image === 'string') return image
    return getStrapiImageUrl(image.url)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: document.title,
        url: window.location.href,
      }).catch(console.error)
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Ссылка скопирована!')
    }
  }

  return (
    <>
      {/* Десктопная версия */}
      <div className="hidden md:block w-full h-[500px]">
        <div className="flex h-full gap-2">
          {/* Большое изображение слева */}
          <div className="w-1/2 h-full">
            <div className="relative w-full h-full rounded-2xl overflow-hidden cursor-pointer" 
                 onClick={() => { setCurrentIndex(0); setIsModalOpen(true) }}>
              <Image
                src={getImageUrl(images[0])}
                alt={courseName || 'Курс'}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          {/* Сетка 2x2 справа */}
          <div className="w-1/2 h-full">
            <div className="grid grid-cols-2 grid-rows-2 gap-2 h-full">
              {images.slice(1, 5).map((image, index) => (
                <div 
                  key={index + 1}
                  className="relative rounded-2xl overflow-hidden cursor-pointer group"
                  onClick={() => { setCurrentIndex(index + 1); setIsModalOpen(true) }}
                >
                  <Image
                    src={getImageUrl(image)}
                    alt={`${courseName} ${index + 2}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Кнопка "Смотреть все" на последнем изображении */}
                  {index === 3 && images.length > 5 && (
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end justify-end p-4">
                      <Button 
                        variant="secondary" 
                        size="sm"
                        className="bg-white text-black hover:bg-gray-100"
                        onClick={(e) => {
                          e.stopPropagation()
                          setCurrentIndex(0)
                          setIsModalOpen(true)
                        }}
                      >
                        Смотреть все
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Мобильная версия */}
      <div className="block md:hidden">
        <div className="relative">
          {/* Кнопки назад и поделиться */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4 z-10 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
            onClick={() => window.history.back()}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
            onClick={handleShare}
          >
            <Share2 className="w-5 h-5" />
          </Button>

          <Swiper
            modules={[Navigation, Pagination]}
            navigation={false}
            pagination={{ 
              clickable: true,
              bulletClass: 'swiper-pagination-bullet !bg-white !opacity-60',
              bulletActiveClass: 'swiper-pagination-bullet-active !bg-white !opacity-100'
            }}
            className="h-[400px] rounded-none"
            onSlideChange={(swiper) => setCurrentIndex(swiper.activeIndex)}
          >
            {images.map((image, index) => (
              <SwiperSlide key={index}>
                <div className="relative w-full h-full">
                  <Image
                    src={getImageUrl(image)}
                    alt={`${courseName} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Счетчик изображений */}
          <div className="absolute bottom-4 right-4 z-10 bg-black/50 text-white px-2 py-1 rounded text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      </div>

      {/* Модальное окно для просмотра всех изображений */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center w-screen h-screen"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Кнопка закрытия */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 left-4 z-20 text-white hover:bg-white/20"
              onClick={() => setIsModalOpen(false)}
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Навигация влево */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 z-20 text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation()
                setCurrentIndex(prev => prev === 0 ? images.length - 1 : prev - 1)
              }}
            >
              <ChevronLeft className="w-8 h-8" />
            </Button>

            {/* Изображение */}
            <div 
              className="relative w-[80%] h-[80vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={getImageUrl(images[currentIndex])}
                alt={`${courseName} ${currentIndex + 1}`}
                fill
                className="object-contain"
              />
            </div>

            {/* Навигация вправо */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 z-20 text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation()
                setCurrentIndex(prev => prev === images.length - 1 ? 0 : prev + 1)
              }}
            >
              <ChevronRight className="w-8 h-8" />
            </Button>

            {/* Счетчик */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-lg">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </>
  )
}