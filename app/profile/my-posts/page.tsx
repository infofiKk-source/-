import { MyPostsPage } from "@/components/my-posts-page"
import { BottomNav } from "@/components/bottom-nav"

export default function MyPostsPageRoute() {
  return (
    <main className="mx-auto max-w-lg">
      <MyPostsPage />
      <BottomNav />
    </main>
  )
}
