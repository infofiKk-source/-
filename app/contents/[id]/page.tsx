import { ContentDetailPage } from "@/components/content-detail-page"
import { BottomNav } from "@/components/bottom-nav"
import { notFound } from "next/navigation"
import { getContentsByMood } from "@/lib/firebase/contents"
import { contents as sampleContents } from "@/src/data/sample"

export default async function ContentDetailPageRoute({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // Firebase에서 먼저 찾기
  let content = null
  try {
    // 모든 감정으로 검색 (더 효율적인 방법이 필요할 수 있음)
    const allContents = await getContentsByMood("외로움", 100) // 임시로 큰 limit
    content = allContents.find((c) => c.id === id) || null
  } catch (error) {
    console.error("Firebase에서 콘텐츠 가져오기 실패:", error)
  }

  // Firebase에서 못 찾으면 샘플 데이터에서 찾기
  if (!content) {
    content = sampleContents.find((c) => c.id === id) || null
  }

  if (!content) {
    notFound()
  }

  return (
    <main className="mx-auto max-w-lg">
      <ContentDetailPage content={content} />
      <BottomNav />
    </main>
  )
}
