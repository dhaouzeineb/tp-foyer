package telcotec.telcotec.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Setter
@Getter
@Entity
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;
    private String prenom;
    private String email;
    private String password;

    @CreationTimestamp
    private Date createdAt;

    private int verified; // 0 = non vérifié, 1 = vérifié, -1 = bloqué
    private String token;
    private String localisation;

    private String tel;
    private String adresse;

    @Enumerated(EnumType.STRING)
    private Role role;
    private int status = 0; // 0 = Offline, 1 = Online

    // ✅ Ajout du champ WebRTC Session ID
    private String webrtcSessionId;

    public enum Role {
        CLIENT_DISPATCHER,
        AGENT_DISPATCHER,
        ADMIN_DISPATCHER
    }

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<Reclamation> reclamations;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<App> apps = new ArrayList<>();

    public User() {
    }

    public User(String nom, String prenom, String email, String password, int verified, String token, String localisation, Role role, String tel, String adresse) {
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
        this.password = password;
        this.verified = verified;
        this.token = token;
        this.localisation = localisation;
        this.role = role;
        this.tel = tel;
        this.adresse = adresse;
        this.status = 0; // Par défaut, l'utilisateur est hors ligne
        this.webrtcSessionId = UUID.randomUUID().toString(); // Génération automatique d'un WebRTC ID
    }
}
