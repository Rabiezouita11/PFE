package com.bezkoder.springjwt.security.services;


import com.bezkoder.springjwt.models.Notification;
import com.bezkoder.springjwt.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service


public class NotificationService {
    @Autowired
    private NotificationRepository notificationRepository;


    public Notification createNotification(Long userId, String fileName, String message, String username) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setFileName(fileName);
        notification.setMessage(message);
        notification.setUsername(username);
        notification.setTimestamp(LocalDateTime.now());

        return notificationRepository.save(notification);
    }

    public List<Notification> getALLNotifications() {
        return notificationRepository.findAll();
    }
}