type LangCode = 'en' | 'hi' | 'ta' | 'bn';

export const strings: Record<string, Record<LangCode, string>> = {
  app_title: {
    en: 'HemoNutri AI',
    hi: 'हेमोन्यूट्री एआई',
    ta: 'ஹெமோநியூட்ரி ஏஐ',
    bn: 'হেমোনিউট্রি এআই'
  },
  scan_anemia: {
    en: 'Scan for Anemia',
    hi: 'एनीमिया की जांच करें',
    ta: 'இரத்த சோகை பரிசோதனை',
    bn: 'অ্যানিমিয়া পরীক্ষা করুন'
  },
  scan_nutrition: {
    en: 'Scan for Nutrition',
    hi: 'पोषण की जांच करें',
    ta: 'ஊட்டச்சத்து பரிசோதனை',
    bn: 'পুষ্টি পরীক্ষা করুন'
  },
  patient_registration: {
    en: 'Register Patient',
    hi: 'रोगी पंजीकरण',
    ta: 'நோயாளி பதிவு',
    bn: 'রোগী নিবন্ধন'
  },
  full_name: {
    en: 'Full Name',
    hi: 'पूरा नाम',
    ta: 'முழு பெயர்',
    bn: 'পুরো নাম'
  },
  age: {
    en: 'Age',
    hi: 'आयु',
    ta: 'வயது',
    bn: 'বয়স'
  },
  gender: {
    en: 'Gender',
    hi: 'लिंग',
    ta: 'பாலினம்',
    bn: 'লিঙ্গ'
  },
  weight: {
    en: 'Weight (kg)',
    hi: 'वजन (किग्रा)',
    ta: 'எடை (கிலோ)',
    bn: 'ওজন (কেজি)'
  },
  save_and_continue: {
    en: 'Save & Continue',
    hi: 'सहेजें और आगे बढ़ें',
    ta: 'சேமித்து தொடரவும்',
    bn: 'সংরক্ষণ করুন এবং চালিয়ে যান'
  },
  place_finger: {
    en: 'Place finger on camera',
    hi: 'कैमरे पर उंगली रखें',
    ta: 'கேமராவில் விரலை வைக்கவும்',
    bn: 'ক্যামেরায় আঙুল রাখুন'
  },
  hold_steady: {
    en: 'Hold steady for 10 seconds...',
    hi: '10 सेकंड तक स्थिर रखें...',
    ta: '10 விநாடிகள் நிலையாக வைத்திருக்கவும்...',
    bn: '১০ সেকেন্ড স্থির রাখুন...'
  },
  eye_scan_instruction: {
    en: 'Pull down lower eyelid',
    hi: 'निचली पलक नीचे खींचें',
    ta: 'கீழ் கண்ணிமையை கீழே இழுக்கவும்',
    bn: 'নিচের চোখের পাতা নিচে টানুন'
  },
  capture_image: {
    en: 'Capture Image',
    hi: 'तस्वीर लें',
    ta: 'படம் பிடிக்கவும்',
    bn: 'ছবি তুলুন'
  },
  analyzing: {
    en: 'Analyzing...',
    hi: 'विश्लेषण हो रहा है...',
    ta: 'பகுப்பாய்வு நடக்கிறது...',
    bn: 'বিশ্লেষণ চলছে...'
  },
  results: {
    en: 'Results',
    hi: 'परिणाम',
    ta: 'முடிவுகள்',
    bn: 'ফলাফল'
  },
  hemoglobin_level: {
    en: 'Hemoglobin Level',
    hi: 'हीमोग्लोबिन स्तर',
    ta: 'ஹீமோகுளோபின் அளவு',
    bn: 'হিমোগ্লোবিন স্তর'
  },
  severity_normal: {
    en: 'Normal',
    hi: 'सामान्य',
    ta: 'சாதாரண',
    bn: 'স্বাভাবিক'
  },
  severity_mild: {
    en: 'Mild Anemia',
    hi: 'हल्का एनीमिया',
    ta: 'லேசான இரத்த சோகை',
    bn: 'মৃদু অ্যানিমিয়া'
  },
  severity_moderate: {
    en: 'Moderate Anemia',
    hi: 'मध्यम एनीमिया',
    ta: 'மிதமான இரத்த சோகை',
    bn: 'মাঝারি অ্যানিমিয়া'
  },
  severity_severe: {
    en: 'Severe Anemia',
    hi: 'गंभीर एनीमिया',
    ta: 'கடுமையான இரத்த சோகை',
    bn: 'মারাত্মক অ্যানিমিয়া'
  },
  recommendations: {
    en: 'Recommendations',
    hi: 'सुझाव',
    ta: 'பரிந்துரைகள்',
    bn: 'সুপারিশ'
  },
  dosage: {
    en: 'Recommended Dosage',
    hi: 'अनुशंसित खुराक',
    ta: 'பரிந்துரைக்கப்பட்ட அளவு',
    bn: 'প্রস্তাবিত ডোজ'
  },
  meal_plan: {
    en: 'Suggested Meal Plan',
    hi: 'सुझाया गया भोजन योजना',
    ta: 'பரிந்துரைக்கப்பட்ட உணவு திட்டம்',
    bn: 'প্রস্তাবিত খাবার পরিকল্পনা'
  },
  generate_passport: {
    en: 'Generate Health Passport',
    hi: 'स्वास्थ्य पासपोर्ट बनाएं',
    ta: 'சுகாதார பாஸ்போர்ட் உருவாக்கவும்',
    bn: 'হেলথ পাসপোর্ট তৈরি করুন'
  },
  print_share: {
    en: 'Print / Share',
    hi: 'प्रिंट / साझा करें',
    ta: 'அச்சிடு / பகிரவும்',
    bn: 'প্রিন্ট / শেয়ার করুন'
  },
  error_camera: {
    en: 'Camera access required.',
    hi: 'कैमरा एक्सेस आवश्यक है।',
    ta: 'கேமரா அனுமதி தேவை.',
    bn: 'ক্যামেরা অ্যাক্সেস প্রয়োজন।'
  },
  error_general: {
    en: 'Something went wrong.',
    hi: 'कुछ गलत हो गया।',
    ta: 'ஏதோ தவறு நடந்துவிட்டது.',
    bn: 'কিছু ভুল হয়েছে।'
  }
};

export function getTranslation(key: string, lang: string = 'en'): string {
  const languageCode = lang as LangCode;
  if (strings[key] && strings[key][languageCode]) {
    return strings[key][languageCode];
  }
  // Fallback to English
  if (strings[key] && strings[key]['en']) {
    return strings[key]['en'];
  }
  return key;
}
