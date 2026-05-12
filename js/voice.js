/* ============================================================
   VOICE MODULE — Web Speech API Voice Search
   ============================================================ */

import { ui } from './ui.js';

class VoiceModule {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.setupRecognition();
  }

  setupRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
        this.updateUI(true);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.updateUI(false);
      };

      this.recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        ui.showToast(`Voice error: ${event.error}`, 'error');
        this.isListening = false;
        this.updateUI(false);
      };
    }
  }

  /**
   * Start or stop listening
   * @param {Function} onResult - Callback with transcript
   */
  toggle(onResult) {
    if (!this.recognition) {
      ui.showToast('Voice search not supported in this browser', 'error');
      return;
    }

    if (this.isListening) {
      this.recognition.stop();
    } else {
      this.recognition.start();
      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (onResult) onResult(transcript);
      };
    }
  }

  /**
   * Update the microphone button UI
   */
  updateUI(listening) {
    const micBtn = document.getElementById('voice-search-btn');
    if (!micBtn) return;

    const icon = micBtn.querySelector('i');
    if (listening) {
      micBtn.classList.add('btn-primary');
      icon.className = 'fas fa-microphone';
      icon.style.animation = 'pulse 1.5s infinite';
    } else {
      micBtn.classList.remove('btn-primary');
      icon.className = 'fas fa-microphone';
      icon.style.animation = '';
    }
  }
}

export const voiceModule = new VoiceModule();
