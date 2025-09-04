import { CoursesFilters } from "@/widgets/courses-filters";
import { CoursesCatalog } from "@/widgets/courses-catalog";

export default function CoursesPage() {
  return (
    <div className="mx-auto px-4 py-4 space-y-4">
      {/* Фильтры курсов - сверху */}
      <div className="flex justify-center">
        <CoursesFilters />
      </div>

      {/* Каталог курсов - снизу */}
      <CoursesCatalog />
    </div>
  );
}
