/**
 * تطبيق نخبة - Nokhba App
 * Author: Ammar Al-Haddar
 */

let tasks = [];
let calendarTasks = [];
let weeklyProgress = JSON.parse(localStorage.getItem("weeklyProgress")) || { completedDays: 0, lastCheckDate: null };

let currentLang = "ar"; // الموقع عربي فقط
try { localStorage.removeItem("appLang"); } catch (e) {}
let currentTheme = localStorage.getItem("appTheme") || "light";

let timerInterval = null;
let remainingSeconds = 0;
let timerRunning = false;
let currentTaskIndex = null;

let currentCalendarDate = new Date();
let selectedDateKey = null;

// المتغيرات الخاصة بالجدول المدرسي
let selectedGrade = 'g7';
let selectedSection = 'a';

// النظام: الأدوار وقاعدة البيانات
let sb = null;
let currentRole = "student";
let currentName = "";
let currentUsername = "";
const staffCategories = [
  { key: "tm", label: "المعلمون" },
  { key: "tf", label: "المعلمات" },
  { key: "assistant", label: "مساعدو المدير" },
  { key: "diwan", label: "الديوان" },
  { key: "counselor", label: "المرشدون" },
  { key: "librarian", label: "أمين المكتبة" },
  { key: "accountant", label: "المحاسبون" },
  { key: "nurse", label: "الممرضات" }
];
let currentStaffCat = "tm";
let staffData = [];
let loginTarget = "teacher";
let scheduleEditing = false;
const scheduleCache = {};
const roleLabels = { student: "طالب", teacher: "معلم", staff: "كادر مدرسي", admin: "المدير" };
const portalTitles = { staff: "بوابة المعلمين والمعلمات", admin: "بوابة الإدارة" };

// كافة الجداول المدرسية المطلوبة
const schedulesData = {
  g7: {
    a: [
      ["الأحد", "مهني", "مهني", "علوم", "رياضيات", "عربي", "إسلامية", "إنجليزي", "-"],
      ["الإثنين", "رياضيات", "إسلامية", "إنجليزي", "عربي", "فن", "علوم", "دراسات", "-"],
      ["الثلاثاء", "إنجليزي", "نشاط", "نشاط", "دراسات", "مهارات", "عربي", "علوم", "رياضيات"],
      ["الأربعاء", "مالية", "رياضيات", "رياضة", "إنجليزي", "عربي", "علوم", "رياضة", "-"],
      ["الخميس", "عربي", "إنجليزي", "رياضيات", "مهارات", "دراسات", "إسلامية", "عربي", "-"]
    ],
    b: [
      ["الأحد", "علوم", "إسلامية", "عربي", "رياضة", "رياضيات", "دراسات", "إنجليزي", "-"],
      ["الإثنين", "عربي", "إنجليزي", "رياضة", "علوم", "رياضيات", "مهارات", "إسلامية", "-"],
      ["الثلاثاء", "مالية", "نشاط", "نشاط", "رياضيات", "عربي", "دراسات", "إنجليزي", "إسلامية"],
      ["الأربعاء", "رياضيات", "فن", "مهني", "مهني", "إنجليزي", "عربي", "علوم", "-"],
      ["الخميس", "دراسات", "مهارات", "إنجليزي", "عربي", "رياضيات", "عربي", "علوم", "-"]
    ],
    c: [
      ["الأحد", "إنجليزي", "إسلامية", "رياضيات", "مهارات", "دراسات", "عربي", "رياضة", "-"],
      ["الإثنين", "علوم", "إسلامية", "إنجليزي", "مهارات", "عربي", "رياضة", "رياضيات", "عربي"],
      ["الثلاثاء", "عربي", "نشاط", "نشاط", "علوم", "رياضيات", "مهني", "مهني", "إنجليزي"],
      ["الأربعاء", "عربي", "دراسات", "رياضيات", "مالية", "فن", "إنجليزي", "علوم", "-"],
      ["الخميس", "إسلامية", "إنجليزي", "علوم", "رياضيات", "عربي", "دراسات", "-", "-"]
    ]
  },
  g8: {
    a: [
      ["الأحد", "رياضيات", "فن", "علوم", "إنجليزي", "مالية", "عربي", "إسلامية", "-"],
      ["الإثنين", "عربي", "رياضيات", "علوم", "دراسات", "إنجليزي", "إسلامية", "رياضة", "فرنسي"],
      ["الثلاثاء", "عربي", "نشاط", "نشاط", "فرنسي", "رياضيات", "إنجليزي", "مهني", "مهني"],
      ["الأربعاء", "علوم", "فن", "مالية", "فرنسي", "عربي", "إسلامية", "إنجليزي", "رياضيات"],
      ["الخميس", "علوم", "رياضة", "إنجليزي", "دراسات", "مهارات", "عربي", "رياضيات", "فرنسي"]
    ],
    b: [
      ["الأحد", "رياضيات", "فن", "علوم", "إنجليزي", "مالية", "عربي", "إسلامية", "-"],
      ["الإثنين", "عربي", "رياضيات", "علوم", "دراسات", "إنجليزي", "إسلامية", "رياضة", "فرنسي"],
      ["الثلاثاء", "عربي", "نشاط", "نشاط", "فرنسي", "رياضيات", "إنجليزي", "مهني", "مهني"],
      ["الأربعاء", "رياضيات", "علوم", "عربي", "رياضة", "مهارات", "دراسات", "عربي", "إنجليزي"],
      ["الخميس", "مهارات", "إسلامية", "فرنسي", "علوم", "عربي", "رياضيات", "إنجليزي", "-"]
    ],
    c: [
      ["الأحد", "رياضيات", "عربي", "إسلامية", "إنجليزي", "رياضة", "علوم", "عربي", "فن"],
      ["الإثنين", "إنجليزي", "عربي", "إسلامية", "دراسات", "فرنسي", "رياضيات", "مهني", "مهني"],
      ["الثلاثاء", "عربي", "نشاط", "نشاط", "إنجليزي", "علوم", "دراسات", "فرنسي", "رياضيات"],
      ["الأربعاء", "عربي", "إنجليزي", "رياضيات", "مهارات", "علوم", "إسلامية", "مالية", "-"],
      ["الخميس", "علوم", "رياضيات", "إنجليزي", "دراسات", "مهارات", "عربي", "فرنسي", "رياضة"]
    ]
  },
  g9: {
    a: [
      ["الأحد", "رياضة", "رياضيات", "إنجليزي", "علوم أرض", "عربي", "إسلامية", "مهارات", "فرنسي"],
      ["الإثنين", "تاريخ", "علوم حياتية", "رياضيات", "عربي", "رياضة", "إنجليزي", "فرنسي", "عربي"],
      ["الثلاثاء", "فيزياء", "نشاط", "نشاط", "عربي", "مالية", "رياضيات", "فن", "إنجليزي"],
      ["الأربعاء", "إنجليزي", "مهارات", "فيزياء", "رياضيات", "وطنية", "إسلامية", "فرنسي", "عربي"],
      ["الخميس", "رياضيات", "إسلامية", "جغرافيا", "كيمياء", "مهني", "مهني", "عربي", "إنجليزي"]
    ],
    b: [
      ["الأحد", "إنجليزي", "علوم أرض", "عربي", "جغرافيا", "مهارات", "فرنسي", "إسلامية", "رياضيات"],
      ["الإثنين", "علوم حياتية", "مالية", "إنجليزي", "رياضيات", "وطنية", "فيزياء", "عربي", "فرنسي"],
      ["الثلاثاء", "عربي", "نشاط", "نشاط", "رياضة", "إنجليزي", "كيمياء", "رياضيات", "مهارات"],
      ["الأربعاء", "رياضيات", "إسلامية", "تاريخ", "عربي", "مهني", "مهني", "رياضة", "إنجليزي"],
      ["الخميس", "رياضيات", "إنجليزي", "فيزياء", "إسلامية", "عربي", "فرنسي", "عربي", "فن"]
    ],
    c: [
      ["الأحد", "فيزياء", "إنجليزي", "عربي", "تاريخ", "رياضيات", "رياضة", "مهارات", "رياضة"],
      ["الإثنين", "إنجليزي", "علوم أرض", "عربي", "رياضيات", "مالية", "فرنسي", "إسلامية", "فن"],
      ["الثلاثاء", "رياضيات", "نشاط", "نشاط", "إسلامية", "عربي", "فرنسي", "إنجليزي", "فيزياء"],
      ["الأربعاء", "رياضيات", "وطنية", "مهارات", "علوم حياتية", "جغرافيا", "إنجليزي", "عربي", "فرنسي"],
      ["الخميس", "مهني", "مهني", "عربي", "إنجليزي", "كيمياء", "رياضيات", "عربي", "إسلامية"]
    ]
  },
  g10: {
    a: [
      ["الأحد", "إنجليزي", "رياضة", "فيزياء", "إسلامية", "عربي", "رياضيات", "فرنسي", "-"],
      ["الإثنين", "مهارات", "تاريخ", "وطنية", "عربي", "إسلامية", "رياضيات", "إنجليزي", "-"],
      ["الثلاثاء", "إنجليزي", "نشاط", "نشاط", "عربي", "أحياء", "رياضيات", "كيمياء", "فيزياء"],
      ["الأربعاء", "رياضيات", "عربي", "جغرافيا", "علوم أرض", "فرنسي", "إنجليزي", "مهارات", "فن"],
      ["الخميس", "عربي", "كيمياء", "إسلامية", "فرنسي", "مالية", "رياضيات", "إنجليزي", "-"]
    ],
    b: [
      ["الأحد", "رياضيات", "فيزياء", "جغرافيا", "مالية", "إنجليزي", "عربي", "فن", "-"],
      ["الإثنين", "عربي", "إسلامية", "علوم حياتية", "مهارات", "إنجليزي", "رياضة", "رياضيات", "-"],
      ["الثلاثاء", "إسلامية", "نشاط", "نشاط", "إنجليزي", "عربي", "مهارات", "علوم أرض", "رياضيات"],
      ["الأربعاء", "إنجليزي", "فيزياء", "تاريخ", "رياضيات", "كيمياء", "عربي", "إسلامية", "فرنسي"],
      ["الخميس", "رياضيات", "وطنية", "إنجليزي", "كيمياء", "عربي", "فرنسي", "فرنسي", "-"]
    ],
    c: [
      ["الأحد", "إنجليزي", "كيمياء", "علوم حياتية", "رياضيات", "فيزياء", "عربي", "رياضيات", "-"],
      ["الإثنين", "علوم أرض", "إنجليزي", "عربي", "رياضيات", "كيمياء", "وطنية", "فرنسي", "-"],
      ["الثلاثاء", "إسلامية", "نشاط", "نشاط", "عربي", "جغرافيا", "فيزياء", "رياضيات", "إنجليزي"],
      ["الأربعاء", "إسلامية", "إنجليزي", "عربي", "فن", "مهارات", "رياضيات", "فرنسي", "عربي"],
      ["الخميس", "مهارات", "مالية", "رياضيات", "فرنسي", "تاريخ", "إنجليزي", "إسلامية", "-"]
    ]
  },
  g11: {
    a: [
      ["الأحد", "عربي", "رياضيات", "إسلامية", "كيمياء", "تاريخ", "إنجليزي", "مالية", "-"],
      ["الإثنين", "عربي", "إنجليزي", "رياضيات", "إسلامية", "كيمياء", "مهارات", "عربي", "-"],
      ["الثلاثاء", "رياضيات", "إنجليزي", "تاريخ", "عربي", "علوم أرض", "إسلامية", "فيزياء", "-"],
      ["الأربعاء", "تاريخ", "رياضيات", "إسلامية", "عربي", "إنجليزي", "فيزياء", "مهارات", "-"],
      ["الخميس", "إسلامية", "عربي", "رياضة", "إنجليزي", "رياضيات", "تاريخ", "علوم حياتية", "-"]
    ],
    b: [
      ["الأحد", "إسلامية", "تاريخ", "رياضيات", "عربي", "إنجليزي", "مالية", "رياضة", "-"],
      ["الإثنين", "رياضيات", "تاريخ", "إسلامية", "عربي", "إنجليزي", "كيمياء", "فيزياء", "مهارات"],
      ["الثلاثاء", "إسلامية", "تاريخ", "عربي", "إنجليزي", "رياضيات", "علوم أرض", "-", "-"],
      ["الأربعاء", "إسلامية", "عربي", "رياضيات", "تاريخ", "كيمياء", "عربي", "إنجليزي", "-"],
      ["الخميس", "إسلامية", "رياضيات", "علوم حياتية", "عربي", "فيزياء", "إنجليزي", "مهارات", "-"]
    ],
    c: [
      ["الأحد", "إسلامية", "عربي", "إنجليزي", "رياضيات", "مهارات", "مهارات", "كيمياء", "-"],
      ["الإثنين", "رياضيات", "عربي", "فيزياء", "إسلامية", "إنجليزي", "مالية", "تاريخ", "-"],
      ["الثلاثاء", "عربي", "رياضيات", "إسلامية", "تاريخ", "إنجليزي", "كيمياء", "عربي", "-"],
      ["الأربعاء", "عربي", "رياضيات", "علوم حياتية", "إسلامية", "تاريخ", "رياضة", "إنجليزي", "-"],
      ["الخميس", "إنجليزي", "تاريخ", "عربي", "رياضيات", "إسلامية", "علوم أرض", "فيزياء", "-"]
    ]
  },
  g12: {
    a: [
      ["الأحد", "فيزياء", "إنجليزي", "رياضيات", "كيمياء", "علوم حياتية", "علوم أرض", "رياضيات", "-"],
      ["الإثنين", "فيزياء", "رياضيات", "كيمياء", "إنجليزي", "أحياء", "علوم أرض", "-", "-"],
      ["الثلاثاء", "علوم أرض", "علوم حياتية", "إنجليزي", "كيمياء", "مهارات", "فيزياء", "رياضيات", "-"],
      ["الأربعاء", "فيزياء", "مهارات", "إنجليزي", "علوم حياتية", "رياضيات", "كيمياء", "علوم أرض", "-"],
      ["الخميس", "كيمياء", "رياضيات", "علوم أرض", "إنجليزي", "علوم حياتية", "رياضة", "فيزياء", "-"]
    ],
    b: [
      ["الأحد", "أحياء", "إنجليزي", "علوم أرض", "رياضيات", "كيمياء", "فيزياء", "-", "-"],
      ["الإثنين", "إنجليزي", "رياضيات", "فيزياء", "علوم أرض", "مهارات", "علوم حياتية", "كيمياء", "-"],
      ["الثلاثاء", "فيزياء", "رياضيات", "كيمياء", "علوم أرض", "علوم حياتية", "مهارات", "إنجليزي", "-"],
      ["الأربعاء", "علوم أرض", "علوم حياتية", "إنجليزي", "كيمياء", "رياضيات", "رياضة", "فيزياء", "-"],
      ["الخميس", "إنجليزي", "علوم أرض", "رياضيات", "فيزياء", "كيمياء", "علوم حياتية", "رياضيات", "-"]
    ],
    c: [
      ["الأحد", "كيمياء", "إنجليزي", "مهارات", "علوم حياتية", "علوم أرض", "رياضيات", "فيزياء", "-"],
      ["الإثنين", "كيمياء", "علوم أرض", "إنجليزي", "علوم حياتية", "فيزياء", "رياضيات", "مهارات", "-"],
      ["الثلاثاء", "كيمياء", "إنجليزي", "علوم أرض", "علوم حياتية", "فيزياء", "رياضيات", "-", "-"],
      ["الأربعاء", "علوم حياتية", "إنجليزي", "علوم أرض", "كيمياء", "رياضيات", "فيزياء", "رياضيات", "-"],
      ["الخميس", "علوم حياتية", "إنجليزي", "كيمياء", "علوم أرض", "فيزياء", "رياضة", "رياضيات", "-"]
    ]
  }
};

