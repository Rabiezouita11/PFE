package com.bezkoder.springjwt.controllers;

import com.bezkoder.springjwt.models.DemandeAttestations;
import com.bezkoder.springjwt.repository.DemandeAttestationsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/DemandeAttestations")
public class DemandeAttestationsController {


    @Autowired
    private DemandeAttestationsRepository demandeAttestationsRepository;



    // Add autowired repositories or services here if needed

    // Placeholder method to handle GET requests for fetching all demandes d'attestations
    @GetMapping
    public List<DemandeAttestations> getAllDemandeAttestations() {
        // Call the service method to fetch all demandes d'attestations
        return demandeAttestationsRepository.findAll();
    }

    // Placeholder method to handle GET requests for fetching a demande d'attestation by ID
    @GetMapping("/{id}")
    public DemandeAttestations getDemandeAttestationsById(@PathVariable Long id) {
        // Implement logic to fetch a demande d'attestation by ID from the repository or service
        return null; // Replace null with actual implementation
    }

    @PostMapping("/saveDemande")
    public DemandeAttestations createDemandeAttestations(@RequestBody DemandeAttestations demandeAttestations) {
        // Call the service method to save the demande d'attestation

        System.out.println("demandeAttestations"+demandeAttestations);
        DemandeAttestations savedDemandeAttestations = demandeAttestationsRepository.save(demandeAttestations);
        return savedDemandeAttestations;
    }

    // Placeholder method to handle PUT requests for updating an existing demande d'attestation
    @PutMapping("/{id}")
    public DemandeAttestations updateDemandeAttestations(@PathVariable Long id, @RequestBody DemandeAttestations demandeAttestationsDetails) {
        // Implement logic to update an existing demande d'attestation
        return null; // Replace null with actual implementation
    }

    // Placeholder method to handle DELETE requests for deleting a demande d'attestation by ID
    @DeleteMapping("/{id}")
    public void deleteDemandeAttestations(@PathVariable Long id) {
        // Implement logic to delete a demande d'attestation by ID
    }
}
