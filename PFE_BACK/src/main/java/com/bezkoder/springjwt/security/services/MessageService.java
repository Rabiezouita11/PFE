package com.bezkoder.springjwt.security.services;


import com.bezkoder.springjwt.models.Message;
import com.bezkoder.springjwt.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MessageService {
    @Autowired
    private MessageRepository messageRepository;

    public List<Message> getMessagesByUserId(Long userId) {
        return messageRepository.findByUserId(userId);
    }

    public Message saveMessage(Message message) {
        return messageRepository.save(message);
    }
}