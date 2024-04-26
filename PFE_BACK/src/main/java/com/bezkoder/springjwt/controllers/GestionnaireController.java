package com.bezkoder.springjwt.controllers;

import com.bezkoder.springjwt.models.ERole;
import com.bezkoder.springjwt.models.Role;
import com.bezkoder.springjwt.models.User;
import com.bezkoder.springjwt.repository.RoleRepository;
import com.bezkoder.springjwt.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
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




}
