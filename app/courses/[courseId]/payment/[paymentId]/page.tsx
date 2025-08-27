interface PaymentDetailsPageProps {
  params: Promise<{
    courseId: string
    paymentId: string
  }>
}

export default async function PaymentDetailsPage({ params }: PaymentDetailsPageProps) {
  const { courseId, paymentId } = await params
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Оплата {paymentId} для курса {courseId}</h1>
    </div>
  )
}