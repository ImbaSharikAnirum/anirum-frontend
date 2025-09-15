import { UnderDevelopment } from "@/shared/ui"
import { CourseEnrollmentProgress } from "@/shared/ui/course-enrollment-progress"

export default function Home() {

  return (
    <main className="flex flex-col items-center justify-center p-24 max-w-4xl mx-auto">
      <div className="text-center mb-12">
       <UnderDevelopment />
      </div>
    </main>
  )
}
