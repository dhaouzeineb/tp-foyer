package telcotec.telcotec.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Reclamation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // ID auto-incrémenté

    @Column(nullable = false)
    private Integer cin; // CIN (modifié en Integer)

    @Column(nullable = false)
    private String nom; // Nom

    @Column(nullable = false)
    private String prenom; // Prénom

    @Column(nullable = false)
    private Integer tel; // Téléphone (modifié en Integer)

    @Column(nullable = false, length = 500)
    private String description; // Description

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NiveauReclamation niveau; // Niveau de réclamation

    @Column(nullable = false)
    private String lieu; // Lieu de la réclamation

    private String image; // URL ou chemin de l'image

    private String video; // URL ou chemin de la vidéo

    private String voice; // URL ou chemin de l'enregistrement audio
    private String lat;
    private String lng;


    // Constructeur avec NiveauReclamation (pas de String)
    public Reclamation(Integer cin, String nom, String prenom, Integer tel, String description, NiveauReclamation niveau, String lieu, String image, String video, String voice, String lat,String lng) {
        this.cin = cin;  // Le CIN est maintenant un Integer
        this.nom = nom;
        this.prenom = prenom;
        this.tel = tel;  // Le téléphone est maintenant un Integer
        this.description = description;
        this.niveau = niveau;  // ici on passe un NiveauReclamation, pas une chaîne
        this.lieu = lieu;
        this.image = image;
        this.video = video;
        this.voice = voice;
        this.lat = lat;
        this.lng = lng;
    }

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonBackReference
    private User user;


    @Column(nullable = false, updatable = false)
    private LocalDateTime dateCreation = LocalDateTime.now(); // Date de création
}
