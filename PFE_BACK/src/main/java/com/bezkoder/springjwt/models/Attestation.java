package com.bezkoder.springjwt.models;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity
@Setter
@Getter
public class Attestation {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String pdfPath;
    private boolean isExist;

    // Constructors, getters, and setters

    public Attestation() {
    }

    public Attestation(String name, String pdfPath, boolean isExist) {
        this.name = name;
        this.pdfPath = pdfPath;
        this.isExist = isExist;
    }

    public Attestation(String name, boolean isExist) {
        this.isExist = isExist;
        this.name = name;

    }

    // Getters and setters




}
