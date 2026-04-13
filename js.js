
/* =========================================
   EBDA TEAM - WEB DEVELOPMENT PROJECT
   PART 1: CONFIGURATION & CORE AUTH
   ========================================= */

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// إعدادات فايربيز الخاصة بمشروعك
const firebaseConfig = {
    apiKey: "AIzaSyCLMAil66B9IDXJE4w4IR36Gxu0IEKaJ-o",
    authDomain: "eee1-95ee9.firebaseapp.com",
    projectId: "eee1-95ee9",
    storageBucket: "eee1-95ee9.firebasestorage.app",
    messagingSenderId: "342455666250",
    appId: "1:342455666250:web:f37becaa0589095db088b3"
};

// تهيئة المشروع
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

/* --- دالة التحكم في تسجيل الدخول وإنشاء الحساب --- */
export async function handleAuth() {
    const emailField = document.getElementById('studentEmail');
    const passField = document.getElementById('studentPass');
    const nameField = document.getElementById('studentName');
    const submitBtn = document.getElementById('submitBtn');

    if (!emailField.value || !passField.value) {
        alert("اكتب الإيميل وكلمة السر يا بطل!");
        return;
    }

    if (passField.value.length < 6) {
        alert("يا بطل، كلمة السر لازم تكون 6 حروف أو أرقام على الأقل!");
        return;
    }

    const isRegisterMode = submitBtn.innerText.includes("إنشاء");

    try {
        submitBtn.innerText = "جاري المعالجة...";
        submitBtn.disabled = true;

        if (isRegisterMode) {
            // إنشاء حساب جديد
            const userCredential = await createUserWithEmailAndPassword(auth, emailField.value, passField.value);
            const user = userCredential.user;

// ... داخل دالة handleAuth عند إنشاء حساب جديد
// داخل دالة handleAuth عند الـ Register
const studentData = {
    uid: user.uid,
    name: nameField ? nameField.value : "طالب جديد",
    email: emailField.value,
    level: "1st Preparatory",
    plan: "باقة مجانية", // دي اللي هتحل مشكلة UNDEFINED
    joinDate: new Date().toLocaleDateString('ar-EG'), // دي اللي هتحل مشكلة التواريخ الفارغة
    courses: []
};
await setDoc(doc(db, "students", user.uid), studentData);
            localStorage.setItem('studentInfo', JSON.stringify(studentData));
            alert("مبروك! تم إنشاء حسابك بنجاح.");
        } else {
            // تسجيل دخول
            const userCredential = await signInWithEmailAndPassword(auth, emailField.value, passField.value);
            const docSnap = await getDoc(doc(db, "students", userCredential.user.uid));
            if (docSnap.exists()) {
                localStorage.setItem('studentInfo', JSON.stringify(docSnap.data()));
            }
            alert("أهلاً بك مجدداً!");
        }
        window.location.href = "dashboard.html";
} catch (error) {
    // نداء دالة عرض الأخطاء
    handleAuthErrors(error);
    submitBtn.innerText = isRegisterMode ? "إنشاء حساب" : "تسجيل دخول";
    submitBtn.disabled = false;
}
    }

// ربط الدالة بالنافذة العالمية لضمان عملها من الـ HTML


// 4. دالة تسجيل الخروج

window.logoutUser = function() {

    localStorage.clear();

    window.location.href = 'index.html';

};

// ==========================================

// 3. نظام الاشتراك (الحلقة المفقودة)

// ==========================================

// دالة بتشتغل بعد ما الطالب يخلص الاستفتاء
window.checkSubscriptions = async function() {
    const userData = JSON.parse(localStorage.getItem('studentInfo'));
    if (!userData || !userData.email) return;

    try {
        // البحث باستخدام studentEmail بدل studentPhone
        const q = query(collection(db, "enrollments"), where("studentEmail", "==", userData.email));
        const querySnapshot = await getDocs(q);
        
        const myCourses = [];
        querySnapshot.forEach(doc => myCourses.push(doc.data().courseName));

        // تمسيك كل الأزرار اللي واخدة كلاس subscribe-btn
        const buttons = document.querySelectorAll('.subscribe-btn');
        buttons.forEach(btn => {
            const onClickValue = btn.getAttribute('onclick') || "";
            
            myCourses.forEach(courseName => {
                if (onClickValue.includes(courseName)) {
                    // التعديل اللي يخلي الزرار رمادي ومكتوب عليه تم الاشتراك
                    btn.innerHTML = 'تم الاشتراك ✓';
                    btn.style.cssText = "background: #4b5563 !important; color: #fff !important; cursor: not-allowed; opacity: 0.7;";
                    btn.disabled = true;
                    btn.onclick = null; // تعطيل الضغط
                }
            });
        });
    } catch (e) {
        console.error("خطأ في تحديث الأزرار:", e);
    }
};

