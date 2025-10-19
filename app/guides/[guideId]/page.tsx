/**
 * Guide Detail Page
 * URL: /guides/[guideId]
 * @layer app
 */

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ContentViewer } from "@/widgets/content-viewer";
import { MyGuideCreations } from "@/widgets/my-guide-creations";
import { GuideCreations } from "@/widgets/guide-creations";
import { getServerUser } from "@/shared/lib/auth";

interface GuidePageProps {
  params: Promise<{ guideId: string }>;
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { guideId } = await params;
  const user = await getServerUser();

  // Валидация guideId (должен быть непустым)
  if (!guideId || guideId.trim() === "") {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto px-4 sm:px-6 md:px-8 py-8">
        <ContentViewer type="guide" id={guideId} user={user} />

        {/* Креативы по данному гайду */}
        {/* Мои креативы по этому гайду */}
        <MyGuideCreations guideId={guideId} user={user} />

        {/* Креативы сообщества по этому гайду */}
        <GuideCreations guideId={guideId} user={user} />
      </div>
    </div>
  );
}

export async function generateMetadata({
  params,
}: GuidePageProps): Promise<Metadata> {
  const { guideId } = await params;

  return {
    title: `Гайд | Anirum`,
    description: "Просмотр гайда",
    openGraph: {
      title: `Гайд | Anirum`,
      description: "Просмотр гайда",
      type: "article",
    },
  };
}
