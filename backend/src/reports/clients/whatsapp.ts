export interface WhatsappStatusResponse {
  ready: boolean;
}

export interface WhatsappSendResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class WhatsappClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.WHATSAPP_BASE_URL || 'http://localhost:5010';
    this.apiKey = process.env.WHATSAPP_API_KEY || '';
  }

  async checkStatus(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/whatsapp/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
        },
      });

      if (!response.ok) return false;
      const data = (await response.json()) as WhatsappStatusResponse;
      return data.ready === true;
    } catch {
      return false;
    }
  }

  async sendMessage(to: string, message: string): Promise<WhatsappSendResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/whatsapp/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
        },
        body: JSON.stringify({ to, message }),
      });

      const data = (await response.json()) as any;
      if (response.ok && data.success) {
        return { success: true, messageId: data.messageId || 'sent_successfully' };
      }
      return { success: false, error: data.message || 'Failed to send message' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  }
}

export default WhatsappClient;
