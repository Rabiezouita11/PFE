package com.bezkoder.springjwt.controllers;

import com.bezkoder.springjwt.models.Conger_Maladie;
import com.bezkoder.springjwt.models.LeaveRequest;
import com.bezkoder.springjwt.models.SoldeConger;
import com.bezkoder.springjwt.payload.response.MessageResponse;
import com.bezkoder.springjwt.repository.CongerMaladieRepository;
import com.bezkoder.springjwt.repository.UserRepository;
import com.bezkoder.springjwt.security.services.UserDetailsImpl;
import com.bezkoder.springjwt.util.CustomDateDeserializer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.apache.commons.io.FilenameUtils;
import com.bezkoder.springjwt.repository.soldeCongerRepository;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.ParseException;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/CongerMaladie")

public class CongerMaladieController {
    @Autowired
    CongerMaladieRepository congerMaladieRepository;
    @Autowired
    UserRepository userRepository;

    @Autowired
    soldeCongerRepository soldeCongerRepository;


    // Define the directory where files will be stored
    // Define the directory where files will be stored within your backend project directory
    private static final String UPLOAD_DIR = "uploads/";

    @PostMapping("/submit")
    public ResponseEntity<?> submitLeaveRequest(@RequestParam("file") MultipartFile file, LeaveRequest leaveRequest) {
        // Get UserDetailsImpl from SecurityContextHolder
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        // Convert date strings to Date objects using custom deserializer
        Date startDate;
        Date endDate;
        try {
            startDate = CustomDateDeserializer.deserializeDate(leaveRequest.getStartDate());
            endDate = CustomDateDeserializer.deserializeDate(leaveRequest.getEndDate());
        } catch (ParseException e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Failed to parse date strings."));
        }

        // Calculate the duration of the leave request in days
        long durationInMilliseconds = endDate.getTime() - startDate.getTime();
        long durationInDays = TimeUnit.MILLISECONDS.toDays(durationInMilliseconds);
System.out.println("durationInDaysdurationInDays"+durationInDays);
        // Get the remaining leave balance (solde) for the user
        SoldeConger soldeConger = soldeCongerRepository.findByUserId(userDetails.getId());
        int remainingSolde = soldeConger != null ? soldeConger.getSolde() : 0;

        // Check if the duration of the leave request exceeds the remaining solde
        if (durationInDays > remainingSolde) {
            return ResponseEntity.badRequest().body(new MessageResponse("Insufficient leave balance."));
        }
        remainingSolde -= durationInDays;


        if (soldeConger != null) {
            soldeConger.setSolde(remainingSolde);
            soldeCongerRepository.save(soldeConger);
        }
        // Save the file to the backend folder
        String fileName = StringUtils.cleanPath(FilenameUtils.getBaseName(file.getOriginalFilename()) + "_" + System.currentTimeMillis() + "." + FilenameUtils.getExtension(file.getOriginalFilename()));
        Path uploadDir = Paths.get("uploads"); // Specify your upload directory here, preferably relative to the application root
        try {
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }
            Files.copy(file.getInputStream(), uploadDir.resolve(fileName));
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(new MessageResponse("Failed to save the file."));
        }

        // Create a new Conger_Maladie object and set its attributes
        Conger_Maladie congerMaladie = new Conger_Maladie();
        congerMaladie.setMessage(leaveRequest.getMessage());
        congerMaladie.setDateDebut(startDate);
        congerMaladie.setDateFin(endDate);
        congerMaladie.setJustificationPath(fileName); // Set the file name as justification path
        congerMaladie.setUser(userRepository.findById(userDetails.getId()).orElse(null));

        // Save the Conger_Maladie object to the database
        congerMaladieRepository.save(congerMaladie);

        // Return a success response
        return ResponseEntity.ok(new MessageResponse("Leave request submitted successfully!"));
    }

    private String saveFile(MultipartFile file) {
        String fileName = file.getOriginalFilename();
        try {
            byte[] bytes = file.getBytes();
            Path path = Paths.get(UPLOAD_DIR + fileName);
            Files.write(path, bytes);
        } catch (IOException e) {
            e.printStackTrace();
        }
        return fileName;
    }

    // Method to create the upload directory if it doesn't exist
    private void createUploadDirectory() {
        Path path = Paths.get(UPLOAD_DIR);
        if (!Files.exists(path)) {
            try {
                Files.createDirectories(path);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    @GetMapping("/count/{userId}")
    public ResponseEntity<?> countRequestsByUserId(@PathVariable Long userId) {
        long inProgressCount = congerMaladieRepository.countByUserIdAndStatus(userId, "IN_PROGRESS");
        long acceptedCount = congerMaladieRepository.countByUserIdAndStatus(userId, "ACCEPTED");
        long refusedCount = congerMaladieRepository.countByUserIdAndStatus(userId, "REFUSED");

        Map<String, Long> counts = new HashMap<>();
        counts.put("inProgress", inProgressCount);
        counts.put("accepted", acceptedCount);
        counts.put("refused", refusedCount);

        return ResponseEntity.ok(counts);
    }
        @GetMapping("/IN_PROGRESS/{userId}")
        public ResponseEntity<List<Conger_Maladie>> getInProgressData(@PathVariable Long userId) {
            List<Conger_Maladie> inProgressData = congerMaladieRepository.findByUserIdAndStatus(userId, "IN_PROGRESS");
            return ResponseEntity.ok(inProgressData);
        }

    @GetMapping("/ACCEPTED/{userId}")
    public ResponseEntity<List<Conger_Maladie>> getAcceptedData(@PathVariable Long userId) {
        List<Conger_Maladie> acceptedData = congerMaladieRepository.findByUserIdAndStatus(userId, "ACCEPTED");
        return ResponseEntity.ok(acceptedData);
    }

    @GetMapping("/REFUSED/{userId}")
    public ResponseEntity<List<Conger_Maladie>> getRefusedData(@PathVariable Long userId) {
        List<Conger_Maladie> refusedData = congerMaladieRepository.findByUserIdAndStatus(userId, "REFUSED");
        return ResponseEntity.ok(refusedData);
    }
    @GetMapping("/{userId}")
    public ResponseEntity<List<Conger_Maladie>> getByUserId(@PathVariable Long userId) {
        List<Conger_Maladie> data = congerMaladieRepository.findByUserId(userId);
        return ResponseEntity.ok(data);
    }

    @GetMapping("/totalLeaveDays/{userId}")
    public ResponseEntity<Integer> getSoldeConger(@PathVariable Long userId) {
        // Retrieve the user's SoldeConger object from the database based on the user ID
        SoldeConger soldeConger = soldeCongerRepository.findByUserId(userId);

        if (soldeConger == null) {
            // If SoldeConger object does not exist for the user, return 0 or handle the case accordingly
            return ResponseEntity.ok(0);
        }

        // Return the solde (total leave days available)
        return ResponseEntity.ok(soldeConger.getSolde());
    }


}