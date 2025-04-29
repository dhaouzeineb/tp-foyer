// videoCall.js
import webSocketService from './socket';
import { showInCallVideoInterfaceEnhanced, showCallingModal } from './callVideoUI';

let peerConnection = null;
let localStream = null;
let currentUserId = null;
let currentTargetUserId = null;
let inCallInterface = null;

const iceConfiguration = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

/**
 * Fonction utilitaire pour obtenir le flux local (caméra/micro).
 * Si le flux existe déjà, il est réutilisé.
 */
async function getLocalMedia() {
  if (localStream) return localStream;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStream = stream;
    // Optionnel : assigner le flux à un élément de prévisualisation
    const localVideo = document.getElementById('localVideo');
    if (localVideo) {
      localVideo.srcObject = stream;
      localVideo.play().catch(err => console.error("Erreur lecture vidéo locale:", err));
    }
    return stream;
  } catch (error) {
    console.error("Erreur d'accès média :", error);
    alert("Veuillez autoriser l'accès à la caméra et au microphone dans les paramètres de votre navigateur !");
    throw error;
  }
}

/**
 * Initialise la connexion WebRTC pour l'appel vidéo.
 */
export const initVideoCall = async (userId, targetUserId) => {
  if (!userId || !targetUserId) {
    console.error("Erreur : userId ou targetUserId manquant pour l'appel vidéo.");
    return;
  }
  currentUserId = userId;
  currentTargetUserId = targetUserId;
  peerConnection = new RTCPeerConnection(iceConfiguration);

  // Envoi des candidats ICE
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      const message = {
        type: 'candidate',
        candidate: event.candidate,
        from: { userId: currentUserId },
        to: currentTargetUserId
      };
      webSocketService.send(JSON.stringify(message));
    }
  };

  // Réception du flux distant
  peerConnection.ontrack = (event) => {
    const remoteVideo = document.getElementById('remoteVideo');
    if (event.streams && event.streams[0]) {
      remoteVideo.srcObject = event.streams[0];
      remoteVideo.play().catch(err => console.error("Erreur lecture vidéo distante :", err));
    }
  };

  return { peerConnection };
};

/**
 * Démarre un appel vidéo (côté appelant).
 */
export const startVideoCall = async (targetUserId, userId, userName, webrtcSessionId) => {
  if (!targetUserId || !userId) {
    console.error("Erreur : targetUserId ou userId manquant pour l'appel vidéo.");
    return;
  }
  currentUserId = userId;
  currentTargetUserId = targetUserId;

  // Affichage du modal "calling"
  webSocketService.callingModal = showCallingModal(() => {
    const cancelMessage = {
      type: 'cancel',
      from: { userId },
      to: targetUserId,
    };
    webSocketService.send(JSON.stringify(cancelMessage));
    endCall();
  });

  await initVideoCall(userId, targetUserId);

  try {
    const stream = await getLocalMedia();
    // Ajout des pistes locales à la connexion
    stream.getTracks().forEach(track => {
      peerConnection.addTrack(track, stream);
    });
  } catch (error) {
    // L'erreur est déjà gérée dans getLocalMedia
    return;
  }

  // Création de l'offre
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);

  const message = {
    type: 'offer',
    offer,
    callType: 'video',
    from: { userId, userName, webrtcSessionId },
    to: targetUserId
  };
  webSocketService.send(JSON.stringify(message));
};

/**
 * Répond à un appel vidéo entrant (côté récepteur).
 */
