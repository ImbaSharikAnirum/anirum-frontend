import { CourseEnrollmentProgress } from "@/shared/ui/course-enrollment-progress";
import { HeroSection } from "@/widgets/home-hero";
import { FeaturesSection } from "@/widgets/home-features/ui/FeaturesSection";
import { IntegrationsSection } from "@/widgets/home-integrations";
import { CommunityShareSection } from "@/widgets/community-share";
import { CtaSection } from "@/widgets/home-cta";

export default function Home() {
  return (
    <main className="pt-16">
      <HeroSection />
      <FeaturesSection />
      <CommunityShareSection />
      <IntegrationsSection />
      <CtaSection />
    </main>
  );
}
