import { 
  answerVoiceCall, 
  endCall as endVoiceCall, 
  addCandidate as addVoiceCandidate , endCall
} from './VoiceCall';
import { 
  answerVideoCall, 
  addCandidate as addVideoCandidate 
} from './videoCall';
import { showIncomingCallModal, showInCallInterface } from './callUI';
import { showInCallVideoInterfaceEnhanced, showCallingModal,showIncomingVideoCallModal  } from './callVideoUI';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.shouldReconnect = true;
    this.userId = null;
    this.sessionId = null;
    this.callingModal = null;
    this.inCallModalInstance = null; // Pour stocker l'instance de l'interface en appel
    this.callType = 'voice'; // Valeur par défaut (peut être "voice" ou "video")
  }
 
  connect(userId, sessionId) {
    if (!userId || !sessionId) {
      console.error('❌ userId ou sessionId manquant pour établir la connexion WebSocket.');
      return;
    }

    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      console.warn("Une connexion WebSocket existante a été détectée. Fermeture de l'ancienne connexion.");
      this.socket.close(1000, "Nouvelle connexion demandée");
    }

    this.userId = userId;
    this.sessionId = sessionId;
    this.shouldReconnect = true;

    const wsUrl = `ws://localhost:8080/socket?userId=${userId}&sessionId=${sessionId}`;

    try {
      this.socket = new WebSocket(wsUrl);
    } catch (error) {
      console.error('❌ Impossible d\'établir la connexion WebSocket :', error);
      return;
    }

    this.socket.onopen = () => {
      console.log('✅ Connexion WebSocket établie.');
      this.reconnectAttempts = 0;
    };

    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        switch (message.type) {
          case 'offer':
            console.log('📥 Offre reçue:', message);
            this.callType = message.callType || 'voice';

            if (this.callType === 'video') {
              showIncomingVideoCallModal(
                message.from.userName || "Inconnu",
                async () => { // Ajouter async ici
                  try {
                    const currentUserId = this.userId;
                    const userName = "VotreNom";
                    const webrtcSessionId = this.sessionId;
                    
                    // Appel synchrone sans await
                    answerVideoCall(message.offer, message.from.userId, currentUserId, userName, webrtcSessionId);
                    
                    this.cleanupCallModal();
                  } catch (error) {
                    console.error("Erreur d'acceptation d'appel :", error);
                  }
                },
                () => {
                  const rejectMessage = {
                    type: 'reject',
                    from: { userId: this.userId },
                    to: message.from.userId
                  };
                  this.send(JSON.stringify(rejectMessage));
                  this.cleanupCallModal();
                }
              );
            } else {
              showIncomingCallModal(
                message.from.userName || "Inconnu",
                () => {
                  const currentUserId = this.userId;
                  const userName = "VotreNom";
                  const webrtcSessionId = this.sessionId;
                  answerVoiceCall(message.offer, message.from.userId, currentUserId, userName, webrtcSessionId);
                  this.cleanupCallModal();
                },
                () => {
                  const rejectMessage = {
                    type: 'reject',
                    from: { userId: this.userId },
                    to: message.from.userId
                  };
                  this.send(JSON.stringify(rejectMessage));
                  this.cleanupCallModal();
                }
              );
            }
            break;

            case 'candidate':
              console.log('📥 Candidat ICE reçu:', message.candidate);
              if (this.callType === 'video') {
                addVideoCandidate(message.candidate);
              } else {
                addVoiceCandidate(message.candidate);
              }
              break;
          case 'answer':
            console.log('📥 Réponse reçue:', message.answer);
            this.cleanupCallModal();

            if (this.callType === 'video') {
              this.inCallModalInstance = showInCallVideoInterfaceEnhanced(
                () => this.handleToggleCamera(),
                () => this.handleScreenShare(),
                (chatMessage) => {
                  const chatMsg = {
                    type: 'chat',
                    message: chatMessage,
                    from: { userId: this.userId },
                    to: message.from.userId
                  };
                  this.send(JSON.stringify(chatMsg));
                },
                () => {
                  const hangupMessage = {
                    type: 'hangup',
                    from: { userId: this.userId },
                    to: message.from.userId
                  };
                  this.send(JSON.stringify(hangupMessage));
                  this.cleanupCall();
                }
              );
            } else {
              this.inCallModalInstance = showInCallInterface(
                (isMuted) => {
                  console.log("Toggle mute action déclenchée");
                },
                () => {
                  const hangupMessage = {
                    type: 'hangup',
                    from: { userId: this.userId },
                    to: message.from.userId
                  };
                  this.send(JSON.stringify(hangupMessage));
                  this.cleanupCall();
                }
              );
            }
            break;

          case 'hangup':
            console.log('❌ Appel terminé par l\'utilisateur:', message.from);
            this.cleanupCall();
            break;

          case 'reject':
          case 'cancel':
            console.warn(`❌ Appel ${message.type} par:`, message.from);
            this.cleanupCallModal();
            break;

          default:
            console.log("📥 Message reçu :", message);
        }
      } catch (e) {
        if (event.data.startsWith("WEBRTC_READY:")) {
          this.sessionId = event.data.split(":")[1];
          console.log(`🎥 WebRTC prêt avec sessionId : ${this.sessionId}`);
        } else {
          console.log("📥 Message non parsable :", event.data);
        }
      }
    };


    this.socket.onerror = (error) => {
      console.error('❌ Erreur sur la connexion WebSocket :', error);
    };

    this.socket.onclose = (event) => {
      console.warn('⚠️ Connexion WebSocket fermée :', event);
      if (!this.shouldReconnect) {
        console.log("🚪 Fermeture WebSocket manuelle détectée. Arrêt des tentatives de reconnexion.");
        return;
      }
      if (event.wasClean || event.code === 1000) {
        console.log("🔕 Fermeture propre du WebSocket. Pas de reconnexion nécessaire.");
        return;
      }
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('❌ Impossible de reconnecter WebSocket après plusieurs tentatives.');
        return;
      }
      console.log(`🔄 Tentative de reconnexion (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})...`);
      setTimeout(() => this.connect(this.userId, this.sessionId), 3000);
    };
  }
  handleToggleCamera() {
    console.log("Toggle camera action");
    // Implémentez la logique de bascule de la caméra ici
  }

  handleScreenShare() {
    console.log("Screen share action");
    // Implémentez la logique de partage d'écran ici
  }

  cleanupCall() {
    endCall();
    if (this.inCallModalInstance) {
      this.inCallModalInstance.close();
      this.inCallModalInstance = null;
    }
  }

  cleanupCallModal() {
    if (this.callingModal) {
      this.callingModal.close();
      this.callingModal = null;
    }
  }

  send(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message);
      console.log('📤 Message envoyé :', message);
    } else {
      console.error('❌ La connexion WebSocket n\'est pas ouverte. Message non envoyé.');
    }
  }

  disconnect() {
    if (this.socket) {
      this.shouldReconnect = false;
      this.socket.close(1000, "Déconnexion manuelle");
      console.log('🚪 Connexion WebSocket fermée manuellement.');
    }
  }

  reconnect() {
    const delay = Math.min(30000, Math.pow(2, this.reconnectAttempts) * 1000);
    this.reconnectAttempts++;
    console.log(`🔄 Reconnexion dans ${delay / 1000} secondes...`);
    setTimeout(() => this.connect(this.userId, this.sessionId), delay);
  }
}

const webSocketService = new WebSocketService();
export default webSocketService;