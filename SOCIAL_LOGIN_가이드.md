# 소셜 로그인 및 PASS 인증 연동 가이드

## 📋 개요

현재 구현된 기능:
- ✅ Google 로그인 (Firebase 기본 지원)
- ⚠️ 네이버 로그인 (구조만 준비, 실제 연동 필요)
- ⚠️ 카카오 로그인 (구조만 준비, 실제 연동 필요)
- ⚠️ PASS 인증 (구조만 준비, 실제 연동 필요)

---

## 🔵 Google 로그인 설정

### 1. Firebase Console에서 Google 로그인 활성화

1. Firebase Console 접속: https://console.firebase.google.com
2. 프로젝트 선택
3. 왼쪽 메뉴에서 **"Authentication"** 클릭
4. **"Sign-in method"** 탭 클릭
5. **"Google"** 클릭
6. **"사용 설정"** 토글을 **ON**으로 변경
7. **프로젝트 지원 이메일** 선택 (또는 입력)
8. **"저장"** 클릭

### 2. 테스트

- `/auth` 페이지에서 "Google로 계속하기" 버튼 클릭
- Google 계정 선택 후 로그인 완료

---

## 🟢 네이버 로그인 연동

### 1. 네이버 개발자 센터에서 앱 등록

1. 네이버 개발자 센터 접속: https://developers.naver.com/
2. **"애플리케이션 등록"** 클릭
3. 정보 입력:
   - 애플리케이션 이름: "위로 플랫폼"
   - 사용 API: "네이버 로그인"
   - 로그인 오픈 API 서비스 환경: "PC 웹" 또는 "모바일 웹"
   - 서비스 URL: `https://your-domain.com`
   - Callback URL: `https://your-domain.com/auth/naver/callback`
4. **"등록"** 클릭
5. **Client ID**와 **Client Secret** 복사

### 2. Firebase Functions 설정 (Custom Token 생성)

네이버는 Firebase에서 직접 지원하지 않으므로, Firebase Functions를 사용하여 Custom Token을 생성해야 합니다.

#### 2-1. Firebase Functions 프로젝트 초기화

```bash
npm install -g firebase-tools
firebase login
firebase init functions
```

#### 2-2. Functions 코드 작성

`functions/src/index.ts`:

```typescript
import * as functions from "firebase-functions"
import * as admin from "firebase-admin"
import axios from "axios"

admin.initializeApp()

export const createNaverCustomToken = functions.https.onCall(async (data, context) => {
  const { accessToken } = data
  
  // 네이버 API로 사용자 정보 가져오기
  const userInfo = await axios.get("https://openapi.naver.com/v1/nid/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
  
  const naverId = userInfo.data.response.id
  const email = userInfo.data.response.email
  const name = userInfo.data.response.name
  
  // Firebase Custom Token 생성
  const customToken = await admin.auth().createCustomToken(naverId, {
    email,
    name,
    provider: "naver",
  })
  
  return { customToken }
})
```

#### 2-3. 클라이언트에서 구현

`lib/firebase/auth-social.ts` 수정:

```typescript
import { signInWithCustomToken } from "firebase/auth"
import { getFunctions, httpsCallable } from "firebase/functions"
import { auth } from "./config"

export async function signInWithNaver(): Promise<User> {
  // 1. 네이버 로그인 페이지로 리다이렉트
  const clientId = "YOUR_NAVER_CLIENT_ID"
  const redirectUri = encodeURIComponent(`${window.location.origin}/auth/naver/callback`)
  const state = Math.random().toString(36).substring(2, 15)
  
  localStorage.setItem("naver_oauth_state", state)
  
  window.location.href = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}`
  
  // 2. Callback 페이지에서 처리 (app/auth/naver/callback/page.tsx 생성 필요)
}
```

### 3. Callback 페이지 생성

`app/auth/naver/callback/page.tsx`:

```typescript
"use client"

import { useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { signInWithCustomToken } from "firebase/auth"
import { getFunctions, httpsCallable } from "firebase/functions"
import { auth } from "@/lib/firebase/config"
import axios from "axios"

export default function NaverCallbackPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code")
      const state = searchParams.get("state")
      
      if (!code || state !== localStorage.getItem("naver_oauth_state")) {
        router.push("/auth?error=invalid_state")
        return
      }
      
      try {
        // 1. 네이버에서 Access Token 받기
        const tokenResponse = await axios.post(
          "https://nid.naver.com/oauth2.0/token",
          null,
          {
            params: {
              grant_type: "authorization_code",
              client_id: "YOUR_NAVER_CLIENT_ID",
              client_secret: "YOUR_NAVER_CLIENT_SECRET",
              code,
              state,
            },
          }
        )
        
        const accessToken = tokenResponse.data.access_token
        
        // 2. Firebase Functions로 Custom Token 받기
        const functions = getFunctions()
        const createCustomToken = httpsCallable(functions, "createNaverCustomToken")
        const result = await createCustomToken({ accessToken })
        
        // 3. Custom Token으로 로그인
        await signInWithCustomToken(auth, result.data.customToken)
        
        router.push("/feed")
      } catch (error) {
        console.error("네이버 로그인 실패:", error)
        router.push("/auth?error=naver_login_failed")
      }
    }
    
    handleCallback()
  }, [searchParams, router])
  
  return <div>로그인 처리 중...</div>
}
```

---

## 🟡 카카오 로그인 연동

### 1. 카카오 개발자 센터에서 앱 등록

1. 카카오 개발자 센터 접속: https://developers.kakao.com/
2. **"내 애플리케이션"** > **"애플리케이션 추가하기"** 클릭
3. 정보 입력:
   - 앱 이름: "위로 플랫폼"
   - 사업자명: 입력
4. **"저장"** 클릭
5. **"플랫폼"** > **"Web 플랫폼 등록"** 클릭
   - 사이트 도메인: `https://your-domain.com`
