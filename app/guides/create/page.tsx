/**
 * Страница создания гайда
 * @layer app
 */

export default function CreateGuidePage() {
  return (
    <div className="mx-auto px-4 sm:px-6 md:px-8 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-12">
          <div className="max-w-md mx-auto space-y-4">
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Создание гайда
              </h1>
              <p className="text-gray-600 mb-6">
                Функционал создания гайдов находится в разработке
              </p>
              <div className="text-sm text-gray-500">
                Скоро здесь появится форма для создания и редактирования гайдов с возможностью:
              </div>
              <ul className="text-sm text-gray-500 text-left mt-4 space-y-1">
                <li>• Загрузки изображений</li>
                <li>• Добавления описания и ссылок</li>
                <li>• Установки тегов</li>
                <li>• Предварительного просмотра</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}