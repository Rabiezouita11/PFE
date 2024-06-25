package com.bezkoder.springjwt.controllers;

import com.bezkoder.springjwt.models.ChatMessage;
import com.bezkoder.springjwt.security.services.ChatMessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
public class ChatController {
    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;
    @Autowired
    private ChatMessageService chatMessageService;
    private static final String GESTIONNAIRE = "1"; // assuming gestionnaire's id is "1"

    @MessageMapping("/chat")
    public void handleChatMessage(ChatMessage message) {
        // Send the message to the gestionnaire
        chatMessageService.saveMessage(message);

        message.setRecipient(GESTIONNAIRE);
        message.setUserId(Long.valueOf(message.getSender()));
        simpMessagingTemplate.convertAndSendToUser(GESTIONNAIRE, "/queue2/notification", message);
    }


    @MessageMapping("/reply")
    public void handleReplyMessage(ChatMessage message) {
        // Send the reply from gestionnaire to the original sender
        chatMessageService.saveMessage(message);

        simpMessagingTemplate.convertAndSendToUser(message.getRecipient(), "/queue2/notification", message);
    }
//    @GetMapping("/api/messages/{recipient}")
//    public List<ChatMessage> getMessagesByRecipient(@PathVariable String recipient) {
//        return chatMessageService.getMessagesByRecipient(recipient);
//    }
    @GetMapping("/api/messages/{userId}")
    public List<ChatMessage> getMessagesByUserId(@PathVariable Long userId) {
        return chatMessageService.findMessagesByUserId(userId);
    }

    @GetMapping("/gest/{userId}")
    public List<ChatMessage> getMessagesByUserIdgestionnaire(@PathVariable Long userId) {
        return chatMessageService.findMessagesByUserIdGest(userId);
    }
}