// أسئلة السرعة
const speedQuestions = [
  { q: "ما هي عاصمة الأردن؟", options: ["عمان", "الزرقاء", "إربد", "العقبة"], answer: 0 },
  { q: "كم عدد أضلاع المربع؟", options: ["3", "4", "5", "6"], answer: 1 },
  { q: "ما هو أطول نهر في العالم؟", options: ["الأمازون", "النيل", "المسيسيبي", "الفرات"], answer: 1 },
  { q: "ما هي المادة التي يتكون منها الماس؟", options: ["الحديد", "الكربون", "النحاس", "الذهب"], answer: 1 },
  { q: "كم عدد كواكب المجموعة الشمسية؟", options: ["7", "8", "9", "10"], answer: 1 },
  { q: "ما هو الحيوان الملقب بسفينة الصحراء؟", options: ["الحصان", "الجمل", "الأسد", "الفيل"], answer: 1 },
  { q: "ما هو أسرع حيوان بري في العالم؟", options: ["الفهد", "الغزال", "الأسد", "النمر"], answer: 0 },
  { q: "في أي قارة تقع الطفيلة؟", options: ["أفريقيا", "آسيا", "أوروبا", "أمريكا"], answer: 1 },
  { q: "ناتج ضرب 7 × 8 يساوي؟", options: ["54", "56", "64", "48"], answer: 1 },
  { q: "ما هو غاز التنفس الأساسي للإنسان؟", options: ["النيتروجين", "الأكسجين", "ثاني أكسيد الكربون", "الهيدروجين"], answer: 1 },

  { q: "ما هو أكبر محيط في العالم؟", options: ["الأطلسي", "الهادي", "الهندي", "المتجمد الشمالي"], answer: 1 },
  { q: "كم عدد أيام السنة الكبيسة؟", options: ["365", "364", "366", "367"], answer: 2 },
  { q: "ما هي عاصمة فرنسا؟", options: ["باريس", "لندن", "مدريد", "روما"], answer: 0 },
  { q: "ما هو الكوكب الأحمر؟", options: ["الزهرة", "المريخ", "عطارد", "المشتري"], answer: 1 },
  { q: "ما هو أكبر كوكب في المجموعة الشمسية؟", options: ["زحل", "نبتون", "المشتري", "الأرض"], answer: 2 },
  { q: "ما هو الرمز الكيميائي للماء؟", options: ["CO2", "H2O", "O2", "NaCl"], answer: 1 },
  { q: "كم عدد قارات العالم؟", options: ["5", "6", "8", "7"], answer: 3 },
  { q: "في أي محافظة أردنية تقع مدينة البتراء؟", options: ["معان", "الكرك", "جرش", "مادبا"], answer: 0 },
  { q: "ما هو أكبر حيوان في العالم؟", options: ["الفيل", "الحوت الأزرق", "الزرافة", "القرش الأبيض"], answer: 1 },
  { q: "كم دقيقة في الساعة الواحدة؟", options: ["50", "100", "60", "30"], answer: 2 },
  { q: "أي عضو مسؤول عن ضخ الدم في الجسم؟", options: ["الكبد", "الرئتان", "الكلية", "القلب"], answer: 3 },
  { q: "ناتج 12 × 12 يساوي؟", options: ["144", "124", "132", "154"], answer: 0 },
  { q: "ما الغاز الذي تمتصه النباتات في البناء الضوئي؟", options: ["الأكسجين", "ثاني أكسيد الكربون", "النيتروجين", "الهيليوم"], answer: 1 },
  { q: "ما هي عاصمة مصر؟", options: ["الإسكندرية", "الجيزة", "القاهرة", "أسوان"], answer: 2 },
  { q: "من مؤسس المملكة الأردنية الهاشمية؟", options: ["الملك عبدالله الأول", "الملك طلال", "الملك الحسين", "الملك عبدالله الثاني"], answer: 0 },
  { q: "ما هو أكبر عضو في جسم الإنسان؟", options: ["الكبد", "الدماغ", "الجلد", "الرئة"], answer: 2 },
  { q: "كم عدد أسنان الإنسان البالغ؟", options: ["28", "30", "36", "32"], answer: 3 },
  { q: "ما هو أقرب كوكب إلى الشمس؟", options: ["عطارد", "الزهرة", "الأرض", "المريخ"], answer: 0 },
  { q: "ما هي وحدة قياس القوة؟", options: ["الجول", "الواط", "النيوتن", "الباسكال"], answer: 2 },
  { q: "ما هو الجذر التربيعي للعدد 81؟", options: ["8", "9", "7", "10"], answer: 1 },
  { q: "كم عدد ألوان قوس قزح؟", options: ["6", "8", "5", "7"], answer: 3 },
  { q: "أي بحر يعتبر أخفض نقطة على سطح اليابسة؟", options: ["البحر الأحمر", "المتوسط", "البحر الميت", "بحر قزوين"], answer: 2 },
  { q: "ما هي عملة الأردن؟", options: ["الريال", "الدينار", "الدرهم", "الجنيه"], answer: 1 },
  { q: "ما هو الحيوان الملقب بملك الغابة؟", options: ["الأسد", "النمر", "الذئب", "الدب"], answer: 0 },
  { q: "ما هو الفلز الذي يكون سائلاً في درجة حرارة الغرفة؟", options: ["الحديد", "الزئبق", "الألمنيوم", "الفضة"], answer: 1 },
  { q: "كم يساوي مجموع زوايا المثلث؟", options: ["90°", "180°", "360°", "270°"], answer: 1 },
  { q: "ما هي أكبر دولة في العالم من حيث المساحة؟", options: ["الصين", "كندا", "الولايات المتحدة", "روسيا"], answer: 3 },
  { q: "ما هو أسرع شيء في الكون؟", options: ["الصوت", "الضوء", "الكهرباء", "الرياح"], answer: 1 },
  { q: "ما هي أكبر صحراء حارة في العالم؟", options: ["الصحراء الكبرى", "النفود", "جوبي", "كالاهاري"], answer: 0 },
  { q: "كم عدد حروف اللغة العربية؟", options: ["26", "30", "28", "29"], answer: 2 },
  { q: "من هو مخترع المصباح الكهربائي؟", options: ["نيوتن", "إديسون", "أينشتاين", "تسلا"], answer: 1 },
  { q: "ما هو الميناء البحري الوحيد في الأردن؟", options: ["العقبة", "الزرقاء", "السلط", "إربد"], answer: 0 },
  { q: "ما هو الغاز الأكثر وجوداً في الغلاف الجوي؟", options: ["الأكسجين", "النيتروجين", "الأرجون", "ثاني أكسيد الكربون"], answer: 1 },
  { q: "كم عدد أضلاع الشكل السداسي؟", options: ["5", "7", "6", "8"], answer: 2 },

  // ---- أسئلة إضافية ----
  { q: "ما هي أكبر مدينة أردنية من حيث عدد السكان؟", options: ["الزرقاء", "العقبة", "إربد", "عمان"], answer: 3 },
  { q: "أين تقع مدينة العقبة؟", options: ["جنوب الأردن", "وسط الأردن", "شرق الأردن", "شمال الأردن"], answer: 0 },
  { q: "ما هي عاصمة المملكة العربية السعودية؟", options: ["الرياض", "جدة", "مكة المكرمة", "الدمام"], answer: 0 },
  { q: "ما هي عاصمة دولة الإمارات العربية المتحدة؟", options: ["العين", "الشارقة", "أبوظبي", "دبي"], answer: 2 },
  { q: "ما هي عاصمة المغرب؟", options: ["مراكش", "فاس", "الدار البيضاء", "الرباط"], answer: 3 },
  { q: "ما هي عاصمة لبنان؟", options: ["صيدا", "طرابلس", "بيروت", "صور"], answer: 2 },
  { q: "ما هو أعلى جبل في الأردن؟", options: ["جبل عجلون", "جبل نيبو", "جبل أم الدامي", "جبل هارون"], answer: 2 },
  { q: "في أي محافظة يقع وادي رم؟", options: ["العقبة", "عجلون", "إربد", "جرش"], answer: 0 },
  { q: "ما المدينة الأردنية المعروفة بمدينة الألف عمود؟", options: ["عمان", "جرش", "مادبا", "الكرك"], answer: 1 },
  { q: "ما المدينة الأردنية المشهورة بالفسيفساء؟", options: ["السلط", "معان", "مادبا", "الطفيلة"], answer: 2 },
  { q: "في أي عام استقل الأردن؟", options: ["1921", "1946", "1948", "1952"], answer: 1 },
  { q: "ما لون النجمة في العلم الأردني؟", options: ["أسود", "أحمر", "أبيض", "أخضر"], answer: 2 },
  { q: "كم عدد رؤوس النجمة في العلم الأردني؟", options: ["7", "8", "5", "6"], answer: 0 },
  { q: "ما هي أكبر محافظة أردنية من حيث المساحة؟", options: ["الكرك", "إربد", "عمان", "معان"], answer: 3 },
  { q: "ما هو الكوكب المشهور بحلقاته؟", options: ["الأرض", "المريخ", "المشتري", "زحل"], answer: 3 },
  { q: "ما هو مصدر الطاقة الرئيسي للأرض؟", options: ["الشمس", "القمر", "الرياح", "البراكين"], answer: 0 },
  { q: "كم عدد عظام جسم الإنسان البالغ؟", options: ["206", "106", "306", "150"], answer: 0 },
  { q: "أي عضو في الجسم مسؤول عن التفكير؟", options: ["القلب", "الرئة", "المعدة", "الدماغ"], answer: 3 },
  { q: "ما الغاز الذي نخرجه عند الزفير بشكل رئيسي؟", options: ["الميثان", "الهيليوم", "ثاني أكسيد الكربون", "الأكسجين"], answer: 2 },
  { q: "ما درجة غليان الماء بالدرجة المئوية؟", options: ["120", "100", "90", "80"], answer: 1 },
  { q: "ما درجة تجمد الماء النقي بالدرجة المئوية؟", options: ["10", "-10", "0", "4"], answer: 2 },
  { q: "ما الرمز الكيميائي للذهب؟", options: ["Au", "Ag", "Fe", "Go"], answer: 0 },
  { q: "ما الرمز الكيميائي للصوديوم؟", options: ["Na", "S", "N", "So"], answer: 0 },
  { q: "ما أصغر وحدة بناء في الكائن الحي؟", options: ["الخلية", "النسيج", "الجهاز", "العضو"], answer: 0 },
  { q: "ما اسم عملية تحول الماء إلى بخار؟", options: ["التجمد", "التبخر", "التكثف", "الانصهار"], answer: 1 },
  { q: "ما وحدة قياس الطول في النظام الدولي؟", options: ["الثانية", "المتر", "الغرام", "اللتر"], answer: 1 },
  { q: "ما وحدة قياس الكتلة في النظام الدولي؟", options: ["الثانية", "المتر", "النيوتن", "الكيلوغرام"], answer: 3 },
  { q: "أي مما يلي يعتبر من الثدييات؟", options: ["السلمون", "الدلفين", "القرش", "التمساح"], answer: 1 },
  { q: "كم عدد أرجل العنكبوت؟", options: ["8", "6", "4", "10"], answer: 0 },
  { q: "ما الطبقة التي تحمينا من الأشعة فوق البنفسجية؟", options: ["طبقة الأوزون", "الغيوم", "طبقة الميثان", "طبقة الأكسجين"], answer: 0 },
  { q: "ما أقرب نجم إلى الأرض؟", options: ["القمر", "الشمس", "الشعرى", "القطب"], answer: 1 },
  { q: "ما أكبر قارة في العالم من حيث المساحة؟", options: ["آسيا", "أمريكا الشمالية", "أفريقيا", "أوروبا"], answer: 0 },
  { q: "ما أصغر قارة في العالم من حيث المساحة؟", options: ["أمريكا الجنوبية", "أنتاركتيكا", "أوروبا", "أستراليا"], answer: 3 },
  { q: "ما أعلى قمة جبلية في العالم؟", options: ["الألب", "كي 2", "إفرست", "كليمنجارو"], answer: 2 },
  { q: "ما أكبر دولة عربية من حيث المساحة؟", options: ["السودان", "السعودية", "الجزائر", "ليبيا"], answer: 2 },
  { q: "ناتج 15 + 27 يساوي؟", options: ["52", "42", "32", "41"], answer: 1 },
  { q: "ناتج 9 × 9 يساوي؟", options: ["81", "90", "99", "72"], answer: 0 },
  { q: "ناتج 100 ÷ 4 يساوي؟", options: ["50", "25", "40", "20"], answer: 1 },
  { q: "أي الأعداد التالية عدد أولي؟", options: ["21", "15", "27", "17"], answer: 3 },
  { q: "كم يساوي 25% من العدد 200؟", options: ["25", "100", "40", "50"], answer: 3 },
  { q: "ما محيط مربع طول ضلعه 5 سم؟", options: ["15 سم", "10 سم", "20 سم", "25 سم"], answer: 2 },
  { q: "ما مساحة مستطيل طوله 6 وعرضه 4؟", options: ["24", "20", "28", "10"], answer: 0 },
  { q: "كم يساوي 2 أس 5؟", options: ["25", "64", "32", "16"], answer: 2 },
  { q: "كم شهراً في السنة الميلادية عدد أيامه 31 يوماً؟", options: ["6", "7", "5", "8"], answer: 1 },
  { q: "ما نصف العدد 150؟", options: ["85", "75", "65", "50"], answer: 1 },
  { q: "ما ضد كلمة «كبير»؟", options: ["قوي", "طويل", "صغير", "واسع"], answer: 2 },
  { q: "ما مرادف كلمة «جميل»؟", options: ["ضخم", "بعيد", "رائع", "قبيح"], answer: 2 },
  { q: "ما الفعل في الجملة: «كتب الطالب الدرس»؟", options: ["الدرس", "كتب", "الطالب", "لا يوجد فعل"], answer: 1 },
  { q: "ما نوع الكلمة «مدرسة»؟", options: ["حرف", "اسم", "ضمير", "فعل"], answer: 1 },
  { q: "ما هي عاصمة اليابان؟", options: ["سيول", "بانكوك", "بكين", "طوكيو"], answer: 3 },
  { q: "ما هي عاصمة تركيا؟", options: ["بورصة", "إزمير", "إسطنبول", "أنقرة"], answer: 3 },
  { q: "ما هي عاصمة ألمانيا؟", options: ["هامبورغ", "ميونخ", "فرانكفورت", "برلين"], answer: 3 },
  { q: "ما أصغر كوكب في المجموعة الشمسية؟", options: ["عطارد", "المريخ", "نبتون", "الزهرة"], answer: 0 },
  { q: "أين تقع الأهرامات الشهيرة في الجيزة؟", options: ["العراق", "مصر", "الأردن", "سوريا"], answer: 1 },
  { q: "من العالم الذي ارتبط اسمه باكتشاف قانون الجاذبية؟", options: ["داروين", "إسحاق نيوتن", "ألبرت أينشتاين", "غاليليو"], answer: 1 },
  { q: "أي حيوان ينتج العسل؟", options: ["الفراشة", "النحل", "الدبور", "النمل"], answer: 1 }
];

let quizTimer = null;
let quizTimeLeft = 30;
let quizScore = 0;
let currentQuestionIdx = 0;

