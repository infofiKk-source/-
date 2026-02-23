import { StatsPage } from "@/components/stats-page"
import { BottomNav } from "@/components/bottom-nav"

export default function StatsPageRoute() {
  return (
    <main className="mx-auto max-w-lg">
      <StatsPage />
      <BottomNav />
    </main>
  )
}
