/**
 * Pinterest Pin Guide Page
 * URL: /guides/pinterest/[pinId]
 * @layer app
 */

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ContentViewer } from '@/widgets/content-viewer'
import { getServerUser } from '@/shared/lib/auth'

interface PinterestPinPageProps {
  params: Promise<{ pinId: string }>
}

export default async function PinterestPinPage({ params }: PinterestPinPageProps) {
  const { pinId } = await params
  const user = await getServerUser()

  // Валидация pinId (должен быть числовым для Pinterest)
  if (!pinId || !/^\d+$/.test(pinId)) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ContentViewer type="pin" id={pinId} user={user} />
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: PinterestPinPageProps): Promise<Metadata> {
  const { pinId } = await params

  return {
    title: `Pinterest Pin | Anirum`,
    description: 'Просмотр Pinterest пина в качестве гайда',
    openGraph: {
      title: `Pinterest Pin | Anirum`,
      description: 'Просмотр Pinterest пина в качестве гайда',
      type: 'article',
    },
  }
}