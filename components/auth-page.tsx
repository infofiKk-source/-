"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Mail, Phone, Lock } from "lucide-react"
import { signInWithGoogle, signInWithNaver, signInWithKakao } from "@/lib/firebase/auth-social"
import { signInAnonymouslyUser, getCurrentUser } from "@/lib/firebase/auth"
import { useRouter } from "next/navigation"

export function AuthPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [step, setStep] = useState<"phone" | "verify">("phone")

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

  const handlePhoneSubmit = async () => {
    if (!phoneNumber.trim()) {
      setError("전화번호를 입력해주세요.")
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      // TODO: PASS 인증 API 호출
      // 실제로는 PASS 인증 서비스와 연동 필요
      alert("PASS 인증 기능은 준비 중입니다. 현재는 소셜 로그인을 이용해주세요.")
      setIsLoading(false)
    } catch (err: any) {
      const errorMessage = err?.message || err?.code || "인증에 실패했습니다."
      console.error("전화번호 인증 실패:", err)
      setError(`인증 실패: ${errorMessage}`)
      setIsLoading(false)
    }
  }

  const handleContinueAsGuest = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const user = getCurrentUser()
      if (!user) {
        await signInAnonymouslyUser()
      }
      router.push("/feed")
    } catch (err: any) {
      const errorMessage = err?.message || err?.code || "익명 로그인에 실패했습니다."
      console.error("익명 로그인 실패:", err)
      setError(`익명 로그인 실패: ${errorMessage}`)
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
        {/* 소셜 로그인 */}
        <section className="mb-8">
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

        {/* 전화번호 인증 (PASS) */}
        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">전화번호 인증</h2>
            <span className="text-xs text-muted-foreground">PASS 앱 연동</span>
          </div>
          {step === "phone" ? (
            <div className="space-y-3">
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="010-1234-5678"
                  className="w-full rounded-2xl border border-border bg-card px-12 py-4 text-sm text-card-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  disabled={isLoading}
                />
              </div>
              <button
                type="button"
                onClick={handlePhoneSubmit}
                disabled={isLoading || !phoneNumber.trim()}
                className="w-full rounded-2xl bg-primary px-6 py-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {isLoading ? "처리 중..." : "PASS 인증하기"}
              </button>
              <p className="text-xs text-muted-foreground">
                PASS 앱을 통해 본인인증을 진행합니다. 스팸 방지를 위해 필요합니다.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="인증번호 입력"
                  className="w-full rounded-2xl border border-border bg-card px-12 py-4 text-sm text-card-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  disabled={isLoading}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep("phone")}
                  className="flex-1 rounded-2xl border border-border bg-card px-6 py-4 text-sm font-medium text-card-foreground transition-colors hover:bg-muted"
                >
                  뒤로
                </button>
                <button
                  type="button"
                  onClick={handlePhoneSubmit}
                  disabled={isLoading || !verificationCode.trim()}
                  className="flex-1 rounded-2xl bg-primary px-6 py-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {isLoading ? "인증 중..." : "인증 완료"}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-6 rounded-2xl border border-destructive/50 bg-destructive/10 p-4">
            <p className="text-sm font-medium text-destructive">{error}</p>
          </div>
        )}

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
              onClick={handleContinueAsGuest}
              disabled={isLoading}
              className="w-full rounded-2xl border border-border bg-background px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
            >
              익명으로 계속하기
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
