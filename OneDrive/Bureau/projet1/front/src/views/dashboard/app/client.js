var conn = new WebSocket('ws://localhost:8080/socket');
var peerConnection;
var localStream;
var answerProcessed = false;
var iceCandidatesQueue = [];
var isCaller = false;

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
function setupPeerConnection() {
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
}
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

conn.onmessage = async function (event) {
    var message = JSON.parse(event.data);

    if (!peerConnection) setupPeerConnection();

    if (message.event === "offer") {
        console.log("📩 Offre reçue");

        if (!isCallEnded && !isCaller) {
            showIncomingCallUI(message.data);
        }

    } else if (message.event === "answer" && !answerProcessed) {
        console.log("📩 Réponse reçue");

        if (message.data && message.data.type) {
            if (peerConnection.signalingState === 'have-local-offer') {
                try {
                    await peerConnection.setRemoteDescription(new RTCSessionDescription(message.data));
                    console.log("✅ Réponse traitée.");
                    answerProcessed = true;

                    while (iceCandidatesQueue.length > 0) {
                        let candidate = iceCandidatesQueue.shift();
                        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                        console.log("✅ Candidat ICE ajouté.");
                    }
                } catch (error) {
                    console.error("❌ Erreur lors du traitement de la réponse:", error);
                }
            }
        } else {
            console.error("❌ Données de réponse invalides reçues:", message.data);
        }

        if (!isCallEnded) {
            showCallControlsUI();
            startCallDuration();
        }

    } else if (message.event === "candidate") {
        console.log("📩 Candidat ICE reçu");

        if (peerConnection.remoteDescription) {
            try {
                await peerConnection.addIceCandidate(new RTCIceCandidate(message.data));
                console.log("✅ Candidat ICE ajouté.");
            } catch (error) {
                console.error("❌ Erreur ajout candidat ICE:", error);
            }
        } else {
            console.log("⚠️ Candidat ICE mis en file d'attente.");
            iceCandidatesQueue.push(message.data);
        }
    } else if (message.event === "endCall") {
        console.log("❌ Appel terminé par l'autre utilisateur");
        endCall();
    }
};

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
export const startVoiceCall = async (callerName) => {
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
            data: { offer, username: callerName } 
        });

    } catch (err) {
        console.error("❌ Erreur lors du démarrage de l'appel vocal:", err);
    }
};



export const startVideoCall = async () => {
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
