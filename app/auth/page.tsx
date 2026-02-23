import { AuthPage } from "@/components/auth-page"
import { BottomNav } from "@/components/bottom-nav"

export default function AuthPageRoute() {
  return (
    <main className="mx-auto max-w-lg">
      <AuthPage />
      <BottomNav />
    </main>
  )
}
