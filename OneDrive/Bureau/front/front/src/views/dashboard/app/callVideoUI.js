// callVideoUI.js - Add this new function for incoming video call modal
/**
 * Affiche un modal pour accepter ou rejeter un appel vidéo entrant
 * @param {string} callerName - Nom de l'appelant
 * @param {Function} onAccept - Callback pour accepter l'appel
 * @param {Function} onReject - Callback pour rejeter l'appel
 * @returns {Object} Objet avec méthode close()
 */
export function showIncomingVideoCallModal(callerName, onAccept, onReject) {
    const modal = document.createElement('div');
    modal.id = 'incomingVideoCallModal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.7)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';
    

    modal.innerHTML = `
        <div style="background: #fff; padding: 25px; border-radius: 12px; text-align: center; width: 350px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
            <h3 style="margin: 0 0 15px 0; color: #333;">Appel Vidéo Entrant</h3>
            <p style="color: #666; margin-bottom: 25px;">De : ${callerName}</p>
            <div style="display: flex; gap: 15px; justify-content: center;">
                <button id="acceptVideoCallBtn" style="padding: 12px 25px; background: #4CAF50; color: white; border: none; border-radius: 25px; cursor: pointer; font-size: 16px;">
                    <i class="fas fa-video"></i> Accepter
                </button>
                <button id="rejectVideoCallBtn" style="padding: 12px 25px; background: #F44336; color: white; border: none; border-radius: 25px; cursor: pointer; font-size: 16px;">
                    <i class="fas fa-phone-slash"></i> Rejeter
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Gestion des clics
    document.getElementById('acceptVideoCallBtn').addEventListener('click', () => {
        onAccept();
        modal.remove();
    });

    document.getElementById('rejectVideoCallBtn').addEventListener('click', () => {
        onReject();
        modal.remove();
    });

    return {
        close: () => modal.remove()
    };
}
/**
 * Affiche un modal indiquant que l'appel vidéo est en cours.
 * @param {Function} onCancel - Callback appelée si l'utilisateur annule l'appel.
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
        <h3 style="margin-top: 0;">Appel vidéo en cours...</h3>
        <p>Connexion à l'appel vidéo...</p>
        <div style="margin-top: 20px;">
          <button id="cancelCallBtn" style="padding: 10px 20px; background: #9E9E9E; color: white; border: none; border-radius: 4px; cursor: pointer;">Annuler</button>
        </div>
      </div>
    `;
  
    document.body.appendChild(modal);
  
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
  
  /**
   * Affiche l'interface d'appel vidéo avec la vidéo locale, vidéo distante, et les contrôles :
   * - Bouton pour basculer la caméra (on/off)
   * - Bouton pour partager l'écran
   * - Bouton pour ouvrir/fermer le chat en temps réel
   * - Bouton pour terminer l'appel
   * La fenêtre de chat permet d'envoyer des messages qui seront transmis avec le nom de l'utilisateur.
   * 
   * @param {Function} onToggleCamera - Callback appelée pour activer/désactiver la vidéo locale.
   * @param {Function} onShareScreen - Callback appelée pour démarrer le partage d'écran.
   * @param {Function} onSendChatMessage - Callback appelée lors de l'envoi d'un message de chat.
   * @param {Function} onEndCall - Callback appelée pour terminer l'appel.
   * @returns {Object} Un objet avec :
   *   - close() : pour fermer l'interface.
   *   - addChatMessage(message, sender) : pour ajouter un message dans la fenêtre de chat.
   *   - getLocalVideoElement() et getRemoteVideoElement() : accès aux éléments vidéo.
   */
  export function showInCallVideoInterfaceEnhanced(onToggleCamera, onShareScreen, onSendChatMessage, onEndCall) {
    // Conteneur principal
    const container = document.createElement('div');
    container.id = 'videoCallContainer';
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.backgroundColor = '#000';
    container.style.zIndex = '1000';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
  
    // Zone vidéo (remote et local)
    const videoArea = document.createElement('div');
    videoArea.style.flex = '1';
    videoArea.style.position = 'relative';
    videoArea.style.display = 'flex';
    videoArea.style.justifyContent = 'center';
    videoArea.style.alignItems = 'center';
  
    // Vidéo distante (plein écran)
    const remoteVideo = document.createElement('video');
    remoteVideo.id = 'remoteVideo';
    remoteVideo.autoplay = true;
    remoteVideo.playsInline = true;
    remoteVideo.style.width = '100%';
    remoteVideo.style.height = '100%';
    remoteVideo.style.objectFit = 'cover';
    videoArea.appendChild(remoteVideo);
  
    // Vidéo locale (incrustée)
    const localVideo = document.createElement('video');
    localVideo.id = 'localVideo';
    localVideo.autoplay = true;
    localVideo.playsInline = true;
    localVideo.muted = true; // pour éviter l'effet de retour audio
    localVideo.style.width = '200px';
    localVideo.style.position = 'absolute';
    localVideo.style.bottom = '20px';
    localVideo.style.right = '20px';
    localVideo.style.border = '2px solid #fff';
    videoArea.appendChild(localVideo);
  
    container.appendChild(videoArea);
  
    // Barre de contrôle
    const controls = document.createElement('div');
    controls.style.display = 'flex';
    controls.style.justifyContent = 'center';
    controls.style.alignItems = 'center';
    controls.style.padding = '10px';
    controls.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
  
    // Bouton basculer la caméra
    const toggleCameraBtn = document.createElement('button');
    toggleCameraBtn.innerHTML = '<i class="fas fa-video"></i> Caméra';
    toggleCameraBtn.style.margin = '0 10px';
    toggleCameraBtn.style.padding = '10px 20px';
    toggleCameraBtn.style.backgroundColor = '#4CAF50';
    toggleCameraBtn.style.color = '#fff';
    toggleCameraBtn.style.border = 'none';
    toggleCameraBtn.style.borderRadius = '4px';
    toggleCameraBtn.style.cursor = 'pointer';
    toggleCameraBtn.addEventListener('click', onToggleCamera);
    controls.appendChild(toggleCameraBtn);
  
    // Bouton partager l'écran
    const shareScreenBtn = document.createElement('button');
    shareScreenBtn.innerHTML = '<i class="fas fa-desktop"></i> Partager écran';
    shareScreenBtn.style.margin = '0 10px';
    shareScreenBtn.style.padding = '10px 20px';
    shareScreenBtn.style.backgroundColor = '#2196F3';
    shareScreenBtn.style.color = '#fff';
    shareScreenBtn.style.border = 'none';
    shareScreenBtn.style.borderRadius = '4px';
    shareScreenBtn.style.cursor = 'pointer';
    shareScreenBtn.addEventListener('click', onShareScreen);
    controls.appendChild(shareScreenBtn);
  
    // Bouton ouvrir/fermer le chat
    const chatToggleBtn = document.createElement('button');
    chatToggleBtn.innerHTML = '<i class="fas fa-comments"></i> Chat';
    chatToggleBtn.style.margin = '0 10px';
    chatToggleBtn.style.padding = '10px 20px';
    chatToggleBtn.style.backgroundColor = '#FF9800';
    chatToggleBtn.style.color = '#fff';
    chatToggleBtn.style.border = 'none';
    chatToggleBtn.style.borderRadius = '4px';
    chatToggleBtn.style.cursor = 'pointer';
    controls.appendChild(chatToggleBtn);
  
    // Bouton terminer l'appel
    const endCallBtn = document.createElement('button');
    endCallBtn.innerHTML = '<i class="fas fa-phone-slash"></i> Terminer';
    endCallBtn.style.margin = '0 10px';
    endCallBtn.style.padding = '10px 20px';
    endCallBtn.style.backgroundColor = '#F44336';
    endCallBtn.style.color = '#fff';
    endCallBtn.style.border = 'none';
    endCallBtn.style.borderRadius = '4px';
    endCallBtn.style.cursor = 'pointer';
    endCallBtn.addEventListener('click', onEndCall);
    controls.appendChild(endCallBtn);
  
    container.appendChild(controls);
  
    // Panneau de chat (caché par défaut)
    const chatPanel = document.createElement('div');
    chatPanel.id = 'chatPanel';
    chatPanel.style.position = 'absolute';
    chatPanel.style.top = '0';
    chatPanel.style.right = '0';
    chatPanel.style.width = '300px';
    chatPanel.style.height = '100%';
    chatPanel.style.backgroundColor = 'rgba(255,255,255,0.9)';
    chatPanel.style.display = 'none';
    chatPanel.style.flexDirection = 'column';
    chatPanel.style.zIndex = '1100';
  
    // En-tête du chat avec le nom "Chat"
    const chatHeader = document.createElement('div');
    chatHeader.style.padding = '10px';
    chatHeader.style.backgroundColor = '#3F51B5';
    chatHeader.style.color = '#fff';
    chatHeader.textContent = 'Chat';
    chatPanel.appendChild(chatHeader);
  
    // Conteneur pour les messages
    const chatMessages = document.createElement('div');
    chatMessages.id = 'chatMessages';
    chatMessages.style.flex = '1';
    chatMessages.style.padding = '10px';
    chatMessages.style.overflowY = 'auto';
    chatPanel.appendChild(chatMessages);
  
    // Formulaire d'envoi de message
    const chatForm = document.createElement('form');
    chatForm.style.display = 'flex';
    chatForm.style.padding = '10px';
    const chatInput = document.createElement('input');
    chatInput.type = 'text';
    chatInput.placeholder = 'Votre message...';
    chatInput.style.flex = '1';
    chatInput.style.padding = '5px';
    chatForm.appendChild(chatInput);
    const chatSendBtn = document.createElement('button');
    chatSendBtn.type = 'submit';
    chatSendBtn.textContent = 'Envoyer';
    chatSendBtn.style.padding = '5px 10px';
    chatForm.appendChild(chatSendBtn);
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const message = chatInput.value.trim();
      if (message !== '') {
        onSendChatMessage(message);
        chatInput.value = '';
      }
    });
    chatPanel.appendChild(chatForm);
  
    container.appendChild(chatPanel);
  
    // Gestion de l'affichage du chat
    let chatVisible = false;
    chatToggleBtn.addEventListener('click', () => {
      chatVisible = !chatVisible;
      chatPanel.style.display = chatVisible ? 'flex' : 'none';
    });
  
    document.body.appendChild(container);
  
    return {
      close: () => {
        if (document.body.contains(container)) {
          document.body.removeChild(container);
        }
      },
      // Pour ajouter un message dans le chat
      addChatMessage: (message, sender) => {
        const messageElem = document.createElement('div');
        messageElem.style.marginBottom = '10px';
        messageElem.innerHTML = `<strong>${sender}:</strong> ${message}`;
        chatMessages.appendChild(messageElem);
        // Faire défiler vers le bas
        chatMessages.scrollTop = chatMessages.scrollHeight;
      },
      // Accès aux éléments vidéo
      getLocalVideoElement: () => localVideo,
      getRemoteVideoElement: () => remoteVideo
    };
  }