package com.bezkoder.springjwt.controllers;

import com.bezkoder.springjwt.models.Badge;
import com.bezkoder.springjwt.models.User;
import com.bezkoder.springjwt.repository.BadgeRepository;
import com.bezkoder.springjwt.repository.UserRepository;
import com.bezkoder.springjwt.security.services.BadgeService;
import com.bezkoder.springjwt.security.services.UserService;
import com.bezkoder.springjwt.util.FileUploadUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

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
    @Autowired
    UserRepository userRepository;


    @GetMapping("/images/{badgeid}/{fileName}")
    public ResponseEntity<byte[]> getImage(@PathVariable Long badgeid, @PathVariable String fileName , @AuthenticationPrincipal UserDetails userDetails) throws IOException {
//        if (!userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_COLLABORATEUR"))) {
//            return new ResponseEntity<>(HttpStatus.FORBIDDEN); // User doesn't have required role
//        }
        Optional<Badge> badgeOptional = badgeRepository.findById(badgeid);
        if (badgeOptional.isEmpty()) {
            String errorMessage = "User not found with ID: " + badgeid;
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorMessage.getBytes());
        }
        // Construct the path to the image file
        String filePath = "badge-photos/" + badgeid + "/" + fileName;
        Path path = Paths.get(filePath);

        if (!Files.exists(path)) {
            String errorMessage = "Image not found for user ID: " + badgeid + " and file name: " + fileName;
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorMessage.getBytes());
        }

        // Read the image file as bytes
        byte[] imageData = Files.readAllBytes(path);

        // Set content type header
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_JPEG); // Adjust content type as needed

        // Serve the image data as a response
        return ResponseEntity.ok().headers(headers).body(imageData);
    }


    @PostMapping("/{userId}")
    public ResponseEntity<Badge> createBadgeForUser(@PathVariable Long userId, @RequestParam String Newusername, @RequestParam String Newmatricule, @RequestParam(value = "image", required = false) MultipartFile multipartFile, @AuthenticationPrincipal UserDetails userDetails) throws IOException {
        if (!userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_COLLABORATEUR"))) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN); // User doesn't have required role
        }

        // Retrieve the user from the database using the UserService
        User user = userService.getUserById(userId);
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND); // User not found
        }

        Badge badge = new Badge();


        String fileName = null;
        if (multipartFile != null) {
            fileName = StringUtils.cleanPath(Objects.requireNonNull(multipartFile.getOriginalFilename()));
            badge.setPhotos(fileName);
            System.out.println(fileName);
        }

        badge.setUsername(Newusername);
        badge.setMatricule(Newmatricule);
        badge.setUser(user);
        badge.setStatus("en cours");

        // Save the badge to the database
        Badge createdBadge = badgeRepository.save(badge);
        if (multipartFile != null) {
            String uploadDir = "badge-photos/" + createdBadge.getId();
            FileUploadUtil.saveFile(uploadDir, fileName, multipartFile);
        }
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

    @GetMapping("/")
    public ResponseEntity<?> getAllBadges(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_MANAGER"))) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN); // User doesn't have required role
        }
        try {
            List<Badge> badges = badgeRepository.findAll();
            return ResponseEntity.ok().body(badges);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving badges: " + e.getMessage());
        }
    }
    @PutMapping("/accept/{badgeId}")
    public ResponseEntity<?> acceptBadge(@PathVariable Long badgeId, @AuthenticationPrincipal UserDetails userDetails) {
        if (!userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_MANAGER"))) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN); // User doesn't have required role
        }
        badgeService.acceptBadge(badgeId);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PutMapping("/refuse/{badgeId}")
    public ResponseEntity<?> refuseBadge(@PathVariable Long badgeId, @AuthenticationPrincipal UserDetails userDetails) {
        if (!userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_MANAGER"))) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN); // User doesn't have required role
        }
        badgeService.refuseBadge(badgeId);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getBadgesByUserId(@PathVariable Long userId, @AuthenticationPrincipal UserDetails userDetails) {
        if (!userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_COLLABORATEUR"))) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN); // User doesn't have required role
        }
        try {
            // Retrieve the user by ID
            User user = userService.getUserById(userId);
            if (user == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND); // User not found
            }

            // Retrieve badges by user
            List<Badge> badges = badgeRepository.findByUser(user);
            return ResponseEntity.ok().body(badges);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving badges for user with ID: " + e);
        }
    }


}
