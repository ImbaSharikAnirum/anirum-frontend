"use client";

import { FileUpload } from "@/components/ui/file-upload";
import { FloatingDock } from "@/components/ui/floating-dock";
import { BookOpen, DollarSign, Users } from "lucide-react";
import Image from "next/image";

export function FeaturesSection() {
  const courseLinks = [
    {
      title: "Alex • 3D Artist",
      icon: (
        <img
          src="/home/features_avatar1.jpg"
          alt="Alex - 3D Artist"
          className="h-full w-full object-cover"
        />
      ),
      href: "#",
    },
    {
      title: "Emma • Animator",
      icon: (
        <img
          src="/home/features_avatar2.jpg"
          alt="Emma - Animator"
          className="h-full w-full object-cover"
        />
      ),
      href: "#",
    },
    {
      title: "Sophia • Rigger",
      icon: (
        <img
          src="/home/features_avatar3.jpg"
          alt="Sophia - Rigger"
          className="h-full w-full object-cover"
        />
      ),
      href: "#",
    },
    {
      title: "Olivia • Concept Artist",
      icon: (
        <img
          src="/home/features_avatar4.jpg"
          alt="Olivia - Concept Artist"
          className="h-full w-full object-cover"
        />
      ),
      href: "#",
    },
    {
      title: "James • Technical Artist",
      icon: (
        <img
          src="/home/features_avatar5.jpg"
          alt="James - Technical Artist"
          className="h-full w-full object-cover"
        />
      ),
      href: "#",
    },
    {
      title: "Michael • Game Designer",
      icon: (
        <img
          src="/home/features_avatar6.jpg"
          alt="Michael - Game Designer"
          className="h-full w-full object-cover"
        />
      ),
      href: "#",
    },
  ];
  const features = [
    {
      sectionTitle: "Учебный материал в открытом доступе",
      price: "Бесплатно",
      title: "Посмотреть и обучиться",
      options: [
        { label: "Гайды", position: "left" },
        { label: "Древо навыков", position: "left" },
      ],
    },
    {
      sectionTitle: "Поделись своим результатом",
      price: "$15 за пакет гайдов",
      title: "Загрузить работу выполнив задание",
      options: [
        { label: "Профиль", position: "left" },
        { label: "Рейтинг", position: "left" },
        { label: "Голосование", position: "left" },
        { label: "Сообщество", position: "left" },
      ],
    },
    {
      sectionTitle: "Учись у специалистов индустрии",
      price: "от $20 за урок",
      title: "Записаться на занятие по определенной теме",
      options: [
        { label: "индивидуально", position: "left" },
        { label: "онлайн", position: "right" },
        { label: "в группе", position: "left" },
        { label: "офлайн", position: "right" },
      ],
    },
  ];

  return (
    <section className="pt-16 pb-24 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="mb-10 grid grid-cols-1 md:grid-cols-[1.2fr_1.3fr] gap-8 items-start">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
              Создано для
              <br />
              начинающих специалистов
              <br />
              в области анимации и игровой
              <br />
              индустрии
            </h2>
          </div>
          <div className="text-slate-700">
            {/* Текст для правой части */}
            <p>
              Anirum создан теми, кто верит, что обучение — это ремесло.
              Осознанность, постоянство и стремление к мастерству делают тебя
              профессионалом. Мы верим, что знания должны быть доступны каждому
              и предлагаем платить только за вдохновение и развитие.
              Присоединяйся.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 border border-slate-200 hover:shadow-xl transition-shadow duration-300 flex flex-col"
            >
              {/* Стек изображений для первой карточки */}
              {index === 0 && (
                <div className="relative h-60 w-48 mx-auto mb-10">
                  {[1, 2, 3, 4, 5].map((num, imgIndex) => {
                    const rotation = (imgIndex - 2) * 8; // От -16° до +16°
                    return (
                      <div
                        key={num}
                        className="absolute left-1/2 top-2 w-32 h-52 transition-all duration-500 hover:translate-y-3 hover:scale-105 hover:z-50"
                        style={{
                          transform: `translateX(-50%) translateY(${
                            imgIndex * 6
                          }px) rotate(${rotation}deg)`,
                          transformOrigin: "center bottom",
                          zIndex: 5 - imgIndex,
                        }}
                      >
                        <div className="relative w-full h-full">
                          <Image
                            src={`/home/features_guide${num}.jpeg`}
                            alt={`Guide ${num}`}
                            fill
                            className="object-cover rounded-lg shadow-xl border-2 border-white"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {index === 1 && (
                <div className="mb-10 relative group h-60">
                  {/* Эффект перетаскивания гайда */}
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-10 w-32 h-48 pointer-events-none transition-all duration-500 group-hover:w-full group-hover:h-full group-hover:top-0 group-hover:left-0 group-hover:translate-x-0 group-hover:opacity-100">
                    <div className="relative w-full h-full transform -rotate-12 group-hover:rotate-0 transition-transform duration-500">
                      <Image
                        src="/home/features_guide3.jpeg"
                        alt="Dragging guide"
                        fill
                        className="object-cover rounded-lg shadow-2xl border-2 border-white opacity-85 group-hover:opacity-100"
                      />
                    </div>
                  </div>
                  <FileUpload />
                </div>
              )}

              {/* FloatingDock для третьего блока */}
              {index === 2 && (
                <div className="mb-10 h-60 flex items-center justify-center">
                  <FloatingDock items={courseLinks} />
                </div>
              )}

              <h3 className="text-xl font-bold text-slate-900 mb-6 h-14 flex items-start">
                {feature.sectionTitle}
              </h3>
              <div className="flex items-start gap-6 flex-1">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-slate-900 text-center px-3 leading-tight">
                    {feature.price}
                  </span>
                </div>
                <div className="flex-1 flex flex-col">
                  <h3 className="text-lg font-semibold text-slate-900 leading-snug mb-3">
                    {feature.title}
                  </h3>
                  {feature.options && (
                    <div className="grid grid-cols-2 gap-y-1 gap-x-4 mt-auto">
                      {feature.options.map((option, idx) => (
                        <div
                          key={idx}
                          className={`text-sm text-slate-700 ${
                            option.position === "left"
                              ? "text-left"
                              : "text-right"
                          }`}
                        >
                          {option.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
