import { FeedContent } from "@/components/feed-content"
import { BottomNav } from "@/components/bottom-nav"

export default function FeedPage() {
  return (
    <main className="mx-auto max-w-lg">
      <FeedContent />
      <BottomNav />
    </main>
  )
}