// نصوص اللغات
const translations = {
  ar: {
    homeBtnText: "الرئيسية",
    appTitle: "منظم وقت الدراسة",
    progressText: "التقدم: ",
    badgeTitle: "وسام التميز الأسبوعي:",
    taskNamePlaceholder: "اسم المهمة الدراسية...",
    btnAddTask: "إضافة المهمة",
    tasksHeading: "قائمة المهام اليومية",
    emptyTasks: "لم تضف أي مهام حتى الآن",
    timerHeading: "المؤقت الدراسـي",
    btnPauseTimer: "إيقاف مؤقت",
    btnResumeTimer: "استئناف",
    btnResetTimer: "إعادة ضبط",
    calendarHeading: "الروزنامة والمواعيد",
    selectedDateDefault: "اختر يوماً من الروزنامة",
    calendarTaskPlaceholder: "عنوان الموعد أو الاختبار...",
    calendarNotePlaceholder: "ملاحظة إضافية...",
    btnAddCalendarTask: "إضافة للروزنامة",
    themeDark: "الوضع الداكن",
    themeLight: "الوضع الفاتح",
    start: "ابدأ",
    finish: "إنهاء",
    cancel: "إلغاء",
    delete: "حذف",
    proBadge: "أصبحت حريفاً رسمياً!",
    fireBadge: "سريع الاشتعال",
    starterBadge: "مبتدئ مواظب",
    cardScheduleTitle: "الجداول",
    cardOrganizerTitle: "منظم الدراسة",
    cardWhatWeKnowTitle: "الترفيه",
    cardSchoolInfoTitle: "ماذا اعرف عن مدرستي",
    cardSpeedQuizTitle: "اسئلة سرعة",
    scheduleHeading: "الجداول",
    wwkTitle: "الترفيه",
    cardFeedbackTitle: "رأيك",
    cardFunTitle: "لعبة الذاكرة",
    feedbackHeading: "شاركنا رأيك",
    feedbackPlaceholder: "اكتب رأيك أو اقتراحك هنا...",
    btnSendFeedback: "إرسال",
    feedbackEmpty: "الرجاء كتابة رأيك أولاً"
  },
  en: {
    homeBtnText: "Home",
    appTitle: "Study Time Organizer",
    progressText: "Progress: ",
    badgeTitle: "Weekly Achievement Badge:",
    taskNamePlaceholder: "Study task name...",
    btnAddTask: "Add Task",
    tasksHeading: "Daily Tasks List",
    emptyTasks: "No tasks added yet",
    timerHeading: "Study Timer",
    btnPauseTimer: "Pause",
    btnResumeTimer: "Resume",
    btnResetTimer: "Reset",
    calendarHeading: "Calendar & Events",
    selectedDateDefault: "Select a date from calendar",
    calendarTaskPlaceholder: "Event or exam title...",
    calendarNotePlaceholder: "Additional note...",
    btnAddCalendarTask: "Add to Calendar",
    themeDark: "Dark Mode",
    themeLight: "Light Mode",
    start: "Start",
    finish: "Done",
    cancel: "Undo",
    delete: "Delete",
    proBadge: "You are an Official Pro!",
    fireBadge: "On Fire!",
    starterBadge: "Consistent Beginner",
    cardScheduleTitle: "Schedules",
    cardOrganizerTitle: "Study Organizer",
    cardWhatWeKnowTitle: "Entertainment",
    cardSchoolInfoTitle: "About My School",
    cardSpeedQuizTitle: "Speed Quiz",
    scheduleHeading: "Schedules",
    wwkTitle: "Entertainment",
    cardFeedbackTitle: "Your Opinion",
    cardFunTitle: "Memory Game",
    feedbackHeading: "Share Your Opinion",
    feedbackPlaceholder: "Write your opinion or suggestion here...",
    btnSendFeedback: "Send",
    feedbackEmpty: "Please write your opinion first"
  }
};

const funnyQuotes = {
  ar: [
    { text: "أصبحت أشك إنك نيوتن شخصياً!" },
    { text: "تقدمك هذا مذهل.. سيغمى عليّ من السرعة!" },
    { text: "يجب أن تأخذ وسام التميز على هذا الأداء البطولي!" },
    { text: "خفف سرعتك، القواعد الفيزيائية لا تتحمل هذا الإنجاز!" }
  ],
  en: [
    { text: "I'm starting to suspect you're Newton himself!" },
    { text: "This progress is insane.. I'm gonna pass out from speed!" },
    { text: "You deserve a medal for this heroic performance!" }
  ]
};

document.addEventListener("DOMContentLoaded", () => {
  initApp();
  setupEventListeners();
  document.dispatchEvent(new Event("app-ready"));
});

// مكتبة Supabase تُحمَّل بدون تعطيل بدء التطبيق، وعند وصولها نربط القاعدة ونحمّل الإعلانات والصور
function onSupabaseReady() {
  if (sb) return;
  initSupabase();
  if (!sb) return;
  loadAnnouncements();
  loadGalleryImages();
}
window.__onSupabase = onSupabaseReady;

function initApp() {
  if (typeof supabase !== "undefined") initSupabase();
  setRole("student", "");
  applyTheme(currentTheme);
  applyLanguage(currentLang);
  loadTasks();
  loadCalendarTasks();
  checkWeeklyBadge();
  showTasks();
  renderCalendar();
  renderSchedule();

  showSection("homeScreen", "replace");
  startGalleryRotation();
  setTimeout(loadGalleryImages, 2500);
  if (location.hash === "#/join") openTam(true);
}

function setupEventListeners() {
  document.getElementById("btnToggleTheme").addEventListener("click", toggleTheme);
  setupExtras();
  setupBackArrowLogic();

  // الصفحة الرئيسية والأدوار
  document.getElementById("galleryBox").addEventListener("click", () => document.getElementById("galleryModal").classList.remove("hidden"));
  document.getElementById("btnCloseGallery").addEventListener("click", () => document.getElementById("galleryModal").classList.add("hidden"));
  document.querySelectorAll(".role-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const role = btn.dataset.role;
      if (role === "student") {
        setRole("student", "");
        showSection("mainMenu");
      } else {
        loginTarget = role;
        document.getElementById("loginTitle").textContent = portalTitles[role];
        document.getElementById("loginUser").value = "";
        document.getElementById("loginPass").value = "";
        document.getElementById("loginMsg").textContent = "";
        showSection("loginSection");
      }
    });
  });
  document.getElementById("btnLogin").addEventListener("click", doLogin);
  document.getElementById("loginPass").addEventListener("keydown", e => { if (e.key === "Enter") doLogin(); });
  document.getElementById("btnLogout").addEventListener("click", logout);
  document.getElementById("cardPassword").addEventListener("click", () => {
    ["pwOld", "pwNew", "pwNew2"].forEach(id => document.getElementById(id).value = "");
    document.getElementById("pwMsg").textContent = "";
    showSection("passwordSection");
  });
  document.getElementById("btnChangePassword").addEventListener("click", changeMyPassword);
  document.getElementById("cardTeachers").addEventListener("click", () => showSection("teachersSection"));
  document.getElementById("cardMyCard").addEventListener("click", () => showSection("teachersSection"));
  document.getElementById("btnCloseTeacher").addEventListener("click", () => document.getElementById("teacherModal").classList.add("hidden"));
  document.getElementById("btnAddTeacher").addEventListener("click", addTeacher);
  document.getElementById("floatBack").addEventListener("click", goBack);
  document.getElementById("btnAddAnnounce").addEventListener("click", addAnnouncement);
  document.getElementById("btnEditSchedule").addEventListener("click", toggleScheduleEdit);
  document.getElementById("btnSaveSchedule").addEventListener("click", saveSchedule);

  // التناقل بين الشاشات

  document.querySelectorAll(".btnHome").forEach(btn => {
    btn.addEventListener("click", () => showSection("mainMenu"));
  });

  document.getElementById("cardSchedule").addEventListener("click", () => showSection("scheduleSection"));
  document.getElementById("cardOrganizer").addEventListener("click", () => showSection("organizerSection"));
  document.getElementById("cardWhatWeKnow").addEventListener("click", () => {
    showSection("whatWeKnowSection");
    hideWwkSubs();
  });

  document.getElementById("cardSpeedQuiz").addEventListener("click", () => {
    showWwkSub("speedQuizSub");
    resetQuizUI();
  });

  document.getElementById("cardFun").addEventListener("click", () => {
    showWwkSub("funSub");
    startMemoryGame();
  });
  document.getElementById("btnRestartMemory").addEventListener("click", startMemoryGame);

  // منظم الدراسة
  document.getElementById("btnAddTask").addEventListener("click", addTask);
  document.getElementById("btnPauseTimer").addEventListener("click", pauseTimer);
  document.getElementById("btnResumeTimer").addEventListener("click", resumeTimer);
  document.getElementById("btnResetTimer").addEventListener("click", resetTimer);
  document.getElementById("btnPrevMonth").addEventListener("click", () => { currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1); renderCalendar(); });
  document.getElementById("btnNextMonth").addEventListener("click", () => { currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1); renderCalendar(); });
  document.getElementById("btnAddCalendarTask").addEventListener("click", addCalendarTask);

  // رأيك
  document.getElementById("bubFeedback").addEventListener("click", () => showSection("feedbackSection"));
  const INFO = { vision: ["رؤيتنا", "images/vision.jpg", "نحو مدرسة رائدة في التميز والتعلم المستدام، وبيئة آمنة وشراكة فاعلة، وقيادة تشاركية عادلة وشفافة."], mission: ["رسالتنا", "images/mission.jpg", "تلتزم المدرسة بتقديم تعليم نوعي يركز على تحسين تعلم الطلبة ورفع أدائهم، وتوفير بيئة مدرسية آمنة ونظيفة، وبناء شراكات فاعلة مع الأسرة والمجتمع المحلي، وتمكين الكادر المدرسي من المشاركة في القيادة وتحمل المسؤوليات بعدالة وشفافية؛ لتحقيق التحسين المستمر والتميز المدرسي."] };
  document.querySelectorAll(".info-btn").forEach(b => b.addEventListener("click", () => {
    const d = INFO[b.dataset.info];
    document.getElementById("infoTitle").textContent = d[0];
    document.getElementById("infoImg").src = d[1];
    document.getElementById("infoText").textContent = d[2];
    document.getElementById("infoModal").classList.remove("hidden");
  }));
  document.getElementById("btnCloseInfo").addEventListener("click", () => document.getElementById("infoModal").classList.add("hidden"));
  document.getElementById("btnSendFeedback").addEventListener("click", sendFeedback);

  // أسئلة السرعة
  document.getElementById("btnStartQuiz").addEventListener("click", startSpeedQuiz);
  document.getElementById("btnRestartQuiz").addEventListener("click", startSpeedQuiz);
}

let currentSectionId = "homeScreen";
function goBack() {
  if (history.state && history.state.sub) { history.back(); return; }
  const c = currentSectionId;
  showSection(c === "mainMenu" || c === "loginSection" || c === "feedbackSection" || (c === "tamSection" && tamFromQr) ? "homeScreen" : (c === "teachersSection" && currentRole === "teacher" ? "mainMenu" : "mainMenu"));
}

let galleryIdx = 0;
function startGalleryRotation() {
  // لا نحمّل إلا الصورة الحالية والتي بعدها، بدل تحميل كل الصور عند الفتح
  const load = i => {
    const el = document.querySelectorAll("#galleryBox img")[i];
    if (el && !el.getAttribute("src") && el.dataset.src) el.src = el.dataset.src;
  };
  load(1);
  setInterval(() => {
    const imgs = document.querySelectorAll("#galleryBox img");
    if (imgs.length < 2) return;
    imgs.forEach(i => i.classList.remove("on"));
    galleryIdx = (galleryIdx + 1) % imgs.length;
    load(galleryIdx);
    load((galleryIdx + 1) % imgs.length);
    imgs[galleryIdx].classList.add("on");
  }, 3000);
}

function showSection(sectionId, mode = "push") {
  clearInterval(quizTimer);
  const gm = document.getElementById("galleryModal");
  if (gm) gm.classList.add("hidden");
  const im = document.getElementById("infoModal");
  if (im) im.classList.add("hidden");
  ["imgViewer", "posterModal"].forEach(id => { const m = document.getElementById(id); if (m) m.classList.add("hidden"); });
  if (typeof stopBreathing === "function") stopBreathing();
  const sections = ["homeScreen", "loginSection", "mainMenu", "scheduleSection", "organizerSection", "whatWeKnowSection", "feedbackSection", "teachersSection", "passwordSection", "tamSection", "tamDashSection", "myTasksSection"];
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add("hidden");
  });
  currentSectionId = sectionId;
  document.getElementById("floatBack").classList.toggle("hidden", sectionId === "homeScreen");
  const target = document.getElementById(sectionId);
  if (target) target.classList.remove("hidden");
  if (sectionId === "teachersSection") loadTeachers();
  if (sectionId === "homeScreen") loadAnnouncements();

  if (mode === "replace") {
    history.replaceState({ section: sectionId }, "");
  } else if (mode === "push") {
    const cur = history.state;
    if (!(cur && cur.section === sectionId && !cur.sub)) {
      history.pushState({ section: sectionId }, "");
    }
  }
}

function showWwkSub(subId) {
  hideWwkSubs();
  document.getElementById(subId).classList.remove("hidden");
  history.pushState({ section: "whatWeKnowSection", sub: subId }, "");
}

// زر الرجوع في الهاتف / المتصفح
window.addEventListener("popstate", (e) => {
  const st = e.state;
  if (!st || !st.section) return;
  showSection(st.section, "none");
  if (st.section === "whatWeKnowSection") {
    hideWwkSubs();
    if (st.sub) {
      document.getElementById(st.sub).classList.remove("hidden");
      if (st.sub === "speedQuizSub") resetQuizUI();
      if (st.sub === "funSub") startMemoryGame();
    }
  }
});

// ---- إدارة الجداول المدرسية ----
function switchGrade(gradeKey) {
  selectedGrade = gradeKey;
  const btns = document.querySelectorAll('.grade-btn');
  btns.forEach(b => b.classList.remove('active'));
  
  const map = { g7: 0, g8: 1, g9: 2, g10: 3, g11: 4, g12: 5 };
  if (btns[map[gradeKey]]) btns[map[gradeKey]].classList.add('active');

  renderSchedule();
  if (schedMode === 'exam') renderExams();
}

function switchSection(secKey) {
  selectedSection = secKey;
  const btns = document.querySelectorAll('.section-btn');
  btns.forEach(b => b.classList.remove('active'));

  const map = { a: 0, b: 1, c: 2 };
  if (btns[map[secKey]]) btns[map[secKey]].classList.add('active');

  renderSchedule();
}

async function getSchedule(g, sec) {
  const key = g + "_" + sec;
  if (scheduleCache[key]) return scheduleCache[key];
  let rows = (schedulesData[g] && schedulesData[g][sec]) || [];
  if (sb) {
    try {
      const { data } = await sb.from("schedules").select("data").eq("key", key).maybeSingle();
      if (data && Array.isArray(data.data)) rows = data.data;
    } catch (e) { console.error(e); }
  }
  scheduleCache[key] = rows;
  return rows;
}

