import { ViewedContentsPage } from "@/components/viewed-contents-page"
import { BottomNav } from "@/components/bottom-nav"

export default function ViewedContentsPageRoute() {
  return (
    <main className="mx-auto max-w-lg">
      <ViewedContentsPage />
      <BottomNav />
    </main>
  )
}
