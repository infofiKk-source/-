"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { signInAnonymouslyUser, getCurrentUser } from "@/lib/firebase/auth"
import { useRouter } from "next/navigation"

export function AuthPage() {
  const router = useRouter()


  return (
    <div className="flex min-h-[100dvh] flex-col bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-5 py-4">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted transition-colors"
            aria-label="홈으로 돌아가기"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Link>
          <h1 className="text-lg font-semibold text-foreground">로그인 / 회원가입</h1>
        </div>
      </header>

      <div className="px-5 pt-6">
        {/* 메인 선택 */}
        <section className="mb-8">
          <div className="flex flex-col gap-3">
            <Link
              href="/auth/login"
              className="flex items-center justify-center gap-3 rounded-2xl border border-border bg-card px-6 py-4 text-sm font-medium text-card-foreground transition-colors hover:bg-muted"
            >
              <span>로그인</span>
            </Link>
            <Link
              href="/auth/signup"
              className="flex items-center justify-center gap-3 rounded-2xl bg-primary px-6 py-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <span>회원가입</span>
            </Link>
          </div>
        </section>

        {/* 익명 로그인 */}
        <section>
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="mb-3 text-sm font-medium text-card-foreground">
              익명으로 시작하기
            </p>
            <p className="mb-4 text-xs text-muted-foreground">
              회원가입 없이 익명으로 서비스를 이용할 수 있습니다.
            </p>
            <button
              type="button"
              onClick={async () => {
                try {
                  const user = getCurrentUser()
                  if (!user) {
                    await signInAnonymouslyUser()
                  }
                  router.push("/feed")
                } catch (err: any) {
                  console.error("익명 로그인 실패:", err)
                }
              }}
              className="w-full rounded-2xl border border-border bg-background px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              익명으로 계속하기
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
