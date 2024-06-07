package com.bezkoder.springjwt.controllers;

import com.bezkoder.springjwt.models.DemandeAttestations;
import com.bezkoder.springjwt.repository.DemandeAttestationsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/DemandeAttestations")
public class DemandeAttestationsController {


    @Autowired
    private DemandeAttestationsRepository demandeAttestationsRepository;




    // Placeholder method to handle GET requests for fetching all demandes d'attestations
    @GetMapping
    public List<DemandeAttestations> getAllDemandeAttestations() {
        // Call the service method to fetch all demandes d'attestations
        return demandeAttestationsRepository.findAll();
    }


    @PostMapping("/saveDemande")
    public DemandeAttestations createDemandeAttestations(@RequestBody DemandeAttestations demandeAttestations) {
        // Call the service method to save the demande d'attestation

        System.out.println("demandeAttestations"+demandeAttestations);
        DemandeAttestations savedDemandeAttestations = demandeAttestationsRepository.save(demandeAttestations);
        return savedDemandeAttestations;
    }
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveDemandeAttestations(@PathVariable Long id) {
        DemandeAttestations demandeAttestations = demandeAttestationsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DemandeAttestations", "id", id));

        demandeAttestations.setIsApproved("accepted"); // Update the isApproved attribute

        demandeAttestationsRepository.save(demandeAttestations); // Save the updated demande d'attestation

        return ResponseEntity.ok().build();
    }
    @PutMapping("/{id}/refuse")
    public ResponseEntity<?> refuseDemandeAttestations(@PathVariable Long id) {
        DemandeAttestations demandeAttestations = demandeAttestationsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DemandeAttestations", "id", id));

        demandeAttestations.setIsApproved("refused"); // Update the isApproved attribute to "refused"

        demandeAttestationsRepository.save(demandeAttestations); // Save the updated demande d'attestation

        return ResponseEntity.ok().build();
    }


}
