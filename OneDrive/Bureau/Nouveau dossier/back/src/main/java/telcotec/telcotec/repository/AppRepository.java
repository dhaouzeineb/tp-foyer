package telcotec.telcotec.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import telcotec.telcotec.entity.App;
import telcotec.telcotec.entity.User;

import java.util.List;

public interface AppRepository extends JpaRepository<App, Long> {
    List<App> findByUserId(Long userId);
}

