"use client";

import React, { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";

interface CardData {
  category: string;
  title: string;
  description: string;
  image: string;
  percentage: string;
  color: string;
  detailedDescription?: string;
}

export function CommunityShareSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const cards: CardData[] = [
    {
      category: "Совместное обучение",
      title: "Совместная проверка работ",
      description: "Выбирай лучший креатив из трёх или проверяй выполнение гайда — помогай сообществу расти вместе",
      image: "/home/features_guide4.jpeg",
      percentage: "Скоро",
      color: "from-cyan-500 to-teal-600",
      detailedDescription: "Креативы — это работы студентов по гайдам платформы. Система предложит тебе два формата проверки: выбрать лучший креатив из трёх представленных или оценить, выполнен ли гайд в загруженной работе. Проверяя работы других студентов, ты помогаешь комьюнити расти и обеспечиваешь максимально быструю обратную связь для всех участников. За активное участие в проверке ты получаешь баллы опыта и повышаешь свой рейтинг, становясь экспертом сообщества.",
    },
    {
      category: "Прогресс",
      title: "Повышение рейтинга по проверенным работам",
      description: "Получай LVL за каждый проверенный сообществом креатив и открывай новые возможности",
      image: "/home/features_guide5.jpeg",
      percentage: "Скоро",
      color: "from-lime-500 to-green-600",
      detailedDescription: "За каждый выполненный и проверенный сообществом гайд ты получаешь опыт и повышаешь свой LVL. Система уровней отражает твой прогресс и активность на платформе. С ростом уровня открываются различные плюшки: доступ к эксклюзивным гайдам, приоритет при модерации твоих креативов, возможность участвовать в закрытых мастер-классах, специальные бейджи в профиле и многое другое. Чем выше твой LVL, тем больше возможностей для роста и развития!",
    },
    {
      category: "Творчество",
      title: "Выполняй авторские работы",
      description: "Создавай креативы по гайдам от верифицированных авторов и помогай им зарабатывать на контенте",
      image: "/home/features_guide1.jpeg",
      percentage: "Скоро",
      color: "from-amber-500 to-orange-600",
      detailedDescription: "Сейчас гайды может загрузить каждый, но мы выявляем авторов самого оригинального и качественного контента. Авторские работы от популярных художников, блогеров и специалистов индустрии будут отмечены специальным значком. За каждый выполненный студентом авторский гайд создатель получает вознаграждение — это мотивирует профессионалов создавать больше учебного материала. Выполняя авторские гайды, ты не только развиваешь навыки, но и поддерживаешь создателей качественного образовательного контента.",
    },
    {
      category: "Голосование",
      title: "Голосуй за автора от которого ты хочешь гайды",
      description: "Влияй на создание нового контента — поддержи любимых авторов своим голосом",
      image: "/home/features_guide2.jpeg",
      percentage: "Скоро",
      color: "from-rose-500 to-pink-600",
      detailedDescription: "Сообщество решает, какой контент создавать в первую очередь. Голосуй за авторов, чьи гайды ты хочешь видеть на платформе. Авторы с наибольшим количеством голосов получают приоритет в создании нового контента и дополнительную поддержку от платформы. Твой голос влияет на развитие образовательной программы!",
    },
    {
      category: "Рейтинг и голосование",
      title: "Сообщество выбирает лучшие работы",
      description:
        "Твой креатив выбирают как лучший из трёх — получай признание и эксклюзивные награды",
      image: "/home/features_guide3.jpeg",
      percentage: "Скоро",
      color: "from-yellow-500 to-orange-600",
      detailedDescription: "Когда студенты проверяют креативы, они выбирают лучшую работу из трёх представленных. Если твой креатив регулярно выбирают как лучший, ты попадаешь в топ сообщества и получаешь различные плюшки. Система отслеживает процент побед твоих работ и формирует рейтинг лучших креативов платформы. Чем чаще сообщество выбирает твои работы, тем выше твой авторитет и тем больше эксклюзивных возможностей откроется для тебя в будущем!",
    },
    {
      category: "Портфолио",
      title: "Создавай профессиональное портфолио",
      description: "Все твои работы в одном месте — покажи их миру",
      image: "/home/features_guide4.jpeg",
      percentage: "Скоро",
      color: "from-pink-500 to-rose-600",
      detailedDescription: "Твой профиль на Anirum — это полноценное онлайн-портфолио, оптимизированное для демонстрации твоих навыков. Красивая презентация работ, интеграция с социальными сетями, детальное описание процесса создания и использованных техник. Работодатели смогут увидеть не только финальный результат, но и твой путь развития, что особенно важно для джуниор-позиций.",
    },
    {
      category: "Распределение доходов",
      title: "Авторские гайды получают 50%",
      description: "Половина всех доходов идет напрямую создателям контента",
      image: "/home/features_guide1.jpeg",
      percentage: "50%",
      color: "from-violet-500 to-purple-600",
      detailedDescription: "Мы верим, что авторы качественного контента заслуживают справедливого вознаграждения. Половина всех доходов от платных гайдов идет напрямую их создателям. Это мотивирует профессионалов делиться знаниями и создавать действительно полезный контент. Прозрачная система выплат и детальная аналитика позволяют авторам отслеживать свой доход и понимать, какой контент наиболее востребован сообществом.",
    },
    {
      category: "Инфраструктура",
      title: "Поддержка платформы — 30%",
      description: "Обеспечиваем стабильную работу сервиса и техподдержку",
      image: "/home/features_guide2.jpeg",
      percentage: "30%",
      color: "from-blue-500 to-cyan-600",
      detailedDescription: "30% доходов инвестируется в развитие и поддержку платформы: серверы, CDN для быстрой загрузки контента, техническая поддержка 24/7, регулярные обновления и новые функции. Мы также инвестируем в безопасность данных, модерацию контента и развитие инструментов для авторов. Наша цель — создать стабильную и удобную среду для обучения и творчества.",
    },
    {
      category: "Развитие контента",
      title: "Новый материал — 20%",
      description: "Закупаем материалы и расширяем бесплатную библиотеку",
      image: "/home/features_guide3.jpeg",
      percentage: "20%",
      color: "from-emerald-500 to-teal-600",
      detailedDescription: "20% средств направляется на вклад в образование. Мы регулярно пополняем библиотеку референсов, моделей для обучения и текстур, создаем бесплатный контент и развиваем образовательные ресурсы платформы. Каждый должен иметь доступ к качественным материалам для обучения!",
    },
  ];

  return (
    <section className="relative w-full bg-white pt-16 sm:pt-24 pb-8 sm:pb-12">
      {/* Заголовок */}
      <div className="container mx-auto px-4">
        <div className="mb-10 grid grid-cols-1 md:grid-cols-[1.2fr_1.3fr] gap-8 items-start">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
              Поделись своим результатом
              <br />
              перед сообществом
            </h2>
          </div>
          <div className="text-slate-700">
            <p>
              Прибыль от загрузки ваших работ компания распределит между
              авторскими гайдами, поддержкой платформы и закупкой нового
              материала. Тем самым увеличивая учебный материал который в
              открытом доступе для просмотра.
            </p>
          </div>
        </div>
      </div>

      {/* Горизонтальный скролл */}
      <div className="relative group overflow-hidden">
        {/* Кнопки */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-50"
        >
          <ChevronLeft className="w-5 h-5 text-slate-700" />
        </button>
        <button
          onClick={() => scroll("right")}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-50"
        >
          <ChevronRight className="w-5 h-5 text-slate-700" />
        </button>

        {/* Скроллящийся ряд карточек */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            /**
             * 💡 Выравнивание с контейнером:
             * - Карточки начинаются с края контейнера (слева)
             * - Уходят за край экрана вправо
             * - При скролле влево - также уходят за край экрана
             */
            "--container-max": "1280px", // Tailwind container max-width
            paddingLeft:
              "calc((100vw - min(100vw, var(--container-max))) / 2 + 1rem)",
            paddingRight:
              "calc((100vw - min(100vw, var(--container-max))) / 2 + 1rem)",
          } as React.CSSProperties}
        >
            {cards.map((card, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-[340px] sm:w-[400px] h-[520px] group/card cursor-pointer"
              >
                <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 hover:border-slate-300 transition-all duration-300 hover:shadow-xl h-full flex flex-col">
                  {/* Превью */}
                  <div className="relative h-[280px] bg-slate-100 overflow-hidden flex-shrink-0">
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      className="object-cover group-hover/card:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg">
                      <span
                        className={`text-sm font-bold bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}
                      >
                        {card.percentage}
                      </span>
                    </div>
                  </div>

                  {/* Контент */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                      {card.category}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight">
                      {card.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed flex-1">
                      {card.description}
                    </p>
                    <button
                      onClick={() => setSelectedCard(card)}
                      className="mt-4 flex items-center text-slate-900 font-medium group-hover/card:translate-x-1 transition-transform hover:text-slate-700"
                    >
                      <span className="text-sm">Подробнее</span>
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* Скрытие скроллбара */}
        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>

      {/* Модальное окно */}
      {selectedCard && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedCard(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Изображение */}
            <div className="relative h-64 bg-slate-100">
              <Image
                src={selectedCard.image}
                alt={selectedCard.title}
                fill
                className="object-cover"
              />
              <button
                onClick={() => setSelectedCard(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
              >
                <X className="w-5 h-5 text-slate-900" />
              </button>
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                <span
                  className={`text-xl font-bold bg-gradient-to-r ${selectedCard.color} bg-clip-text text-transparent`}
                >
                  {selectedCard.percentage}
                </span>
              </div>
            </div>

            {/* Контент */}
            <div className="p-8">
              <div className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                {selectedCard.category}
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4 leading-tight">
                {selectedCard.title}
              </h2>
              <p className="text-base text-slate-700 leading-relaxed whitespace-pre-line">
                {selectedCard.detailedDescription || selectedCard.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