6. **"카카오 로그인"** > **"활성화 설정"** ON
   - Redirect URI: `https://your-domain.com/auth/kakao/callback`
7. **REST API 키** 복사

### 2. Firebase Functions 설정

네이버와 유사하게 Custom Token 생성 함수 필요:

```typescript
export const createKakaoCustomToken = functions.https.onCall(async (data, context) => {
  const { accessToken } = data
  
  // 카카오 API로 사용자 정보 가져오기
  const userInfo = await axios.get("https://kapi.kakao.com/v2/user/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
  
  const kakaoId = userInfo.data.id.toString()
  const email = userInfo.data.kakao_account?.email
  const nickname = userInfo.data.properties?.nickname
  
  // Firebase Custom Token 생성
  const customToken = await admin.auth().createCustomToken(kakaoId, {
    email,
    name: nickname,
    provider: "kakao",
  })
  
  return { customToken }
})
```

### 3. 클라이언트 구현

네이버와 유사한 플로우로 구현:

```typescript
export async function signInWithKakao(): Promise<User> {
  const clientId = "YOUR_KAKAO_REST_API_KEY"
  const redirectUri = encodeURIComponent(`${window.location.origin}/auth/kakao/callback`)
  
  window.location.href = `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`
}
```

---

## 📱 PASS 인증 연동

### 1. PASS 인증 서비스 선택

PASS 인증은 다음 서비스를 통해 제공됩니다:
- **나이스 본인인증** (https://www.niceid.co.kr/)
- **PASS 인증** (SKT, KT, LGU+)

### 2. 나이스 본인인증 연동 예시

#### 2-1. 나이스 본인인증 가입

1. 나이스 본인인증 사이트 접속
2. 회원가입 및 서비스 신청
3. **CPID**와 **CPPWD** 발급

#### 2-2. 본인인증 API 호출

```typescript
// lib/firebase/pass-auth.ts
import axios from "axios"

export async function verifyPhoneWithPASS(phoneNumber: string) {
  // 1. 본인인증 요청
  const response = await axios.post("https://nice.checkplus.co.kr/CheckPlusSafeModel/checkplus.cb", {
    CPID: "YOUR_CPID",
    CPPWD: "YOUR_CPPWD",
    phoneNumber,
    // 기타 필요한 파라미터
  })
  
  // 2. 인증 완료 후 사용자 정보 받기
  // 3. Firebase에 사용자 정보 저장
}
```

### 3. PASS 앱 연동

PASS 앱 연동은 모바일 앱에서만 가능하므로, 웹에서는:
- PASS 인증 서비스 API 사용
- 또는 모바일 웹뷰에서 PASS 앱 호출

---

## 🔐 Firebase Authentication 설정

### 1. Sign-in Methods 활성화

Firebase Console > Authentication > Sign-in method:
- ✅ Anonymous (익명)
- ✅ Google
- ⚠️ Custom (네이버/카카오용)

### 2. 보안 규칙 설정

Firestore 보안 규칙에서 인증된 사용자만 접근하도록 설정:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 📝 구현 체크리스트

### Google 로그인
- [x] Firebase Console에서 Google 로그인 활성화
- [x] 클라이언트 코드 구현
- [x] UI 구현

### 네이버 로그인
- [ ] 네이버 개발자 센터 앱 등록
- [ ] Firebase Functions 설정
- [ ] Callback 페이지 구현
- [ ] 클라이언트 코드 완성

### 카카오 로그인
- [ ] 카카오 개발자 센터 앱 등록
- [ ] Firebase Functions 설정
- [ ] Callback 페이지 구현
- [ ] 클라이언트 코드 완성

### PASS 인증
- [ ] 나이스 본인인증 또는 PASS 인증 서비스 가입
- [ ] API 연동
- [ ] 전화번호 인증 플로우 구현

---

## ⚠️ 주의사항

1. **환경 변수 관리**: Client ID, Secret 등은 환경 변수로 관리하세요
2. **보안**: Client Secret은 서버에서만 사용하세요
3. **테스트**: 개발 환경과 프로덕션 환경의 Redirect URI를 분리하세요
4. **에러 처리**: 각 단계에서 에러 처리를 철저히 하세요

---

## 🚀 다음 단계

1. Firebase Console에서 Google 로그인 활성화
2. 네이버/카카오 개발자 센터에서 앱 등록
3. Firebase Functions 설정 (네이버/카카오용)
4. Callback 페이지 구현
5. PASS 인증 서비스 연동
