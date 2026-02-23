import { DMChatPage } from "@/components/dm-chat-page"
import { BottomNav } from "@/components/bottom-nav"

export default function DMChatPageRoute({
  params,
}: {
  params: Promise<{ conversationId: string }>
}) {
  return (
    <main className="mx-auto max-w-lg">
      <DMChatPage params={params} />
      <BottomNav />
    </main>
  )
}
