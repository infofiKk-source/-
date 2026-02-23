import { DMListPage } from "@/components/dm-list-page"
import { BottomNav } from "@/components/bottom-nav"

export default function DMListPageRoute() {
  return (
    <main className="mx-auto max-w-lg">
      <DMListPage />
      <BottomNav />
    </main>
  )
}
