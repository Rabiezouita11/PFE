package com.bezkoder.springjwt.models;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatMessage {
    private String sender;
    private String recipient;
    private String content;
    private String fileName;
    // Getters and setters
}
