package telcotec.telcotec.repository;


import telcotec.telcotec.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import javax.management.relation.Role;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);  // Add this method
    List<User> findByRoleAndStatus(User.Role role, int status);
    List<User> findByStatus(int status); // Custom query method to find users by status


}

