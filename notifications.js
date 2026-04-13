
import { doc, onSnapshot, collection, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "./js.js"; 

export function initNotifications() {
    const user = JSON.parse(localStorage.getItem('studentInfo'));
    if (!user) return;

    // مراقبة الشات والدروس الجديدة
    onSnapshot(doc(db, "chats", user.phone), (snap) => {
        if (snap.exists()) {
            const msgs = snap.data().messages || [];
            if (msgs.length > 0 && msgs[msgs.length - 1].sender === 'admin') {
                updateNotifUI("لديك رسالة جديدة من الإدارة 💬");
            }
        }
    });

    onSnapshot(collection(db, "courses"), (snap) => {
        snap.docChanges().forEach(change => {
            if (change.type === "added") {
                updateNotifUI("تمت إضافة درس جديد في الكورس 🎬");
            }
        });
    });
}

function updateNotifUI(text) {
    const dot = document.getElementById('notif-dot');
    const list = document.getElementById('notif-list');
    
    if (dot) dot.style.display = 'block';
    
    const newItem = document.createElement('div');
    newItem.className = 'notif-item';
    newItem.innerHTML = `<p>${text}</p><small>الآن</small>`;
    
    if (list.querySelector('.no-notif')) list.innerHTML = '';
    list.prepend(newItem);
}

// دالة فتح وقفل القائمة
window.toggleNotifPanel = function() {
    const panel = document.getElementById('notif-panel');
    const dot = document.getElementById('notif-dot');
    
    if (panel.style.display === 'block') {
        panel.style.display = 'none';
    } else {
        panel.style.display = 'block';
        if (dot) dot.style.display = 'none'; // تختفي النقطة عند القراءة
    }
};

// قفل القائمة لو ضغطت في أي مكان بره
document.addEventListener('click', (e) => {
    const container = document.querySelector('.notification-container');
    const panel = document.getElementById('notif-panel');
    if (container && !container.contains(e.target)) {
        panel.style.display = 'none';
    }
});