package com.bezkoder.springjwt.controllers;

import com.bezkoder.springjwt.models.Badge;
import com.bezkoder.springjwt.models.User;
import com.bezkoder.springjwt.repository.BadgeRepository;
import com.bezkoder.springjwt.security.services.BadgeService;
import com.bezkoder.springjwt.security.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
@CrossOrigin(origins = "*", maxAge = 3600)

@RestController
@RequestMapping("/api/badges")
public class BadgeController {
    @Autowired
    private BadgeRepository badgeRepository;
    @Autowired
    private UserService userService; // Assuming you have a UserService
    @Autowired
    private BadgeService badgeService;





    @PostMapping("/{userId}")
    public ResponseEntity<Badge> createBadgeForUser(@PathVariable Long userId, @RequestBody Badge badgeRequest , @AuthenticationPrincipal UserDetails userDetails) {
        if (!userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_COLLABORATEUR"))) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN); // User doesn't have required role
        }
        // Retrieve the user from the database using the UserService
        User user = userService.getUserById(userId);
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND); // User not found
        }

        // Associate the user with the badge
        badgeRequest.setUser(user);

        // Set default status
        badgeRequest.setStatus("en cours");

        // Save the badge to the database
        Badge createdBadge = badgeRepository.save(badgeRequest);

        return new ResponseEntity<>(createdBadge, HttpStatus.CREATED);
    }

    @GetMapping("/status/{userId}")
    public ResponseEntity<?> checkBadgeStatus(@PathVariable Long userId, @AuthenticationPrincipal UserDetails userDetails) {
        if (!userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_COLLABORATEUR"))) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN); // User doesn't have required role
        }
        try {
            // Check if the user has a badge with status "accepter"
            String status = badgeService.findBadgeStatusByUserId(userId);
            return ResponseEntity.ok().body("{\"status\": \"" + status + "\"}");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error checking badge status");
        }
    }


}