async function renderSchedule() {
  const tbody = document.getElementById("scheduleTableBody");
  if (!tbody) return;
  const g = selectedGrade, sec = selectedSection;
  const rows = await getSchedule(g, sec);
  if (g !== selectedGrade || sec !== selectedSection) return;

  tbody.innerHTML = "";
  rows.forEach(row => {
    const tr = document.createElement("tr");
    row.forEach((cell, i) => {
      const td = document.createElement("td");
      if (scheduleEditing && i > 0) {
        const inp = document.createElement("input");
        inp.className = "sched-input";
        inp.value = cell;
        td.appendChild(inp);
      } else {
        td.textContent = cell;
      }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

function toggleScheduleEdit() {
  if (currentRole !== "admin") return;
  scheduleEditing = !scheduleEditing;
  document.getElementById("btnEditSchedule").textContent = scheduleEditing ? "إلغاء التعديل" : "تعديل الجدول";
  document.getElementById("btnSaveSchedule").classList.toggle("hidden", !scheduleEditing);
  renderSchedule();
}

async function saveSchedule() {
  if (!sb || currentRole !== "admin") return;
  const rows = [...document.querySelectorAll("#scheduleTableBody tr")].map(tr =>
    [...tr.children].map((td, i) => i === 0 ? td.textContent : (td.querySelector("input").value.trim() || "-"))
  );
  const key = selectedGrade + "_" + selectedSection;
  const { error } = await sb.from("schedules").upsert({ key: key, data: rows });
  if (error) {
    alert("تعذر الحفظ: " + error.message);
    return;
  }
  scheduleCache[key] = rows;
  alert("تم حفظ الجدول لجميع المستخدمين");
  toggleScheduleEdit();
}

// ---- الوضع الداكن والفاتح ----
function toggleTheme() {
  currentTheme = currentTheme === "light" ? "dark" : "light";
  localStorage.setItem("appTheme", currentTheme);
  applyTheme(currentTheme);
}

function applyTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("dark-mode");
    document.getElementById("themeBtnText").textContent = currentLang === "ar" ? "الوضع الفاتح" : "Light Mode";
  } else {
    document.body.classList.remove("dark-mode");
    document.getElementById("themeBtnText").textContent = currentLang === "ar" ? "الوضع الداكن" : "Dark Mode";
  }
}

// ---- تغيير اللغة ----
function toggleLanguage() {
  currentLang = currentLang === "ar" ? "en" : "ar";
  localStorage.setItem("appLang", currentLang);
  applyLanguage(currentLang);
  showTasks();
  renderCalendar();
}

function applyLanguage(lang) {
  const t = translations[lang];
  document.documentElement.setAttribute("lang", lang);
  document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");

  document.querySelectorAll(".homeBtnText").forEach(el => el.textContent = t.homeBtnText);

  document.getElementById("cardScheduleTitle").textContent = t.cardScheduleTitle;
  document.getElementById("cardOrganizerTitle").textContent = t.cardOrganizerTitle;
  document.getElementById("cardWhatWeKnowTitle").textContent = t.cardWhatWeKnowTitle;
  document.getElementById("cardSpeedQuizTitle").textContent = t.cardSpeedQuizTitle;
  document.getElementById("scheduleHeading").textContent = t.scheduleHeading;
  document.getElementById("wwkTitle").textContent = t.wwkTitle;
  
  document.getElementById("cardFunTitle").textContent = t.cardFunTitle;
  document.getElementById("feedbackHeading").textContent = t.feedbackHeading;
  document.getElementById("feedbackText").placeholder = t.feedbackPlaceholder;
  document.getElementById("btnSendFeedback").textContent = t.btnSendFeedback;

  document.getElementById("appTitle").textContent = t.appTitle;
  document.getElementById("badgeTitle").textContent = t.badgeTitle;
  document.getElementById("taskName").placeholder = t.taskNamePlaceholder;
  document.getElementById("btnAddTask").textContent = t.btnAddTask;
  document.getElementById("tasksHeading").textContent = t.tasksHeading;
  document.getElementById("timerHeading").textContent = t.timerHeading;
  document.getElementById("btnPauseTimer").textContent = t.btnPauseTimer;
  document.getElementById("btnResumeTimer").textContent = t.btnResumeTimer;
  document.getElementById("btnResetTimer").textContent = t.btnResetTimer;
  document.getElementById("calendarHeading").textContent = t.calendarHeading;
  document.getElementById("selectedDateText").textContent = t.selectedDateDefault;
  document.getElementById("calendarTaskName").placeholder = t.calendarTaskPlaceholder;
  document.getElementById("calendarTaskNote").placeholder = t.calendarNotePlaceholder;
  document.getElementById("btnAddCalendarTask").textContent = t.btnAddCalendarTask;

  applyTheme(currentTheme);
}

function hideWwkSubs() {
  ["speedQuizSub", "funSub"].forEach(id => document.getElementById(id).classList.add("hidden"));
  clearInterval(quizTimer);
}

// ---- لعبة الذاكرة ----
const memoryPairsData = [
  { a: "الأردن", b: "عمان", fact: "عمان عاصمة الأردن، وتُعرف بمدينة التلال السبعة." },
  { a: "فرنسا", b: "باريس", fact: "باريس عاصمة فرنسا وفيها برج إيفل الشهير." },
  { a: "مصر", b: "القاهرة", fact: "القاهرة عاصمة مصر وتقع على نهر النيل." },
  { a: "اليابان", b: "طوكيو", fact: "طوكيو عاصمة اليابان وهي من أكبر مدن العالم سكاناً." },
  { a: "السعودية", b: "الرياض", fact: "الرياض هي عاصمة المملكة العربية السعودية." },
  { a: "الذهب", b: "Au", fact: "رمز الذهب Au مأخوذ من الكلمة اللاتينية aurum." },
  { a: "الحديد", b: "Fe", fact: "رمز الحديد Fe مأخوذ من الكلمة اللاتينية ferrum." },
  { a: "الأكسجين", b: "O", fact: "الأكسجين يشكل نحو 21% من هواء الغلاف الجوي." },
  { a: "الماء", b: "H2O", fact: "جزيء الماء يتكون من ذرتي هيدروجين وذرة أكسجين." },
  { a: "الجمل", b: "سفينة الصحراء", fact: "الجمل يخزن الدهون في سنامه ويتحمل العطش أياماً طويلة." },
  { a: "المريخ", b: "الكوكب الأحمر", fact: "لون المريخ الأحمر سببه أكسيد الحديد في تربته." },
  { a: "الحوت الأزرق", b: "أكبر حيوان", fact: "الحوت الأزرق أكبر حيوان عرفته الأرض، ويصل طوله إلى نحو 30 متراً." },
  { a: "البتراء", b: "المدينة الوردية", fact: "البتراء بناها الأنباط، وهي من عجائب الدنيا السبع الجديدة." },
  { a: "العقبة", b: "ميناء الأردن", fact: "العقبة هي الميناء البحري الوحيد في الأردن وتقع على البحر الأحمر." },
  { a: "البحر الميت", b: "أخفض نقطة", fact: "البحر الميت أخفض نقطة على سطح اليابسة، ويقع نحو 430 متراً تحت مستوى سطح البحر." },
  { a: "نهر النيل", b: "أطول نهر", fact: "يُعدّ النيل أطول نهر في العالم، ويبلغ طوله نحو 6650 كم." }
];

let memoryCards = [];
let memoryFirst = null;
let memoryLock = false;
let memoryMoves = 0;
let memoryMatched = 0;
let memoryGameId = 0;

function startMemoryGame() {
  const pool = memoryPairsData.slice();
  shuffle(pool);
  memoryCards = [];
  pool.slice(0, 8).forEach((p, i) => {
    memoryCards.push({ pair: i, text: p.a, fact: p.fact, flipped: false, matched: false });
    memoryCards.push({ pair: i, text: p.b, fact: p.fact, flipped: false, matched: false });
  });
  shuffle(memoryCards);

  memoryGameId++;
  memoryFirst = null;
  memoryLock = false;
  memoryMoves = 0;
  memoryMatched = 0;
  document.getElementById("memoryFact").classList.add("hidden");
  renderMemoryGrid();
}

function renderMemoryGrid() {
  const grid = document.getElementById("memoryGrid");
  grid.innerHTML = "";
  memoryCards.forEach((card, idx) => {
    const btn = document.createElement("button");
    btn.className = "memory-card" + (card.matched ? " matched" : card.flipped ? " flipped" : "");
    btn.textContent = (card.flipped || card.matched) ? card.text : "?";
    btn.onclick = () => flipMemoryCard(idx);
    grid.appendChild(btn);
  });
  document.getElementById("memoryMoves").textContent = memoryMoves;
  document.getElementById("memoryPairs").textContent = memoryMatched;
}

function flipMemoryCard(idx) {
  const card = memoryCards[idx];
  if (memoryLock || card.flipped || card.matched) return;

  card.flipped = true;

  if (memoryFirst === null) {
    memoryFirst = idx;
    renderMemoryGrid();
    return;
  }

  const first = memoryCards[memoryFirst];
  memoryMoves++;

  if (first.pair === card.pair) {
    first.matched = true;
    card.matched = true;
    memoryMatched++;
    memoryFirst = null;
    const factBox = document.getElementById("memoryFact");
    factBox.textContent = memoryMatched === 8
      ? "أحسنت! أنهيت اللعبة في " + memoryMoves + " محاولة 🎉"
      : "💡 " + card.fact;
    factBox.classList.remove("hidden");
    renderMemoryGrid();
  } else {
    memoryLock = true;
    renderMemoryGrid();
    const gid = memoryGameId;
    setTimeout(() => {
      if (gid !== memoryGameId) return;
      first.flipped = false;
      card.flipped = false;
      memoryFirst = null;
      memoryLock = false;
      renderMemoryGrid();
    }, 900);
  }
}

// ---- رأيك (يفتح تطبيق البريد برسالة جاهزة) ----
const FEEDBACK_EMAIL = "d38227194@gmail.com";

function sendFeedback() {
  const box = document.getElementById("feedbackText");
  const msg = box.value.trim();
  if (!msg) {
    alert(translations[currentLang].feedbackEmpty);
    return;
  }
  const subject = encodeURIComponent("رأي في تطبيق نخبة");
  const body = encodeURIComponent(msg);
  window.location.href = `mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${body}`;
  box.value = "";
}

// ---- أسئلة السرعة ----
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function resetQuizUI() {
  clearInterval(quizTimer);
  document.getElementById("quizStartArea").classList.remove("hidden");
  document.getElementById("quizActiveArea").classList.add("hidden");
  document.getElementById("quizResultArea").classList.add("hidden");
}

function startSpeedQuiz() {
  quizTimeLeft = 30;
  quizScore = 0;
  currentQuestionIdx = 0;

  shuffle(speedQuestions);

  document.getElementById("quizStartArea").classList.add("hidden");
  document.getElementById("quizResultArea").classList.add("hidden");
  document.getElementById("quizActiveArea").classList.remove("hidden");

  document.getElementById("quizScoreText").textContent = quizScore;
  document.getElementById("quizTimerText").textContent = quizTimeLeft;

  showNextQuestion();

  clearInterval(quizTimer);
  quizTimer = setInterval(() => {
    quizTimeLeft--;
    document.getElementById("quizTimerText").textContent = quizTimeLeft;
    if (quizTimeLeft <= 0) {
      endSpeedQuiz();
    }
  }, 1000);
}

function showNextQuestion() {
  if (currentQuestionIdx >= speedQuestions.length) {
    endSpeedQuiz();
    return;
  }

  const q = speedQuestions[currentQuestionIdx];
  document.getElementById("quizQuestionText").textContent = q.q;

  const container = document.getElementById("quizOptionsContainer");
  container.innerHTML = "";

  const opts = q.options.map((o, i) => ({ o: o, ok: i === q.answer }));
  shuffle(opts);
  opts.forEach(item => {
    const btn = document.createElement("button");
    btn.className = "quiz-option-btn";
    btn.textContent = item.o;
    btn.onclick = () => checkAnswer(item.ok ? 1 : 0, 1);
    container.appendChild(btn);
  });
}

function checkAnswer(selected, correct) {
  if (selected === correct) {
    quizScore++;
    document.getElementById("quizScoreText").textContent = quizScore;
  }
  currentQuestionIdx++;
  showNextQuestion();
}

function endSpeedQuiz() {
  clearInterval(quizTimer);
  document.getElementById("quizActiveArea").classList.add("hidden");
  document.getElementById("quizResultArea").classList.remove("hidden");
  document.getElementById("finalScore").textContent = quizScore;
}

// ---- منظم الدراسة الأصلي ----
function saveTasks() { localStorage.setItem("appTasks", JSON.stringify(tasks)); }
function loadTasks() { tasks = JSON.parse(localStorage.getItem("appTasks")) || []; }
function saveCalendarTasks() { localStorage.setItem("appCalendar", JSON.stringify(calendarTasks)); }
function loadCalendarTasks() { calendarTasks = JSON.parse(localStorage.getItem("appCalendar")) || []; }

function updateProgressBar() {
  const progressBar = document.getElementById("progressBar");
  const progressText = document.getElementById("progressText");
  const t = translations[currentLang];

  if (!tasks || tasks.length === 0) {
    if (progressBar) progressBar.style.width = "0%";
    if (progressText) progressText.textContent = t.progressText + "0%";
    return;
  }

  const doneCount = tasks.filter(task => task.done).length;
  const percentage = Math.round((doneCount / tasks.length) * 100);

  if (progressBar) progressBar.style.width = `${percentage}%`;
  if (progressText) progressText.textContent = `${t.progressText}${percentage}% (${doneCount}/${tasks.length})`;

  if (percentage === 100) triggerDayCompletion();
}

function showFunnyMotivation() {
  const box = document.getElementById("motivationBox");
  const quotesList = funnyQuotes[currentLang];
  const q = quotesList[Math.floor(Math.random() * quotesList.length)];

  document.getElementById("motivationText").textContent = q.text;
  box.style.display = "block";
}

function triggerDayCompletion() {
  const today = new Date().toDateString();
  if (weeklyProgress.lastCheckDate !== today) {
    weeklyProgress.completedDays = (weeklyProgress.completedDays % 7) + 1;
    weeklyProgress.lastCheckDate = today;
    localStorage.setItem("weeklyProgress", JSON.stringify(weeklyProgress));
  }
  showFunnyMotivation();
  checkWeeklyBadge();
}

function checkWeeklyBadge() {
  const badgeCard = document.getElementById("weeklyBadge");
  const badgeText = document.getElementById("badgeText");
  const t = translations[currentLang];

  const days = weeklyProgress.completedDays || 0;
  if (days >= 7) {
    badgeText.textContent = `${t.proBadge} (${days}/7)`;
    badgeCard.style.display = "block";
  } else if (days >= 4) {
    badgeText.textContent = `${t.fireBadge} (${days}/7)`;
    badgeCard.style.display = "block";
  } else if (days > 0) {
    badgeText.textContent = `${t.starterBadge} (${days}/7)`;
    badgeCard.style.display = "block";
  } else {
    badgeCard.style.display = "none";
  }
}

function addTask() {
  const nameInput = document.getElementById("taskName");
  const hoursInput = document.getElementById("taskHours");
  const minutesInput = document.getElementById("taskMinutes");
  const typeSelect = document.getElementById("taskType");

  const name = nameInput.value.trim();
  const hours = Number(hoursInput.value);
  const minutes = Number(minutesInput.value);

  if (!name || (hours === 0 && minutes === 0)) return;

  tasks.push({
    name: name,
    type: typeSelect.value,
    hours: hours,
    minutes: minutes,
    totalSeconds: (hours * 3600) + (minutes * 60),
    done: false
  });

  saveTasks();
  showTasks();
  nameInput.value = "";
}

function showTasks() {
  const box = document.getElementById("tasks");
  const t = translations[currentLang];
  updateProgressBar();

  if (!box) return;
  if (tasks.length === 0) {
    box.innerHTML = `<p class="empty">${t.emptyTasks}</p>`;
    return;
  }

  box.innerHTML = "";
  tasks.forEach((task, index) => {
    const div = document.createElement("div");
    div.className = task.done ? "task done" : "task";

    div.innerHTML = `
      <div style="font-weight:bold;">${escapeHTML(task.name)}</div>
      <div style="font-size:0.85rem; opacity: 0.8;">${escapeHTML(task.type)} | ${task.hours}h ${task.minutes}m</div>
      <div style="margin-top:8px; display:flex; gap:5px;">
        <button style="background:#10b981;" onclick="startTimer(${index})">${t.start}</button>
        <button style="background:#f59e0b;" onclick="finishTask(${index})">${task.done ? t.cancel : t.finish}</button>
        <button style="background:#ef4444;" onclick="deleteTask(${index})">${t.delete}</button>
      </div>
    `;
    box.appendChild(div);
  });
}

function finishTask(index) {
  tasks[index].done = !tasks[index].done;
  if (tasks[index].done) showFunnyMotivation();
  saveTasks();
  showTasks();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  showTasks();
}

// المؤقت
function startTimer(index) {
  clearInterval(timerInterval);
  currentTaskIndex = index;
  remainingSeconds = tasks[index].totalSeconds;
  timerRunning = true;
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    if (remainingSeconds > 0) {
      remainingSeconds--;
      updateTimerDisplay();
    } else {
      clearInterval(timerInterval);
      finishTask(index);
    }
  }, 1000);
}

function pauseTimer() { clearInterval(timerInterval); timerRunning = false; }
function resumeTimer() {
  if (timerRunning || remainingSeconds <= 0) return;
  timerRunning = true;
  timerInterval = setInterval(() => {
    if (remainingSeconds > 0) {
      remainingSeconds--;
      updateTimerDisplay();
    } else {
      clearInterval(timerInterval);
      if (currentTaskIndex !== null) finishTask(currentTaskIndex);
    }
  }, 1000);
}
function resetTimer() {
  clearInterval(timerInterval);
  remainingSeconds = 0;
  document.getElementById("timer").textContent = "00:00:00";
}
function updateTimerDisplay() {
  const h = Math.floor(remainingSeconds / 3600);
  const m = Math.floor((remainingSeconds % 3600) / 60);
  const s = remainingSeconds % 60;
  document.getElementById("timer").textContent = 
    String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
}

// الروزنامة
function dateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function renderCalendar() {
  const grid = document.getElementById("calendarGrid");
  const title = document.getElementById("monthTitle");
  if (!grid || !title) return;
  grid.innerHTML = "";

  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();

  title.textContent = currentCalendarDate.toLocaleDateString(currentLang === "ar" ? "ar-JO" : "en-US", { month: "long", year: "numeric" });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    empty.className = "calendar-day empty-day";
    grid.appendChild(empty);
  }

  const todayKey = dateKey(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

  for (let day = 1; day <= daysInMonth; day++) {
    const key = dateKey(year, month, day);
    const div = document.createElement("div");
    div.className = "calendar-day" + (key === todayKey ? " today" : "");
    div.onclick = () => selectCalendarDate(year, month, day);
    div.innerHTML = `<div>${day}</div>`;

    const dayTasks = calendarTasks.filter(t => t.date === key);
    if (dayTasks.length > 0) {
      div.innerHTML += `<div style="font-size:0.7rem; color:var(--primary-color);">• ${dayTasks.length}</div>`;
    }

    grid.appendChild(div);
  }
}

function selectCalendarDate(year, month, day) {
  selectedDateKey = dateKey(year, month, day);
  const date = new Date(year, month, day);
  document.getElementById("selectedDateText").textContent = date.toLocaleDateString(currentLang === "ar" ? "ar-JO" : "en-US", { weekday: "long", month: "long", day: "numeric" });
  showCalendarTasks();
}

function addCalendarTask() {
  if (!selectedDateKey) return;
  const nameInput = document.getElementById("calendarTaskName");
  const timeInput = document.getElementById("calendarTaskTime");
  const noteInput = document.getElementById("calendarTaskNote");

  if (!nameInput.value.trim()) return;

  calendarTasks.push({
    id: Date.now(),
    date: selectedDateKey,
    title: nameInput.value.trim(),
    time: timeInput.value,
    note: noteInput.value.trim()
  });

  saveCalendarTasks();
  renderCalendar();
  showCalendarTasks();
  nameInput.value = "";
  timeInput.value = "";
  noteInput.value = "";
}

function showCalendarTasks() {
  const box = document.getElementById("calendarTaskList");
  if (!box || !selectedDateKey) return;

  const dayTasks = calendarTasks.filter(t => t.date === selectedDateKey);
  box.innerHTML = "";

  dayTasks.forEach(task => {
    const div = document.createElement("div");
    div.style.cssText = "padding:8px; margin-top:5px; background:var(--task-bg); border-radius:6px; display:flex; justify-content:space-between; align-items:center;";
    div.innerHTML = `
      <div>
        <strong>${escapeHTML(task.title)}</strong> ${task.time ? task.time : ""}
        ${task.note ? `<div style="font-size:0.8rem; opacity:0.7;">${escapeHTML(task.note)}</div>` : ""}
      </div>
      <button style="background:#ef4444; padding:4px 8px; font-size:0.8rem;" onclick="deleteCalendarTask(${task.id})">حذف</button>
    `;
    box.appendChild(div);
  });
}

function deleteCalendarTask(id) {
  calendarTasks = calendarTasks.filter(t => t.id !== id);
  saveCalendarTasks();
  renderCalendar();
  showCalendarTasks();
}

// ---- قاعدة البيانات وتسجيل الدخول (Supabase) ----
function initSupabase() {
  try {
    if (typeof supabase === "undefined" || typeof SUPABASE_URL === "undefined" || SUPABASE_URL.startsWith("PASTE")) return;
    sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    sb.auth.signOut(); // كل جلسة جديدة تبدأ بدون تسجيل دخول
  } catch (e) { console.error(e); }
}

function setRole(role, name) {
  currentRole = role;
  currentName = name || "";
  if (role === "student") currentUsername = "";
  document.getElementById("roleLabel").textContent = roleLabels[role] + (name ? " - " + name : "");
  document.getElementById("btnLogout").textContent = "خروج";
  document.getElementById("btnLogout").classList.toggle("hidden", role === "student");
  document.querySelectorAll(".admin-only").forEach(el => el.classList.toggle("hidden", role !== "admin"));
  document.querySelectorAll("[data-roles]").forEach(el => el.classList.toggle("hidden", !el.dataset.roles.split(" ").includes(role)));
  const hint = document.getElementById("menuHint");
  if (hint) hint.textContent = role === "admin" ? "إدارة المعلمين والجدول والإعلانات" : role === "student" ? "اختر القسم للبدء" : "اختر القسم";
  scheduleEditing = false;
  document.getElementById("btnEditSchedule").textContent = "تعديل الجدول";
  document.getElementById("btnSaveSchedule").classList.add("hidden");
  renderSchedule();
  loadAnnouncements();
}

async function changeMyPassword() {
  const msg = document.getElementById("pwMsg");
  const oldP = document.getElementById("pwOld").value;
  const newP = document.getElementById("pwNew").value;
  const newP2 = document.getElementById("pwNew2").value;
  msg.style.color = "#ef4444";
  if (!sb || !currentUsername) { msg.textContent = "سجّل الدخول أولاً"; return; }
  if (!oldP || !newP) { msg.textContent = "املأ جميع الخانات"; return; }
  if (pwProblem(newP)) { msg.textContent = pwProblem(newP); return; }
  if (newP !== newP2) { msg.textContent = "كلمتا السر الجديدتان غير متطابقتين"; return; }
  if (newP === oldP) { msg.textContent = "الجديدة يجب أن تختلف عن الحالية"; return; }
  // تأكد من كلمة السر الحالية
  const { error: e1 } = await sb.auth.signInWithPassword({ email: currentUsername + "@nokhba.school", password: oldP });
  if (e1) { msg.textContent = "كلمة السر الحالية غير صحيحة"; return; }
  const { error: e2 } = await sb.auth.updateUser({ password: newP });
  if (e2) { msg.textContent = "تعذر التغيير: " + e2.message; return; }
  ["pwOld", "pwNew", "pwNew2"].forEach(id => document.getElementById(id).value = "");
  msg.style.color = "#22c55e";
  msg.textContent = "تم تغيير كلمة السر بنجاح";
}

async function doLogin() {
  const msg = document.getElementById("loginMsg");
  const u = document.getElementById("loginUser").value.trim().toLowerCase();
  const p = document.getElementById("loginPass").value;
  if (!u || !p) { msg.textContent = "أدخل اسم المستخدم وكلمة السر"; return; }
  if (!sb) { msg.textContent = "قاعدة البيانات غير مربوطة بعد (راجع supabase-config.js)"; return; }
  msg.textContent = "جاري الدخول...";

  const { error } = await sb.auth.signInWithPassword({ email: u + "@nokhba.school", password: p });
  if (error) {
    msg.textContent = /confirm/i.test(error.message)
      ? "الحساب غير مفعّل: فعّل Auto Confirm للمستخدم في Supabase"
      : "اسم المستخدم أو كلمة السر غير صحيحة";
    return;
  }

  const { data: prof, error: err2 } = await sb.from("profiles").select("role,name").eq("username", u).maybeSingle();
  if (err2 || !prof) {
    await sb.auth.signOut();
    msg.textContent = err2 ? "خطأ: " + err2.message : "لا يوجد صف باسم \"" + u + "\" في جدول profiles";
    return;
  }
  const allowed = loginTarget === "admin" ? ["admin", "staff"] : ["teacher"];
  if (!allowed.includes(prof.role)) {
    await sb.auth.signOut();
    msg.textContent = "هذا الحساب غير مخوّل للدخول من هذه البوابة";
    return;
  }
  currentUsername = u;
  setRole(prof.role, prof.name || u);
  showSection(prof.role === "teacher" ? "teachersSection" : "mainMenu", "replace");
}

function logout() {
  if (sb) sb.auth.signOut();
  setRole("student", "");
  showSection("homeScreen");
}

async function loadAnnouncements() {
  const home = document.getElementById("homeAnnouncements");
  const list = document.getElementById("announcementsList");
  if (!sb) { home.innerHTML = '<p class="muted">لا توجد إعلانات حالياً</p>'; return; }
  const { data, error } = await sb.from("announcements").select("id,text,created_at").order("created_at", { ascending: false }).limit(10);
  const items = (!error && data) ? data : [];
  home.innerHTML = items.length
    ? items.map(a => `<div class="ann-item"><span>${escapeHTML(a.text)}</span></div>`).join("")
    : '<p class="muted">لا توجد إعلانات حالياً</p>';
  list.innerHTML = "";
  if (currentRole !== "admin") return;
  items.forEach(a => {
    const div = document.createElement("div");
    div.className = "ann-item";
    div.innerHTML = `<span>${escapeHTML(a.text)}</span><button style="background:#ef4444; padding:4px 8px; font-size:0.8rem;" onclick="deleteAnnouncement(${Number(a.id)})">حذف</button>`;
    list.appendChild(div);
  });
}

async function addAnnouncement() {
  if (!sb || currentRole !== "admin") return;
  const box = document.getElementById("announceText");
  const text = box.value.trim();
  if (!text) return;
  const { error } = await sb.from("announcements").insert({ text: text, by_name: currentName });
  if (error) { alert("تعذر النشر: " + error.message); return; }
  box.value = "";
  loadAnnouncements();
}

async function deleteAnnouncement(id) {
  if (!sb || currentRole !== "admin") return;
  const { error } = await sb.from("announcements").delete().eq("id", id);
  if (error) { alert("تعذر الحذف: " + error.message); return; }
  loadAnnouncements();
}

// ---- المعلمين ----
function resizeImage(file, size = 300, square = true) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      if (square) {
        const side = Math.min(img.width, img.height);
        canvas.width = size; canvas.height = size;
        canvas.getContext("2d").drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
      } else {
        const k = Math.min(1, size / Math.max(img.width, img.height));
        canvas.width = Math.round(img.width * k); canvas.height = Math.round(img.height * k);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      }
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", square ? 0.8 : 0.7));
    };
    img.onerror = reject;
    img.src = url;
  });
}

