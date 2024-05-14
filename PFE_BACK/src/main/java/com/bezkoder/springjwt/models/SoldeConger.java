package com.bezkoder.springjwt.models;

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

    @Setter
    private int solde = 30; // Default value set to 30

}
