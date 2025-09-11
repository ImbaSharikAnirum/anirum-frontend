export default function CompanyPage() {
  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">Реквизиты компании</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Официальные данные творческой студии для делового сотрудничества
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Основная информация */}
        <div className="bg-gray-50 p-8 rounded-xl border">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 border-b border-gray-200 pb-3">
            Основные данные
          </h2>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-2">Полное наименование</h3>
              <p className="text-gray-700">
                Индивидуальный предприниматель<br />
                <span className="font-bold text-lg text-blue-900">Шарин Игорь Владимирович</span>
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-2">Государственная регистрация</h3>
              <div className="space-y-2">
                <p className="text-gray-700"><span className="font-medium">ИНН:</span> 142300870631</p>
                <p className="text-gray-700"><span className="font-medium">ОГРНИП:</span> 317144700004547</p>
                <p className="text-gray-700"><span className="font-medium">Статус:</span> Действующий ИП</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-2">Юридический адрес</h3>
              <p className="text-gray-700">
                677021, Россия, Республика Саха (Якутия)<br />
                г. Якутск, ул. Ленина, д. 1, каб. 607
              </p>
            </div>
          </div>
        </div>

        {/* Банковские реквизиты */}
        <div className="bg-gray-50 p-8 rounded-xl border">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 border-b border-gray-200 pb-3">
            Банковские реквизиты
          </h2>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-2">Расчетный счет</h3>
              <p className="text-gray-700 font-mono text-lg tracking-wider">
                40802810200003306559
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-2">Банк получателя</h3>
              <div className="space-y-2">
                <p className="text-gray-700 font-medium">АО "ТИНЬКОФФ БАНК"</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">ИНН банка:</span><br />
                    <span className="text-gray-800">7710140679</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">БИК банка:</span><br />
                    <span className="text-gray-800">044525974</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-2">Корреспондентский счет</h3>
              <p className="text-gray-700 font-mono tracking-wider">
                30101810145250000974
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-2">Адрес банка</h3>
              <p className="text-gray-700 text-sm">
                г. Москва, 127287<br />
                ул. Хуторская 2-я, д. 38А, стр. 26
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Дополнительная информация */}
      <div className="mt-12 bg-gray-50 p-8 rounded-xl border">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 text-center">
          Дополнительная информация
        </h2>
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-3xl font-bold text-gray-900 mb-2">2017</div>
            <p className="text-gray-700 font-medium">Год основания</p>
            <p className="text-sm text-gray-600 mt-1">Более 7 лет опыта</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-3xl font-bold text-gray-900 mb-2">Якутск</div>
            <p className="text-gray-700 font-medium">Город работы</p>
            <p className="text-sm text-gray-600 mt-1">Республика Саха (Якутия)</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-3xl font-bold text-gray-900 mb-2">ИП</div>
            <p className="text-gray-700 font-medium">Форма деятельности</p>
            <p className="text-sm text-gray-600 mt-1">Официально зарегистрировано</p>
          </div>
        </div>
      </div>

      {/* Контактная информация */}
      <div className="mt-8 text-center bg-gray-50 p-6 rounded-xl border">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Контактная информация
        </h3>
        <p className="text-gray-700">
          Для получения документов и деловых вопросов: 
          <span className="font-semibold text-blue-700 ml-2">+7 (914) 270-14-11</span>
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Время работы: понедельник - пятница, 10:00 - 18:00
        </p>
        <p className="text-xs text-gray-500 mt-1">
          ИНН: 142300870631 | ОГРНИП: 317144700004547
        </p>
      </div>
    </div>
  )
}