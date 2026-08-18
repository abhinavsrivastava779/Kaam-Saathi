class MockTelephonyProvider {
  async triggerCallback(phone) {
    console.log(`[MOCK TELEPHONY] Triggering IVR callback to ${phone}...`);
    return {
      success: true,
      provider: 'mock',
      callId: `call_${Date.now()}`,
      status: 'initiated',
      message: 'IVR कॉल शुरू की गई है।'
    };
  }

  getIVRPrompt(step) {
    const prompts = {
      WELCOME: 'काम मंच में आपका स्वागत है। कौशल चुनने के लिए नंबर दबाएं: 1-मिस्त्री, 2-पेंटर, 3-बढ़ई, 4-प्लंबर, 5-सफाई, 6-मज़दूर',
      NAME: 'अपना नाम बोलें या दर्ज करें।',
      AREA: 'अपना काम करने का इलाका बताएं।',
      RATE: 'अपनी दिहाड़ी बताएं (जैसे 700)।',
      AVAILABILITY: 'क्या आप आज काम के लिए उपलब्ध हैं? 1 दबाएं: हाँ, 2 दबाएं: नहीं',
      COMPLETED: 'बधाई हो! आपका प्रोफाइल बन गया है।'
    };
    return prompts[step] || 'कृपया अपनी प्रविष्टि दर्ज करें।';
  }
}

module.exports = new MockTelephonyProvider();
