package telcotec.telcotec.service;


import telcotec.telcotec.entity.Notification;
import java.util.List;

public interface NotificationService {

    Notification createNotification(Long agentId, String title, String message, String link);
    List<Notification> getNotificationsForAgent(Long agentId);
    void markAllAsRead(Long agentId);
    long getUnreadCount(Long agentId);
    void markAsRead(Long id);
}
