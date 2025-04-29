
const webrtcSessionId = localStorage.getItem('webrtc_session_id');

// Vérification de l'existence de webrtc_session_id


// Création de la connexion WebSocket en utilisant le webrtc_session_id
var conn = new WebSocket(`ws://localhost:8080/socket?webrtc_session_id=${webrtcSessionId}`);


// Configuration de la connexion peer-to-peer
function setupPeerConnection(targetWebRtcSessionId) {
    const peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            send({
                event: "candidate",
                data: {
                    candidate: event.candidate,
                    targetWebRtcSessionId: targetWebRtcSessionId
                }
            });
        }
    };

    peerConnection.ontrack = event => {
        const remoteStream = event.streams[0];
        if (event.track.kind === 'audio') {
            remoteAudio.srcObject = remoteStream;
        }
        if (event.track.kind === 'video') {
            remoteVideo.srcObject = remoteStream;
        }
    };

    return peerConnection;
}

// Fonction d'appel vocal
export const startVoiceCall = async (targetWebRtcSessionId, callerName) => {
    // Vérifier qu’un utilisateur cible a été sélectionné
    if (!targetWebRtcSessionId) {
        alert("Aucun utilisateur sélectionné pour l'appel");
        return;
    }
    // Empêcher l'appel à soi-même
    if (targetWebRtcSessionId === webrtcSessionId) {
        alert("Vous ne pouvez pas vous appeler vous-même");
        return;
    }
    
    // Créer la connexion peer-to-peer
    const peerConnection = setupPeerConnection(targetWebRtcSessionId);
    
    try {
        // Récupérer le flux audio
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

        // Créer et envoyer l'offre
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        send({
            event: "offer",
            data: {
                offer,
                callerName,
                targetWebRtcSessionId
            }
        });
        
    } catch (error) {
        console.error("Erreur démarrage appel:", error);
    }
};

// Gestion des messages entrants
conn.onmessage = async (event) => {
    const message = JSON.parse(event.data);
    
    // Ignorer les messages non destinés à cet utilisateur
    if (message.data.targetWebRtcSessionId !== webrtcSessionId) return;

    switch(message.event) {
        case "offer":
            handleOffer(message.data);
            break;
            
        case "answer":
            handleAnswer(message.data);
            break;
            
        case "candidate":
            handleCandidate(message.data);
            break;
    }
};

// Gestion des offres
// Fonction de traitement des offres
const handleOffer = async (data) => {
    const peerConnection = setupPeerConnection(data.callerId);
    
    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
    
    // Répondre à l'offre avec une réponse
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    
    send({
        event: "answer",
        data: {
            answer,
            targetWebRtcSessionId: data.callerId
        }
    });
};
const peerConnections = {};

// Fonction de traitement des réponses
const handleAnswer = async (data) => {
    const peerConnection = peerConnections[data.targetWebRtcSessionId];
    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
};

// Fonction de gestion des candidats ICE
const handleCandidate = async (data) => {
    const peerConnection = peerConnections[data.targetWebRtcSessionId];
    await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
};

// Recevoir les messages de WebSocket (offre, réponse, candidats ICE, etc.)
conn.onmessage = (message) => {
    const data = JSON.parse(message.data);
    if (data.event === "offer") {
        // Traitement de l'offre reçue (établissement de la connexion)
        handleOffer(data);
    } else if (data.event === "answer") {
        // Traitement de la réponse reçue de l'autre utilisateur
        handleAnswer(data);
    } else if (data.event === "candidate") {
        // Ajout du candidat ICE
        handleCandidate(data);
    }
};


  
  // Modifiez la connexion WebSocket

var peerConnection;
var localStream;
var answerProcessed = false;
var iceCandidatesQueue = [];
var isCaller = false;
conn.onerror = function(error) {
    console.error("WebSocket Error:", error);
    // Tentative de reconnexion
    setTimeout(() => {
        conn = new WebSocket(`ws://localhost:8080/socket?userId=${webrtcSessionId}`);
    }, 3000);
};
const audioElement = new Audio();
audioElement.volume = 1; // Assurez-vous que le volume est bien initialisé

audioElement.onvolumechange = function () {
    if (audioElement.volume === 0) {
        console.log("Volume à zéro, mais le son est toujours actif");
    }
};

var localVideo = document.createElement('video');
localVideo.id = "localVideo";
localVideo.autoplay = true;
localVideo.muted = true;
document.body.appendChild(localVideo);

var remoteVideo = document.createElement('video');
remoteVideo.id = "remoteVideo";
remoteVideo.autoplay = true;
document.body.appendChild(remoteVideo);
// Création d'un élément audio distant unique
var remoteAudio = document.createElement('audio');
remoteAudio.id = "remoteAudio";
remoteAudio.autoplay = true;
remoteAudio.controls = true; // Permet l'interaction utilisateur pour contourner les restrictions autoplay

conn.onopen = () => console.log("✅ WebSocket connecté.");
conn.onerror = error => console.error("❌ WebSocket Error:", error);
conn.onclose = event => console.log(`⚠️ Connexion fermée, code=${event.code}, raison=${event.reason}`);

