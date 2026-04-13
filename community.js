
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc, deleteDoc, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// إعدادات Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCLMAil66B9IDXJE4w4IR36Gxu0IEKaJ-o",
    authDomain: "eee1-95ee9.firebaseapp.com",
    projectId: "eee1-95ee9",
    storageBucket: "eee1-95ee9.firebasestorage.app",
    messagingSenderId: "342455666250",
    appId: "1:342455666250:web:f37becaa0589095db088b3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// دالة رفع الصور لـ Firebase Storage (للحصول على رابط دائم)
async function uploadFile(file, folder) {
    if (!file) return null;
    const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
}

// 1. دالة إنشاء منشور جديد (بدون تغيير كلاسات الـ HTML)
window.createPost = async function() {
    const text = document.getElementById('post-text').value;
    const imgFile = document.getElementById('img-upload').files[0];
    const userData = JSON.parse(localStorage.getItem('studentInfo'));

    if (!userData) return alert("يرجى تسجيل الدخول أولاً");
    if (!text && !imgFile) return alert("اكتب شيئاً للنشر!");

    try {
        let imageUrl = "";
        if (imgFile) {
            imageUrl = await uploadFile(imgFile, "posts");
        }

        await addDoc(collection(db, "posts"), {
            author: userData.name,
            authorImg: userData.profileImg || "default-avatar.png",
            content: text,
            image: imageUrl,
            likes: [],
            comments: [],
            createdAt: serverTimestamp()
        });

        document.getElementById('post-text').value = "";
        if (window.clearPreview) window.clearPreview(); // استدعاء دالة المسح من الـ HTML
        alert("تم النشر بنجاح!");
    } catch (e) {
        console.error("Error adding document: ", e);
    }
};

// 2. دالة الإعجاب (Like) باستخدام arrayUnion/Remove
window.likePost = async function(postId) {
    const userData = JSON.parse(localStorage.getItem('studentInfo'));
    if (!userData) return alert("سجل دخولك للتفاعل");

    const postRef = doc(db, "posts", postId);
    const postSnap = await getDoc(postRef);
    const likes = postSnap.data().likes || [];

    if (likes.includes(userData.phone)) {
        await updateDoc(postRef, { likes: arrayRemove(userData.phone) });
    } else {
        await updateDoc(postRef, { likes: arrayUnion(userData.phone) });
    }
};

// 3. دالة التعليق
window.addComment = async function(postId) {
    const input = document.getElementById(`input-${postId}`);
    const userData = JSON.parse(localStorage.getItem('studentInfo'));
    if (!input.value.trim()) return;

    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, {
        comments: arrayUnion({
            name: userData.name,
            text: input.value,
            time: new Date().toLocaleString('ar-EG')
        })
    });
    input.value = "";
};

// 4. دالة الحذف
window.deletePost = async function(postId) {
    if (confirm("هل أنت متأكد من حذف هذا المنشور؟")) {
        await deleteDoc(doc(db, "posts", postId));
    }
};

// 5. دالة جلب المنشورات (تحديث تلقائي Real-time)
window.loadPosts = function() {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    onSnapshot(q, (snapshot) => {
        const postsContainer = document.getElementById('posts-container');
        if (!postsContainer) return;
        
        postsContainer.innerHTML = '';
        snapshot.forEach((doc) => {
            const post = doc.data();
            const postId = doc.id;
            const userData = JSON.parse(localStorage.getItem('studentInfo'));
            const isLiked = post.likes.includes(userData?.phone);

            // نستخدم نفس الهيكل اللي أنت صممته في الـ HTML
            postsContainer.innerHTML += `
                <div class="post-card">
                    <div class="post-header">
                        <img src="${post.authorImg}" class="author-img">
                        <div class="author-info">
                            <h4>${post.author}</h4>
                            <span>${post.createdAt?.toDate().toLocaleString('ar-EG') || 'الآن'}</span>
                        </div>
                        ${userData?.name === post.author ? `<button class="delete-btn" onclick="deletePost('${postId}')"><i class="fas fa-trash"></i></button>` : ''}
                    </div>
                    <div class="post-content">
                        <p>${post.content}</p>
                        ${post.image ? `<img src="${post.image}" class="post-main-img">` : ''}
                    </div>
                    <div class="post-actions">
                        <button onclick="likePost('${postId}')" style="color: ${isLiked ? 'var(--accent)' : '#ccc'}">
                            <i class="fas fa-heart"></i> ${post.likes.length}
                        </button>
                        <button><i class="fas fa-comment"></i> ${post.comments.length}</button>
                    </div>
                    <div class="comments-section">
                        ${post.comments.map(c => `<div class="comment"><b>${c.name}:</b> ${c.text}</div>`).join('')}
                        <div class="comment-input-area">
                            <input type="text" id="input-${postId}" placeholder="اكتب تعليقاً...">
                            <button onclick="addComment('${postId}')"><i class="fas fa-paper-plane"></i></button>
                        </div>
                    </div>
                </div>
            `;
        });
    });
};

// تشغيل جلب البيانات عند التحميل
if (document.getElementById('posts-container')) {
    window.loadPosts();
}