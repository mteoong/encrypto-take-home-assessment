import { Sidebar } from "@/components/sidebar"
import { LoanDetailPage } from "@/components/loan-detail-page"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface LoanDetailProps {
  params: Promise<{
    id: string
  }>
}

export default async function LoanDetail({ params }: LoanDetailProps) {
  const { id } = await params
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full">
        <div className="flex justify-start p-4 pb-0">
          <Link href="/">
            <Button variant="ghost" size="icon" className="bg-background/80 backdrop-blur-sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="flex-1 flex items-start justify-center px-4 pb-4 overflow-hidden">
          <LoanDetailPage loanId={id} />
        </div>
      </main>
    </div>
  )
}