function staffKey(t) {
  const c = t.category || "teacher";
  if (c === "teacher") return t.gender === "f" ? "tf" : "tm";
  return c;
}

function renderStaffTabs() {
  const box = document.getElementById("staffTabs");
  box.innerHTML = "";
  staffCategories.forEach(c => {
    const btn = document.createElement("button");
    btn.className = "tab-btn" + (c.key === currentStaffCat ? " active" : "");
    btn.textContent = c.label;
    btn.onclick = () => { currentStaffCat = c.key; renderStaffTabs(); renderStaff(); };
    box.appendChild(btn);
  });
}

async function loadTeachers() {
  const list = document.getElementById("teachersList");
  renderStaffTabs();
  if (!sb) { list.innerHTML = "<p style='text-align:center;'>قاعدة البيانات غير مربوطة</p>"; return; }
  const { data, error } = await sb.from("teachers")
    .select("id,username,name,specialty,photo,bio,category,gender,classes,tasks_text,years_experience")
    .order("created_at");
  if (error) { list.innerHTML = "<p style='text-align:center;'>" + escapeHTML(error.message) + "</p>"; return; }
  staffData = data;
  renderStaff();
}

const GRADES = [["7","السابع"],["8","الثامن"],["9","التاسع"],["10","العاشر"],["11","الحادي عشر"],["12","الثاني عشر"]];
const TAMANINA_URL = "https://ais-dev-edmcimlo5luskkwbjlby34-355668188961.europe-west3.run.app";
const LOGO_IMG = "images/school-logo.jpg";

function canEdit(t) {
  return currentRole === "admin" || (currentRole !== "student" && !!t.username && t.username === currentUsername);
}

function renderStaff() {
  const list = document.getElementById("teachersList");
  list.innerHTML = "";
  document.getElementById("teacherModal").classList.add("hidden");
  const own = currentRole === "teacher" || currentRole === "staff";
  document.getElementById("teachersHeading").textContent = own ? "بطاقتي" : "المعلمون والمعلمات";
  document.getElementById("staffTabs").classList.toggle("hidden", own);
  const items = own
    ? staffData.filter(t => t.username && t.username === currentUsername)
    : staffData.filter(t => staffKey(t) === currentStaffCat);
  if (items.length === 0) {
    list.innerHTML = "<p style='text-align:center;'>" + (own ? "لم يُربط حسابك ببطاقة بعد، تواصل مع الإدارة" : "لم تتم إضافة أحد في هذا القسم بعد") + "</p>";
    return;
  }
  if (own) {
    items.forEach(t => list.appendChild(buildCard(t)));
    const bar = document.createElement("div");
    bar.className = "tactions";
    bar.style.marginTop = "14px";
    const mk = (txt, color, fn) => { const b = document.createElement("button"); b.textContent = txt; if (color) b.style.background = color; b.onclick = fn; bar.appendChild(b); };
    mk("تغيير كلمة السر", "#64748b", () => showSection("passwordSection"));
    mk("خروج", "#ef4444", logout);
    list.appendChild(bar);
    return;
  }
  const wrap = document.createElement("div");
  wrap.className = "bubs";
  items.forEach(t => {
    const b = document.createElement("div");
    b.className = "bub";
    const photo = t.photo && t.photo.startsWith("data:image/") ? t.photo : LOGO_IMG;
    b.innerHTML = `<img src="${photo}" alt=""><b>${escapeHTML(t.name)}</b><small>${escapeHTML(t.specialty || "")}</small>`;
    b.onclick = () => {
      const body = document.getElementById("teacherModalBody");
      body.innerHTML = "";
      body.appendChild(buildCard(t));
      document.getElementById("teacherModal").classList.remove("hidden");
    };
    wrap.appendChild(b);
  });
  list.appendChild(wrap);
}

function buildCard(t) {
  const div = document.createElement("div");
  div.className = "tcard";
  const photo = t.photo && t.photo.startsWith("data:image/") ? t.photo : LOGO_IMG;
  const isTeacher = (t.category || "teacher") === "teacher";
  const isCounselor = t.category === "counselor";
  const isLibrarian = t.category === "librarian";
  const isAssistant = t.category === "assistant";
  div.innerHTML =
    `<div class="trow"><img class="tphoto" src="${photo}" alt="">` +
    `<div class="tinfo"><div class="teacher-name">${escapeHTML(t.name)}</div><div class="teacher-spec">${escapeHTML(t.specialty || "")}</div>` +
    (t.years_experience != null ? `<div class="tyears">سنوات الخبرة: ${Number(t.years_experience)}</div>` : "") + `</div></div>` +
    `<div class="tbio">${escapeHTML(t.bio || "لا توجد نبذة بعد")}</div>` +
    (isTeacher ? `<div class="tbubbles"><button class="tb" data-p="classes">العلاقات الدراسية</button><button class="tb" data-p="tasks">المهام والاختبارات</button></div>` : "") +
    ((isCounselor && (currentRole === "student" || canEdit(t))) ? `<div class="tbubbles"><button class="tb" data-p="tam">طمأنينة</button></div>` : "") +
    (isLibrarian ? `<div class="tbubbles"><button class="tb" data-p="loans">الكتب المستعارة</button></div>` : "") +
    (isAssistant ? `<div class="tbubbles"><button class="tb" data-p="notices">الإعلانات</button></div>` : "") +
    `<div class="tpanel hidden"></div><div class="tactions"></div>`;

  const panel = div.querySelector(".tpanel");
  div.querySelectorAll(".tb").forEach(b => b.onclick = () => {
    const p = b.dataset.p;
    if (p === "tam") { if (currentRole === "student") openTam(false); else openTamDash(); return; }
    if (!panel.classList.contains("hidden") && panel.dataset.cur === p) { panel.classList.add("hidden"); return; }
    panel.dataset.cur = p;
    if (p === "classes") showClasses(t, panel); else if (p === "loans") showLoans(t, panel); else if (p === "notices") showNotices(t, panel); else showTeacherTasks(t, panel);
  });

  const acts = div.querySelector(".tactions");
  const addBtn = (txt, color, fn) => {
    const b = document.createElement("button");
    b.textContent = txt;
    if (color) b.style.background = color;
    b.onclick = fn;
    acts.appendChild(b);
  };
  if (canEdit(t)) addBtn("تعديل البطاقة", null, () => { panel.dataset.cur = "edit"; showEdit(t, panel); });
  if (currentRole === "admin") {
    if (t.username) addBtn("كلمة السر", "#64748b", () => resetPassword(t.username));
    addBtn("حذف", "#ef4444", () => deleteTeacher(t.id, t.username));
  }
  return div;
}

