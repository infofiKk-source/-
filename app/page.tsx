import { HomeHero } from "@/components/home-hero"
import { BottomNav } from "@/components/bottom-nav"

export default function HomePage() {
  return (
    <main className="mx-auto max-w-lg">
      <HomeHero />
      <BottomNav />
    </main>
  )
}
