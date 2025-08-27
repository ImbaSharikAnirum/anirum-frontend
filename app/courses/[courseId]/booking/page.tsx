interface BookingPageProps {
  params: Promise<{
    courseId: string
  }>
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { courseId } = await params
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Бронирование курса {courseId}</h1>
    </div>
  )
}