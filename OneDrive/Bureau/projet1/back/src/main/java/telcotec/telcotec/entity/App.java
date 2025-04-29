package telcotec.telcotec.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Data // Génère automatiquement les getters, setters, toString, equals et hashCode
@NoArgsConstructor // Génère un constructeur sans argument
@AllArgsConstructor // Génère un constructeur avec tous les arguments
@Builder // Génère un builder pour cette classe
public class App {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nomPeripherique; // Nom du périphérique

    private String type; // Type du périphérique (ex: Mobile, Desktop, Tablet)

    private String adresseIp; // Adresse IP du périphérique

    @Column(unique = true)  // Assure que l'adresse MAC soit unique dans la base de données
    private String mac; // Adresse MAC unique

    private String osName; // Nom du système d'exploitation (ex: Windows, MacOS, Linux)

    // Champs supplémentaires pour les informations du périphérique
    private String deviceInfo; // Description générale ou autres informations du périphérique

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonBackReference
    private User user;

    @Builder.Default
    @Column(nullable = false)
    private int verifie = 1; // 1: autorisé, 0: non autorisé, -1: bloqué

    // Constructeur explicite pour instancier tous les champs
    public App(String nomPeripherique, String type, String adresseIp, String mac, String osName, String deviceInfo, User user, int verifie) {
        this.nomPeripherique = nomPeripherique;
        this.type = type;
        this.adresseIp = adresseIp;
        this.mac = mac;
        this.osName = osName;
        this.deviceInfo = deviceInfo;
        this.user = user;
        this.verifie = verifie;
    }
}
