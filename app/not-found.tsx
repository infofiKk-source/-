import Link from "next/link"
import { Home } from "lucide-react"

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-lg flex-col items-center justify-center gap-6 bg-background px-6">
      <div className="text-center">
        <p className="font-serif text-6xl font-semibold text-primary/30">404</p>
        <h1 className="mt-4 text-lg font-semibold text-foreground">
          페이지를 찾을 수 없어요
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          찾고 계신 이야기가 여기에는 없는 것 같아요.
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:shadow-md"
      >
        <Home className="h-4 w-4" />
        <span>홈으로 돌아가기</span>
      </Link>
    </main>
  )
}