function send(message) {
    if (conn.readyState === WebSocket.OPEN) {
        conn.send(JSON.stringify(message));
    } else {
        console.warn("⚠️ WebSocket fermé, message non envoyé.");
    }
}

// Configuration de la RTCPeerConnection
/*function setupPeerConnection() {
    peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            console.log("📩 Candidat ICE généré:", event.candidate);
            send({ event: "candidate", data: event.candidate });
        }
    };

    peerConnection.ontrack = event => {
        console.log("🎥 Flux distant reçu:", event.track.kind);
        if (event.track.kind === 'audio') {
            console.log("🔊 Piste audio distante reçue.");
            remoteAudio.srcObject = event.streams[0];
        }
        if (event.track.kind === 'video') {
            console.log("📹 Piste vidéo distante reçue.");
            remoteVideo.srcObject = event.streams[0];
        }
    };

    peerConnection.oniceconnectionstatechange = () => {
        console.log("État de la connexion ICE:", peerConnection.iceConnectionState);
    };

    peerConnection.onconnectionstatechange = () => {
        console.log("État de la connexion peer-to-peer:", peerConnection.connectionState);
    };
}*/
let callStartTime;
let callInterval;

function startCallDuration() {
    let callDurationElement = document.getElementById('callDuration');

    if (!callDurationElement) {
        callDurationElement = document.createElement('div');
        callDurationElement.id = 'callDuration';
        document.body.appendChild(callDurationElement);
    }

    let startTime = Date.now();

    const updateDuration = () => {
        let elapsed = Date.now() - startTime;
        let minutes = Math.floor(elapsed / 60000);
        let seconds = Math.floor((elapsed % 60000) / 1000);
        callDurationElement.textContent = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
    };

    callInterval = setInterval(updateDuration, 1000);
}

let isCallEnded = false;
let isRemoteCallEnded = false;

function endCall() {
    if (isCallEnded) return;

    isCallEnded = true;

    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }

    send({ event: "endCall", data: { message: "Appel terminé" } });

    if (peerConnection) {
        peerConnection.close();
    }
    clearInterval(callInterval);

    console.log("📞 Appel terminé.");

    localVideo.srcObject = null;
    remoteVideo.srcObject = null;

    let controlsDiv = document.getElementById('callControls');
    if (controlsDiv) {
        controlsDiv.remove();
    }

    if (!isRemoteCallEnded) {
        isRemoteCallEnded = true;
        let remoteControlsDiv = document.getElementById('remoteCallControls');
        if (remoteControlsDiv) {
            remoteControlsDiv.remove();
        }
    }

}

/*conn.onmessage = async function(event) {
    const message = JSON.parse(event.data);
    
    // Filtrage des messages non destinés à cet utilisateur
    if(message.targetUserId && message.targetUserId !== userId) return;

    // Gestion des différents types de messages
    switch(message.event) {
        case "offer":
            if (!isCallEnded && !isCaller) {
                showIncomingCallUI(message.data);
            }
            break;
            
        case "answer":
            if (peerConnection.signalingState === 'have-local-offer') {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(message.data));
            }
            break;
            
        case "candidate":
            try {
                await peerConnection.addIceCandidate(new RTCIceCandidate(message.data));
            } catch (error) {
                console.error("Erreur candidat ICE:", error);
            }
            break;
            
        case "endCall":
            endCall();
            break;
    }
};*/

function showIncomingCallUI(callData) {
    if (isCallEnded) return;

    // Lecture de la sonnerie
    audioElement.src = '/2.mp3'; // Remplacez par le chemin réel vers votre fichier audio
    audioElement.play().catch(err => console.error("Erreur lors de la lecture de la sonnerie:", err));

    const incomingCallDiv = document.createElement('div');
    incomingCallDiv.id = "incomingCallControls";
    incomingCallDiv.style.position = "fixed";
    incomingCallDiv.style.top = "20px";
    incomingCallDiv.style.left = "50%";
    incomingCallDiv.style.transform = "translateX(-50%)";
    incomingCallDiv.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    incomingCallDiv.style.padding = "10px";
    incomingCallDiv.style.borderRadius = "5px";
    incomingCallDiv.style.color = "white";

    // Affichage du nom de l'appelant
    const callerName = callData.username || "Inconnu";
    const callInfo = document.createElement('div');
    callInfo.textContent = `Appel de : ${callerName}`;
    incomingCallDiv.appendChild(callInfo);

    const acceptBtn = document.createElement('button');
    acceptBtn.textContent = "Accepter";
    acceptBtn.style.padding = "10px";
    acceptBtn.style.margin = "5px";
    acceptBtn.style.backgroundColor = "#4CAF50";
    acceptBtn.style.color = "white";
    acceptBtn.onclick = async function () {
        // Arrêter la sonnerie lors de l'acceptation de l'appel
        audioElement.pause();
        document.getElementById('incomingCallControls')?.remove();
        await acceptCall(callData.offer);
    };

    const rejectBtn = document.createElement('button');
    rejectBtn.textContent = "Refuser";
    rejectBtn.style.padding = "10px";
    rejectBtn.style.margin = "5px";
    rejectBtn.style.backgroundColor = "#f44336";
    rejectBtn.style.color = "white";
    rejectBtn.onclick = function () {
        // Arrêter la sonnerie lors du refus de l'appel
        audioElement.pause();
        document.getElementById('incomingCallControls')?.remove();
        send({ event: "endCall", data: { message: "Appel refusé" } });
    };

    incomingCallDiv.appendChild(acceptBtn);
    incomingCallDiv.appendChild(rejectBtn);

    document.body.appendChild(incomingCallDiv);
}


