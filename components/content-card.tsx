import { ExternalLink } from "lucide-react"
import { EmotionBadge } from "@/components/emotion-tag"
import type { ContentCard as ContentCardType } from "@/lib/data"

export function ContentCard({ card }: { card: ContentCardType }) {
  return (
    <article className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold leading-relaxed text-card-foreground">
          {card.title}
        </h3>
        <EmotionBadge mood={card.emotion} />
      </div>

      <p className="font-serif text-sm leading-relaxed text-primary italic">
        {`"${card.comfort}"`}
      </p>

      <p className="text-xs leading-relaxed text-muted-foreground">
        {card.reason}
      </p>

      <a
        href={card.link}
        className="mt-auto inline-flex items-center gap-1.5 self-start rounded-full bg-primary/10 px-4 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
      >
        <span>읽으러 가기</span>
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </article>
  )
}
