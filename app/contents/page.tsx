import { ContentsPage } from "@/components/contents-page"
import { BottomNav } from "@/components/bottom-nav"

export default function ContentsPageRoute() {
  return (
    <main className="mx-auto max-w-lg">
      <ContentsPage />
      <BottomNav />
    </main>
  )
}
