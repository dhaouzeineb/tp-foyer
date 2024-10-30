package tn.esprit.tpfoyer.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.tpfoyer.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    // Vous pouvez ajouter des méthodes supplémentaires si nécessaire
}
