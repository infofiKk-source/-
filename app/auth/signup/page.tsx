import { SignupPage } from "@/components/signup-page"
import { BottomNav } from "@/components/bottom-nav"

export default function SignupPageRoute() {
  return (
    <main className="mx-auto max-w-lg">
      <SignupPage />
      <BottomNav />
    </main>
  )
}
