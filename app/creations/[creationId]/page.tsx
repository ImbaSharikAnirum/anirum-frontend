/**
 * Creation Detail Page
 * URL: /creations/[creationId]
 * @layer app
 */

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { CreationViewer } from '@/widgets/creation-viewer'
import { getServerUser } from '@/shared/lib/auth'

interface CreationPageProps {
  params: Promise<{ creationId: string }>
}

export default async function CreationPage({ params }: CreationPageProps) {
  const { creationId } = await params
  const user = await getServerUser()

  // Валидация creationId
  if (!creationId || creationId.trim() === '') {
    notFound()
  }

  return <CreationViewer creationId={creationId} user={user} />
}

export async function generateMetadata({
  params,
}: CreationPageProps): Promise<Metadata> {
  const { creationId } = await params

  return {
    title: `Креатив | Anirum`,
    description: 'Просмотр креатива',
    openGraph: {
      title: `Креатив | Anirum`,
      description: 'Просмотр креатива',
      type: 'article',
    },
  }
}
