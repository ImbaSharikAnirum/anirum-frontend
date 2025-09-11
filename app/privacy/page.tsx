export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">Политика конфиденциальности</h1>
        <p className="text-lg text-gray-600">
          Дата последнего обновления: {new Date().toLocaleDateString('ru-RU')}
        </p>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg mb-8 border-l-4 border-gray-400">
        <h2 className="text-xl font-semibold mb-3 text-gray-900">Краткое описание</h2>
        <p className="text-gray-700">
          Мы уважаем вашу конфиденциальность и обязуемся защищать ваши персональные данные. 
          Эта политика объясняет, как мы собираем, используем и защищаем вашу информацию.
        </p>
      </div>

      <div className="space-y-8">
        {/* Оглавление */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Содержание</h2>
          <div className="grid md:grid-cols-2 gap-2 text-sm">
            <a href="#data-collection" className="text-gray-700 hover:underline">1. Сбор данных</a>
            <a href="#data-usage" className="text-gray-700 hover:underline">2. Использование данных</a>
            <a href="#data-sharing" className="text-gray-700 hover:underline">3. Передача данных</a>
            <a href="#data-security" className="text-gray-700 hover:underline">4. Безопасность данных</a>
            <a href="#cookies" className="text-gray-700 hover:underline">5. Файлы cookie</a>
            <a href="#user-rights" className="text-gray-700 hover:underline">6. Ваши права</a>
            <a href="#data-retention" className="text-gray-700 hover:underline">7. Хранение данных</a>
            <a href="#children-privacy" className="text-gray-700 hover:underline">8. Конфиденциальность детей</a>
            <a href="#international-transfers" className="text-gray-700 hover:underline">9. Международные передачи</a>
            <a href="#data-breach" className="text-gray-700 hover:underline">10. Нарушения безопасности</a>
            <a href="#third-party-services" className="text-gray-700 hover:underline">11. Сторонние сервисы</a>
            <a href="#updates" className="text-gray-700 hover:underline">12. Обновления политики</a>
            <a href="#contact" className="text-gray-700 hover:underline">13. Контактная информация</a>
          </div>
        </div>

        {/* 1. Сбор данных */}
        <section id="data-collection" className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">1. Какие данные мы собираем</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Данные, которые вы предоставляете:</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Имя и контактная информация (телефон, email)</li>
                <li>Возраст и предпочтения по обучению</li>
                <li>Информация об оплате услуг</li>
                <li>Сообщения и отзывы</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Данные, собираемые автоматически:</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>IP-адрес и информация о браузере</li>
                <li>Страницы, которые вы посещаете</li>
                <li>Время и продолжительность визитов</li>
                <li>Устройство и операционная система</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 2. Использование данных */}
        <section id="data-usage" className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">2. Как мы используем ваши данные</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Основные цели:</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Предоставление консультационных услуг</li>
                <li>Обработка записей и платежей</li>
                <li>Связь с вами по вопросам услуг</li>
                <li>Персонализация опыта обучения</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Дополнительные цели:</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Улучшение качества услуг</li>
                <li>Аналитика и статистика</li>
                <li>Техническая поддержка</li>
                <li>Соблюдение правовых требований</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 3. Передача данных */}
        <section id="data-sharing" className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">3. Передача данных третьим лицам</h2>
          <div className="bg-gray-50 p-4 rounded-lg mb-4 border-l-4 border-gray-400">
            <p className="text-gray-800 font-medium">
              Мы НЕ продаем, НЕ сдаем в аренду и НЕ передаем ваши персональные данные третьим лицам для маркетинговых целей.
            </p>
          </div>
          <p className="text-gray-700 mb-3">Передача данных возможна только в следующих случаях:</p>
          <ul className="list-disc pl-6 space-y-1 text-gray-700">
            <li>С вашего явного согласия</li>
            <li>По требованию законодательства РФ</li>
            <li>Поставщикам платежных услуг (только данные для оплаты)</li>
            <li>При продаже или реорганизации бизнеса (с уведомлением)</li>
          </ul>
        </section>

        {/* 4. Безопасность */}
        <section id="data-security" className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">4. Безопасность ваших данных</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Технические меры:</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Шифрование данных при передаче (SSL)</li>
                <li>Защищенные серверы и базы данных</li>
                <li>Регулярное обновление систем безопасности</li>
                <li>Ограниченный доступ к данным</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Организационные меры:</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Обучение персонала по защите данных</li>
                <li>Политики доступа к информации</li>
                <li>Регулярный аудит безопасности</li>
                <li>Планы реагирования на инциденты</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 5. Cookies */}
        <section id="cookies" className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">5. Файлы cookie и аналогичные технологии</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Типы используемых cookie:</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded">
                  <h4 className="font-medium text-gray-800">Необходимые cookie</h4>
                  <p className="text-sm text-gray-600">Обеспечивают работу сайта</p>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <h4 className="font-medium text-gray-800">Аналитические cookie</h4>
                  <p className="text-sm text-gray-600">Помогают улучшить сайт</p>
                </div>
              </div>
            </div>
            <p className="text-gray-700">
              Вы можете управлять cookie в настройках браузера. Отключение некоторых cookie может повлиять на функциональность сайта.
            </p>
          </div>
        </section>

        {/* 6. Права пользователей */}
        <section id="user-rights" className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">6. Ваши права в отношении персональных данных</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-gray-600 text-sm">✓</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Доступ к данным</h4>
                  <p className="text-sm text-gray-600">Получить копию ваших данных</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-gray-600 text-sm">✓</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Исправление данных</h4>
                  <p className="text-sm text-gray-600">Обновить неточную информацию</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-gray-600 text-sm">✓</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Удаление данных</h4>
                  <p className="text-sm text-gray-600">Запросить удаление ваших данных</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-gray-600 text-sm">✓</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Ограничение обработки</h4>
                  <p className="text-sm text-gray-600">Ограничить использование данных</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-gray-600 text-sm">✓</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Портируемость данных</h4>
                  <p className="text-sm text-gray-600">Получить данные в удобном формате</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-gray-600 text-sm">✓</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Отзыв согласия</h4>
                  <p className="text-sm text-gray-600">Отозвать ранее данное согласие</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Хранение данных */}
        <section id="data-retention" className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">7. Сроки хранения данных</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-medium text-gray-800">Данные активных клиентов</span>
              <span className="text-gray-600">Время предоставления услуг + 3 года</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-medium text-gray-800">Финансовые записи</span>
              <span className="text-gray-600">5 лет (требование законодательства)</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-medium text-gray-800">Данные веб-сайта</span>
              <span className="text-gray-600">2 года или до отзыва согласия</span>
            </div>
          </div>
        </section>

        {/* 8. Конфиденциальность детей */}
        <section id="children-privacy" className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">8. Защита конфиденциальности детей</h2>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-400">
              <p className="text-gray-800 font-medium">
                Наши услуги предназначены для лиц старше 13 лет. Мы не собираем персональные данные детей младше 13 лет намеренно.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Если вы родитель или опекун:</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Убедитесь, что ваш ребенок имеет ваше разрешение на использование сайта</li>
                <li>Контролируйте активность ребенка в интернете</li>
                <li>Свяжитесь с нами, если обнаружите, что мы собрали данные ребенка без согласия</li>
              </ul>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                Если нам станет известно, что мы собрали персональные данные ребенка младше 13 лет, 
                мы немедленно удалим эту информацию из наших систем.
              </p>
            </div>
          </div>
        </section>

        {/* 9. Международные передачи */}
        <section id="international-transfers" className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">9. Международные передачи данных</h2>
          <div className="space-y-4">
            <p className="text-gray-700">
              Ваши персональные данные обрабатываются на территории Российской Федерации. 
              В некоторых случаях данные могут передаваться в другие страны.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Случаи передачи:</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Использование международных платежных систем</li>
                  <li>Облачные сервисы для хранения данных</li>
                  <li>Аналитические сервисы (Google Analytics)</li>
                  <li>Служба поддержки и коммуникации</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Меры защиты:</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Соглашения о защите данных с поставщиками</li>
                  <li>Соответствие международным стандартам</li>
                  <li>Шифрование при передаче данных</li>
                  <li>Регулярный аудит безопасности</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 10. Нарушения безопасности */}
        <section id="data-breach" className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">10. Реагирование на нарушения безопасности</h2>
          <div className="space-y-4">
            <p className="text-gray-700">
              Мы принимаем серьезные меры для предотвращения утечек данных, но в случае инцидента 
              следуем четкому протоколу реагирования.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-700 mb-2">72 часа</div>
                <p className="text-sm text-gray-600">Максимальное время уведомления регулятора</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-700 mb-2">48 часов</div>
                <p className="text-sm text-gray-600">Время уведомления пользователей при высоком риске</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-700 mb-2">24/7</div>
                <p className="text-sm text-gray-600">Мониторинг систем безопасности</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Наши действия при нарушении:</h3>
              <div className="space-y-2">
                <div className="flex items-start space-x-3">
                  <span className="text-gray-600 font-bold">1.</span>
                  <p className="text-gray-700">Немедленное выявление и остановка нарушения</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-gray-600 font-bold">2.</span>
                  <p className="text-gray-700">Оценка масштаба и потенциального ущерба</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-gray-600 font-bold">3.</span>
                  <p className="text-gray-700">Уведомление регулирующих органов в установленные сроки</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-gray-600 font-bold">4.</span>
                  <p className="text-gray-700">Информирование затронутых пользователей</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-gray-600 font-bold">5.</span>
                  <p className="text-gray-700">Принятие мер по предотвращению повторных инцидентов</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 11. Сторонние сервисы */}
        <section id="third-party-services" className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">11. Интеграции со сторонними сервисами</h2>
          <div className="space-y-4">
            <p className="text-gray-700">
              Наш сайт использует различные сторонние сервисы для улучшения функциональности. 
              Каждый сервис имеет собственную политику конфиденциальности.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Платежные системы:</h3>
                <div className="space-y-2">
                  <div className="bg-gray-50 p-3 rounded">
                    <h4 className="font-medium text-gray-800">Тинькофф Банк</h4>
                    <p className="text-sm text-gray-600">Обработка платежей и финансовых данных</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <h4 className="font-medium text-gray-800">СБП (Система быстрых платежей)</h4>
                    <p className="text-sm text-gray-600">Мгновенные переводы между банками</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Аналитика и коммуникации:</h3>
                <div className="space-y-2">
                  <div className="bg-gray-50 p-3 rounded">
                    <h4 className="font-medium text-gray-800">Google Analytics</h4>
                    <p className="text-sm text-gray-600">Анализ посещаемости сайта</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <h4 className="font-medium text-gray-800">WhatsApp Business</h4>
                    <p className="text-sm text-gray-600">Коммуникация с клиентами</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-400">
              <p className="text-gray-700 text-sm">
                <strong>Важно:</strong> Мы рекомендуем ознакомиться с политиками конфиденциальности этих сервисов 
                на их официальных сайтах, так как мы не контролируем их практики обработки данных.
              </p>
            </div>
          </div>
        </section>

        {/* 12. Обновления политики */}
        <section id="updates" className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">12. Обновления и изменения политики</h2>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Типы изменений:</h3>
                <div className="space-y-2">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-gray-600 text-sm">•</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">Технические обновления</h4>
                      <p className="text-sm text-gray-600">Исправления и уточнения без изменения сути</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-gray-600 text-sm">!</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">Существенные изменения</h4>
                      <p className="text-sm text-gray-600">Изменения в способах обработки данных</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Процесс уведомления:</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p><strong>30 дней заранее</strong> - для существенных изменений</p>
                  <p><strong>Размещение на сайте</strong> - видимое уведомление</p>
                  <p><strong>Email-уведомления</strong> - зарегистрированным пользователям</p>
                  <p><strong>Архив изменений</strong> - история всех версий</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">Ваши действия при изменениях:</h4>
              <p className="text-gray-700 text-sm">
                Продолжение использования наших услуг после вступления изменений в силу означает 
                ваше согласие с обновленной политикой. Если вы не согласны с изменениями, 
                прекратите использование сайта и свяжитесь с нами для удаления ваших данных.
              </p>
            </div>
          </div>
        </section>

        {/* 13. Контакты */}
        <section id="contact" className="bg-gray-50 p-6 rounded-lg border">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">13. Связь с нами</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">По вопросам конфиденциальности:</h3>
              <div className="space-y-2 text-gray-700">
                <p><strong>WhatsApp:</strong> +7 (914) 270-14-11</p>
                <p><strong>Время ответа:</strong> в течение 48 часов</p>
                <p><strong>Ответственный:</strong> ИП Шарин И.В.</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Для реализации ваших прав:</h3>
              <p className="text-gray-700 text-sm">
                Мы обязуемся рассмотреть ваш запрос в течение 30 дней. 
                При обращении укажите ваше имя и опишите суть запроса.
              </p>
            </div>
          </div>
        </section>

        {/* Заключение */}
        <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-gray-400">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Заключительные положения</h3>
          <p className="text-gray-700 text-sm mb-2">
            Эта политика конфиденциальности составлена в соответствии с требованиями законодательства 
            Российской Федерации о персональных данных и международными стандартами защиты информации.
          </p>
          <p className="text-gray-700 text-sm">
            Дата вступления в силу: {new Date().toLocaleDateString('ru-RU')} | 
            Версия документа: 1.0 | 
            Следующий пересмотр: {new Date(Date.now() + 365*24*60*60*1000).toLocaleDateString('ru-RU')}
          </p>
        </div>
      </div>
    </div>
  )
}