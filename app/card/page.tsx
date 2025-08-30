import { Sidebar } from "@/components/sidebar"
import { CardPage } from "@/components/card-page"

export default function Card() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <CardPage />
      </main>
    </div>
  )
}
