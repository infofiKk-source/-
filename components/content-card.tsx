import { ExternalLink } from "lucide-react"
import { EmotionBadge } from "@/components/emotion-tag"
import type { Content } from "@/src/data/sample"

export function ContentCard({ content }: { content: Content }) {
  return (
    <article className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-primary/70">{content.type}</span>
          </div>
          <h3 className="text-base font-semibold leading-relaxed text-card-foreground">
            {content.title}
          </h3>
        </div>
        {content.tags.length > 0 && (
          <EmotionBadge mood={content.tags[0]} />
        )}
      </div>

      <p className="font-serif text-sm leading-relaxed text-primary italic">
        {`"${content.comfort_line}"`}
      </p>

      <p className="text-xs leading-relaxed text-muted-foreground">
        {content.why}
      </p>

      <a
        href={content.link}
        className="mt-auto inline-flex items-center gap-1.5 self-start rounded-full bg-primary/10 px-4 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
      >
        <span>보러 가기</span>
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </article>
  )
}
