import { CourseForm } from '@/features/course-create'
import { AuthGuard, RoleGuard } from '@/shared/ui'

export default function CreateCoursePage() {
  return (
    <AuthGuard>
      <RoleGuard 
        allowedRoles={['Teacher', 'Manager']}
        accessDeniedTitle="Нет доступа к созданию курсов"
        accessDeniedMessage="Создавать курсы могут только преподаватели и менеджеры"
      >
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-8">Создать курс</h1>
          <CourseForm />
        </div>
      </RoleGuard>
    </AuthGuard>
  )
}