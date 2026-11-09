/* =========================================================
   NUR FLIX — sozlamalar va kinolar ma'lumotlari
   Faqat tekshirilgan ma'lumot kiriting. Noma'lum maydonlarni
   null yoki bo'sh qoldiring — sayt ularni ko'rsatmaydi.
   ========================================================= */

window.NURFLIX_CONFIG = {
  perPage: 8,              // "Barcha kinolar" bo'limida bir sahifadagi kinolar soni
  adsEndpoint: null,       // Masalan: "/api/ads"  — README.md dagi formatga qarang
  loginEndpoint: null      // Masalan: "/api/login" — backend tayyor bo'lganda
};

/*
  Maydonlar:
  id         — URL uchun noyob nom (lotin harflari, tire)
  title      — film nomi
  year       — chiqqan yili
  country    — davlat
  language   — til
  genres     — janrlar ro'yxati
  premiere   — premyera sanasi "YYYY-MM-DD"
  director, writers, producers, music, cast
  age        — yosh chegarasi, masalan "16+"
  rating     — raqam (masalan 7.4) yoki null — tasdiqlanmagan bo'lsa null qoldiring
  description— qisqa tavsif
  poster     — vertikal poster URL (2:3 nisbat tavsiya etiladi) yoki null
  backdrop   — banner uchun keng fon rasmi URL (16:9) yoki null
  video      — { type: "file", src: "film.mp4" } yoki { type: "embed", src: "https://..." } yoki null
  trailer    — xuddi shu formatda yoki null
  featured   — bannerda ko'rsatilsinmi
  popular    — "Ommabop hind kinolari" bo'limida ko'rsatilsinmi
*/

window.NURFLIX_FILMS = [
  {
    id: "raja-shivaji",
    title: "Raja Shivaji",
    year: 2026,
    country: "Hindiston",
    language: null,
    genres: ["Jangari", "Biografik", "Drama", "Tarixiy", "Harbiy"],
    premiere: "2026-05-01",
    director: "Riteish Deshmukh",
    writers: ["Riteish Deshmukh", "Sandeep S. Patil", "Jaydeep Yadav"],
    producers: ["Jyoti Deshpande", "Genelia Deshmukh"],
    music: "Ajay-Atul",
    cast: ["Salman Khan", "Sanjay Dutt", "Riteish Deshmukh", "Abhishek Bachchan", "Vidya Balan", "Mahesh Manjrekar", "Boman Irani", "Fardeen Khan"],
    age: "16+",
    rating: null,
    description: "Riteish Deshmukh rejissyorligida suratga olingan tarixiy-biografik jangari film. Jio Studios taqdim etadi, Mumbai Film Company ishlab chiqargan.",
    poster: null,
    backdrop: null,
    video: null,
    trailer: null,
    featured: true,
    popular: true
    // Manba: foydalanuvchi bergan namuna sahifa va afisha matni
  },
  {
    id: "awarapan-2",
    title: "Awarapan 2",
    year: 2026,
    country: "Hindiston",
    language: "Hind tili",
    genres: ["Jangari", "Romantik", "Drama"],
    premiere: "2026-08-14",
    director: "Nitin Kakkar",
    writers: ["Bilal Siddiqui"],
    producers: ["Vishesh Bhatt"],
    music: null,
    cast: ["Emraan Hashmi", "Disha Patani", "Shabana Azmi"],
    age: null,
    rating: null,
    description: "2007-yilgi «Awarapan» filmining davomi. Emraan Hashmi yana Shivam Pandit roliga qaytgan. Vishesh Films ishlab chiqargan.",
    poster: null,
    backdrop: null,
    video: null,
    trailer: null,
    featured: true,
    popular: true
    // Manbalar: esquireindia.co.in, theweek.in, newsable.asianetnews.com (2026)
  },
  {
    id: "gunmaaster-g9",
    title: "Gunmaaster G9",
    year: 2026,
    country: "Hindiston",
    language: "Hind tili",
    genres: ["Jangari", "Romantik", "Drama"],
    premiere: "2026-11-27",
    director: "Aditya Datt",
    writers: [],
    producers: ["Deepak Mukut", "Hunar Mukut", "Sangeeta Ahir"],
    music: "Himesh Reshammiya",
    cast: ["Emraan Hashmi", "Genelia Deshmukh", "Aparshakti Khurana", "Abhishek Singh"],
    age: null,
    rating: null,
    description: "Aditya Datt rejissyorligidagi jangari-romantik film. Musiqa muallifi — Himesh Reshammiya. Nomi 1979-yilgi «Surakksha» filmidagi Gunmaster G9 qahramoniga ishora qiladi.",
    poster: null,
    backdrop: null,
    video: null,
    trailer: null,
    featured: true,
    popular: true
    // Manbalar: hollywoodreporterindia.com, theprint.in, bollywoodhungama.com (2026)
  }
];
