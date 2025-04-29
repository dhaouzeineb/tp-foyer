package telcotec.telcotec.entity;


public class SignalMessage {
    private String type;
    private String sender;
    private String receiver;
    private String sdp;
    private String candidate;

    public SignalMessage() {}

    public SignalMessage(String type, String sender, String receiver, String sdp, String candidate) {
        this.type = type;
        this.sender = sender;
        this.receiver = receiver;
        this.sdp = sdp;
        this.candidate = candidate;
    }

    // Getters et Setters
}

