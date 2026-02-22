# Firebase 설정 완벽 가이드

## 📦 1단계: Firebase 패키지 설치

### 방법 1: 터미널에서 직접 실행

1. **터미널 열기**
   - VS Code에서 `Ctrl + `` (백틱) 누르기
   - 또는 Windows PowerShell 열기

2. **프로젝트 폴더로 이동**
   ```powershell
   cd "C:\Users\명재민\Desktop\위로 플랫폼"
   ```

3. **Firebase 설치**
   ```powershell
   npm install firebase
   ```

4. **설치 완료 확인**
   - "added X packages" 메시지가 나오면 성공!

---

## 🔥 2단계: Firebase 콘솔에서 설정 정보 가져오기

### 2-1. Firebase 웹사이트 접속
1. 브라우저에서 https://console.firebase.google.com 접속
2. Google 계정으로 로그인

### 2-2. 프로젝트 만들기 (처음인 경우)
1. **"프로젝트 추가"** 또는 **"Add project"** 버튼 클릭
2. 프로젝트 이름 입력 (예: "위로플랫폼")
3. **"계속"** 클릭
4. Google Analytics는 선택사항 (건너뛰어도 됨)
5. **"프로젝트 만들기"** 클릭
6. 몇 초 기다리기

### 2-3. 웹 앱 추가
1. 프로젝트가 열리면 왼쪽 상단의 **톱니바퀴 아이콘** ⚙️ 클릭
2. **"프로젝트 설정"** 또는 **"Project settings"** 클릭
3. 페이지 중간의 **"내 앱"** 섹션 찾기
4. **`</>` 아이콘** (웹 앱 추가) 클릭
5. 앱 닉네임 입력 (예: "위로 플랫폼 웹")
6. **"앱 등록"** 버튼 클릭

### 2-4. 설정 정보 복사
다음과 같은 코드가 나타납니다:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

**이 정보를 복사해두세요!**

---

## ⚙️ 3단계: 설정 정보 입력하기

### 3-1. 파일 열기
1. VS Code에서 `lib/firebase/config.ts` 파일 열기

### 3-2. 정보 입력
Firebase 콘솔에서 복사한 정보를 아래 형식에 맞춰 입력:

```typescript
const firebaseConfig = {
  apiKey: "여기에-apiKey-값-붙여넣기",
  authDomain: "여기에-authDomain-값-붙여넣기",
  projectId: "여기에-projectId-값-붙여넣기",
  storageBucket: "여기에-storageBucket-값-붙여넣기",
  messagingSenderId: "여기에-messagingSenderId-값-붙여넣기",
  appId: "여기에-appId-값-붙여넣기",
}
```

**예시:**
```typescript
const firebaseConfig = {
  apiKey: "AIzaSyAbc123Def456",
  authDomain: "my-project.firebaseapp.com",
  projectId: "my-project-id",
  storageBucket: "my-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456",
}
```

### 3-3. 저장
- `Ctrl + S` 눌러서 저장

---

## 🔐 4단계: Authentication 설정

1. Firebase 콘솔 왼쪽 메뉴에서 **"Authentication"** 클릭
2. **"시작하기"** 또는 **"Get started"** 클릭
3. **"Sign-in method"** 탭 클릭
4. **"익명"** 또는 **"Anonymous"** 찾기
5. **"익명"** 클릭
6. **"사용 설정"** 토글을 **ON**으로 변경
7. **"저장"** 클릭

---

## 💾 5단계: Firestore Database 설정

### 5-1. 데이터베이스 만들기
1. Firebase 콘솔 왼쪽 메뉴에서 **"Firestore Database"** 클릭
2. **"데이터베이스 만들기"** 또는 **"Create database"** 클릭
3. **"테스트 모드에서 시작"** 선택
4. **"다음"** 클릭
5. 위치 선택: **"asia-northeast3"** (서울) 또는 가까운 지역
6. **"사용 설정"** 클릭
7. 몇 초 기다리기

### 5-2. 보안 규칙 설정
1. **"규칙"** 탭 클릭
2. 아래 규칙으로 교체:

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

3. **"게시"** 버튼 클릭

---

## ✅ 완료!

이제 모든 설정이 완료되었습니다!

### 테스트 방법
1. 터미널에서 `npm run dev` 실행
2. 브라우저에서 `/post/new` 페이지로 이동
3. 글 작성 후 저장
4. Firebase 콘솔 > Firestore Database에서 `posts` 컬렉션이 생성되고 글이 저장되었는지 확인

---

## 🆘 문제 해결

### "Cannot find module 'firebase'" 오류
- 터미널에서 `npm install firebase` 다시 실행
- VS Code 재시작

### "Firebase: Error (auth/configuration-not-found)" 오류
- `lib/firebase/config.ts` 파일의 설정 정보가 올바른지 확인
- 따옴표가 제대로 있는지 확인

### "Permission denied" 오류
- Firestore 보안 규칙이 올바르게 설정되었는지 확인
- Authentication이 활성화되었는지 확인
