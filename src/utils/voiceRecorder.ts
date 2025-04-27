
export class VoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  async startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
    } catch (error) {
      console.error('Error starting voice recording:', error);
      throw error;
    }
  }

  stopRecording(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'));
        return;
      }

      this.mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
          const base64Audio = await this.blobToBase64(audioBlob);
          
          this.audioChunks = [];
          this.mediaRecorder?.stream.getTracks().forEach(track => track.stop());
          
          resolve(base64Audio);
        } catch (error) {
          reject(error);
        }
      };

      this.mediaRecorder.stop();
    });
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          // Remove the data URL prefix (e.g., "data:audio/webm;base64,")
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to convert blob to base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Estimate duration based on audio size (rough estimate)
  estimateDuration(base64Audio: string): number {
    // Convert base64 to bytes to estimate duration
    const bytes = this.base64ToBytes(base64Audio);
    // Rough estimate: ~128 kbps webm audio = ~16KB per second
    // Using a conservative estimate of 12KB per second to avoid underestimating
    const bytesPerSecond = 12 * 1024;
    return Math.max(1, Math.round(bytes / bytesPerSecond));
  }

  private base64ToBytes(base64: string): number {
    return Math.floor((base64.length * 3) / 4);
  }
}
