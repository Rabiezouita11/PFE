package com.bezkoder.springjwt.models;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
@Getter
@Setter
@Entity
public class SoldeConger {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Getters and setters
    // Constructors
    // Other fields and methods

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;


    private long solde = 30; // Default value set to 30

    private long oldSoldConger; // New attribute: old sold conger

}
