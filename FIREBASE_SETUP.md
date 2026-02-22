# Firebase 설정 가이드

## 1단계: Firebase 콘솔에서 프로젝트 만들기

### 1-1. Firebase 웹사이트 접속
1. 브라우저에서 https://console.firebase.google.com 접속
2. Google 계정으로 로그인

### 1-2. 프로젝트 추가
1. 화면 왼쪽 상단의 **"프로젝트 추가"** 또는 **"Add project"** 버튼 클릭
2. **프로젝트 이름** 입력 (예: "위로 플랫폼" 또는 "consolation-platform")
3. **"계속"** 버튼 클릭

### 1-3. Google Analytics 설정 (선택사항)
1. Google Analytics 사용 여부 선택 (선택해도 되고 안 해도 됨)
2. **"계속"** 버튼 클릭

### 1-4. 프로젝트 생성 완료
1. **"프로젝트 만들기"** 버튼 클릭
2. 몇 초 기다리면 프로젝트가 생성됨
3. **"계속"** 버튼 클릭

---

## 2단계: Authentication 설정 (익명 로그인)

### 2-1. Authentication 메뉴로 이동
1. 왼쪽 메뉴에서 **"Authentication"** (또는 "인증") 클릭
2. **"시작하기"** 또는 **"Get started"** 버튼 클릭

### 2-2. 익명 로그인 활성화
1. **"Sign-in method"** (또는 "로그인 방법") 탭 클릭
2. 목록에서 **"익명"** 또는 **"Anonymous"** 찾기
3. **"익명"** 클릭
4. **"사용 설정"** 또는 **"Enable"** 토글을 켜기 (ON)
5. **"저장"** 버튼 클릭

---

## 3단계: Firestore Database 설정

### 3-1. Firestore 생성
1. 왼쪽 메뉴에서 **"Firestore Database"** (또는 "Firestore 데이터베이스") 클릭
2. **"데이터베이스 만들기"** 또는 **"Create database"** 버튼 클릭

### 3-2. 보안 규칙 설정
1. **"테스트 모드에서 시작"** 선택 (나중에 규칙 수정 가능)
2. **"다음"** 버튼 클릭

### 3-3. 위치 선택
1. **"asia-northeast3"** (서울) 또는 가까운 지역 선택
2. **"사용 설정"** 버튼 클릭
3. 몇 초 기다리면 데이터베이스 생성 완료

---

## 4단계: Firebase 설정 정보 가져오기

### 4-1. 프로젝트 설정으로 이동
1. 왼쪽 상단의 **톱니바퀴 아이콘** 클릭
2. **"프로젝트 설정"** 또는 **"Project settings"** 클릭

### 4-2. 웹 앱 추가
1. 페이지 중간의 **"</>"** 아이콘 (웹 앱 추가) 클릭
2. **앱 닉네임** 입력 (예: "위로 플랫폼 웹")
3. **"앱 등록"** 버튼 클릭

### 4-3. Firebase 설정 정보 복사
1. 나타나는 코드에서 다음 정보를 복사해두세요:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`

2. 이 정보는 나중에 코드에 사용합니다.

---

## 5단계: Firestore 보안 규칙 설정 (나중에)

### 5-1. Firestore 규칙 수정
1. **"Firestore Database"** 메뉴로 이동
2. **"규칙"** 탭 클릭
3. 다음 규칙으로 변경:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // posts: 누구나 읽기, 익명 사용자만 쓰기
    match /posts/{postId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if false;
    }
    
    // comments: 누구나 읽기, 익명 사용자만 쓰기
    match /comments/{commentId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if false;
    }
    
    // reactions: 누구나 읽기, 익명 사용자만 쓰기
    match /reactions/{reactionId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if false;
    }
  }
}
```

4. **"게시"** 버튼 클릭

---

## 완료!

이제 코드에 Firebase를 연결할 준비가 되었습니다!
