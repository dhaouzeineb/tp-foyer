package telcotec.telcotec.repository;


import telcotec.telcotec.entity.Notification;

import org.springframework.data.jpa.repository.JpaRepository;
import telcotec.telcotec.entity.Notification;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByAgentIdOrderByTimestampDesc(Long agentId);
    long countByAgentIdAndIsReadFalse(Long agentId);

}

