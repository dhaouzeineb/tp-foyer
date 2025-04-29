package telcotec.telcotec.config;

import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import telcotec.telcotec.entity.User;
import telcotec.telcotec.service.UserService;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SocketHandler extends TextWebSocketHandler {

    private final Map<String, WebSocketSession> userSessions = new HashMap<>();  // Static
    private final Map<String, String> userWebrtcSessions = new ConcurrentHashMap<>();

    private final UserService userService;

    @Autowired
    public SocketHandler(UserService userService) {
        this.userService = userService;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        System.out.println("Tentative de connexion WebSocket");
// SocketHandler.java
        String userId = extractUserId(session);
        String sessionId = extractSessionId(session);
       System.out.println("✅ Utilisateur " + userId + " connecté.");
        System.out.println("Nouvelle connexion pour userId=" + userId + " avec sessionId=" + sessionId);
        if (userId == null || sessionId == null) {
            System.err.println("Erreur : userId ou sessionId manquants.");
            session.close(CloseStatus.BAD_DATA);
            return;
        }

        User user = userService.getUserById(Long.parseLong(userId));
        if (user == null) {
            System.err.println("Erreur : utilisateur introuvable pour userId = " + userId);
            session.close(CloseStatus.NOT_ACCEPTABLE.withReason("Utilisateur introuvable"));
            return;
        }

        // Validation du sessionId
        if (!sessionId.equals(user.getWebrtcSessionId())) {
            System.err.println("Erreur : sessionId invalide pour l'utilisateur " + userId);
            session.close(CloseStatus.NOT_ACCEPTABLE.withReason("Session invalide"));
            return;
        }

        // Si une connexion existe déjà pour cet utilisateur, fermez-la
        if (userSessions.containsKey(userId)) {
            WebSocketSession oldSession = userSessions.get(userId);
            if (oldSession.isOpen()) {
                oldSession.close(CloseStatus.NORMAL);
                System.out.println("Ancienne connexion fermée pour l'utilisateur : " + userId);
            }
        }

        userSessions.put(userId, session);
        userWebrtcSessions.put(userId, sessionId);

        // Envoi de confirmation au client
        session.sendMessage(new TextMessage("WEBRTC_READY:" + sessionId));
        System.out.println("Connexion WebRTC validée pour l'utilisateur : " + userId);
    }



    // SocketHandler.java (méthode handleTextMessage modifiée)
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String messageContent = message.getPayload();
        System.out.println("📩 Message reçu : " + messageContent);

        try {
            JSONObject json = new JSONObject(messageContent);
            // Extraction des champs attendus
            String messageType = json.optString("type", null);
            JSONObject fromObj = json.optJSONObject("from");
            String targetUserId = json.optString("to", "");

            // Vérifier que le type, le champ "from" et "to" sont présents
            if (messageType == null || fromObj == null || fromObj.length() == 0 || targetUserId.isEmpty()) {
                System.out.println("❌ Format de message invalide : " + messageContent);
                return;
            }

            // Trouver la session WebSocket du destinataire
            WebSocketSession targetSession = userSessions.get(targetUserId);
            if (targetSession != null && targetSession.isOpen()) {
                // Renvoie le message brut au destinataire
                targetSession.sendMessage(message);
                System.out.println("📤 Message transféré à " + targetUserId);
            } else {
                System.out.println("❌ Destinataire non connecté : " + targetUserId);
            }
        } catch (JSONException e) {
            System.out.println("⚠️ Message JSON invalide : " + messageContent);
        }
    }



    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        System.out.println("🔴 Connexion WebSocket fermée avec statut : " + status);

        String userId = extractUserId(session);
        if (userId != null) {
            userSessions.remove(userId);
            userWebrtcSessions.remove(userId);
            System.out.println("👤 Utilisateur déconnecté : " + userId);
        }

        // Vérifie si la fermeture est inattendue et tente une action si nécessaire
        if (status.getCode() == 1006) {
            System.out.println("⚠️ Fermeture inattendue de la connexion WebSocket !");
        } else {
            System.out.println("✅ Fermeture propre de la connexion WebSocket.");
        }
    }


    private String extractUserId(WebSocketSession session) {
        try {
            String query = session.getUri().getQuery();
            if (query != null) {
                return Arrays.stream(query.split("&"))
                        .filter(param -> param.startsWith("userId="))
                        .findFirst()
                        .map(param -> param.split("=")[1])
                        .orElse(null);
            }
        } catch (Exception e) {
            System.err.println("Erreur lors de l'extraction de l'ID utilisateur : " + e.getMessage());
        }
        return null;
    }

    private String extractSessionId(WebSocketSession session) {
        try {
            String query = session.getUri().getQuery();
            if (query != null) {
                return Arrays.stream(query.split("&"))
                        .filter(param -> param.startsWith("sessionId="))
                        .findFirst()
                        .map(param -> param.split("=")[1])
                        .orElse(null);
            }
        } catch (Exception e) {
            System.err.println("Erreur lors de l'extraction de l'ID de session : " + e.getMessage());
        }
        return null;
    }

    private String extractTargetUserId(String message) {
        try {
            String[] parts = message.split(":");
            if (parts.length > 1) {
                return parts[1];
            }
        } catch (Exception e) {
            System.err.println("Erreur lors de l'extraction de l'ID de l'utilisateur cible : " + e.getMessage());
        }
        return null;
    }

    // Getter pour userSessions
    public Map<String, WebSocketSession> getUserSessions() {
        return userSessions;
    }
}
