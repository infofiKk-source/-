/**
 * Firestore posts 컬렉션에 시드 데이터를 추가하는 스크립트
 * 
 * 실행 방법:
 * 1. 터미널에서 프로젝트 루트 디렉토리로 이동
 * 2. 다음 명령어 실행:
 *    npx tsx scripts/seedPosts.ts
 * 
 * 또는 ts-node를 사용:
 *    npx ts-node scripts/seedPosts.ts
 * 
 * 주의사항:
 * - Firebase 설정이 올바르게 되어 있어야 합니다 (lib/firebase/config.ts)
 * - 중복된 link + reason 조합은 자동으로 건너뜁니다
 */

import { collection, addDoc, getDocs, query, where, serverTimestamp, Timestamp } from "firebase/firestore"
import { db } from "../lib/firebase/config"

// 시드 데이터
const seedPosts = [
  {
    emotion: "낮은 자존감",
    link: "https://youtu.be/U8HG32IZmto?si=E1ZXxgAnwMJudxt3",
    reason: "낮은 자존감을 가진 사람들의 특징이 너무 제 얘기 같아서 위로가 됐어요."
  },
  {
    emotion: "낮은 자존감",
    link: "https://youtu.be/E_rcMfy_-4s?si=Ft-X3cc4Okfe33v7",
    reason: "연애하면서 자존감이 낮아지는 과정이 너무 공감돼서 마음이 정리됐어요."
  },
  {
    emotion: "불안",
    link: "https://youtu.be/1RWqCaGics4?si=sG6zoF4kxUozCt_V",
    reason: "연애에서 불안형의 모습이 잘 그려져 있어서 제 감정을 이해받는 느낌이었어요."
  },
  {
    emotion: "불안",
    link: "https://youtu.be/pBCCrmVYPss?si=tRYNhN9j1v4vFCHp",
    reason: "불안형 연애가 딱 저 같아서 혼자가 아니라는 느낌이 들었어요."
  },
  {
    emotion: "슬픔",
    link: "https://youtu.be/pBCCrmVYPss?si=tRYNhN9j1v4vFCHp",
    reason: "이별하는 모습이 너무 슬퍼서 제 마음을 대신 표현해주는 것 같았어요."
  },
  {
    emotion: "슬픔",
    link: "https://youtu.be/E_rcMfy_-4s?si=Ft-X3cc4Okfe33v7",
    reason: "노래 가사가 이별하는 제 마음 같아서 울면서도 위로받았어요."
  }
]

// 랜덤 익명 닉네임 생성
function generateAnonymousName(index: number): string {
  const names = ["익명", "익명2", "익명3", "익명4", "익명5", "익명6"]
  return names[index] || `익명${index + 1}`
}

// OpenGraph 메타데이터 추출 (간단한 버전)
async function fetchLinkMeta(url: string): Promise<{ title?: string; image?: string; site?: string } | null> {
  try {
    // URL 정규화
    let targetUrl = url
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      targetUrl = `https://${url}`
    }

    // YouTube URL인 경우 간단한 메타데이터 반환
    if (targetUrl.includes("youtube.com") || targetUrl.includes("youtu.be")) {
      return {
        title: "YouTube 영상",
        image: "",
        site: "YouTube"
      }
    }

    // 일반 URL의 경우 fetch 시도 (타임아웃 설정)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    try {
      const response = await fetch(targetUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        return null
      }

      const html = await response.text()

      // OpenGraph 메타데이터 파싱
      const ogData: { title?: string; image?: string; site?: string } = {}

      // og:title
      const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i)
      if (ogTitleMatch) {
        ogData.title = ogTitleMatch[1]
      }

      // og:image
      const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i)
      if (ogImageMatch) {
        ogData.image = ogImageMatch[1]
      }

      // og:site_name
      const ogSiteMatch = html.match(/<meta\s+property=["']og:site_name["']\s+content=["']([^"']+)["']/i)
      if (ogSiteMatch) {
        ogData.site = ogSiteMatch[1]
      }

      // Fallback: title 태그
      if (!ogData.title) {
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
        if (titleMatch) {
          ogData.title = titleMatch[1]
        }
      }

      return Object.keys(ogData).length > 0 ? ogData : null
    } catch (fetchError) {
      clearTimeout(timeoutId)
      return null
    }
  } catch (error) {
    console.warn(`링크 메타데이터 추출 실패 (${url}):`, error)
    return null
  }
}

// 중복 체크: link + reason 조합이 이미 존재하는지 확인
async function isDuplicate(link: string, reason: string): Promise<boolean> {
  try {
    const q = query(
      collection(db, "posts"),
      where("link", "==", link),
      where("reason", "==", reason)
    )
    const querySnapshot = await getDocs(q)
    return !querySnapshot.empty
  } catch (error) {
    console.error("중복 체크 실패:", error)
    return false // 에러 발생 시 중복이 아닌 것으로 간주하고 진행
  }
}

// 메인 실행 함수
async function runSeedPosts() {
  console.log("🌱 Firestore posts 시드 데이터 추가 시작...\n")

  let insertedCount = 0
  let skippedCount = 0

  for (let i = 0; i < seedPosts.length; i++) {
    const seedPost = seedPosts[i]
    const { emotion, link, reason } = seedPost

    console.log(`[${i + 1}/${seedPosts.length}] 처리 중: ${emotion} - ${link.substring(0, 50)}...`)

    // 중복 체크
    const duplicate = await isDuplicate(link, reason)
    if (duplicate) {
      console.log(`  ⏭️  스킵: 이미 존재하는 link + reason 조합입니다.\n`)
      skippedCount++
      continue
    }

    // 링크 메타데이터 추출 시도
    let linkMeta: { title?: string; image?: string; site?: string } | undefined
    try {
      const meta = await fetchLinkMeta(link)
      if (meta) {
        linkMeta = meta
        console.log(`  📎 메타데이터 추출 성공: ${meta.title || "제목 없음"}`)
      }
    } catch (error) {
      console.log(`  ⚠️  메타데이터 추출 실패 (건너뜀)`)
    }

    // Firestore에 저장할 데이터 구성
    const postData: any = {
      emotionTags: [emotion], // emotion을 배열로 변환
      link: link,
      reason: reason,
      empathyCount: 0,
      saveCount: 0,
      createdAt: serverTimestamp(),
      authorName: generateAnonymousName(i),
      contentType: "video"
    }

    // linkMeta가 있으면 추가 (없으면 필드 자체를 추가하지 않음)
    if (linkMeta && (linkMeta.title || linkMeta.image || linkMeta.site)) {
      postData.linkMeta = linkMeta
    }

    try {
      await addDoc(collection(db, "posts"), postData)
      console.log(`  ✅ 삽입 완료\n`)
      insertedCount++
    } catch (error) {
      console.error(`  ❌ 삽입 실패:`, error)
      skippedCount++
    }
  }

  // 최종 결과 출력
  console.log("=".repeat(50))
  console.log(`📊 완료: ${insertedCount}개 삽입, ${skippedCount}개 스킵`)
  console.log("=".repeat(50))
}

// 스크립트 실행
runSeedPosts()
  .then(() => {
    console.log("\n✨ 시드 데이터 추가 완료!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("\n❌ 오류 발생:", error)
    process.exit(1)
  })
