package telcotec.telcotec.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import telcotec.telcotec.entity.Notification;
import telcotec.telcotec.entity.User;
import telcotec.telcotec.repository.NotificationRepository;
import telcotec.telcotec.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationServiceImpl implements NotificationService {
    @Autowired private NotificationRepository notifRepo;
    @Autowired private UserRepository userRepo;

    @Override
    public Notification createNotification(Long agentId, String title, String message, String link) {
        User agent = userRepo.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent not found"));

        Notification notification = new Notification();
        notification.setAgent(agent);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setLink("/dashboard/" + link); // Ajouter le préfixe du chemin
        notification.setTimestamp(LocalDateTime.now());
        notification.setRead(false);

        return notifRepo.save(notification);
    }


    @Override
    public List<Notification> getNotificationsForAgent(Long agentId) {
        return notifRepo.findByAgentIdOrderByTimestampDesc(agentId);
    }

    @Override
    @Transactional
    public void markAllAsRead(Long agentId) {
        List<Notification> list = notifRepo.findByAgentIdOrderByTimestampDesc(agentId);
        list.forEach(n -> n.setRead(true));
        notifRepo.saveAll(list);
    }
    public long getUnreadCount(Long agentId) {
        return notifRepo.countByAgentIdAndIsReadFalse(agentId);
    }

    public void markAsRead(Long id) {
        Notification notification = notifRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        notifRepo.save(notification);
    }
}

