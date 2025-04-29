package telcotec.telcotec.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import telcotec.telcotec.entity.Reclamation;
import telcotec.telcotec.entity.User;

import java.util.List;

@Repository
public interface ReclamationRepository extends JpaRepository<Reclamation, Long> {

    // Corrected method signature to include tel
    List<Reclamation> findByCinOrNomContainingOrTelOrId(Integer cin, String nom, Integer tel, Long id);

    // Optionally, custom query with JPQL to include all necessary parameters
    @Query("SELECT r FROM Reclamation r WHERE r.cin = :cin OR r.nom LIKE %:nom% OR r.tel = :tel OR r.id = :id")
    List<Reclamation> searchReclamations(Integer cin, String nom, Integer tel, Long id);
    List<Reclamation> findByUser(User user);

}

