/**
 * Guide Detail Page
 * URL: /guides/[guideId]
 * @layer app
 */

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ContentViewer } from '@/widgets/content-viewer'
import { getServerUser } from '@/shared/lib/auth'

interface GuidePageProps {
  params: Promise<{ guideId: string }>
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { guideId } = await params
  const user = await getServerUser()

  // Валидация guideId (должен быть непустым)
  if (!guideId || guideId.trim() === '') {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ContentViewer type="guide" id={guideId} user={user} />
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { guideId } = await params

  return {
    title: `Гайд | Anirum`,
    description: 'Просмотр гайда',
    openGraph: {
      title: `Гайд | Anirum`,
      description: 'Просмотр гайда',
      type: 'article',
    },
  }
}
