 import { collection, query, orderBy, limit, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

function listenToGlobalNotifs() {
    const notifArea = document.getElementById('notif-area');
    const contentList = document.getElementById('notif-content-list');

    // بنراقب كولكشن global_notifications اللي عملناه في الأدمن
    const q = query(collection(db, "global_notifications"), orderBy("time", "desc"), limit(3));

    onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
            notifArea.style.display = 'none';
            return;
        }

        notifArea.style.display = 'block'; // أظهر المساحة لو فيه بيانات
        contentList.innerHTML = ''; // فضي التحميل

        snapshot.forEach((doc) => {
            const data = doc.data();
            const item = document.createElement('div');
            item.className = 'notif-item-text';
            item.innerHTML = `
                <i class="fas fa-check-circle" style="color:#86ff7b; margin-left:8px;"></i>
                ${data.msg}
            `;
            contentList.appendChild(item);
        });
    });
}

window.hideNotifArea = () => {
    document.getElementById('notif-area').style.display = 'none';
};

// تشغيل عند التحميل
listenToGlobalNotifs();