import { getServerUser } from "@/shared/lib/auth";
import { getServerPinterestStatus } from "@/shared/lib/pinterest";
import { GuidesConnectPinterest } from "@/widgets/guides-connect-pinterest";
import { GuidesSearchBar } from "@/widgets/guides-search-bar";
import { GuidesGallery } from "@/widgets/guides-gallery";
import { GalleryViewProvider } from "@/shared/contexts/GalleryViewContext";

/**
 * Серверный компонент страницы гайдов
 * Получает данные через SSR и передает в клиентский виджет
 */
export default async function GuidesPage() {
  // SSR: получаем данные на сервере перед рендером
  const user = await getServerUser();
  const initialPinterestStatus = user ? await getServerPinterestStatus() : null;

  const isAuthenticated = !!user;
  const isPinterestConnected = initialPinterestStatus?.isConnected;

  return (
    <GalleryViewProvider defaultView="popular">
      <div className="mx-auto px-4 sm:px-6 md:px-8 py-8">
        <div className="space-y-8">
          {/* Поиск гайдов */}
          <div className="flex justify-center">
            <GuidesSearchBar user={user} pinterestStatus={initialPinterestStatus} />
          </div>

          {/* Галерея гайдов и пинов */}
          {isAuthenticated && (
            <div className="guides-gallery">
              <GuidesGallery user={user} pinterestStatus={initialPinterestStatus} />
            </div>
          )}
        </div>
      </div>
    </GalleryViewProvider>
  );
}
