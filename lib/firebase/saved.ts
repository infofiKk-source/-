import { collection, addDoc, getDocs, query, where, deleteDoc, doc, Timestamp } from "firebase/firestore"
import { db } from "./config"

export interface SavedPost {
  id?: string
  user_id: string
  post_id: string
  saved_at: Timestamp | Date
}

export interface SavedContent {
  id?: string
  user_id: string
  content_id: string
  saved_at: Timestamp | Date
}

/**
 * 게시글 저장
 */
export async function savePost(userId: string, postId: string): Promise<string> {
  try {
    // 이미 저장했는지 확인
    const existing = await getSavedPost(userId, postId)
    if (existing) {
      throw new Error("이미 저장한 게시글입니다.")
    }

    const docRef = await addDoc(collection(db, "saved_posts"), {
      user_id: userId,
      post_id: postId,
      saved_at: Timestamp.now(),
    })

    return docRef.id
  } catch (error) {
    console.error("게시글 저장 실패:", error)
    throw error
  }
}

/**
 * 게시글 저장 해제
 */
export async function unsavePost(userId: string, postId: string): Promise<void> {
  try {
    const saved = await getSavedPost(userId, postId)
    if (!saved || !saved.id) {
      throw new Error("저장된 게시글이 없습니다.")
    }

    await deleteDoc(doc(db, "saved_posts", saved.id))
  } catch (error) {
    console.error("게시글 저장 해제 실패:", error)
    throw error
  }
}

/**
 * 저장한 게시글 확인
 */
export async function getSavedPost(userId: string, postId: string): Promise<SavedPost | null> {
  try {
    const q = query(
      collection(db, "saved_posts"),
      where("user_id", "==", userId),
      where("post_id", "==", postId)
    )

    const querySnapshot = await getDocs(q)
    if (querySnapshot.empty) {
      return null
    }

    const doc = querySnapshot.docs[0]
    return {
      id: doc.id,
      ...doc.data(),
    } as SavedPost
  } catch (error) {
    console.error("저장한 게시글 확인 실패:", error)
    return null
  }
}

/**
 * 사용자가 저장한 모든 게시글 가져오기
 */
export async function getSavedPosts(userId: string): Promise<SavedPost[]> {
  try {
    const q = query(
      collection(db, "saved_posts"),
      where("user_id", "==", userId)
    )

    const querySnapshot = await getDocs(q)
    const savedPosts: SavedPost[] = []

    querySnapshot.forEach((doc) => {
      savedPosts.push({
        id: doc.id,
        ...doc.data(),
      } as SavedPost)
    })

    // 최신순 정렬
    savedPosts.sort((a, b) => {
      const aTime = a.saved_at instanceof Timestamp ? a.saved_at.toMillis() : 0
      const bTime = b.saved_at instanceof Timestamp ? b.saved_at.toMillis() : 0
      return bTime - aTime
    })

    return savedPosts
  } catch (error) {
    console.error("저장한 게시글 목록 가져오기 실패:", error)
    throw error
  }
}

/**
 * 콘텐츠 저장
 */
export async function saveContent(userId: string, contentId: string): Promise<string> {
  try {
    // 이미 저장했는지 확인
    const existing = await getSavedContent(userId, contentId)
    if (existing) {
      throw new Error("이미 저장한 콘텐츠입니다.")
    }

    const docRef = await addDoc(collection(db, "saved_contents"), {
      user_id: userId,
      content_id: contentId,
      saved_at: Timestamp.now(),
    })

    return docRef.id
  } catch (error) {
    console.error("콘텐츠 저장 실패:", error)
    throw error
  }
}

/**
 * 콘텐츠 저장 해제
 */
export async function unsaveContent(userId: string, contentId: string): Promise<void> {
  try {
    const saved = await getSavedContent(userId, contentId)
    if (!saved || !saved.id) {
      throw new Error("저장된 콘텐츠가 없습니다.")
    }

    await deleteDoc(doc(db, "saved_contents", saved.id))
  } catch (error) {
    console.error("콘텐츠 저장 해제 실패:", error)
    throw error
  }
}

/**
 * 저장한 콘텐츠 확인
 */
export async function getSavedContent(userId: string, contentId: string): Promise<SavedContent | null> {
  try {
    const q = query(
      collection(db, "saved_contents"),
      where("user_id", "==", userId),
      where("content_id", "==", contentId)
    )

    const querySnapshot = await getDocs(q)
    if (querySnapshot.empty) {
      return null
    }

    const doc = querySnapshot.docs[0]
    return {
      id: doc.id,
      ...doc.data(),
    } as SavedContent
  } catch (error) {
    console.error("저장한 콘텐츠 확인 실패:", error)
    return null
  }
}

/**
 * 사용자가 저장한 모든 콘텐츠 가져오기
 */
export async function getSavedContents(userId: string): Promise<SavedContent[]> {
  try {
    const q = query(
      collection(db, "saved_contents"),
      where("user_id", "==", userId)
    )

    const querySnapshot = await getDocs(q)
    const savedContents: SavedContent[] = []

    querySnapshot.forEach((doc) => {
      savedContents.push({
        id: doc.id,
        ...doc.data(),
      } as SavedContent)
    })

    // 최신순 정렬
    savedContents.sort((a, b) => {
      const aTime = a.saved_at instanceof Timestamp ? a.saved_at.toMillis() : 0
      const bTime = b.saved_at instanceof Timestamp ? b.saved_at.toMillis() : 0
      return bTime - aTime
    })

    return savedContents
  } catch (error) {
    console.error("저장한 콘텐츠 목록 가져오기 실패:", error)
    throw error
  }
}
