import { DailyPage } from "@/components/daily-page"
import { BottomNav } from "@/components/bottom-nav"

export default function DailyPageRoute() {
  return (
    <main className="mx-auto max-w-lg">
      <DailyPage />
      <BottomNav />
    </main>
  )
}
