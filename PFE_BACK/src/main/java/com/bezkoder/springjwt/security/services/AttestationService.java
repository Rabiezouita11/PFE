package com.bezkoder.springjwt.security.services;

import com.bezkoder.springjwt.models.Attestation;
import com.bezkoder.springjwt.repository.AttestationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service

public class AttestationService {
    @Autowired
    private AttestationRepository attestationRepository;

    public Attestation saveAttestation(Attestation attestation) {
        return attestationRepository.save(attestation);
    }
}
