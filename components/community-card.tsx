import Link from "next/link"
import { Heart, MessageCircle } from "lucide-react"
import { EmotionBadge } from "@/components/emotion-tag"
import type { CommunityPost } from "@/lib/data"

export function CommunityCard({ post }: { post: CommunityPost }) {
  return (
    <Link href={`/post/${post.id}`}>
      <article className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
        <div className="flex items-center justify-between">
          <EmotionBadge mood={post.mood} />
          <span className="text-xs text-muted-foreground">{post.createdAt}</span>
        </div>

        <p className="text-sm leading-relaxed text-card-foreground line-clamp-3">
          {post.summary}
        </p>

        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="text-xs text-muted-foreground">{post.author}</span>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Heart className="h-3.5 w-3.5" />
              {post.empathyCount}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <MessageCircle className="h-3.5 w-3.5" />
              {post.commentCount}
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