// تأكد من تشغيل الدالة أول ما الصفحة تفتح
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(window.checkSubscriptions, 1000); 
});
// دالة فحص الأزرار (تعديل عشان يفتح صفحة عرض الكورس)
window.subscribeCourse = async function(courseId, courseName) {
    const studentData = JSON.parse(localStorage.getItem('studentInfo'));
    if (!studentData) {
        alert("سجل دخولك أولاً يا بطل!");
        window.location.href = 'login.html';
        return;
    }
    localStorage.setItem('pendingCourse', courseName);
    window.location.href = 'survey.html'; 
};

window.checkSubscriptions = async function() {
    const userData = JSON.parse(localStorage.getItem('studentInfo'));
    if (!userData || !userData.email) return;

    try {
        const q = query(collection(db, "enrollments"), where("studentEmail", "==", userData.email));
        const querySnapshot = await getDocs(q);
        
        const subscribedCourses = [];
        querySnapshot.forEach(doc => subscribedCourses.push(doc.data().courseName));

        const buttons = document.querySelectorAll('.subscribe-btn');
        buttons.forEach(btn => {
            const onClickAttr = btn.getAttribute('onclick') || "";
            subscribedCourses.forEach(courseTitle => {
                if (onClickAttr.includes(courseTitle)) {
                    // التعديل هنا: الزرار هيتحول لمشاهدة ويدخله على صفحة العرض
                    btn.innerHTML = 'مشاهدة الكورس 📺';
                    btn.style.cssText = "background: #2ecca4 !important; color: #000 !important; cursor: pointer;";
                    btn.onclick = () => { window.location.href = "course-view.html?course=" + courseTitle; };
                }
            });
        });
    } catch (e) { console.error(e); }
};
// ==========================================

// 4. تحديث الهيدر (شغال تمام)

// ==========================================

// 1. تحديث الهيدر والبيانات في أي صفحة
window.updateHeader = function() {
    const data = JSON.parse(localStorage.getItem('studentInfo'));
    if (!data) return;

    // تحديث منطقة تسجيل الدخول (لو موجودة)
    const authArea = document.getElementById('auth-area');
    if (authArea) {
        const userImg = data.profileImage || 'https://www.w3schools.com/howto/img_avatar.png';
        authArea.innerHTML = `
            <div class="user-nav-wrapper" style="display:flex; align-items:center; gap:10px;">
                <img src="${userImg}" style="width:35px; height:35px; border-radius:50%; object-fit:cover;">
                <div style="background: rgba(76, 175, 80, 0.1); border: 1px solid #4CAF50; border-radius: 20px; padding: 5px 15px;">
                    <span style="color:#fff;">Hello,</span>
                    <span style="color:#4CAF50; font-weight:bold;">${data.name.split(' ')[0]}</span>
                </div>
                <a href="dashboard.html" class="dash-btn">Dashboard</a>
                <button onclick="logoutUser()" class="logout-link">logout</button>
            </div>`;
    }

    // تحديث البيانات في الداشبورد أو الكورسات (توحيد الـ IDs)
    if(document.getElementById('userNameHeader')) document.getElementById('userNameHeader').innerText = data.name;
    if(document.getElementById('userPlan')) document.getElementById('userPlan').innerText = data.plan || "باقة مجانية";
    if(document.getElementById('joinDateText')) document.getElementById('joinDateText').innerText = data.joinDate || "---";
};
window.toggleChat = function() {
    const data = JSON.parse(localStorage.getItem('studentInfo'));
    
    // لو مفيش حساب مسجل
    if (!data) {
        alert("Please login or create an account first! 🚀");
        window.location.href = 'login.html'; 
        return;
    }

    // لو الحساب موجود، يفتح الشات فوراً
    const chatContainer = document.getElementById('chat-container'); 
    if (chatContainer) {
        chatContainer.classList.toggle('active');
        const notifDot = document.getElementById('notif-dot');
        if (notifDot) notifDot.style.display = 'none';
    } else {
        // لو مفيش صندوق شات في الصفحة دي، يوديك لصفحة الشات
        window.location.href = 'chat.html'; 
    }
};
// 2. فحص الاشتراكات وتغيير أزرار الكورسات
window.checkSubscriptions = async function() {
    const userData = JSON.parse(localStorage.getItem('studentInfo'));
    if (!userData || !userData.email) return;

    try {
        // البحث بالإيميل في مجموعة enrollments
        const q = query(collection(db, "enrollments"), where("studentEmail", "==", userData.email));
        const querySnapshot = await getDocs(q);
        
        const subscribedCourses = [];
        querySnapshot.forEach(doc => subscribedCourses.push(doc.data().courseName));

        const buttons = document.querySelectorAll('.subscribe-btn');
        buttons.forEach(btn => {
            const onClickAttr = btn.getAttribute('onclick') || "";
            subscribedCourses.forEach(courseTitle => {
                if (onClickAttr.includes(courseTitle)) {
                    btn.innerHTML = 'تم الاشتراك ✅';
                    btn.style.cssText = "background: #2d2d2d !important; color: #86ff7b !important; cursor: default; pointer-events: none;";
                    btn.disabled = true;
                    btn.onclick = null;
                }
            });
        });
    } catch (e) { 
        console.error("Error checking subs:", e); 
    }
};

