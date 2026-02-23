"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Mail, Lock } from "lucide-react"
import { signInWithEmail } from "@/lib/firebase/auth"
import { signInWithGoogle, signInWithNaver, signInWithKakao } from "@/lib/firebase/auth-social"
import { useRouter } from "next/navigation"

export function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("이메일과 비밀번호를 입력해주세요.")
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      await signInWithEmail(email, password)
      router.push("/feed")
    } catch (err: any) {
      let errorMessage = "로그인에 실패했습니다."
      
      if (err?.code === "auth/user-not-found") {
        errorMessage = "등록되지 않은 이메일입니다."
      } else if (err?.code === "auth/wrong-password") {
        errorMessage = "비밀번호가 올바르지 않습니다."
      } else if (err?.code === "auth/invalid-email") {
        errorMessage = "올바른 이메일 형식이 아닙니다."
      } else if (err?.message) {
        errorMessage = err.message
      }
      
      console.error("이메일 로그인 실패:", err)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await signInWithGoogle()
      router.push("/feed")
    } catch (err: any) {
      const errorMessage = err?.message || err?.code || "로그인에 실패했습니다."
      console.error("Google 로그인 실패:", err)
      setError(`Google 로그인 실패: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNaverSignIn = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await signInWithNaver()
      router.push("/feed")
    } catch (err: any) {
      const errorMessage = err?.message || err?.code || "로그인에 실패했습니다."
      console.error("네이버 로그인 실패:", err)
      setError(`네이버 로그인 실패: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKakaoSignIn = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await signInWithKakao()
      router.push("/feed")
    } catch (err: any) {
      const errorMessage = err?.message || err?.code || "로그인에 실패했습니다."
      console.error("카카오 로그인 실패:", err)
      setError(`카카오 로그인 실패: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-5 py-4">
          <Link
            href="/auth"
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted transition-colors"
            aria-label="뒤로 가기"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Link>
          <h1 className="text-lg font-semibold text-foreground">로그인</h1>
        </div>
      </header>

      <div className="px-5 pt-6">
        {/* 이메일/비밀번호 로그인 */}
        <section className="mb-8">
          <h2 className="mb-4 text-sm font-semibold text-foreground">로그인</h2>
          <div className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일"
                className="w-full rounded-2xl border border-border bg-card px-12 py-4 text-sm text-card-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                disabled={isLoading}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호"
                className="w-full rounded-2xl border border-border bg-card px-12 py-4 text-sm text-card-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleEmailLogin()
                  }
                }}
              />
            </div>
            <button
              type="button"
              onClick={handleEmailLogin}
              disabled={isLoading || !email.trim() || !password.trim()}
              className="w-full rounded-2xl bg-primary px-6 py-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {isLoading ? "로그인 중..." : "로그인"}
            </button>
          </div>
        </section>

        {/* 간편 로그인 */}
        <section className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex-1 border-t border-border" />
            <span className="text-xs text-muted-foreground">또는</span>
            <div className="flex-1 border-t border-border" />
          </div>
          <h2 className="mb-4 text-sm font-semibold text-foreground">간편 로그인</h2>
          <div className="flex flex-col gap-3">
            {/* Google 로그인 */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="flex items-center justify-center gap-3 rounded-2xl border border-border bg-card px-6 py-4 text-sm font-medium text-card-foreground transition-colors hover:bg-muted disabled:opacity-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Google로 계속하기</span>
            </button>

            {/* 네이버 로그인 */}
            <button
              type="button"
              onClick={handleNaverSignIn}
              disabled={isLoading}
              className="flex items-center justify-center gap-3 rounded-2xl border border-border bg-[#03C75A] px-6 py-4 text-sm font-medium text-white transition-colors hover:bg-[#02B350] disabled:opacity-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z" />
              </svg>
              <span>네이버로 계속하기</span>
            </button>

            {/* 카카오 로그인 */}
            <button
              type="button"
              onClick={handleKakaoSignIn}
              disabled={isLoading}
              className="flex items-center justify-center gap-3 rounded-2xl border border-border bg-[#FEE500] px-6 py-4 text-sm font-medium text-[#000000] transition-colors hover:bg-[#FDD835] disabled:opacity-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3C6.48 3 2 6.48 2 11c0 2.84 1.55 5.36 4 6.73V21l3.5-1.95c.5.08 1 .12 1.5.12 5.52 0 10-3.48 10-8s-4.48-8-10-8z" />
              </svg>
              <span>카카오로 계속하기</span>
            </button>
          </div>
        </section>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-6 rounded-2xl border border-destructive/50 bg-destructive/10 p-4">
            <p className="text-sm font-medium text-destructive">{error}</p>
          </div>
        )}

        {/* 회원가입 링크 */}
        <section>
          <div className="rounded-2xl border border-border bg-card p-5 text-center">
            <p className="text-sm text-muted-foreground">
              계정이 없으신가요?{" "}
              <Link href="/auth/signup" className="font-medium text-primary hover:underline">
                회원가입
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
