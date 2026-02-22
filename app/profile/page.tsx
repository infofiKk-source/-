import { BottomNav } from "@/components/bottom-nav"
import { Heart, PenLine, BookOpen } from "lucide-react"

export default function ProfilePage() {
  return (
    <main className="mx-auto max-w-lg">
      <div className="flex min-h-[100dvh] flex-col bg-background pb-24">
        <header className="px-6 pt-14 pb-6">
          <h1 className="text-xl font-semibold text-foreground">내 공간</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            나의 감정 기록을 돌아보는 곳
          </p>
        </header>

        {/* Profile card */}
        <section className="px-5">
          <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <span className="text-xl font-bold text-primary">M</span>
            </div>
            <div>
              <p className="text-base font-semibold text-card-foreground">
                마음여행자
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                2026년 1월부터 함께한 여정
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="px-5 pt-6">
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-card p-4">
              <PenLine className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold text-card-foreground">12</span>
              <span className="text-xs text-muted-foreground">작성한 글</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-card p-4">
              <Heart className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold text-card-foreground">48</span>
              <span className="text-xs text-muted-foreground">받은 공감</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-card p-4">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold text-card-foreground">7</span>
              <span className="text-xs text-muted-foreground">읽은 콘텐츠</span>
            </div>
          </div>
        </section>

        {/* Recent emotions */}
        <section className="px-5 pt-6">
          <h2 className="mb-3 text-sm font-semibold text-foreground">
            최근 감정 흐름
          </h2>
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-end justify-between gap-2">
              {["외로움", "불안", "슬픔", "무기력", "외로움", "번아웃", "슬픔"].map(
                (emotion, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div
                      className="w-6 rounded-full bg-primary/20"
                      style={{
                        height: `${Math.max(20, Math.random() * 60 + 20)}px`,
                      }}
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {["월", "화", "수", "목", "금", "토", "일"][i]}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        {/* Encouragement */}
        <section className="mt-auto px-5 pt-8">
          <div className="rounded-2xl bg-warm-glow/40 p-5">
            <p className="font-serif text-sm leading-relaxed text-foreground/70 italic">
              {
                "\"꾸준히 자신의 마음을 돌보는 당신은 이미 충분히 강한 사람이에요.\""
              }
            </p>
          </div>
        </section>
      </div>
      <BottomNav />
    </main>
  )
}
