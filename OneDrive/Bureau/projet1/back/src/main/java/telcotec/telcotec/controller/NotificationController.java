package telcotec.telcotec.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import telcotec.telcotec.DTO.NotificationRequest;
import telcotec.telcotec.entity.Notification;
import telcotec.telcotec.service.NotificationService;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    @Autowired private NotificationService notifService;

    @PostMapping
    public ResponseEntity<Notification> create(@RequestBody NotificationRequest req) {
        Notification saved = notifService.createNotification(
                req.getAgentId(), req.getTitle(), req.getMessage(), req.getLink()
        );
        return ResponseEntity.ok(saved);
    }

    // NotificationController.java
    @GetMapping("/{agentId}")
    public ResponseEntity<List<Notification>> list(@PathVariable Long agentId) {
        List<Notification> all = notifService.getNotificationsForAgent(agentId);
        return ResponseEntity.ok(all);
    }

    @PostMapping("/{agentId}/mark-read")
    public ResponseEntity<Void> markRead(@PathVariable Long agentId) {
        notifService.markAllAsRead(agentId);
        return ResponseEntity.ok().build();
    }
    @GetMapping("/unread-count/{agentId}")
    public ResponseEntity<Long> getUnreadCount(@PathVariable Long agentId) {
        return ResponseEntity.ok(notifService.getUnreadCount(agentId));
    }

    // Remplacer par cette version
    @PostMapping("/mark-read/{id}")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notifService.markAsRead(id);
        return ResponseEntity.ok().build();
    }
}