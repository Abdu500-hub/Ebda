// 1. استيراد db فقط من ملفك الأساسي
import { db } from './js.js'; 
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 2. ربط الدالة بـ window عشان الـ HTML يشوفها
window.finishSurveyAndSubscribe = async function() {
    const btn = document.getElementById('submitSurveyBtn');
    const userData = JSON.parse(localStorage.getItem('studentInfo'));
    const pendingCourse = localStorage.getItem('pendingCourse');
    
    // سحب الداتا من الفورم
    const pcLevel = document.getElementById('pc-level').value;
    const infoData = document.getElementById('student-details').value;

    if (!userData || !pendingCourse) {
        alert("خطأ: يرجى اختيار الكورس مجدداً.");
        window.location.href = 'index.html';
        return;
    }

    try {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';

        // 3. تحديث الفايربيز (اسم الكورس + بيانات الاستفتاء)
        await updateDoc(doc(db, "students", userData.phone), {
            plan: pendingCourse,
            experience: pcLevel,
            goal: infoData,
            surveyDone: true
        });

        // 4. تحديث الـ LocalStorage
        userData.plan = pendingCourse;
        localStorage.setItem('studentInfo', JSON.stringify(userData));

        alert("تم الاشتراك بنجاح! نورت إبداع تيم 🚀");
        localStorage.removeItem('pendingCourse');
        window.location.href = 'dashboard.html';

    } catch (e) {
        console.error(e);
        btn.disabled = false;
        btn.innerHTML = 'تأكيد الاشتراك والانطلاق';
        alert("فشل الحفظ، تأكد من اتصال الإنترنت");
    }
};





































export { db };