package telcotec.telcotec.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import telcotec.telcotec.entity.Reclamation;
import telcotec.telcotec.entity.User;
import telcotec.telcotec.repository.ReclamationRepository;

import java.util.List;

@Service
public class ReclamationServiceImpl implements ReclamationService {

    @Autowired
    private ReclamationRepository reclamationRepository;

    @Override
    public Reclamation addReclamation(Reclamation reclamation) {
        return reclamationRepository.save(reclamation);
    }

    @Override
    public void deleteReclamation(Long id) {
        reclamationRepository.deleteById(id);
    }

            @Override
            public Reclamation updateReclamation(Long id, Reclamation updatedReclamation) {
                return reclamationRepository.findById(id).map(existingReclamation -> {
                    // Mise à jour uniquement des champs non nuls
                    if (updatedReclamation.getCin() != null) { // Vérifier si cin est non null
                        existingReclamation.setCin(updatedReclamation.getCin());
                    }
                    if (updatedReclamation.getNom() != null && !updatedReclamation.getNom().isEmpty()) {
                        existingReclamation.setNom(updatedReclamation.getNom());
                    }
                    if (updatedReclamation.getPrenom() != null && !updatedReclamation.getPrenom().isEmpty()) {
                        existingReclamation.setPrenom(updatedReclamation.getPrenom());
                    }
                    if (updatedReclamation.getTel() != null) { // Vérifier si tel est non null
                        existingReclamation.setTel(updatedReclamation.getTel());
                    }
                    if (updatedReclamation.getDescription() != null && !updatedReclamation.getDescription().isEmpty()) {
                        existingReclamation.setDescription(updatedReclamation.getDescription());
                    }
                    if (updatedReclamation.getNiveau() != null) {
                        existingReclamation.setNiveau(updatedReclamation.getNiveau());
                    }
                    if (updatedReclamation.getLieu() != null && !updatedReclamation.getLieu().isEmpty()) {
                        existingReclamation.setLieu(updatedReclamation.getLieu());
                    }
                    if (updatedReclamation.getImage() != null && !updatedReclamation.getImage().isEmpty()) {
                        existingReclamation.setImage(updatedReclamation.getImage());
                    }
                    if (updatedReclamation.getVideo() != null && !updatedReclamation.getVideo().isEmpty()) {
                        existingReclamation.setVideo(updatedReclamation.getVideo());
                    }
                    if (updatedReclamation.getVoice() != null && !updatedReclamation.getVoice().isEmpty()) {
                        existingReclamation.setVoice(updatedReclamation.getVoice());
                    }
                    if (updatedReclamation.getLat() != null && !updatedReclamation.getLat().isEmpty()) {
                        existingReclamation.setLat(updatedReclamation.getLat());
                    }
                    if (updatedReclamation.getLng() != null && !updatedReclamation.getLng().isEmpty()) {
                        existingReclamation.setLng(updatedReclamation.getLng());
                    }
                    return reclamationRepository.save(existingReclamation);
                }).orElseThrow(() -> new RuntimeException("Réclamation introuvable avec l'ID : " + id));
            }

    @Override


    public List<Reclamation> searchReclamations(Integer cin, String nom, Integer tel, Long id) {
        // Call the repository method that correctly handles the parameters
        return reclamationRepository.findByCinOrNomContainingOrTelOrId(cin, nom, tel, id);
    }
    @Override

    public List<Reclamation> getAllReclamations() {
        return reclamationRepository.findAll();
    }
    @Override

    public List<Reclamation> getReclamationsByUser(User user) {
        return reclamationRepository.findByUser(user); // Assuming there's a method in the repository
    }
}
