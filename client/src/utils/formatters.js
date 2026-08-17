export const SKILLS_LIST = [
  { id: 'mistri', title: 'मिस्त्री', emoji: '🧱', code: 'mistri' },
  { id: 'painter', title: 'पेंटर', emoji: '🎨', code: 'painter' },
  { id: 'carpenter', title: 'बढ़ई', emoji: '🪚', code: 'carpenter' },
  { id: 'plumber', title: 'प्लंबर', emoji: '🔧', code: 'plumber' },
  { id: 'cleaning', title: 'सफाई', emoji: '🧹', code: 'cleaning' },
  { id: 'helper', title: 'मज़दूर', emoji: '💪', code: 'helper' },
  { id: 'cook', title: 'बावर्ची', emoji: '🍳', code: 'cook' },
  { id: 'electrician', title: 'इलेक्ट्रीशियन', emoji: '⚡', code: 'electrician' },
];

export function getSkillInfo(skillKey) {
  if (!skillKey) return { emoji: '👷', title: 'कामगार' };
  
  const found = SKILLS_LIST.find(
    s => s.id === skillKey || s.code === skillKey || s.title === skillKey
  );

  if (found) return found;

  // Fallback check in Hindi strings
  if (skillKey.includes('मिस्त्री')) return { emoji: '🧱', title: 'मिस्त्री' };
  if (skillKey.includes('पेंटर')) return { emoji: '🎨', title: 'पेंटर' };
  if (skillKey.includes('बढ़ई')) return { emoji: '🪚', title: 'बढ़ई' };
  if (skillKey.includes('प्लंबर')) return { emoji: '🔧', title: 'प्लंबर' };
  if (skillKey.includes('सफाई')) return { emoji: '🧹', title: 'सफाई' };
  if (skillKey.includes('मज़दूर')) return { emoji: '💪', title: 'मज़दूर' };
  if (skillKey.includes('बावर्ची')) return { emoji: '🍳', title: 'बावर्ची' };
  if (skillKey.includes('इलेक्ट्रीशियन')) return { emoji: '⚡', title: 'इलेक्ट्रीशियन' };

  return { emoji: '👷', title: skillKey };
}

export function formatCurrency(amount) {
  return `₹${amount || 0}`;
}
