class MockWhatsappProvider {
  async processIncomingMessage(from, text) {
    console.log(`[MOCK WHATSAPP] Incoming from ${from}: "${text}"`);
    return {
      success: true,
      provider: 'mock',
      from,
      reply: `नमस्ते! काम मंच में आपका स्वागत है। आपका संदेश "${text}" प्राप्त हुआ।`
    };
  }

  generateShareUrl(phone, text) {
    const encodedText = encodeURIComponent(text);
    const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
    if (cleanPhone) {
      return `https://wa.me/${cleanPhone}?text=${encodedText}`;
    }
    return `https://wa.me/?text=${encodedText}`;
  }
}

module.exports = new MockWhatsappProvider();
