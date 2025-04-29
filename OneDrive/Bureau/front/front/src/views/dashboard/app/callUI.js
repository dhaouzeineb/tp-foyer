let localStream = null; // Declare at the top or in the relevant scope

/**
 * Affiche un modal pour un appel entrant avec boutons d'acceptation et de refus.
 * @param {string} callerName - Le nom de l'appelant.
 * @param {Function} onAccept - Callback appelé si l'utilisateur accepte.
 * @param {Function} onReject - Callback appelé si l'utilisateur refuse.
 */
export function showIncomingCallModal(callerName, onAccept, onReject) {
    const modal = document.createElement('div');
    modal.id = 'incomingCallModal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';
  
    modal.innerHTML = `
    <div style="background: #fff; padding: 20px; border-radius: 8px; text-align: center; width: 300px; box-shadow: 0 2px 10px rgba(0,0,0,0.2);">
      <h3 style="margin-top: 0;">Appel entrant</h3>
      <p>${callerName} vous appelle...</p>
      <div style="margin-top: 20px;">
        <button id="acceptCallBtn" style="margin: 10px; padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">Accepter</button>
        <button id="rejectCallBtn" style="margin: 10px; padding: 10px 20px; background: #F44336; color: white; border: none; border-radius: 4px; cursor: pointer;">Refuser</button>
      </div>
    </div>
  `;
  
  
    document.body.appendChild(modal);
  
    document.getElementById('acceptCallBtn').addEventListener('click', () => {
      onAccept();
      closeModal();
    });
  
    document.getElementById('rejectCallBtn').addEventListener('click', () => {
      onReject();
      closeModal();
    });
  
    const audio = new Audio('/2.mp3');
  audio.loop = true;
  audio.play();

  function closeModal() {
    audio.pause();
    if (document.body.contains(modal)) {
      document.body.removeChild(modal);
    }
  }
  }
  
  /**
   * Affiche un modal indiquant que l'appel est en cours pour l'appelant, avec une sonnerie.
   * @param {Function} onCancel - Callback appelé si l'appelant annule l'appel.
   * @returns {Object} Un objet avec une méthode close() pour fermer le modal.
   */
  export function showCallingModal(onCancel) {
    const modal = document.createElement('div');
    modal.id = 'callingModal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';
  
    modal.innerHTML = `
    <div style="background: #fff; padding: 20px; border-radius: 8px; text-align: center; width: 300px; box-shadow: 0 2px 10px rgba(0,0,0,0.2);">
      <h3 style="margin-top: 0;">Appel en cours...</h3>
      <p>Nous appelons l'utilisateur...</p>
      <div style="margin-top: 20px;">
        <button id="cancelCallBtn" style="padding: 10px 20px; background: #9E9E9E; color: white; border: none; border-radius: 4px; cursor: pointer;">Annuler</button>
      </div>
    </div>
  `;
  
  
    document.body.appendChild(modal);
  
    // Lecture d'une sonnerie (à fournir, par exemple '/sounds/ringtone.mp3')
    
  
    document.getElementById('cancelCallBtn').addEventListener('click', () => {
      onCancel();
     
      closeModal();
    });
  
    function closeModal() {
      if (document.body.contains(modal)) {
        document.body.removeChild(modal);
      }
    }
  
    return {
      close: () => {
        closeModal();
      }
    };
  }
  export function showInCallInterface(onMuteToggle, onEndCall, localAudioTrack) {
    const modal = document.createElement('div');
    modal.id = 'inCallModal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';
  
    let isMuted = false; 
  
    // Timer logic (unchanged)
    let startTime = Date.now();
    let timerInterval;
    const updateTimer = () => {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      const minutes = Math.floor(duration / 60).toString().padStart(2, '0');
      const seconds = (duration % 60).toString().padStart(2, '0');
      timerDisplay.textContent = `${minutes}:${seconds}`;
    };
  
    modal.innerHTML = `
      <div style="background: #fff; padding: 20px; border-radius: 8px; text-align: center; width: 300px; box-shadow: 0 2px 10px rgba(0,0,0,0.2);">
        <h3 style="margin-top: 0;">En appel</h3>
        <div id="timer" style="font-size: 24px; margin: 20px 0;">00:00</div>
        <div style="margin-top: 20px;">
          <button id="muteBtn" style="margin: 10px; padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
            <i class="fas fa-microphone"></i>
          </button>
          <button id="endCallBtn" style="margin: 10px; padding: 10px 20px; background: #F44336; color: white; border: none; border-radius: 4px; cursor: pointer;">
            <i class="fas fa-phone-slash"></i>
          </button>
        </div>
      </div>
    `;
  
    document.body.appendChild(modal);
  
    const timerDisplay = modal.querySelector('#timer');
    const muteBtn = modal.querySelector('#muteBtn');
    const endCallBtn = modal.querySelector('#endCallBtn');
  
    timerInterval = setInterval(updateTimer, 1000);
  
    // Handle mute/unmute functionality
    muteBtn.addEventListener('click', () => {
      isMuted = !isMuted;
      muteBtn.style.backgroundColor = isMuted ? '#9E9E9E' : '#4CAF50';
      muteBtn.querySelector('i').className = isMuted ? 'fas fa-microphone-slash' : 'fas fa-microphone';
      if (localAudioTrack) {
        localAudioTrack.enabled = !isMuted; // Mute or unmute the local audio track
      }
      onMuteToggle(isMuted);
    });
  
    // End the call
    endCallBtn.addEventListener('click', () => {
      onEndCall();
      clearInterval(timerInterval);
      document.body.removeChild(modal);
    });
  
    return {
      close: () => {
        clearInterval(timerInterval);
        if (document.body.contains(modal)) {
          document.body.removeChild(modal);
        }
      }
    };
  }
  