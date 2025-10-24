import { CourseEnrollmentProgress } from "@/shared/ui/course-enrollment-progress";
import { HeroSection } from "@/widgets/home-hero";
import { FeaturesSection } from "@/widgets/home-features/ui/FeaturesSection";
import { IntegrationsSection } from "@/widgets/home-integrations";
import { CommunityShareSection } from "@/widgets/community-share";
import { CtaSection } from "@/widgets/home-cta";
import { getServerUser } from "@/shared/lib/auth";
import { getServerPinterestStatus } from "@/shared/lib/pinterest";

export default async function Home() {
  // SSR: получаем данные на сервере перед рендером
  const user = await getServerUser();
  const initialPinterestStatus = user ? await getServerPinterestStatus() : null;

  return (
    <main className="pt-16">
      <HeroSection />
      <FeaturesSection />
      <CommunityShareSection />
      <IntegrationsSection user={user} pinterestStatus={initialPinterestStatus} />
      <CtaSection />
    </main>
  );
}
