import { signInAnonymously, onAuthStateChanged, User, AuthError } from "firebase/auth"
import { auth } from "./config"

// 익명 로그인
export async function signInAnonymouslyUser() {
  try {
    const userCredential = await signInAnonymously(auth)
    return userCredential.user
  } catch (error) {
    const authError = error as AuthError
    console.error("익명 로그인 실패:", {
      code: authError.code,
      message: authError.message,
      fullError: authError,
    })
    throw {
      code: authError.code,
      message: authError.message,
      fullError: authError,
    }
  }
}

// 현재 사용자 가져오기
export function getCurrentUser(): User | null {
  return auth.currentUser
}

// 인증 상태 변경 감지
export function onAuthStateChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}
