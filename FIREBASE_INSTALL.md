# Firebase 설치 및 설정 가이드

## 1단계: Firebase 패키지 설치

터미널에서 다음 명령어를 실행하세요:

```powershell
cd "C:\Users\명재민\Desktop\위로 플랫폼"
npm install firebase
```

## 2단계: Firebase 콘솔에서 설정 정보 가져오기

1. https://console.firebase.google.com 접속
2. 프로젝트 선택 (또는 새로 만들기)
3. 왼쪽 상단 톱니바퀴 아이콘 클릭 > "프로젝트 설정"
4. "일반" 탭에서 아래로 스크롤
5. "내 앱" 섹션에서 웹 앱이 없으면 `</>` 아이콘 클릭하여 추가
6. 나타나는 설정 정보를 복사

## 3단계: Firebase 설정 파일에 정보 입력

`lib/firebase/config.ts` 파일을 열고, Firebase 콘솔에서 복사한 정보를 입력하세요:

```typescript
const firebaseConfig = {
  apiKey: "여기에-apiKey-입력",
  authDomain: "여기에-authDomain-입력",
  projectId: "여기에-projectId-입력",
  storageBucket: "여기에-storageBucket-입력",
  messagingSenderId: "여기에-messagingSenderId-입력",
  appId: "여기에-appId-입력",
}
```

## 4단계: Firestore 보안 규칙 설정

Firebase 콘솔에서:
1. "Firestore Database" 메뉴 클릭
2. "규칙" 탭 클릭
3. 다음 규칙으로 변경:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /posts/{postId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if false;
    }
    match /comments/{commentId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if false;
    }
    match /reactions/{reactionId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if false;
    }
  }
}
```

4. "게시" 버튼 클릭

## 완료!

이제 앱을 실행하면 Firebase가 작동합니다.
