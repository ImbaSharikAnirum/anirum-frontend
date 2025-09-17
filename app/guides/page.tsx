import { getServerUser } from "@/shared/lib/auth"
import { getServerPinterestStatus } from "@/shared/lib/pinterest"
import { GuidesContent } from "@/widgets/guides-content"

/**
 * Серверный компонент страницы гайдов
 * Получает данные через SSR и передает в клиентский виджет
 */
export default async function GuidesPage() {
  // SSR: получаем данные на сервере перед рендером
  const user = await getServerUser()
  const initialPinterestStatus = user ? await getServerPinterestStatus() : null

  return (
    <GuidesContent
      user={user}
      initialPinterestStatus={initialPinterestStatus}
    />
  )
}