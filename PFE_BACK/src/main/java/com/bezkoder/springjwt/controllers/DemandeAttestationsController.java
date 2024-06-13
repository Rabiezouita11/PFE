package com.bezkoder.springjwt.controllers;

import com.bezkoder.springjwt.models.Attestation;
import com.bezkoder.springjwt.models.DemandeAttestations;
import com.bezkoder.springjwt.models.User;
import com.bezkoder.springjwt.repository.AttestationRepository;
import com.bezkoder.springjwt.repository.DemandeAttestationsRepository;
import com.bezkoder.springjwt.repository.UserRepository;
import com.bezkoder.springjwt.security.services.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.mail.MessagingException;
import java.io.IOException;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/DemandeAttestations")
public class DemandeAttestationsController {


    @Autowired
    private DemandeAttestationsRepository demandeAttestationsRepository;

    @Autowired
    private EmailService emailService; // Assuming you have an EmailService for sending emails

    @Autowired
    private UserRepository userRepository; // Assuming you have a UserRepository
    @Autowired
    private AttestationRepository attestationRepository;

    // Placeholder method to handle GET requests for fetching all demandes d'attestations
    @GetMapping
    public List<DemandeAttestations> getAllDemandeAttestations() {
        // Call the service method to fetch all demandes d'attestations
        return demandeAttestationsRepository.findAll();
    }


    @PostMapping("/saveDemande")
    public ResponseEntity<Object> createDemandeAttestations(@RequestBody DemandeAttestations demandeAttestations) {
        try {
            // Set the creation date to the current date
            demandeAttestations.setCreationDate(LocalDate.now());

            // Get the current month
            YearMonth currentMonth = YearMonth.now();
            LocalDate firstDayOfMonth = currentMonth.atDay(1);
            LocalDate lastDayOfMonth = currentMonth.atEndOfMonth();

            // Retrieve the list of DemandeAttestations for the given user_id and current month
            List<DemandeAttestations> requestsForCurrentUserInCurrentMonth = demandeAttestationsRepository.findByUserIdAndCreationDateBetween(
                    demandeAttestations.getUser_id(),
                    firstDayOfMonth,
                    lastDayOfMonth
            );

            // Check if the number of requests exceeds 3
            if (requestsForCurrentUserInCurrentMonth.size() >= 3) {
                String errorMessage = "You have reached the maximum limit for attestation requests this month (" + currentMonth.getMonth() + ").";
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorMessage);
            }


            // Call the service method to save the demande d'attestation
            DemandeAttestations savedDemandeAttestations = demandeAttestationsRepository.save(demandeAttestations);
            return ResponseEntity.ok().body(savedDemandeAttestations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An internal server error occurred.");
        }
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveDemandeAttestations(@PathVariable Long id) {
        DemandeAttestations demandeAttestations = demandeAttestationsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DemandeAttestations", "id", id));

        demandeAttestations.setIsApproved("accepted"); // Update the isApproved attribute

        demandeAttestationsRepository.save(demandeAttestations); // Save the updated demande d'attestation

        // Retrieve user email
        User user = userRepository.findById(Long.valueOf(demandeAttestations.getUser_id()))
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", demandeAttestations.getUser_id()));
        String userEmail = user.getEmail();

        // Retrieve attestation details
        Attestation attestation = attestationRepository.findById(Long.valueOf(demandeAttestations.getAttestation_id()))
                .orElseThrow(() -> new ResourceNotFoundException("Attestation", "id", demandeAttestations.getAttestation_id()));

        // Send email to the user
        try {
            emailService.sendDemandeAttestationsEmail(userEmail, demandeAttestations, attestation);
        } catch (MessagingException e) {
            e.printStackTrace();
            // Handle the exception
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }

        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/refuse")
    public ResponseEntity<?> refuseDemandeAttestations(@PathVariable Long id) throws MessagingException {
        DemandeAttestations demandeAttestations = demandeAttestationsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DemandeAttestations", "id", id));

        demandeAttestations.setIsApproved("refused"); // Update the isApproved attribute to "refused"

        demandeAttestationsRepository.save(demandeAttestations); // Save the updated demande d'attestation

        // Retrieve attestation details using attestation_id
        Long attestationId = Long.valueOf(demandeAttestations.getAttestation_id());
        Optional<Attestation> attestationOptional = attestationRepository.findById(attestationId);

        // Check if attestation exists
        if (attestationOptional.isPresent()) {
            Attestation attestation = attestationOptional.get();
            // Set attestation name to demandeAttestations

            // Retrieve user email
            User user = userRepository.findById(Long.valueOf(demandeAttestations.getUser_id()))
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", demandeAttestations.getUser_id()));
            String userEmail = user.getEmail();

            // Send email to the user with attestation details
            emailService.sendDemandeAttestationsEmail(userEmail, demandeAttestations, attestation);

            return ResponseEntity.ok().build();
        } else {
            throw new ResourceNotFoundException("Attestation", "id", attestationId);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDemandeAttestations(@PathVariable Long id) {
        // Find the demande attestation by id
        Optional<DemandeAttestations> demandeAttestationsOptional = demandeAttestationsRepository.findById(id);

        // Check if the demande attestation exists
        if (demandeAttestationsOptional.isPresent()) {
            DemandeAttestations demandeAttestations = demandeAttestationsOptional.get();

            // Check if isApproved is "en cours"
            if ("en cours".equals(demandeAttestations.getIsApproved())) {
                // Delete the demande attestation
                demandeAttestationsRepository.delete(demandeAttestations);
                return ResponseEntity.ok().build();
            } else {
                // If isApproved is not "en cours", return a message indicating it's not eligible for deletion
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("The demande attestation is not in 'en cours' status and cannot be deleted.");
            }
        } else {
            // If the demande attestation with the provided id does not exist, return a not found response
            return ResponseEntity.notFound().build();
        }
    }

}
