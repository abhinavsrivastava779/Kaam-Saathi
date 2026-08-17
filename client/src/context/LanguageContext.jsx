import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const translations = {
  'होम': 'Home', 'खोजें': 'Search', 'काम पाएं': 'Find Work', 'माई प्रोफाइल': 'My Profile', 'बिना नेट (IVR)': 'Offline (IVR)', 'मदद': 'Help',
  'मुझे काम चाहिए': 'I Need Work', 'मुझे मज़दूर चाहिए': 'I Need Workers', 'माई प्रोफाइल देखें': 'View My Profile',
  'अपनी उपलब्धता और दिहाड़ी बदलें': 'Change availability and daily wage', 'अपना प्रोफाइल बनाएं और रोज़ाना दिहाड़ी पाएं': 'Create your profile and find daily work',
  'पास के मिस्त्री, पेंटर, प्लंबर सीधे खोजें': 'Find nearby masons, painters and plumbers',
  'काम और मज़दूर, दोनों आसानी से खोजें': 'Find work and workers easily', '☎️ मदद चाहिए?': '☎️ Need help?', 'कॉल करें': 'Call',
  'WhatsApp': 'WhatsApp', 'मिस्ड कॉल': 'Missed Call', 'IVR आवाज़': 'IVR Voice', 'फिल्टर बदलें': 'Change filters',
  'खोज परिणाम:': 'Search results:', 'सभी कामगार': 'All workers', 'केवल "🟢 आज उपलब्ध" दिखाएं': 'Show only "🟢 Available today"',
  'कोई मज़दूर नहीं मिला': 'No worker found', 'दूरी या काम बदलें': 'Change distance or work',
  'आज उपलब्ध': 'Available today', 'आज उपलब्ध नहीं': 'Not available today', 'मालिक आपको कॉल कर सकते हैं': 'Employers can call you', 'कॉल प्राप्त नहीं होंगे': 'You will not receive calls',
  'रेटिंग दें': 'Give rating', 'काम कैसा लगा? रेटिंग दें': 'How was the work? Give a rating', 'रेटिंग सेव हो गई ✓': 'Rating saved ✓',
  '📞 कॉल करें': '📞 Call', '📍 लोकेशन भेजें': '📍 Share location', 'दिहाड़ी बदलें': 'Change daily wage', 'लोकेशन बदलें': 'Change location',
  'माई प्रोफाइल विवरण': 'My profile details', 'आपकी 1 दिन की दिहाड़ी:': 'Your daily wage:', 'काम करने का इलाका:': 'Work area:',
  'लॉगआउट': 'Logout', 'Employer Login': 'Employer Login', 'OTP भेजें': 'Send OTP', 'Login करें': 'Login',
  'OTP भेजा जा रहा है...': 'Sending OTP...', 'गलत OTP': 'Invalid OTP', '10 अंकों का mobile number डालें।': 'Enter a 10-digit mobile number.',
  'Employer Dashboard': 'Employer Dashboard', 'मज़दूर खोजें': 'Find workers', 'प्रोफाइल सेव करें': 'Save profile', 'आपकी प्रोफाइल': 'Your profile',
  'नाम': 'Name', 'फोटो': 'Photo', 'रेटिंग': 'Rating', 'आपने जितने मज़दूरों को रेट किया:': 'Workers you have rated:',
  'हर मज़दूर को सिर्फ एक बार रेट कर सकते हैं।': 'You can rate each worker only once.', 'प्रोफाइल अपडेट हो गई।': 'Profile updated.',
  'प्रोफाइल सेव हो रही है...': 'Saving profile...', 'Search workers': 'Search workers', 'आज उपलब्ध मज़दूर': 'Workers available today',
  'KYC Verified': 'KYC Verified', 'नई प्रोफाइल': 'New profile', 'रेटिंग सेव नहीं हुई।': 'Rating could not be saved.',
  'रेटिंग देने के लिए employer login करें।': 'Please login as employer to rate.', 'आप इस मज़दूर को पहले ही रेट कर चुके हैं।': 'You have already rated this worker.',
  'लोड हो रहा है...': 'Loading...', 'कुछ गलत हो गया। कृपया दोबारा कोशिश करें।': 'Something went wrong. Please try again.', 'त्रुटि (Error)': 'Error',
  'कृपया 4 अंकों का OTP दर्ज करें।': 'Please enter the 4-digit OTP.',
  'प्रोफाइल एडिट करें': 'Edit Profile',
  'दी गई रेटिंग': 'Ratings Given',
  'Verified मज़दूर': 'Verified Workers',
  'प्रोफाइल अपडेट हो गई ✓': 'Profile updated ✓',
  'सेव हो रहा है...': 'Saving...',
  'नंबर बदलें': 'Change number',
  'Professional Employer Dashboard': 'Professional Employer Dashboard',
  'Employer Quick Actions': 'Employer Quick Actions',
  'Save Profile': 'Save Profile',
  'Edit Profile': 'Edit Profile',
  'Find Workers': 'Find Workers',
  'Profile successfully updated ✓': 'Profile updated ✓',
  'Profile update नहीं हुआ।': 'Profile update failed.',
  'Saving...': 'Saving...'

};

const LanguageContext = createContext(null);
export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(localStorage.getItem('kaam_saathi_language') || 'hi');
  useEffect(() => localStorage.setItem('kaam_saathi_language', language), [language]);
  const value = useMemo(() => ({ language, setLanguage, t: (text) => language === 'en' ? (translations[text] || text) : text }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
export const useLanguage = () => useContext(LanguageContext);
