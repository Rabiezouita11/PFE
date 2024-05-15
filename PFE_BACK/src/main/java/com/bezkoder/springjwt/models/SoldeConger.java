package com.bezkoder.springjwt.models;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;

@Entity
public class SoldeConger {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Getters and setters
    // Constructors
    // Other fields and methods
    @Setter
    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Getter
    @Setter
    private int solde = 30; // Default value set to 30
}
