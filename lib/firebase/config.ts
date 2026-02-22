import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

// Firebase 설정 정보
const firebaseConfig = {
  apiKey: "AIzaSyAKSNl0HEvtVHrAV_fqfhlORGljVRjO9uU",
  authDomain: "consolation-3b720.firebaseapp.com",
  projectId: "consolation-3b720",
  storageBucket: "consolation-3b720.firebasestorage.app",
  messagingSenderId: "448320363360",
  appId: "1:448320363360:web:2ba24f67a47bdc57191c05",
}

// Firebase 초기화 (중복 초기화 방지)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

// Auth와 Firestore 인스턴스 생성
export const auth = getAuth(app)
export const db = getFirestore(app)

export default app