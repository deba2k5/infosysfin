export interface SMSAlert {
  id: string;
  type: 'weather' | 'crop' | 'market' | 'insurance' | 'emergency';
  message: string;
  timestamp: Date;
  status: 'sent' | 'pending' | 'failed';
  phoneNumber: string;
}

export interface SMSSubscription {
  phoneNumber: string;
  alertTypes: string[];
  language: string;
  location: string;
  active: boolean;
}

// Using the provided phone number
const SMS_TARGET_NUMBER = '6290277345';

export const smsService = {
  async sendSMSAlert(message: string, type: string, phoneNumber: string = SMS_TARGET_NUMBER): Promise<boolean> {
    try {
      // In production, integrate with SMS gateway like Twilio, AWS SNS, or Indian SMS providers
      // For now, simulate SMS sending and log to console
      
      const smsData = {
        to: phoneNumber,
        message: message,
        type: type,
        timestamp: new Date().toISOString()
      };

      console.log('📱 SMS Alert Sent:', smsData);
      
      // Simulate API call to SMS provider
      const response = await simulateSMSGateway(smsData);
      
      // Store SMS in local storage for tracking
      const sentSMS: SMSAlert = {
        id: generateId(),
        type: type as any,
        message,
        timestamp: new Date(),
        status: response.success ? 'sent' : 'failed',
        phoneNumber
      };

      storeSMSHistory(sentSMS);
      return response.success;
    } catch (error) {
      console.error('SMS service error:', error);
      return false;
    }
  },

  async sendWeatherAlert(weatherData: any, phoneNumber: string = SMS_TARGET_NUMBER): Promise<boolean> {
    const message = `🌦️ KrishakSure Weather Alert
Temperature: ${weatherData.temperature}°C
Condition: ${weatherData.condition}
Humidity: ${weatherData.humidity}%
Rain Chance: ${weatherData.rainChance || 'Low'}%

Stay prepared! Visit app for detailed forecast.`;

    return this.sendSMSAlert(message, 'weather', phoneNumber);
  },

  async sendCropAlert(cropInfo: string, phoneNumber: string = SMS_TARGET_NUMBER): Promise<boolean> {
    const message = `🌱 KrishakSure Crop Alert
${cropInfo}

For detailed guidance, open KrishakSure app or call our helpline.`;

    return this.sendSMSAlert(message, 'crop', phoneNumber);
  },

  async sendMarketAlert(marketData: any, phoneNumber: string = SMS_TARGET_NUMBER): Promise<boolean> {
    const message = `💰 KrishakSure Market Update
${marketData.crop}: ₹${marketData.price}/quintal
Market: ${marketData.market}
Trend: ${marketData.trend}

Best time to sell! Check app for more markets.`;

    return this.sendSMSAlert(message, 'market', phoneNumber);
  },

  async sendInsuranceAlert(insuranceInfo: string, phoneNumber: string = SMS_TARGET_NUMBER): Promise<boolean> {
    const message = `🛡️ KrishakSure Insurance Alert
${insuranceInfo}

Important: Complete your application by visiting KrishakSure app.`;

    return this.sendSMSAlert(message, 'insurance', phoneNumber);
  },

  async sendEmergencyAlert(alertMessage: string, phoneNumber: string = SMS_TARGET_NUMBER): Promise<boolean> {
    const message = `🚨 URGENT - KrishakSure Emergency Alert
${alertMessage}

Take immediate action! Call helpline: 1800-XXX-XXXX`;

    return this.sendSMSAlert(message, 'emergency', phoneNumber);
  },

  async subscribeToAlerts(subscription: SMSSubscription): Promise<boolean> {
    try {
      // Store subscription preferences
      const subscriptions = getStoredSubscriptions();
      subscriptions.push(subscription);
      localStorage.setItem('sms_subscriptions', JSON.stringify(subscriptions));
      
      // Send welcome SMS
      const welcomeMessage = `🙏 Welcome to KrishakSure SMS Alerts!
You'll receive updates on: ${subscription.alertTypes.join(', ')}
Language: ${subscription.language}
Location: ${subscription.location}

Reply STOP to unsubscribe.`;

      return this.sendSMSAlert(welcomeMessage, 'subscription', subscription.phoneNumber);
    } catch (error) {
      console.error('Subscription error:', error);
      return false;
    }
  },

  getSMSHistory(): SMSAlert[] {
    try {
      const history = localStorage.getItem('sms_history');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error getting SMS history:', error);
      return [];
    }
  },

  getSubscriptions(): SMSSubscription[] {
    return getStoredSubscriptions();
  }
};

// Helper functions
function simulateSMSGateway(smsData: any): Promise<{ success: boolean; messageId?: string }> {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      // Simulate 95% success rate
      const success = Math.random() > 0.05;
      resolve({
        success,
        messageId: success ? `sms_${Date.now()}` : undefined
      });
    }, 1000);
  });
}

function generateId(): string {
  return `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function storeSMSHistory(sms: SMSAlert): void {
  try {
    const history = smsService.getSMSHistory();
    history.unshift(sms); // Add to beginning
    
    // Keep only last 100 messages
    const trimmedHistory = history.slice(0, 100);
    localStorage.setItem('sms_history', JSON.stringify(trimmedHistory));
  } catch (error) {
    console.error('Error storing SMS history:', error);
  }
}

function getStoredSubscriptions(): SMSSubscription[] {
  try {
    const subscriptions = localStorage.getItem('sms_subscriptions');
    return subscriptions ? JSON.parse(subscriptions) : [];
  } catch (error) {
    console.error('Error getting subscriptions:', error);
    return [];
  }
}
