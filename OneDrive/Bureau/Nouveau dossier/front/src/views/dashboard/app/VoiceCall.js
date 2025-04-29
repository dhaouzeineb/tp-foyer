import webSocketService from './socket';
import { showCallingModal, showInCallInterface } from './callUI';

// Variables globales de la session d'appel
let peerConnection = null;
let localStream = null;
let currentUserId = null;
let currentTargetUserId = null;


const iceConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
  ],
};

// Fonction utilitaire pour récupérer ou créer l'élément audio distant
const getOrCreateRemoteAudio = (userId) => {
  const id = `remoteAudio-${userId}`;
  let remoteAudio = document.getElementById(id);
  if (!remoteAudio) {
    remoteAudio = document.createElement('audio');
    remoteAudio.id = id;
    remoteAudio.autoplay = true;
    remoteAudio.playsInline = true;
    remoteAudio.style.display = 'none';
    document.body.appendChild(remoteAudio);
  }
  return remoteAudio;
};

// Fonction utilitaire pour récupérer ou créer l'élément audio local
const getOrCreateLocalAudio = () => {
  let localAudio = document.getElementById('localAudio');
  if (!localAudio) {
    localAudio = document.createElement('audio');
    localAudio.id = 'localAudio';
    localAudio.autoplay = true;
    localAudio.playsInline = true;
    localAudio.style.display = 'none';
    document.body.appendChild(localAudio);
  }
  return localAudio;
};

/**
 * Initialise la connexion WebRTC pour l'appel vocal.
 */
export const initVoiceCall = async (userId, targetUserId) => {
  if (!userId || !targetUserId) {
    console.error("Erreur : userId ou targetUserId manquant lors de l'initialisation de l'appel vocal.");
    return;
  }

  currentUserId = userId;
  currentTargetUserId = targetUserId;

  peerConnection = new RTCPeerConnection(iceConfiguration);

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      const message = {
        type: 'candidate',
        candidate: event.candidate,
        from: { userId: currentUserId },
        to: currentTargetUserId
      };
      webSocketService.send(JSON.stringify(message));
      console.log('📤 Candidat ICE envoyé:', message);
    }
  };

  // Réception des flux distants
  peerConnection.ontrack = (event) => {
    const remoteAudio = getOrCreateRemoteAudio(currentTargetUserId);
    if (event.streams[0]) {
      remoteAudio.srcObject = event.streams[0];
      remoteAudio.play().catch(err => console.error("Erreur audio :", err));
    }
  };

  

  return { peerConnection };
};
let localAudioTracks = {};

export const toggleMute = (userId, isMuted) => {
  if (localAudioTracks[userId]) {
    localAudioTracks[userId].enabled = !isMuted;
  }
};

/**
 * Démarre un appel vocal.
 */
export const startVoiceCall = async (targetUserId, userId, userName, webrtcSessionId) => {
  if (!targetUserId || !userId) {
      console.error("Erreur : targetUserId ou userId manquant lors de l'initiation de l'appel vocal.");
      return;
  }

  currentUserId = userId;
  currentTargetUserId = targetUserId;

  // Initialize the call interface
// VoiceCall.js (modification de startVoiceCall)
webSocketService.callingModal = showCallingModal(() => {
  const cancelMessage = {
    type: 'cancel',
    from: { userId },
    to: targetUserId,
  };
  webSocketService.send(JSON.stringify(cancelMessage));
  endCall(); // Ajouter cette ligne
  console.log("Appel annulé par l'appelant.");
});

  if (!peerConnection) {
      await initVoiceCall(userId, targetUserId);
  }

  try {
      localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const localAudio = getOrCreateLocalAudio();
      localAudio.srcObject = localStream;

      // Store the local audio track for later mute/unmute
      localAudioTracks[currentUserId] = localStream.getAudioTracks()[0];
    } catch (error) {
      console.error("Erreur lors de l'accès au microphone:", error);
      return;
  }

  localStream.getAudioTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
  });

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);

  const message = {
      type: 'offer',
      offer,
      from: { userId, userName, webrtcSessionId },
      to: targetUserId
  };

  webSocketService.send(JSON.stringify(message));
  console.log('Appel vocal démarré:', message);
};

/**
 * Répond à un appel entrant et active le micro.
 */
export const answerVoiceCall = async (offer, callerUserId, userId, userName, webrtcSessionId) => {
  if (!callerUserId || !userId) {
    console.error("Erreur : callerUserId ou userId manquant lors de la réponse à l'appel.");
    return;
  }

  currentUserId = userId;
  currentTargetUserId = callerUserId;

  if (!peerConnection) {
    await initVoiceCall(userId, callerUserId);
  }

  try {
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const localAudio = getOrCreateLocalAudio();
    localAudio.srcObject = localStream;
    localAudioTracks[currentUserId] = localStream.getAudioTracks()[0];

  } catch (error) {
    console.error("Erreur lors de l'accès au microphone:", error);
    return;
  }

  localStream.getAudioTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });

  await peerConnection.setRemoteDescription(offer);
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);

  const message = {
    type: 'answer',
    answer,
    from: { userId },
    to: callerUserId
  };

  webSocketService.send(JSON.stringify(message));
  console.log('Appel vocal répondu:', message);

  showInCallInterface(
    (isMuted) => {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
      });
    },
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
};

/**
 * Ajoute un candidat ICE reçu via le signalement.
 */
export const addCandidate = async (candidate) => {
  try {
    if (peerConnection) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      console.log('Candidat ICE ajouté:', candidate);
    }
  } catch (error) {
    console.error("Erreur lors de l'ajout du candidat ICE:", error);
  }
};

/**
 * Termine l'appel.
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
  ['remoteAudio', 'localAudio'].forEach(id => {
    const audioElement = document.getElementById(id);
    if (audioElement) {
      audioElement.srcObject = null;
      audioElement.parentNode.removeChild(audioElement);
    }
  });
  console.log("Appel terminé et les pistes médias locales arrêtées.");
};