package telcotec.telcotec.controller;


import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import telcotec.telcotec.entity.SignalMessage;

@Controller
public class SignalingController {

    @MessageMapping("/signal")
    @SendTo("/topic/signal")
    public SignalMessage handleSignal(SignalMessage message) {
        return message;
    }
}

