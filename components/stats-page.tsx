"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, BarChart3, TrendingUp, Loader2 } from "lucide-react"
import { signInAnonymouslyUser, getCurrentUser } from "@/lib/firebase/auth"
import { getPostsLast30Days, aggregateByMood, aggregateByDate } from "@/lib/firebase/stats"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from "recharts"
import type { Emotion } from "@/lib/data"
import { emotions } from "@/lib/data"

export function StatsPage() {
  const [moodData, setMoodData] = useState<{ mood: Emotion; count: number }[]>([])
  const [dateData, setDateData] = useState<{ date: string; count: number }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // 익명 로그인
        let user = getCurrentUser()
        if (!user) {
          user = await signInAnonymouslyUser()
        }

        // 최근 30일 데이터 가져오기
        const posts = await getPostsLast30Days()

        // 감정별 집계
        const moodAggregated = aggregateByMood(posts)
        setMoodData(moodAggregated)

        // 날짜별 집계
        const dateAggregated = aggregateByDate(posts)
        setDateData(dateAggregated)
      } catch (err: any) {
        const errorMessage = err?.message || err?.code || "통계를 불러오는데 실패했습니다."
        console.error("통계 로드 실패:", {
          code: err?.code,
          message: err?.message,
          fullError: err,
        })
        setError(`오류: ${errorMessage}`)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [])

  // 날짜 포맷팅 (MM/DD)
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${month}/${day}`
  }

  // 감정 색상 매핑
  const getMoodColor = (mood: Emotion) => {
    const emotion = emotions.find((e) => e.label === mood)
    if (!emotion) return "#8884d8"
    
    // 색상 클래스에서 실제 색상 추출 (간단한 매핑)
    const colorMap: Record<string, string> = {
      "외로움": "#3b82f6", // blue
      "불안": "#f59e0b", // amber
      "번아웃": "#ef4444", // red
      "무기력": "#6b7280", // gray
      "이별": "#8b5cf6", // purple
      "낮은 자존감": "#10b981", // emerald
      "슬픔": "#6366f1", // indigo
      "분노": "#f97316", // orange
    }
    return colorMap[mood] || "#8884d8"
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-5 py-4">
          <Link
            href="/feed"
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted transition-colors"
            aria-label="피드로 돌아가기"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Link>
          <h1 className="text-lg font-semibold text-foreground">감정 통계</h1>
        </div>
      </header>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">통계를 불러오는 중...</p>
        </div>
      ) : error ? (
        <div className="mx-5 mt-6 rounded-2xl border border-destructive/50 bg-destructive/10 p-6">
          <p className="text-sm font-medium text-destructive">{error}</p>
          <p className="mt-2 text-xs text-destructive/70">
            네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요.
          </p>
        </div>
      ) : (
        <div className="px-5 pt-6 pb-6">
          {/* 감정별 통계 */}
          <section className="mb-8" aria-label="감정별 통계">
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">감정별 게시글 수</h2>
            </div>
            {moodData.length > 0 ? (
              <div className="rounded-2xl border border-border bg-card p-4">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={moodData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="mood"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {moodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getMoodColor(entry.mood)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-card p-8 text-center">
                <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">
                  최근 30일간 게시글이 없어요
                </p>
              </div>
            )}
          </section>

          {/* 날짜별 통계 */}
          <section aria-label="날짜별 통계">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">최근 30일 게시글 추이</h2>
            </div>
            {dateData.length > 0 ? (
              <div className="rounded-2xl border border-border bg-card p-4">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={dateData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10 }}
                      tickFormatter={formatDate}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      labelFormatter={(label) => formatDate(label)}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#8884d8"
                      strokeWidth={2}
                      dot={{ fill: "#8884d8", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-card p-8 text-center">
                <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">
                  최근 30일간 게시글이 없어요
                </p>
              </div>
            )}
          </section>

          {/* 요약 정보 */}
          {moodData.length > 0 && (
            <section className="mt-8" aria-label="요약 정보">
              <div className="rounded-2xl border border-border bg-card p-5">
                <h3 className="mb-4 text-sm font-semibold text-foreground">요약</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">총 게시글 수</span>
                    <span className="text-sm font-medium text-foreground">
                      {moodData.reduce((sum, item) => sum + item.count, 0)}개
                    </span>
                  </div>
                  {moodData.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">가장 많은 감정</span>
                      <span className="text-sm font-medium text-foreground">
                        {moodData[0].mood} ({moodData[0].count}개)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
