package telcotec.telcotec.service;


import telcotec.telcotec.entity.Reclamation;
import telcotec.telcotec.entity.User;

import java.util.List;

public  interface ReclamationService {

    // Ajouter une réclamation
    Reclamation addReclamation(Reclamation reclamation);

    // Supprimer une réclamation par ID
    void deleteReclamation(Long id);

    // Modifier une réclamation
    Reclamation updateReclamation(Long id, Reclamation reclamation);

    // Rechercher des réclamations par cin, nom ou tel
    List<Reclamation> searchReclamations(Integer cin, String nom, Integer tel, Long id);
    List<Reclamation> getAllReclamations() ;
    List<Reclamation> getReclamationsByUser(User user);
}