function showEdit(t, panel) {
  panel.classList.remove("hidden");
  panel.innerHTML = `<h4>تعديل البطاقة</h4>
    <input class="e-name" placeholder="الاسم" value="${escapeHTML(t.name || "")}">
    <input class="e-spec" placeholder="التخصص" value="${escapeHTML(t.specialty || "")}">
    ${true ? `<input class="e-years" type="number" min="0" max="60" inputmode="numeric" placeholder="سنوات الخبرة" value="${t.years_experience != null ? Number(t.years_experience) : ""}">` : ""}
    <textarea class="e-bio" maxlength="600" placeholder="النبذة">${escapeHTML(t.bio || "")}</textarea>
    <input class="e-photo" type="file" accept="image/*">
    <button class="mini">حفظ</button>`;
  panel.querySelector(".mini").onclick = async () => {
    const name = panel.querySelector(".e-name").value.trim();
    if (!name) { alert("اكتب الاسم"); return; }
    const patch = { name: name, specialty: panel.querySelector(".e-spec").value.trim(), bio: panel.querySelector(".e-bio").value.trim().slice(0, 600) };
    const yEl = panel.querySelector(".e-years");
    if (yEl) { const y = yEl.value.trim(); patch.years_experience = y === "" ? null : Math.max(0, Math.min(60, parseInt(y, 10) || 0)); }
    const f = panel.querySelector(".e-photo").files[0];
    if (f) { try { patch.photo = await resizeImage(f); } catch (e) { alert("تعذر قراءة الصورة"); return; } }
    let err;
    if (currentRole === "admin") {
      ({ error: err } = await sb.from("teachers").update(patch).eq("id", t.id));
    } else {
      ({ error: err } = await sb.rpc("update_my_card_v3", { p_name: patch.name, p_specialty: patch.specialty, p_bio: patch.bio, p_photo: patch.photo ?? null, p_years: patch.years_experience ?? null }));
    }
    if (err) { alert("تعذر الحفظ: " + err.message); return; }
    alert("تم الحفظ");
    loadTeachers();
  };
}

async function saveWork(t, patch) {
  let err;
  if (currentRole === "admin") {
    ({ error: err } = await sb.from("teachers").update(patch).eq("id", t.id));
  } else {
    ({ error: err } = await sb.rpc("update_my_work", { p_classes: patch.classes ?? null, p_tasks_text: patch.tasks_text ?? null, p_tasks_images: patch.tasks_images ?? null }));
  }
  if (err) { alert("تعذر الحفظ: " + err.message); return false; }
  return true;
}

// صيغة الحفظ: "7-a,7-b,8-c" (الصف-الشعبة). والصيغة القديمة "7" تعني كل شعب الصف
function parseClasses(str) {
  const m = new Map();
  (str || "").split(",").map(x => x.trim()).filter(Boolean).forEach(tok => {
    const [g, s] = tok.split("-");
    if (!GRADES.some(x => x[0] === g)) return;
    if (!m.has(g)) m.set(g, new Set());
    if (!s) SECTIONS.forEach(x => m.get(g).add(x[0]));
    else if (SECTIONS.some(x => x[0] === s)) m.get(g).add(s);
  });
  return m;
}

async function saveClasses(t, v) {
  let err;
  if (currentRole === "admin") ({ error: err } = await sb.from("teachers").update({ classes: v }).eq("id", t.id));
  else ({ error: err } = await sb.rpc("update_my_classes", { p_classes: v }));
  if (err) { alert("تعذر الحفظ: " + err.message); return false; }
  return true;
}

function showClasses(t, panel) {
  const ed = canEdit(t);
  const sel = parseClasses(t.classes);
  panel.classList.remove("hidden");
  const rows = (ed ? GRADES : GRADES.filter(g => sel.has(g[0]))).map(([k, l]) => {
    const set = sel.get(k) || new Set();
    if (!ed) {
      const all = SECTIONS.every(s => set.has(s[0]));
      return `<div class="cls-row"><b>${l}</b><span class="chips">${all ? `<span class="chip on">كل الشعب</span>` : SECTIONS.filter(s => set.has(s[0])).map(s => `<span class="chip on">شعبة ${s[1]}</span>`).join("")}</span></div>`;
    }
    const allOn = SECTIONS.every(s => set.has(s[0]));
    return `<div class="cls-row"><b>${l}</b><span class="chips"><span class="chip ${allOn ? "on" : ""}" data-all="${k}">الكل</span>` +
      SECTIONS.map(([sk, sl]) => `<span class="chip ${set.has(sk) ? "on" : ""}" data-k="${k}-${sk}">${sl}</span>`).join("") + `</span></div>`;
  }).join("");
  panel.innerHTML = `<h4>الصفوف والشعب التي يدرّسها</h4>` + (rows || `<p class="muted">لم يتم تحديد الصفوف بعد</p>`) + (ed ? `<button class="mini">حفظ</button>` : "");
  if (!ed) return;
  const syncAll = g => {
    const chips = [...panel.querySelectorAll(`.chip[data-k^="${g}-"]`)];
    panel.querySelector(`.chip[data-all="${g}"]`).classList.toggle("on", chips.every(x => x.classList.contains("on")));
  };
  panel.querySelectorAll(".chip[data-k]").forEach(c => c.onclick = () => { c.classList.toggle("on"); syncAll(c.dataset.k.split("-")[0]); });
  panel.querySelectorAll(".chip[data-all]").forEach(c => c.onclick = () => {
    const g = c.dataset.all, on = !c.classList.contains("on");
    panel.querySelectorAll(`.chip[data-k^="${g}-"]`).forEach(x => x.classList.toggle("on", on));
    c.classList.toggle("on", on);
  });
  panel.querySelector(".mini").onclick = async () => {
    const v = [...panel.querySelectorAll(".chip.on[data-k]")].map(c => c.dataset.k).join(",");
    if (await saveClasses(t, v)) { t.classes = v; alert("تم الحفظ"); }
  };
}

const MAX_TASK_IMGS = 10;   // صور لكل مهمة
const MAX_TASKS = 20;       // عدد المهام المحفوظة لكل معلم
const SECTIONS = [["a", "أ"], ["b", "ب"], ["c", "ج"]];
const sectionLabel = k => (SECTIONS.find(s => s[0] === k) || [k, k])[1];
const taskTags = x => (x.classes || []).map(k => `<span class="chip on">${escapeHTML(gradeLabel(k))}</span>`).join("") +
  ((x.sections || []).length ? `<span class="chip on">شعبة ${x.sections.map(sectionLabel).join("، ")}</span>` : "");
const gradeLabel = k => (GRADES.find(g => g[0] === k) || [k, k])[1];

async function saveTeacherTasks(t, tasks) {
  let err;
  if (currentRole === "admin") {
    ({ error: err } = await sb.from("teachers").update({ tasks: tasks, tasks_text: null, tasks_images: null }).eq("id", t.id));
  } else {
    ({ error: err } = await sb.rpc("update_my_tasks", { p_tasks: tasks }));
  }
  if (err) { alert("تعذر الحفظ: " + err.message); return false; }
  t.tasks = tasks; t.tasks_text = null; t.tasks_images = [];
  return true;
}

async function showTeacherTasks(t, panel) {
  panel.classList.remove("hidden");
  panel.innerHTML = "<p class='muted'>جارٍ التحميل...</p>";
  if (t.tasks === undefined) {
    const { data, error } = await sb.from("teachers").select("tasks,tasks_text,tasks_images").eq("id", t.id).single();
    if (error) { panel.innerHTML = "<p class='muted'>" + escapeHTML(error.message) + "</p>"; return; }
    let tasks = Array.isArray(data && data.tasks) ? data.tasks : [];
    const oldImgs = Array.isArray(data && data.tasks_images) ? data.tasks_images : [];
    if (!tasks.length && ((data && data.tasks_text) || oldImgs.length)) {
      tasks = [{ id: "legacy", classes: [], text: data.tasks_text || "", images: oldImgs, date: null }];
    }
    t.tasks = tasks;
  }
  const ed = canEdit(t);
  const rel = parseClasses(t.classes);
  const own = [...rel.keys()];
  const options = own.length ? GRADES.filter(g => own.includes(g[0])) : GRADES;
  let filter = "all";
  const draft = { classes: new Set(), sections: new Set(), text: "", images: [] };

  const draw = () => {
    const list = [...t.tasks].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
    const used = [...new Set(list.flatMap(x => x.classes || []))];
    const shown = filter === "all" ? list : list.filter(x => (x.classes || []).includes(filter));
    let html = `<h4>المهام والاختبارات</h4>`;
    if (used.length > 1) {
      html += `<div class="chips">` + [["all", "الكل"]].concat(used.map(k => [k, gradeLabel(k)])).map(([k, l]) => `<span class="chip ${filter === k ? "on" : ""}" data-f="${k}">${l}</span>`).join("") + `</div>`;
    }
    html += shown.length ? shown.map(x => {
      const d = x.date ? new Date(x.date + "T00:00:00") : null;
      return `<div class="task" data-id="${escapeHTML(String(x.id))}">` +
        ((x.classes || []).length ? `<div class="chips">${taskTags(x)}</div>` : "") +
        (d && !isNaN(d) ? `<small class="muted">${escapeHTML(d.toLocaleDateString("ar-JO", { day: "numeric", month: "long", year: "numeric" }))}</small>` : "") +
        (x.text ? `<div class="tbio" style="white-space:pre-wrap;">${escapeHTML(x.text)}</div>` : "") +
        `<div class="timgs view">${(x.images || []).map((src, i) => `<div class="timg"><img src="${src}" alt=""><a class="dl" download="task-${i + 1}.jpg" href="${src}">تحميل</a></div>`).join("")}</div>` +
        (ed ? `<button class="mini del" style="background:#ef4444;">حذف المهمة</button>` : "") + `</div>`;
    }).join("") : `<p class="muted">لا يوجد شيء بعد</p>`;

    if (ed) {
      html += `<div class="task" style="border-style:dashed;"><h4 style="margin-top:0;">إضافة مهمة جديدة</h4>
        <p class="muted" style="margin:4px 0;">1) اختر الصفوف</p>
        <div class="chips add-grades">${options.map(([k, l]) => `<span class="chip ${draft.classes.has(k) ? "on" : ""}" data-k="${k}">${l}</span>`).join("")}</div>
        ${own.length ? "" : `<p class="muted" style="margin:4px 0;">لم تحدد صفوفك في «العلاقات الدراسية»، لذلك تظهر كل الصفوف.</p>`}
        <p class="muted" style="margin:8px 0 4px;">${own.length ? "الشعب (اختياري، وإذا لم تختر فنستخدم شعبك المحددة في العلاقات الدراسية)" : "الشعب (اختياري، وإذا لم تختر فالمهمة لكل الشعب)"}</p>
        <div class="chips add-sections">${SECTIONS.map(([k, l]) => `<span class="chip ${draft.sections.has(k) ? "on" : ""}" data-s="${k}">شعبة ${l}</span>`).join("")}</div>
        <p class="muted" style="margin:8px 0 4px;">2) اكتب المهمة أو الاختبار</p>
        <textarea class="tt" maxlength="3000" placeholder="اكتب المهام أو الاختبارات...">${escapeHTML(draft.text)}</textarea>
        <p class="muted" style="margin:8px 0 4px;">3) أضف صوراً (حتى ${MAX_TASK_IMGS})</p>
        <div class="timgs">${draft.images.map((src, i) => `<div class="timg"><img src="${src}" alt=""><b data-i="${i}">×</b></div>`).join("")}</div>
        <input type="file" class="tf" accept="image/*" multiple>
        <button class="mini add">إضافة المهمة</button></div>`;
    }
    panel.innerHTML = html;

    panel.querySelectorAll(".timg img").forEach(im => im.onclick = () => openViewer(im.src));
    panel.querySelectorAll(".chip[data-f]").forEach(c => c.onclick = () => { filter = c.dataset.f; draw(); });
    panel.querySelectorAll(".task .del").forEach(btn => btn.onclick = async () => {
      const id = btn.closest(".task").dataset.id;
      if (!confirm("حذف هذه المهمة؟")) return;
      if (await saveTeacherTasks(t, t.tasks.filter(x => String(x.id) !== id))) draw();
    });
    if (!ed) return;
    const ta = panel.querySelector(".tt");
    ta.oninput = () => { draft.text = ta.value; };
    panel.querySelectorAll(".add-grades .chip").forEach(c => c.onclick = () => {
      c.classList.toggle("on");
      if (c.classList.contains("on")) draft.classes.add(c.dataset.k); else draft.classes.delete(c.dataset.k);
    });
    panel.querySelectorAll(".add-sections .chip").forEach(c => c.onclick = () => {
      c.classList.toggle("on");
      if (c.classList.contains("on")) draft.sections.add(c.dataset.s); else draft.sections.delete(c.dataset.s);
    });
    panel.querySelectorAll(".timg b").forEach(b => b.onclick = () => { draft.images.splice(Number(b.dataset.i), 1); draw(); });
    panel.querySelector(".tf").onchange = async (e) => {
      draft.text = ta.value;
      for (const f of e.target.files) {
        if (draft.images.length >= MAX_TASK_IMGS) { alert("الحد الأقصى " + MAX_TASK_IMGS + " صور لكل مهمة"); break; }
        try { draft.images.push(await resizeImage(f, 1100, false)); } catch (x) { alert("تعذر قراءة صورة"); }
      }
      draw();
    };
    panel.querySelector(".add").onclick = async () => {
      const text = ta.value.trim().slice(0, 3000);
      if (!draft.classes.size) { alert("اختر صفاً واحداً على الأقل قبل إضافة المهمة"); return; }
      if (!text && !draft.images.length) { alert("اكتب المهمة أو أضف صورة"); return; }
      if (t.tasks.length >= MAX_TASKS) { alert("وصلت للحد الأقصى (" + MAX_TASKS + " مهمة). احذف مهمة قديمة أولاً"); return; }
      let secs = SECTIONS.map(s => s[0]).filter(k => draft.sections.has(k));
      if (!secs.length && rel.size) {
        const u = new Set();
        draft.classes.forEach(g => (rel.get(g) || new Set()).forEach(s => u.add(s)));
        secs = SECTIONS.map(s => s[0]).filter(k => u.has(k));
      }
      if (secs.length === SECTIONS.length) secs = [];
      const task = { id: Date.now().toString(36), classes: GRADES.map(g => g[0]).filter(k => draft.classes.has(k)), sections: secs, text: text, images: draft.images.slice(), date: new Date().toLocaleDateString("en-CA") };
      const all = [task].concat(t.tasks);
      if (JSON.stringify(all).length > 9000000) { alert("حجم الصور كبير جداً، احذف مهمة قديمة أو ارفع صوراً أصغر"); return; }
      if (await saveTeacherTasks(t, all)) { draft.classes.clear(); draft.sections.clear(); draft.text = ""; draft.images = []; alert("تمت إضافة المهمة"); draw(); }
    };
  };
  draw();
}

function pwProblem(p) {
  if (p.length < 8 || !/[a-z]/.test(p) || !/[A-Z]/.test(p) || !/\d/.test(p) || !/[^A-Za-z0-9]/.test(p))
    return "كلمة السر يجب أن تكون 8 أحرف على الأقل وتحتوي حرفاً كبيراً وحرفاً صغيراً ورقماً ورمزاً (مثل @ أو #)";
  return "";
}

async function manageUser(body) {
  const { data, error } = await sb.functions.invoke("manage-user", { body: body });
  if (error) {
    try { const j = await error.context.json(); return j.error || error.message; } catch (e) { return error.message; }
  }
  return data && data.error ? data.error : null;
}

async function addTeacher() {
  if (!sb || currentRole !== "admin") return;
  const name = document.getElementById("tName").value.trim();
  const specialty = document.getElementById("tSpecialty").value.trim();
  const username = document.getElementById("tUsername").value.trim().toLowerCase();
  const category = document.getElementById("tCategory").value;
  const password = document.getElementById("tPassword").value;
  const file = document.getElementById("tPhoto").files[0];
  const yRaw = document.getElementById("tYears").value.trim();
  const years = yRaw === "" ? null : Math.max(0, Math.min(60, parseInt(yRaw, 10) || 0));

  if (!name) { alert("اكتب الاسم"); return; }
  if (username && !/^[a-z0-9._-]+$/.test(username)) { alert("اسم المستخدم بالإنجليزي وأرقام فقط، بدون مسافات"); return; }

  if (username && pwProblem(password)) { alert(pwProblem(password)); return; }

  let photo = null;
  if (file) {
    try { photo = await resizeImage(file); } catch (e) { alert("تعذر قراءة الصورة"); return; }
  }

  const dbCategory = (category === "tm" || category === "tf") ? "teacher" : category;
  const gender = category === "tf" ? "f" : "m";

  if (username) {
    const err = await manageUser({ action: "create", username: username, password: password, name: name, role: dbCategory === "teacher" ? "teacher" : "staff" });
    if (err) { alert("تعذر إنشاء الحساب: " + err); return; }
  }
  const { error } = await sb.from("teachers").insert({ name: name, specialty: specialty, username: username || null, photo: photo, category: dbCategory, gender: gender, years_experience: years });
  if (error) {
    if (username) await manageUser({ action: "delete", username: username });
    alert("تعذر الإضافة: " + error.message);
    return;
  }

  if (false) {
    // صلاحية الدخول كمعلم (لا تغيّر الحساب إذا كان موجوداً مسبقاً)
    const { error: e2 } = await sb.from("profiles").upsert({ username: username, role: dbCategory === "teacher" ? "teacher" : "staff", name: name }, { onConflict: "username", ignoreDuplicates: true });
    if (e2) alert("أُضيف المعلم لكن تعذر تجهيز صلاحية الدخول: " + e2.message);
  }

  ["tName", "tSpecialty", "tYears", "tUsername", "tPassword", "tPhoto"].forEach(id => { document.getElementById(id).value = ""; });
  currentStaffCat = category;
  if (username) alert("تم إنشاء الحساب. اليوزر: " + username + "\nسلّم كلمة السر للشخص.");
  loadTeachers();
}

