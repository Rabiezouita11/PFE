package com.bezkoder.springjwt.controllers;

import com.bezkoder.springjwt.models.ChatMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
public class ChatController {
    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;

    private static final String GESTIONNAIRE = "1"; // assuming gestionnaire's id is "1"

    @MessageMapping("/chat")
    public void handleChatMessage(ChatMessage message) {
        // Send the message to the gestionnaire
        message.setRecipient(GESTIONNAIRE);
        simpMessagingTemplate.convertAndSendToUser(GESTIONNAIRE, "/queue2/notification", message);
    }

    @MessageMapping("/reply")
    public void handleReplyMessage(ChatMessage message) {
        // Send the reply from gestionnaire to the original sender
        simpMessagingTemplate.convertAndSendToUser(message.getRecipient(), "/queue2/notification", message);
    }
}
