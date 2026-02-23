import { NextRequest, NextResponse } from "next/server"

/**
 * 텍스트를 embedding 벡터로 변환
 * 
 * 실제 프로덕션에서는 OpenAI API나 다른 embedding 서비스를 사용해야 합니다.
 * 현재는 간단한 텍스트 유사도 기반으로 구현합니다.
 */
export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    // TODO: 실제 embedding 서비스 연동
    // 현재는 간단한 해시 기반 벡터 생성 (실제로는 OpenAI embedding API 사용)
    // const embedding = await generateEmbedding(text)
    
    // 임시: 텍스트를 간단한 벡터로 변환 (실제로는 OpenAI API 사용)
    const embedding = generateSimpleEmbedding(text)

    return NextResponse.json({ embedding })
  } catch (error: any) {
    console.error("Embedding 생성 실패:", error)
    return NextResponse.json(
      { error: error.message || "Failed to generate embedding" },
      { status: 500 }
    )
  }
}

/**
 * 간단한 embedding 생성 (실제로는 OpenAI API 사용)
 * 실제 프로덕션에서는 OpenAI의 text-embedding-3-small 등을 사용해야 합니다.
 */
function generateSimpleEmbedding(text: string): number[] {
  // 간단한 해시 기반 벡터 생성 (실제로는 의미 기반 벡터여야 함)
  const vector: number[] = []
  const normalized = text.toLowerCase().normalize("NFC")
  
  // 128차원 벡터 생성
  for (let i = 0; i < 128; i++) {
    let hash = 0
    for (let j = 0; j < normalized.length; j++) {
      hash = ((hash << 5) - hash + normalized.charCodeAt(j) + i) | 0
    }
    vector.push(Math.sin(hash) * 0.5 + 0.5) // 0-1 범위로 정규화
  }
  
  return vector
}

/**
 * Cosine similarity 계산
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    return 0
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i]
    normA += vecA[i] * vecA[i]
    normB += vecB[i] * vecB[i]
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB)
  if (denominator === 0) {
    return 0
  }

  return dotProduct / denominator
}