async function deleteTeacher(id, username) {
  if (!sb || currentRole !== "admin") return;
  if (!confirm(username ? "حذف البطاقة وحساب الدخول أيضاً؟" : "حذف هذه البطاقة؟")) return;
  const { error } = await sb.from("teachers").delete().eq("id", id);
  if (error) { alert("تعذر الحذف: " + error.message); return; }
  if (username) await manageUser({ action: "delete", username: username });
  loadTeachers();
}

async function resetPassword(username) {
  const p = prompt("كلمة السر الجديدة لـ " + username + " (8+ أحرف: كبير وصغير ورقم ورمز):");
  if (!p) return;
  if (pwProblem(p)) { alert(pwProblem(p)); return; }
  const err = await manageUser({ action: "reset", username: username, password: p });
  alert(err ? "تعذر التغيير: " + err : "تم تغيير كلمة السر");
}


function escapeHTML(text) {
  return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}


// ================= إضافات: عارض الصور =================
function openViewer(src) {
  const im = document.getElementById("viewerImg");
  im.src = src;
  const dl = document.getElementById("btnDownloadImg");
  if (dl) dl.href = src;
  im.classList.remove("zoomed");
  document.getElementById("imgViewer").classList.remove("hidden");
}

// ================= صور المدرسة (يضيفها المدير) =================
let galleryRows = [];
async function loadGalleryImages() {
  if (!sb) return;
  try {
    const { data, error } = await sb.from("gallery").select("id,img").order("created_at");
    if (error) return;
    galleryRows = (data || []).filter(r => /^data:image\//.test(r.img));
  } catch (e) { return; }
  const box = document.getElementById("galleryBox");
  box.querySelectorAll("img.db").forEach(i => i.remove());
  const span = box.querySelector("span");
  galleryRows.forEach(r => {
    const im = document.createElement("img");
    im.className = "db"; im.src = r.img; im.alt = "";
    box.insertBefore(im, span);
  });
  renderGalleryModal();
}

function renderGalleryModal() {
  const list = document.getElementById("galleryDbList");
  if (!list) return;
  list.innerHTML = "";
  galleryRows.forEach(r => {
    const d = document.createElement("div");
    d.className = "gitem";
    const im = document.createElement("img");
    im.src = r.img; im.alt = "";
    d.appendChild(im);
    if (currentRole === "admin") {
      const b = document.createElement("b");
      b.textContent = "×";
      b.onclick = async () => {
        if (!confirm("حذف هذه الصورة؟")) return;
        const { error } = await sb.from("gallery").delete().eq("id", r.id);
        if (error) { alert("تعذر الحذف: " + error.message); return; }
        loadGalleryImages();
      };
      d.appendChild(b);
    }
    list.appendChild(d);
  });
}

async function addGalleryImages(files) {
  const msg = document.getElementById("galMsg");
  if (!sb || currentRole !== "admin") return;
  let ok = 0;
  msg.textContent = "جارٍ الرفع...";
  for (const f of files) {
    try {
      const img = await resizeImage(f, 1100, false);
      const { error } = await sb.from("gallery").insert({ img: img });
      if (error) { msg.textContent = "تعذر الرفع: " + error.message; break; }
      ok++;
    } catch (e) { msg.textContent = "تعذر قراءة صورة"; }
  }
  if (ok) msg.textContent = "تمت إضافة " + ok + " صورة";
  document.getElementById("galFile").value = "";
  loadGalleryImages();
}

// ================= الجداول: جدول الامتحانات =================
let schedMode = "study";
const examCache = {};

function setSchedMode(m) {
  schedMode = m;
  document.querySelectorAll(".mode-btn").forEach(b => b.classList.toggle("active", b.dataset.m === m));
  document.querySelectorAll(".study-only").forEach(el => el.classList.toggle("mode-off", m !== "study"));
  document.getElementById("examPanel").classList.toggle("hidden", m !== "exam");
  if (m === "exam") renderExams();
}

async function getExams(g) {
  const key = "exams_" + g;
  if (examCache[key]) return examCache[key];
  let rows = [];
  if (sb) {
    try {
      const { data } = await sb.from("schedules").select("data").eq("key", key).maybeSingle();
      if (data && Array.isArray(data.data)) rows = data.data;
    } catch (e) { console.error(e); }
  }
  examCache[key] = rows;
  return rows;
}

async function saveExams(g, rows) {
  const key = "exams_" + g;
  const { error } = await sb.from("schedules").upsert({ key: key, data: rows });
  if (error) { alert("تعذر الحفظ: " + error.message); return false; }
  examCache[key] = rows;
  renderExams();
  return true;
}

async function renderExams() {
  const list = document.getElementById("examList");
  const g = selectedGrade;
  const rows = [...await getExams(g)].sort((a, b) => String(a.date).localeCompare(String(b.date)));
  if (g !== selectedGrade) return;
  list.innerHTML = rows.length ? "" : "<p class='muted' style='text-align:center;'>لا توجد امتحانات لهذا الصف بعد</p>";
  const today = new Date().toISOString().slice(0, 10);
  rows.forEach(r => {
    const d = new Date(r.date + "T00:00:00");
    const label = isNaN(d) ? r.date : d.toLocaleDateString("ar-JO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const div = document.createElement("div");
    div.className = "exam-row" + (r.date < today ? " past" : "");
    div.innerHTML = `<div><div class="d">${escapeHTML(label)}</div><div>${escapeHTML(r.subject)}</div></div>`;
    if (currentRole === "admin") {
      const b = document.createElement("button");
      b.className = "mini"; b.style.background = "#ef4444"; b.textContent = "حذف";
      b.onclick = async () => {
        if (!confirm("حذف هذا الامتحان؟")) return;
        await saveExams(g, (await getExams(g)).filter(x => !(x.date === r.date && x.subject === r.subject)));
      };
      div.appendChild(b);
    }
    list.appendChild(div);
  });
}

async function addExam() {
  if (!sb || currentRole !== "admin") return;
  const date = document.getElementById("examDate").value;
  const subject = document.getElementById("examSubject").value.trim();
  if (!date || !subject) { alert("اختر التاريخ واكتب اسم مادة الامتحان"); return; }
  const rows = [...await getExams(selectedGrade), { date: date, subject: subject.slice(0, 60) }];
  if (await saveExams(selectedGrade, rows)) document.getElementById("examSubject").value = "";
}

// ================= طمأنينة: واجهة الطالب =================
const TAM_MOODS = [
  { k: "joy", l: "الفرح", g: "✦", c: "#f59e0b", m: "جميل أن تشعر بالفرح! حافظ على هذه الطاقة وشاركها مع من حولك." },
  { k: "calm", l: "الهدوء", g: "≈", c: "#14b8a6", m: "الهدوء نعمة. استمتع بهذه اللحظة، وتذكّر أنك قادر على الحفاظ على توازنك." },
  { k: "sad", l: "الحزن", g: "◐", c: "#3b82f6", m: "من الطبيعي أن نشعر بالحزن أحياناً، ومشاعرك مهمة. لست وحدك، وهناك من يسمعك." },
  { k: "anxious", l: "القلق", g: "✳", c: "#a855f7", m: "القلق شعور يمرّ، وأنت أقوى مما تظن. خذ نفساً عميقاً وجرّب تمرين التنفس." },
  { k: "tired", l: "الإرهاق", g: "▽", c: "#8b5cf6", m: "جسدك وعقلك يحتاجان راحة. خذ استراحة قصيرة، واشرب ماءً، وكن لطيفاً مع نفسك." },
  { k: "bored", l: "الملل", g: "─", c: "#64748b", m: "الملل إشارة من عقلك أنه يريد تجديداً. جرّب هدفاً صغيراً أو نشاطاً جديداً اليوم." },
  { k: "angry", l: "الغضب", g: "◆", c: "#ef4444", m: "الغضب شعور مشروع، والمهم كيف نتعامل معه. ابتعد لحظة وتنفّس، ثم تحدّث بهدوء مع من تثق به." },
  { k: "fear", l: "الخوف", g: "○", c: "#6366f1", m: "الخوف يخفّ حين نشاركه. أنت في مكان آمن، ويمكنك طلب مساعدة سرية في أي وقت." }
];
const TAM_REASONS = ["الدراسة والاختبارات", "الأصدقاء والعلاقات", "المنزل والأسرة", "الضغوطات والمسؤوليات", "أخرى"];
let tamFromQr = false, tamMood = null, breathTimer = null;

function openTam(fromQr) {
  tamFromQr = !!fromQr;
  tamReset();
  showSection("tamSection", fromQr ? "replace" : "push");
}

function tamReset() {
  stopBreathing();
  tamMood = null;
  document.getElementById("tamStep1").classList.remove("hidden");
  document.getElementById("tamStep2").classList.add("hidden");
  document.getElementById("tamStep3").classList.add("hidden");
  document.getElementById("helpBox").classList.add("hidden");
  document.getElementById("helpDone").textContent = "";
  const box = document.getElementById("tamMoods");
  box.innerHTML = "";
  TAM_MOODS.forEach(m => {
    const b = document.createElement("button");
    b.className = "tam-mood";
    b.style.background = m.c;
    b.innerHTML = `<i>${m.g}</i>${m.l}`;
    b.onclick = () => tamPickMood(m);
    box.appendChild(b);
  });
}

function tamPickMood(m) {
  tamMood = m;
  document.getElementById("tamStep1").classList.add("hidden");
  document.getElementById("tamStep2").classList.remove("hidden");
  const box = document.getElementById("tamReasons");
  box.innerHTML = "";
  TAM_REASONS.concat(["تخطي"]).forEach(r => {
    const c = document.createElement("span");
    c.className = "chip";
    c.textContent = r;
    c.onclick = () => tamSubmit(r === "تخطي" ? null : r);
    box.appendChild(c);
  });
}

async function tamSubmit(reason) {
  const m = tamMood;
  if (sb && m) {
    try {
      const { error } = await sb.from("mood_checkins").insert({ mood: m.k, reason: reason });
      if (error) console.error(error);
    } catch (e) { console.error(e); }
  }
  document.getElementById("tamStep2").classList.add("hidden");
  document.getElementById("tamStep3").classList.remove("hidden");
  const badge = document.getElementById("tamBadge");
  badge.style.background = m.c;
  badge.textContent = m.g;
  document.getElementById("tamMsg").textContent = m.m;
}

function startBreathing() {
  stopBreathing();
  const box = document.getElementById("breathBox");
  const c = document.getElementById("breathCircle");
  const t = document.getElementById("breathText");
  box.classList.remove("hidden");
  const seq = [["شهيق...", 1.25, 4000], ["احتفظ بالنفس", 1.25, 2000], ["زفير...", 0.6, 4000]];
  let step = 0, cycles = 0;
  const run = () => {
    const [txt, scale, ms] = seq[step];
    t.textContent = txt;
    c.style.transform = "scale(" + scale + ")";
    breathTimer = setTimeout(() => {
      step = (step + 1) % seq.length;
      if (step === 0 && ++cycles >= 5) { t.textContent = "أحسنت! كيف تشعر الآن؟"; c.style.transform = "scale(.6)"; return; }
      run();
    }, ms);
  };
  run();
}

function stopBreathing() {
  clearTimeout(breathTimer);
  breathTimer = null;
  const b = document.getElementById("breathBox");
  if (b) b.classList.add("hidden");
}

async function sendHelp() {
  const msg = document.getElementById("helpMsg").value.trim();
  const contact = document.getElementById("helpContact").value.trim();
  const out = document.getElementById("helpDone");
  if (!msg) { out.textContent = "اكتب رسالتك أولاً"; return; }
  if (!sb) { out.textContent = "قاعدة البيانات غير مربوطة"; return; }
  out.textContent = "جارٍ الإرسال...";
  const { error } = await sb.from("support_requests").insert({ message: msg, contact: contact || null });
  if (error) { out.textContent = "تعذر الإرسال: " + error.message; return; }
  document.getElementById("helpMsg").value = "";
  document.getElementById("helpContact").value = "";
  out.textContent = "وصلت رسالتك للمرشد بسرية. شكراً لشجاعتك 💚";
}

// ================= طمأنينة: لوحة المرشد =================
let tamDays = 1;
const TICKET_STATUS = { new: "جديدة", progress: "قيد المعالجة", contacted: "تم التواصل", done: "مكتملة" };

function openTamDash() {
  showSection("tamDashSection");
  loadTamDash();
}

async function loadTamDash() {
  if (!sb) return;
  const pulse = document.getElementById("tamPulse");
  const bars = document.getElementById("tamBars");
  pulse.innerHTML = "<p class='muted'>جارٍ التحميل...</p>";
  bars.innerHTML = "";
  const { data, error } = await sb.rpc("care_mood_stats", { p_days: tamDays });
  if (error) { pulse.innerHTML = "<p class='muted'>" + escapeHTML(error.message) + "</p>"; return; }
  const counts = {};
  (data || []).forEach(r => { counts[r.mood] = Number(r.n); });
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const pct = n => total ? Math.round(n * 100 / total) : 0;
  const pos = (counts.joy || 0) + (counts.calm || 0);
  const need = ["sad", "anxious", "tired", "angry", "fear"].reduce((a, k) => a + (counts[k] || 0), 0);
  pulse.innerHTML = `<div class="tam-stat"><div><b>${total}</b>إجابة</div><div><b>${pct(pos)}%</b>حالة إيجابية</div><div><b>${pct(need)}%</b>تحتاج دعماً</div></div>`;
  TAM_MOODS.forEach(m => {
    const n = counts[m.k] || 0;
    const row = document.createElement("div");
    row.className = "tam-bar";
    row.innerHTML = `<span>${m.l}</span><span class="track"><span class="fill" style="display:block;width:${pct(n)}%;background:${m.c};"></span></span><span>${n}</span>`;
    bars.appendChild(row);
  });
  loadTickets();
}

async function loadTickets() {
  const box = document.getElementById("tamTickets");
  box.innerHTML = "<p class='muted'>جارٍ التحميل...</p>";
  const { data, error } = await sb.from("support_requests").select("id,message,contact,status,note,created_at").order("created_at", { ascending: false }).limit(100);
  if (error) { box.innerHTML = "<p class='muted'>" + escapeHTML(error.message) + "</p>"; return; }
  if (!data.length) { box.innerHTML = "<p class='muted' style='text-align:center;'>لا توجد طلبات حالياً</p>"; return; }
  box.innerHTML = "";
  data.forEach(t => {
    const div = document.createElement("div");
    div.className = "tick";
    const when = new Date(t.created_at).toLocaleString("ar-JO");
    div.innerHTML = `<small>${escapeHTML(when)}</small><div style="margin:6px 0;white-space:pre-wrap;">${escapeHTML(t.message)}</div>` +
      (t.contact ? `<div><small>وسيلة التواصل:</small> ${escapeHTML(t.contact)}</div>` : `<div><small>مجهول الهوية</small></div>`) +
      `<select>${Object.entries(TICKET_STATUS).map(([k, l]) => `<option value="${k}" ${t.status === k ? "selected" : ""}>${l}</option>`).join("")}</select>` +
      `<textarea maxlength="1000" placeholder="ملاحظات المرشد (سرية)">${escapeHTML(t.note || "")}</textarea>` +
      `<div class="tactions"><button class="sv">حفظ</button><button class="dl" style="background:#ef4444;">حذف</button></div>`;
    div.querySelector(".sv").onclick = async () => {
      const { error: e } = await sb.from("support_requests").update({ status: div.querySelector("select").value, note: div.querySelector("textarea").value.trim() || null }).eq("id", t.id);
      alert(e ? "تعذر الحفظ: " + e.message : "تم الحفظ");
    };
    div.querySelector(".dl").onclick = async () => {
      if (!confirm("حذف هذا الطلب نهائياً؟")) return;
      const { error: e } = await sb.from("support_requests").delete().eq("id", t.id);
      if (e) { alert("تعذر الحذف: " + e.message); return; }
      loadTickets();
    };
    box.appendChild(div);
  });
}

function loadQr() {
  return new Promise(res => {
    if (typeof QRCode !== "undefined") return res();
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
    s.onload = res; s.onerror = res;
    document.head.appendChild(s);
  });
}

async function showPoster() {
  await loadQr();
  const url = location.origin + location.pathname + "#/join";
  const box = document.getElementById("posterQr");
  box.innerHTML = "";
  if (typeof QRCode === "undefined") box.textContent = "تعذر تحميل مكتبة الرمز، تأكد من الاتصال بالإنترنت";
  else new QRCode(box, { text: url, width: 220, height: 220 });
  document.getElementById("posterModal").classList.remove("hidden");
}

async function purgeOld() {
  if (!sb) return;
  if (!confirm("حذف إجابات المزاج الأقدم من 90 يوماً، والطلبات المكتملة الأقدم من 90 يوماً؟")) return;
  const cut = new Date(Date.now() - 90 * 864e5).toISOString();
  const e1 = (await sb.from("mood_checkins").delete().lt("created_at", cut)).error;
  const e2 = (await sb.from("support_requests").delete().lt("created_at", cut).eq("status", "done")).error;
  alert(e1 || e2 ? "تعذر الحذف: " + (e1 || e2).message : "تم الحذف");
  loadTamDash();
}

// ================= ربط الأحداث الجديدة =================
function setupExtras() {
  const on = (id, ev, fn) => { const el = document.getElementById(id); if (el) el.addEventListener(ev, fn); };
  const syncModalState = () => document.body.classList.toggle("modal-open", !!document.querySelector(".modal:not(.hidden)"));
  new MutationObserver(syncModalState).observe(document.body, { subtree: true, attributes: true, attributeFilter: ["class"] });
  syncModalState();
  on("btnCloseViewer", "click", () => document.getElementById("imgViewer").classList.add("hidden"));
  on("viewerImg", "click", () => document.getElementById("viewerImg").classList.toggle("zoomed"));
  document.querySelectorAll(".mode-btn").forEach(b => b.addEventListener("click", () => setSchedMode(b.dataset.m)));
  on("btnAddExam", "click", addExam);
  on("galleryBox", "click", renderGalleryModal);
  on("galFile", "change", e => addGalleryImages([...e.target.files]));
  on("cardTam", "click", () => openTam(false));
  on("cardMyTasks", "click", openMyTasks);
  on("btnBreath", "click", startBreathing);
  on("btnBreathStop", "click", stopBreathing);
  on("btnHelp", "click", () => { document.getElementById("helpBox").classList.remove("hidden"); });
  on("btnSendHelp", "click", sendHelp);
  on("btnTamAgain", "click", tamReset);
  document.querySelectorAll(".tam-p").forEach(b => b.addEventListener("click", () => {
    tamDays = Number(b.dataset.d);
    document.querySelectorAll(".tam-p").forEach(x => x.classList.toggle("active", x === b));
    loadTamDash();
  }));
  on("btnTamQr", "click", showPoster);
  on("btnClosePoster", "click", () => document.getElementById("posterModal").classList.add("hidden"));
  on("btnPrintPoster", "click", () => window.print());
  on("btnTamPurge", "click", purgeOld);
}


// ================= أمين المكتبة: الكتب المستعارة =================
async function showLoans(t, panel) {
  panel.classList.remove("hidden");
  const ed = canEdit(t);
  panel.innerHTML = `<h4>الكتب المستعارة</h4>` + (ed ? `
    <input class="l-name" maxlength="80" placeholder="اسم الطالب/ة">
    <input class="l-book" maxlength="120" placeholder="اسم الكتاب (اختياري)">
    <label class="muted" style="display:block;margin:4px 0;">موعد تسليم الكتاب</label>
    <input class="l-date" type="date">
    <button class="mini l-add">إضافة</button>` : "") + `<div class="l-list"><p class="muted">جارٍ التحميل...</p></div>`;
  const list = panel.querySelector(".l-list");
  const load = async () => {
    if (!sb) { list.innerHTML = "<p class='muted'>قاعدة البيانات غير مربوطة</p>"; return; }
    const { data, error } = await sb.from("library_loans").select("id,student_name,book_title,due_date").eq("returned", false).order("due_date");
    if (error) { list.innerHTML = "<p class='muted'>" + escapeHTML(error.message) + "</p>"; return; }
    if (!data.length) { list.innerHTML = "<p class='muted' style='text-align:center;'>لا توجد كتب مستعارة حالياً</p>"; return; }
    const today = new Date().toLocaleDateString("en-CA");
    list.innerHTML = "";
    data.forEach(r => {
      const d = new Date(r.due_date + "T00:00:00");
      const label = isNaN(d) ? r.due_date : d.toLocaleDateString("ar-JO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
      const late = r.due_date < today;
      const row = document.createElement("div");
      row.className = "loan" + (late ? " late" : "");
      row.innerHTML = `<div><b>${escapeHTML(r.student_name)}</b>` + (r.book_title ? `<small>${escapeHTML(r.book_title)}</small>` : "") +
        `<span class="due">موعد التسليم: ${escapeHTML(label)}${late ? " (متأخر)" : ""}</span></div>`;
      if (ed) {
        const box = document.createElement("div");
        box.className = "lb";
        const ok = document.createElement("button");
        ok.className = "mini"; ok.textContent = "تم الإرجاع";
        ok.onclick = async () => {
          const { error: e } = await sb.from("library_loans").update({ returned: true }).eq("id", r.id);
          if (e) { alert("تعذر الحفظ: " + e.message); return; }
          load();
        };
        const del = document.createElement("button");
        del.className = "mini"; del.style.background = "#ef4444"; del.textContent = "حذف";
        del.onclick = async () => {
          if (!confirm("حذف هذا السجل؟")) return;
          const { error: e } = await sb.from("library_loans").delete().eq("id", r.id);
          if (e) { alert("تعذر الحذف: " + e.message); return; }
          load();
        };
        box.appendChild(ok); box.appendChild(del);
        row.appendChild(box);
      }
      list.appendChild(row);
    });
  };
  if (ed) {
    panel.querySelector(".l-add").onclick = async () => {
      const name = panel.querySelector(".l-name").value.trim();
      const book = panel.querySelector(".l-book").value.trim();
      const due = panel.querySelector(".l-date").value;
      if (!name || !due) { alert("اكتب اسم الطالب/ة واختر موعد التسليم"); return; }
      const { error } = await sb.from("library_loans").insert({ student_name: name, book_title: book || null, due_date: due });
      if (error) { alert("تعذر الإضافة: " + error.message); return; }
      panel.querySelector(".l-name").value = "";
      panel.querySelector(".l-book").value = "";
      load();
    };
  }
  load();
}


// ================= مهماتي: مهام المعلمين للطالب حسب الصف والشعبة =================
let mtGrade = "", mtSection = "";
try { mtGrade = localStorage.getItem("mtGrade") || ""; mtSection = localStorage.getItem("mtSection") || ""; } catch (e) { /* تجاهل */ }

function openMyTasks() {
  showSection("myTasksSection");
  renderMtPickers();
  loadMyTasks();
}

function renderMtPickers() {
  const g = document.getElementById("mtGrades");
  const s = document.getElementById("mtSections");
  g.innerHTML = "";
  s.innerHTML = "";
  GRADES.forEach(([k, l]) => {
    const b = document.createElement("button");
    b.className = "tab-btn" + (mtGrade === k ? " active" : "");
    b.textContent = "الصف " + l;
    b.onclick = () => { mtGrade = k; try { localStorage.setItem("mtGrade", k); } catch (e) { /* تجاهل */ } renderMtPickers(); loadMyTasks(); };
    g.appendChild(b);
  });
  SECTIONS.forEach(([k, l]) => {
    const b = document.createElement("button");
    b.className = "tab-btn" + (mtSection === k ? " active" : "");
    b.textContent = "الشعبة (" + l + ")";
    b.onclick = () => { mtSection = k; try { localStorage.setItem("mtSection", k); } catch (e) { /* تجاهل */ } renderMtPickers(); loadMyTasks(); };
    s.appendChild(b);
  });
}

async function loadMyTasks() {
  const box = document.getElementById("mtList");
  if (!mtGrade || !mtSection) { box.innerHTML = "<p class='muted' style='text-align:center;'>اختر الصف والشعبة أولاً</p>"; return; }
  if (!sb) { box.innerHTML = "<p class='muted' style='text-align:center;'>قاعدة البيانات غير مربوطة</p>"; return; }
  const gr = mtGrade, se = mtSection;
  box.innerHTML = "<p class='muted' style='text-align:center;'>جارٍ التحميل...</p>";
  const { data, error } = await sb.rpc("tasks_for_grade", { p_grade: gr });
  if (gr !== mtGrade || se !== mtSection) return;
  if (error) { box.innerHTML = "<p class='muted' style='text-align:center;'>" + escapeHTML(error.message) + "</p>"; return; }
  const rows = (data || []).filter(r => { const s = Array.isArray(r.sections) ? r.sections : []; return !s.length || s.includes(se); });
  if (!rows.length) { box.innerHTML = "<p class='muted' style='text-align:center;'>لا توجد مهام لهذا الصف والشعبة حالياً</p>"; return; }
  box.innerHTML = "";
  rows.forEach(r => {
    const d = r.task_date ? new Date(r.task_date + "T00:00:00") : null;
    const div = document.createElement("div");
    div.className = "task";
    div.innerHTML = `<h4>${escapeHTML(r.teacher_name || "")}${r.specialty ? ` <small class="muted">— ${escapeHTML(r.specialty)}</small>` : ""}</h4>` +
      `<div class="chips">${taskTags({ classes: r.classes || [], sections: r.sections || [] })}</div>` +
      (d && !isNaN(d) ? `<small class="muted">${escapeHTML(d.toLocaleDateString("ar-JO", { day: "numeric", month: "long", year: "numeric" }))}</small>` : "") +
      (r.task_text ? `<div class="tbio" style="white-space:pre-wrap;">${escapeHTML(r.task_text)}</div>` : "") +
      (r.image_count > 0 ? `<button class="mini imgs-btn">عرض الصور (${r.image_count})</button><div class="timgs view"></div>` : "");
    const btn = div.querySelector(".imgs-btn");
    if (btn) btn.onclick = async () => {
      const holder = div.querySelector(".timgs");
      if (holder.childElementCount) { holder.innerHTML = ""; btn.textContent = `عرض الصور (${r.image_count})`; return; }
      btn.textContent = "جارٍ التحميل...";
      const { data: imgs, error: e } = await sb.rpc("task_images", { p_teacher: r.teacher_id, p_task: r.task_id });
      if (e) { btn.textContent = "تعذر تحميل الصور"; return; }
      (Array.isArray(imgs) ? imgs : []).forEach((src, i) => {
        if (!/^data:image\//.test(src)) return;
        const w = document.createElement("div");
        w.className = "timg";
        w.innerHTML = `<img src="${src}" alt=""><a class="dl" download="task-${i + 1}.jpg" href="${src}">تحميل</a>`;
        w.querySelector("img").onclick = () => openViewer(src);
        holder.appendChild(w);
      });
      btn.textContent = "إخفاء الصور";
    };
    box.appendChild(div);
  });
}

// ================= سهم الرجوع: يختفي طالما زر رجوع الصفحة ظاهر على الشاشة =================
function injectPageBackButtons() {
  const ids = ["mainMenu", "loginSection", "scheduleSection", "organizerSection", "whatWeKnowSection", "feedbackSection", "teachersSection", "passwordSection", "tamSection", "tamDashSection", "myTasksSection"];
  ids.forEach(id => {
    const sec = document.getElementById(id);
    if (!sec || sec.querySelector(".nav-back-btn:not(.btnHome)")) return;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "nav-back-btn page-back";
    b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 12H19M13.2 5.6C14.6 8.8 16.6 10.8 19.6 12c-3 1.2-5 3.2-6.4 6.4" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg><span>رجوع</span>';
    b.onclick = goBack;
    sec.insertBefore(b, sec.firstChild);
  });
}

function setupBackArrowLogic() {
  injectPageBackButtons();
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { en.target.__vis = en.isIntersecting; });
    const any = [...document.querySelectorAll(".nav-back-btn")].some(el => el.__vis && !el.closest(".modal") && el.offsetParent !== null);
    document.body.classList.toggle("back-inpage", any);
  }, { threshold: 0.3 });
  document.querySelectorAll(".nav-back-btn").forEach(el => io.observe(el));
}


// ================= إعلانات مساعد المدير (منفصلة عن لوحة الإعلانات الرئيسية) =================
const MAX_NOTICES = 30;

async function saveNotices(t, notices) {
  let err;
  if (currentRole === "admin") ({ error: err } = await sb.from("teachers").update({ notices: notices }).eq("id", t.id));
  else ({ error: err } = await sb.rpc("update_my_notices", { p_notices: notices }));
  if (err) { alert("تعذر الحفظ: " + err.message); return false; }
  t.notices = notices;
  return true;
}

async function showNotices(t, panel) {
  panel.classList.remove("hidden");
  panel.innerHTML = "<p class='muted'>جارٍ التحميل...</p>";
  if (t.notices === undefined) {
    const { data, error } = await sb.from("teachers").select("notices").eq("id", t.id).single();
    if (error) { panel.innerHTML = "<p class='muted'>" + escapeHTML(error.message) + "</p>"; return; }
    t.notices = Array.isArray(data && data.notices) ? data.notices : [];
  }
  const ed = canEdit(t);
  let draft = "";
  const draw = () => {
    const list = [...t.notices].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")) || String(b.id).localeCompare(String(a.id)));
    let html = `<h4>الإعلانات</h4>`;
    html += list.length ? list.map(n => {
      const d = n.date ? new Date(n.date + "T00:00:00") : null;
      return `<div class="task" data-id="${escapeHTML(String(n.id))}">` +
        (d && !isNaN(d) ? `<small class="muted">${escapeHTML(d.toLocaleDateString("ar-JO", { weekday: "long", day: "numeric", month: "long", year: "numeric" }))}</small>` : "") +
        `<div class="tbio" style="white-space:pre-wrap;">${escapeHTML(n.text || "")}</div>` +
        (ed ? `<button class="mini del" style="background:#ef4444;">حذف</button>` : "") + `</div>`;
    }).join("") : `<p class="muted" style="text-align:center;">لا توجد إعلانات حالياً</p>`;
    if (ed) {
      html += `<div class="task" style="border-style:dashed;"><h4 style="margin-top:0;">نشر إعلان جديد</h4>
        <textarea class="nt" maxlength="1000" placeholder="اكتب الإعلان...">${escapeHTML(draft)}</textarea>
        <button class="mini add">نشر الإعلان</button></div>`;
    }
    panel.innerHTML = html;
    panel.querySelectorAll(".task .del").forEach(btn => btn.onclick = async () => {
      const id = btn.closest(".task").dataset.id;
      if (!confirm("حذف هذا الإعلان؟")) return;
      if (await saveNotices(t, t.notices.filter(n => String(n.id) !== id))) draw();
    });
    if (!ed) return;
    const ta = panel.querySelector(".nt");
    ta.oninput = () => { draft = ta.value; };
    panel.querySelector(".add").onclick = async () => {
      const text = ta.value.trim().slice(0, 1000);
      if (!text) { alert("اكتب نص الإعلان أولاً"); return; }
      if (t.notices.length >= MAX_NOTICES) { alert("وصلت للحد الأقصى (" + MAX_NOTICES + " إعلاناً). احذف إعلاناً قديماً أولاً"); return; }
      const n = { id: Date.now().toString(36), text: text, date: new Date().toLocaleDateString("en-CA") };
      if (await saveNotices(t, [n].concat(t.notices))) { draft = ""; draw(); }
    };
  };
  draw();
}