async function acceptCall(offer) {
    try {
        console.log("📞 Acceptation de l'appel...");
        if (!peerConnection) setupPeerConnection();
        localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        localStream.getTracks().forEach(track => {
            if (peerConnection.signalingState !== 'closed') {
                peerConnection.addTrack(track, localStream);
                console.log(`✅ Piste ${track.kind} ajoutée à la connexion.`);
            } else {
                console.error("❌ Connexion fermée, impossible d'ajouter la piste.");
            }
        });
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        send({ event: "answer", data: answer });
        console.log("✅ Réponse envoyée.");
        showCallControlsUI();
        startCallDuration();
    } catch (error) {
        console.error("❌ Erreur lors de l'acceptation de l'appel:", error);
    }
}

function showCallControlsUI() {
    if (isCallEnded) return;
    const controlsDiv = document.createElement('div');
    controlsDiv.id = "callControls";
    controlsDiv.style.position = "fixed";
    controlsDiv.style.bottom = "20px";
    controlsDiv.style.left = "50%";
    controlsDiv.style.transform = "translateX(-50%)";
    controlsDiv.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    controlsDiv.style.padding = "10px";
    controlsDiv.style.borderRadius = "5px";
    controlsDiv.style.color = "white";
    const callDurationElement = document.createElement('div');
    callDurationElement.id = "callDuration";
    controlsDiv.appendChild(callDurationElement);
    const toggleMicBtn = document.createElement('button');
    toggleMicBtn.id = "toggleMicBtn";
    toggleMicBtn.textContent = "Couper Micro";
    toggleMicBtn.style.padding = "10px";
    toggleMicBtn.style.margin = "5px";
    toggleMicBtn.style.backgroundColor = "#ff6347";
    toggleMicBtn.style.color = "white";
    toggleMicBtn.onclick = toggleMicrophone;
    controlsDiv.appendChild(toggleMicBtn);
    const hangUpBtn = document.createElement('button');
    hangUpBtn.textContent = "Raccrocher";
    hangUpBtn.style.padding = "10px";
    hangUpBtn.style.margin = "5px";
    hangUpBtn.style.backgroundColor = "#ff6347";
    hangUpBtn.style.color = "white";
    hangUpBtn.onclick = endCall;
    controlsDiv.appendChild(hangUpBtn);
    document.body.appendChild(controlsDiv);
}

let isMuted = false;

function toggleMicrophone() {
    const micButton = document.getElementById('toggleMicBtn');

    if (!localStream) {
        console.error("❌ Local stream non défini.");
        return;
    }
    isMuted = !isMuted;
    localStream.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
        console.log(`Piste audio locale : ${track.id}, activée : ${track.enabled}`);
    });

    micButton.textContent = isMuted ? "Activer Micro" : "Couper Micro";
}
/*export const startVoiceCall = async (callerName,targetUserId) => {
    if (targetUserId === userId) {
        alert("Vous ne pouvez pas vous appeler vous-même");
        return;
      }
    isCaller = true;
    if (!peerConnection || peerConnection.signalingState === 'closed') {
        console.log("❌ La connexion est fermée, création d'une nouvelle connexion");
        setupPeerConnection();
    }
    console.log("📱 Démarrage de l'appel vocal...");

    try {
        localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

        localStream.getTracks().forEach(track => {
            if (peerConnection.signalingState !== 'closed') {
                peerConnection.addTrack(track, localStream);
                console.log(`✅ Piste ${track.kind} ajoutée à la connexion.`);
            } else {
                console.error("❌ Connexion fermée, impossible d'ajouter la piste.");
            }
        });

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        // Envoi de l'offre avec le nom de l'appelant
        send({
            event: "offer",
            data: { 
                offer,
                username: callerName,
                targetUserId  // This must be the correct UUID of the target user
            }
        });
        

    } catch (err) {
        console.error("❌ Erreur lors du démarrage de l'appel vocal:", err);
    }
};*/



export const startVideoCall = async (targetUserId, callerName) => {
    if (targetUserId === webrtcSessionId) {
        alert("Vous ne pouvez pas vous appeler vous-même");
        return;
    }
    
    // Reset de la connexion
    if (peerConnection) {
        peerConnection.close();
    }
    setupPeerConnection();
    if (!peerConnection) setupPeerConnection();
    console.log("📞 Démarrage de l'appel vidéo...");

    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideo.srcObject = localStream;
        localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        send({ event: "offer", data: offer });

        answerProcessed = false;
    } catch (err) {
        console.error("❌ Erreur appel vidéo:", err);
    }
};
