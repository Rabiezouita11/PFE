package com.bezkoder.springjwt.controllers;

import com.bezkoder.springjwt.models.Conger_Maladie;
import com.bezkoder.springjwt.models.ERole;
import com.bezkoder.springjwt.models.Role;
import com.bezkoder.springjwt.models.User;
import com.bezkoder.springjwt.repository.CongerMaladieRepository;
import com.bezkoder.springjwt.repository.RoleRepository;
import com.bezkoder.springjwt.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.transaction.annotation.Transactional;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import java.io.File;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)

@RestController
@RequestMapping("/api/Gestionnaire")
public class GestionnaireController {
    @Autowired
    UserRepository userRepository;
    @Autowired
    RoleRepository roleRepository;

    @Autowired
    CongerMaladieRepository congerMaladieRepository;
    @Autowired
    private JavaMailSender javaMailSender;


    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(@AuthenticationPrincipal UserDetails userDetails) {
        if (!userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_GESTIONNAIRE"))) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN); // User doesn't have required role
        }

        // Retrieve ROLE_MANAGER and ROLE_COLLABORATEUR roles
        Role roleManager = roleRepository.findByName(ERole.ROLE_MANAGER)
                .orElseThrow(() -> new RuntimeException("Role ROLE_MANAGER not found"));
        Role roleCollaborateur = roleRepository.findByName(ERole.ROLE_COLLABORATEUR)
                .orElseThrow(() -> new RuntimeException("Role ROLE_COLLABORATEUR not found"));

        // Fetch users with specified roles
        List<User> users = userRepository.findByRoleIds(Arrays.asList(roleManager.getId(), roleCollaborateur.getId()));
        return ResponseEntity.ok(users);
    }
    @PutMapping("/users/{userId}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long userId, @RequestParam boolean newStatus) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setStatus(newStatus);
            userRepository.save(user); // Save the updated user

            // Send email to the user
            sendEmail(user.getEmail(), newStatus);

            return ResponseEntity.ok().body("{\"message\": \"User status updated successfully\"}");
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    private void sendEmail(String userEmail, boolean newStatus) {
        MimeMessage message = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message);
        String statusMessage = newStatus ? "Your access has been granted." : "Your access has been denied.";
        String loginPath = newStatus ? "http://localhost:4200/login" : "";
        try {
            helper.setTo(userEmail);
            helper.setSubject("User Status Update");
            helper.setText("Dear User,\n\n" + statusMessage + "\n\n" + loginPath + "\n\nRegards,\nThe Admin Team");
            javaMailSender.send(message);
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }
    @Transactional // Ensure that the transaction is committed before sending the email
    @PutMapping("/conger-maladie/{congerId}/status")
    public ResponseEntity<?> updateCongerStatus(@PathVariable Long congerId, @RequestBody String newStatus) {
        Optional<Conger_Maladie> congerOptional = congerMaladieRepository.findById(congerId);
        if (congerOptional.isPresent()) {
            Conger_Maladie conger = congerOptional.get();
            String oldStatus = conger.getStatus();

            conger.setStatus(newStatus);
            congerMaladieRepository.save(conger); // Save the updated conger
            sendCongerStatusEmailAsync(conger.getUser().getEmail(), oldStatus, newStatus, conger);

            return ResponseEntity.ok().body("{\"message\": \"Conger status updated successfully\"}");
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    @Async
    protected void sendCongerStatusEmailAsync(String userEmail, String oldStatus, String newStatus, Conger_Maladie conger) {
        MimeMessage message = javaMailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "utf-8");
            String userName = conger.getUser().getUsername();

            String statusMessage = "Your Conger Maladie status has been updated from <span style=\"color: red;\">" + oldStatus + "</span> to <span style=\"color: green;\">" + newStatus + "</span>";

            statusMessage += "<br><br><strong>Conger Maladie Details:</strong><br>";
            statusMessage += "<ul>";
            statusMessage += "<li>ID: " + conger.getId() + "</li>";
            statusMessage += "<li>Message: " + conger.getMessage() + "</li>";
            statusMessage += "<li>Date Debut: " + conger.getDateDebut() + "</li>";
            statusMessage += "<li>Date Fin: " + conger.getDateFin() + "</li>";
            statusMessage += "</ul>";

            helper.setTo(userEmail);
            helper.setSubject("Conger Maladie Status Update");
            // Set HTML content with all details
            helper.setText("<html><body><p>Dear " + userName + ",,</p><p>" + statusMessage + "</p><p>Regards,<br/>The Admin Team</p></body></html>", true);
            Path filePath = Paths.get("uploads", conger.getJustificationPath()); // Assuming uploads folder is at the root of your project
            byte[] fileBytes = Files.readAllBytes(filePath);
            // Add attachment
            helper.addAttachment("Justification File.pdf", new ByteArrayResource(fileBytes), "application/pdf");

            javaMailSender.send(message);
        } catch (MessagingException e) {
            e.printStackTrace();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @GetMapping("/conger-maladie")
    public ResponseEntity<List<Conger_Maladie>> getAllCongerMaladie() {
        List<Conger_Maladie> congerMaladies = congerMaladieRepository.findAll();
        return ResponseEntity.ok().body(congerMaladies);
    }


}
