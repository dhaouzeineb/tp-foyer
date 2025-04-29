package telcotec.telcotec.controller;


import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.annotation.OnEvent;
import org.springframework.stereotype.Controller;
import java.util.HashMap;
import java.util.Map;

@Controller
public class WebSocketController {

    private final Map<String, SocketIOClient> clients = new HashMap<>();

    @OnEvent("join-room")
    public void onJoinRoom(SocketIOClient client, String roomId) {
        clients.put(client.getSessionId().toString(), client);
        client.sendEvent("room-joined", roomId);
    }

    @OnEvent("call")
    public void onCall(SocketIOClient client, Map<String, Object> data) {
        String targetUserId = (String) data.get("targetUserId");
        if (clients.containsKey(targetUserId)) {
            clients.get(targetUserId).sendEvent("incoming-call", data);
        }
    }

    @OnEvent("answer")
    public void onAnswer(SocketIOClient client, Map<String, Object> data) {
        String callerId = (String) data.get("callerId");
        if (clients.containsKey(callerId)) {
            clients.get(callerId).sendEvent("call-answered", data);
        }
    }

    @OnEvent("end-call")
    public void onEndCall(SocketIOClient client, String roomId) {
        clients.values().forEach(c -> c.sendEvent("call-ended", roomId));
    }
}

