import { NextRequest, NextResponse } from "next/server"

interface OpenGraphData {
  title?: string
  description?: string
  image?: string
  url?: string
  siteName?: string
  type?: string
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const url = searchParams.get("url")

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 })
  }

  try {
    // URL 유효성 검사
    let targetUrl = url
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      targetUrl = `https://${url}`
    }

    // URL fetch
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      // 타임아웃 설정
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`)
    }

    const html = await response.text()

    // OpenGraph 메타데이터 파싱
    const ogData: OpenGraphData = {}

    // og:title
    const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i)
    if (ogTitleMatch) {
      ogData.title = ogTitleMatch[1]
    }

    // og:description
    const ogDescriptionMatch = html.match(
      /<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i
    )
    if (ogDescriptionMatch) {
      ogData.description = ogDescriptionMatch[1]
    }

    // og:image
    const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i)
    if (ogImageMatch) {
      ogData.image = ogImageMatch[1]
    }

    // og:url
    const ogUrlMatch = html.match(/<meta\s+property=["']og:url["']\s+content=["']([^"']+)["']/i)
    if (ogUrlMatch) {
      ogData.url = ogUrlMatch[1]
    }

    // og:site_name
    const ogSiteNameMatch = html.match(
      /<meta\s+property=["']og:site_name["']\s+content=["']([^"']+)["']/i
    )
    if (ogSiteNameMatch) {
      ogData.siteName = ogSiteNameMatch[1]
    }

    // og:type
    const ogTypeMatch = html.match(/<meta\s+property=["']og:type["']\s+content=["']([^"']+)["']/i)
    if (ogTypeMatch) {
      ogData.type = ogTypeMatch[1]
    }

    // Fallback: title 태그 사용
    if (!ogData.title) {
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
      if (titleMatch) {
        ogData.title = titleMatch[1]
      }
    }

    // Fallback: meta description 사용
    if (!ogData.description) {
      const metaDescriptionMatch = html.match(
        /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i
      )
      if (metaDescriptionMatch) {
        ogData.description = metaDescriptionMatch[1]
      }
    }

    // 플랫폼 감지
    const platform = detectPlatform(targetUrl)

    return NextResponse.json({
      ...ogData,
      platform,
      originalUrl: targetUrl,
    })
  } catch (error: any) {
    console.error("OpenGraph 파싱 실패:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to fetch OpenGraph data",
        originalUrl: url,
      },
      { status: 500 }
    )
  }
}

function detectPlatform(url: string): string {
  const hostname = new URL(url).hostname.toLowerCase()

  if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
    return "YouTube"
  }
  if (hostname.includes("instagram.com")) {
    return "Instagram"
  }
  if (hostname.includes("twitter.com") || hostname.includes("x.com")) {
    return "Twitter"
  }
  if (hostname.includes("facebook.com")) {
    return "Facebook"
  }
  if (hostname.includes("tiktok.com")) {
    return "TikTok"
  }
  if (hostname.includes("spotify.com")) {
    return "Spotify"
  }
  if (hostname.includes("music.apple.com")) {
    return "Apple Music"
  }
  if (hostname.includes("netflix.com")) {
    return "Netflix"
  }
  if (hostname.includes("watcha.com")) {
    return "왓챠"
  }
  if (hostname.includes("wavve.com")) {
    return "웨이브"
  }

  return "링크"
}
