import { LoginPage } from "@/components/login-page"
import { BottomNav } from "@/components/bottom-nav"

export default function LoginPageRoute() {
  return (
    <main className="mx-auto max-w-lg">
      <LoginPage />
      <BottomNav />
    </main>
  )
}