export const answerVideoCall = async (offer, callerUserId, userId, userName, webrtcSessionId) => {
  if (!callerUserId || !userId) {
    console.error("Erreur : callerUserId ou userId manquant lors de la réponse à l'appel vidéo.");
    return;
  }
  currentUserId = userId;
  currentTargetUserId = callerUserId;

  try {
    // Initialiser la connexion WebRTC si nécessaire
    if (!peerConnection) {
      await initVideoCall(userId, callerUserId);
    }

    // Réutiliser localStream s'il existe déjà pour éviter l'ouverture multiple
    if (!localStream) {
      try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      } catch (error) {
        if (error.name === "NotReadableError") {
          console.error("Erreur d'accès média : Le périphérique est déjà utilisé.");
          alert("La caméra ou le micro est déjà en cours d'utilisation par une autre instance. Fermez l'autre appel ou utilisez un autre périphérique.");
        } else {
          console.error("Erreur d'accès média :", error);
          alert("Erreur lors de l'accès à la caméra/micro. Veuillez vérifier vos autorisations.");
        }
        endCall();
        return;
      }
    } else {
      console.log("Flux local existant réutilisé.");
    }

    // Ajouter les pistes locales à la connexion
    localStream.getTracks().forEach(track => {
      // Pour éviter d'ajouter plusieurs fois la même piste, on peut vérifier si elle n'est pas déjà ajoutée.
      if (!peerConnection.getSenders().find(sender => sender.track === track)) {
        peerConnection.addTrack(track, localStream);
      }
    });

    // Mettre à jour ou créer l'élément vidéo local
    let localVideo = document.getElementById('localVideo');
    if (!localVideo) {
      localVideo = document.createElement('video');
      localVideo.id = 'localVideo';
      localVideo.autoplay = true;
      localVideo.muted = true; // Pour éviter l'écho
      document.body.appendChild(localVideo);
    }
    localVideo.srcObject = localStream;

    // Configurer la connexion avec l'offre et créer la réponse
    await peerConnection.setRemoteDescription(offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    const message = {
      type: 'answer',
      answer,
      callType: 'video',
      from: { userId },
      to: callerUserId
    };
    webSocketService.send(JSON.stringify(message));

    // Afficher l'interface d'appel vidéo avancée
    inCallInterface = showInCallVideoInterfaceEnhanced(
      // Callback pour activer/désactiver la vidéo locale
      () => {
        if (localStream) {
          localStream.getVideoTracks().forEach(track => {
            track.enabled = !track.enabled;
          });
        }
      },
      // Callback pour partager l'écran
      async () => {
        try {
          const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          const screenTrack = screenStream.getVideoTracks()[0];
          const sender = peerConnection.getSenders().find(s => s.track && s.track.kind === 'video');
          if (sender) {
            sender.replaceTrack(screenTrack);
          }
          // Rétablir la caméra quand le partage s'arrête
          screenTrack.onended = async () => {
            const camStream = await navigator.mediaDevices.getUserMedia({ video: true });
            const camTrack = camStream.getVideoTracks()[0];
            if (sender) {
              sender.replaceTrack(camTrack);
            }
          };
        } catch (error) {
          console.error("Erreur lors du partage d'écran :", error);
        }
      },
      // Callback pour envoyer un message de chat
      (chatMessage) => {
        const chatMsg = {
          type: 'chat',
          message: chatMessage,
          from: { userId },
          userName: userName,
          to: currentTargetUserId
        };
        webSocketService.send(JSON.stringify(chatMsg));
      },
      // Callback pour terminer l'appel
      () => {
        const hangupMessage = {
          type: 'hangup',
          from: { userId },
          to: callerUserId
        };
        webSocketService.send(JSON.stringify(hangupMessage));
        endCall();
      }
    );

  } catch (error) {
    console.error("Erreur globale answerVideoCall :", error);
    endCall();
  }
};




/**
 * Ajoute un candidat ICE à la connexion.
 */
export const addCandidate = async (candidate) => {
  try {
    if (peerConnection) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
  } catch (error) {
    console.error("Erreur lors de l'ajout du candidat ICE :", error);
  }
};

/**
 * Termine l'appel vidéo et arrête la caméra et le micro.
 */
export const endCall = () => {
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
    localStream = null;
  }
  // Optionnel : réinitialiser ou masquer les éléments vidéo
  ['localVideo', 'remoteVideo'].forEach(id => {
    const elem = document.getElementById(id);
    if (elem) {
      elem.srcObject = null;
      // elem.remove(); // Si vous souhaitez retirer complètement l'élément
    }
  });
  console.log("Appel terminé, caméra et micro fermés.");
};
