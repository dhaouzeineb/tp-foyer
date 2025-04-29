package telcotec.telcotec.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "agent_id", nullable = false)
    @JsonBackReference
    private User agent;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 500)
    private String message;

    private String link;

    @Column(nullable = false)
    private boolean isRead; // Renommé de "read" à "isRead"

    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp;

    // Constructeur personnalisé
    public Notification(User agent, String title, String message, String link) {
        this.agent = agent;
        this.title = title;
        this.message = message;
        this.link = link;
    }

    // Initialisation automatique avant insertion en base
    @PrePersist
    private void onCreate() {
        this.timestamp = LocalDateTime.now();
        this.isRead = false;
    }
}
