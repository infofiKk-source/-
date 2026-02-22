# Git 커밋 및 푸시 가이드

## 📝 1단계: 변경사항 확인

터미널에서 실행:
```powershell
git status
```

변경된 파일 목록이 보입니다.

---

## ➕ 2단계: 변경사항 추가

모든 변경사항을 추가:
```powershell
git add .
```

또는 특정 파일만 추가:
```powershell
git add lib/firebase/config.ts
```

---

## 💾 3단계: 커밋 (변경사항 저장)

```powershell
git commit -m "Firebase 연동 및 게시물 저장 기능 추가"
```

**커밋 메시지 예시:**
- `"Firebase 연동 완료"`
- `"게시물 저장 기능 추가"`
- `"Firebase 설정 및 에러 처리 개선"`

---

## 🚀 4단계: GitHub에 푸시

```powershell
git push
```

처음 푸시하는 경우:
```powershell
git push -u origin main
```

또는 `master` 브랜치인 경우:
```powershell
git push -u origin master
```

---

## 📋 한 번에 실행하기

터미널에 아래 명령어를 **한 줄씩** 복사해서 붙여넣으세요:

```powershell
git add .
```

```powershell
git commit -m "Firebase 연동 및 게시물 저장 기능 추가"
```

```powershell
git push
```

---

## ⚠️ 주의사항

### 처음 Git 사용하는 경우

1. **Git 초기화** (아직 안 했다면):
   ```powershell
   git init
   ```

2. **GitHub 저장소 연결** (아직 안 했다면):
   ```powershell
   git remote add origin https://github.com/사용자명/저장소명.git
   ```

3. **브랜치 이름 설정**:
   ```powershell
   git branch -M main
   ```

### 인증 오류가 나는 경우

GitHub Personal Access Token이 필요할 수 있습니다:
1. GitHub > Settings > Developer settings > Personal access tokens
2. 토큰 생성
3. 푸시할 때 비밀번호 대신 토큰 사용

---

## ✅ 완료 확인

푸시가 성공하면:
- GitHub 저장소에서 변경사항 확인 가능
- Vercel이 자동으로 재배포 시작 (연결되어 있다면)