// تشغيل الدوال عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    window.updateHeader();
    setTimeout(window.checkSubscriptions, 1000); 
});

// ==========================================

// 5. فحص الاشتراكات (إخفاء الزرار)

// ==========================================


// ==========================================

// 6. تسجيل الخروج

// ==========================================



// ==========================================

// 7. تشغيل كل شيء عند التحميل (المكان الموحد)

// ==========================================

document.addEventListener('DOMContentLoaded', () => {

    window.updateHeader();

   

    // تشغيل المنشورات لو في صفحة الهوم

    if (document.getElementById('posts-container')) {

        window.loadPosts();

    }

   

    // تشغيل الكورسات لو في صفحة الداش بورد

    if (document.getElementById('my-courses-container')) {

        window.loadMyCourses();

    }



    // فحص الأزرار (تأخير بسيط لضمان تحميل الـ HTML)

    setTimeout(window.checkSubscriptions, 800);

});

























































































































































// أضف باقي دوال handleAuth و loadPosts و loadMyCourses كما هي لديك..

















































































































// ==========================================

// 13. نظام القائمة الجانبية للموبايل (Hamburger Menu)

// ==========================================



// دالة تشغيل المنيو بشكل عام في أي صفحة

window.initUniversalMenu = function() {

    // بنحاول نمسك الزرار سواء كان اسمه mobile-menu-btn أو lessons-menu-btn

    const menuBtn = document.getElementById('mobile-menu-btn') || document.getElementById('lessons-menu-btn');

    const navLinks = document.getElementById('navLinks') || document.getElementById('lessonsNav');



    if (menuBtn && navLinks) {

        menuBtn.onclick = function() {

            navLinks.classList.toggle('active');

           

            // تغيير شكل الأيقونة

            const icon = menuBtn.querySelector('i');

            if (navLinks.classList.contains('active')) {

                icon.classList.replace('fa-bars', 'fa-times');

            } else {

                icon.classList.replace('fa-times', 'fa-bars');

            }

        };

    }

};



// نأكد تشغيلها في كل مرة الدوم يحمل

document.addEventListener('DOMContentLoaded', () => {

    window.initUniversalMenu();

});









// دالة تشغيل منيو الداش بورد

window.initDashboardMenu = function() {

    const menuBtn = document.getElementById('mobile-menu-btn');

    const closeBtn = document.getElementById('close-menu');

    const navLinks = document.getElementById('navLinks');



    if (menuBtn && navLinks) {

        menuBtn.onclick = () => navLinks.classList.add('active');

    }



    if (closeBtn && navLinks) {

        closeBtn.onclick = () => navLinks.classList.remove('active');

    }



    // إغلاق المنيو لو ضغطنا في أي حتة فاضية

    document.addEventListener('click', (e) => {

        if (navLinks && navLinks.classList.contains('active') && !navLinks.contains(e.target) && !menuBtn.contains(e.target)) {

            navLinks.classList.remove('active');

        }

    });

};



// تشغيل الفحص

document.addEventListener('DOMContentLoaded', () => {

    window.initDashboardMenu();

    if (typeof window.updateHeader === 'function') {

        window.updateHeader();

    }

});

window.goBack = function() {

    if (document.referrer.includes(window.location.hostname)) {

        history.back();

    } else {

        window.location.href = 'dashboard.html'; // أو الرئيسية

    }

};









































































// داخل ملف js.js

const submitBtn = document.getElementById('submitBtn');

if (submitBtn) {

    submitBtn.addEventListener('click', handleAuth);

}









// تشغيل الفحص أول ما الصفحة تحمل

document.addEventListener('DOMContentLoaded', () => {
    window.updateHeader();
    // تأخير بسيط عشان نضمن إن الأزرار ظهرت في الـ HTML
    setTimeout(window.checkSubscriptions, 1000); 
});












































// دالة معالجة أخطاء الفايربيز
function handleAuthErrors(error) {
    console.error("Auth Error Code:", error.code);
    let message = "حدث خطأ ما، حاول مرة أخرى";

    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        message = "البريد الإلكتروني أو كلمة المرور غير صحيحة";
    } else if (error.code === 'auth/email-already-in-use') {
        message = "هذا البريد الإلكتروني مسجل بالفعل";
    } else if (error.code === 'auth/weak-password') {
        message = "كلمة المرور ضعيفة جداً";
    } else if (error.code === 'auth/invalid-email') {
        message = "صيغة البريد الإلكتروني غير صحيحة";
    }

    alert(message);
}