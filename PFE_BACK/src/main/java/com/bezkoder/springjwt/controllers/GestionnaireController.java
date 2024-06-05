package com.bezkoder.springjwt.controllers;

import com.bezkoder.springjwt.Dto.DonnerDTO;
import com.bezkoder.springjwt.models.*;
import com.bezkoder.springjwt.repository.*;
import com.bezkoder.springjwt.security.services.AttestationService;
import com.bezkoder.springjwt.security.services.DonnerService;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@CrossOrigin(origins = "*", maxAge = 3600)

@RestController
@RequestMapping("/api/Gestionnaire")
public class GestionnaireController {
    private static final String UPLOAD_DIR = "attestations";

    @Autowired
    UserRepository userRepository;
    @Autowired
    RoleRepository roleRepository;
    @Autowired
    com.bezkoder.springjwt.repository.soldeCongerRepository soldeCongerRepository;

    @Autowired
    CongerMaladieRepository congerMaladieRepository;
    @Autowired
    private JavaMailSender javaMailSender;
    @Autowired
    private DonnerRepository donnerRepository;
    @Autowired
    private DonnerService donnerService;
    @Autowired
    private AttestationService attestationService;
    @Autowired
    private AttestationRepository attestationRepository;

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
            SoldeConger newSoldeConger = new SoldeConger();
            newSoldeConger.setUser(user);
            newSoldeConger.setSolde(30);
            soldeCongerRepository.save(newSoldeConger);
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

            // Check if the new status is "REFUSED"
            if ("REFUSED".equalsIgnoreCase(newStatus)) {
                // Find the user's SoldeConger
                Long durationInDays = donnerRepository.getDurationInDaysByCongerMaladieId(congerId);
                if (durationInDays != null) {
                    Optional<SoldeConger> soldeCongerOptional = Optional.ofNullable(soldeCongerRepository.findByUserId(conger.getUser().getId()));

                    if (soldeCongerOptional.isPresent()) {
                        SoldeConger soldeConger = soldeCongerOptional.get();
                        soldeConger.setSolde(soldeConger.getSolde() + durationInDays);
                        soldeCongerRepository.save(soldeConger); // Save the updated SoldeConger
                    }
                }
            }

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
            statusMessage += "<li>Type de congé: " + conger.getTypeConger() + "</li>";

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

    @GetMapping("/donner/conger-maladie/{congerMaladieId}")
    public ResponseEntity<DonnerDTO> getDonnerByCongerMaladieId(@PathVariable Long congerMaladieId) {
        Optional<DonnerDTO> donner = donnerService.getDonnerByCongerMaladieId(congerMaladieId);
        if (donner.isPresent()) {
            return ResponseEntity.ok().body(donner.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/SaveAttestations")
    public ResponseEntity<?> handleFileUpload(@RequestParam(value = "file", required = false) MultipartFile file,
                                              @RequestParam("name") String name,
                                              @RequestParam("isExist") boolean isExist) {
        try {
            if (file != null) {
                String fileName = StringUtils.cleanPath(FilenameUtils.getBaseName(file.getOriginalFilename()) + "_" + System.currentTimeMillis() + "." + FilenameUtils.getExtension(file.getOriginalFilename()));
                Path uploadDir = Paths.get(UPLOAD_DIR);
                if (!Files.exists(uploadDir)) {
                    Files.createDirectories(uploadDir);
                }
                Files.copy(file.getInputStream(), uploadDir.resolve(fileName));

                String pdfPath = UPLOAD_DIR + "/" + fileName;

                // Save attestation data into the database
                Attestation attestation = new Attestation(name, pdfPath, isExist);
                attestationService.saveAttestation(attestation);

                // Return a success response with a custom message
                return ResponseEntity.ok().body("Attestation saved successfully");
            } else {
                Attestation attestation = new Attestation(name, isExist);
                attestationService.saveAttestation(attestation);
                // If file is null, return a bad request response
                return ResponseEntity.ok().body("Attestation saved successfully");
            }
        } catch (Exception e) {
            // If an exception occurs, return a server error response
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload file");
        }
    }

    @PostMapping("/GeneratePdf")
    public ResponseEntity<String> generatePdf(@RequestBody Map<String, String> pdfContentMap) {
        try {


            String pdfContent = pdfContentMap.get("pdfContent");
            String pdfName = pdfContentMap.get("pdfName");


            // Extract and trim the content
            String content = pdfContent.trim();

            // Remove double quotes from the extracted content
            content = content.replace("\"", "");

            // Create a new PDF document
            PDDocument document = new PDDocument();
            PDPage page = new PDPage();
            document.addPage(page);

            // Create a new content stream for writing to the PDF
            PDPageContentStream contentStream = new PDPageContentStream(document, page);

            // Set the font and font size for the title
            contentStream.setFont(PDType1Font.HELVETICA_BOLD, 24);

            // Calculate the width of the title
            String title = "Attestations " + pdfName;
            float titleWidth = PDType1Font.HELVETICA_BOLD.getStringWidth(title) / 1000f * 24;
            float pageWidth = page.getMediaBox().getWidth();
            float titleX = (pageWidth - titleWidth) / 2f; // Center the title horizontally

            // Write the title to the PDF
            contentStream.beginText();
            contentStream.newLineAtOffset(titleX, 750); // Set the position for the title (top center)
            contentStream.showText(title); // Display the title
            contentStream.endText();

            // Set the font and font size for the content
            contentStream.setFont(PDType1Font.HELVETICA, 12);

            // Split the content into lines with line breaks every 60 characters
            List<String> lines = splitContent(content, 60);

            // Starting y position for the content
            float y = 700;

            // Loop through each line of content
            for (String line : lines) {
                // Calculate the X offset to center the text horizontally
                float textWidth = PDType1Font.HELVETICA.getStringWidth(line) / 1000f * 12;
                float xOffset = (pageWidth - textWidth) / 2f;

                // Write each line as a separate paragraph
                contentStream.beginText();
                contentStream.newLineAtOffset(xOffset, y); // Set the position for the text
                contentStream.showText(line); // Display the line
                contentStream.endText();
                y -= 20; // Move to the next line
            }

            // Close the content stream
            contentStream.close();

            // Save the PDF document to a byte array
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            document.save(outputStream);
            document.close();

            // Specify the directory where you want to save the PDF
            String uploadDir = "attestations";

            // Create the directory if it doesn't exist
            if (!Files.exists(Paths.get(uploadDir))) {
                Files.createDirectories(Paths.get(uploadDir));
            }

            // Generate a unique file name for the PDF
            String fileName = "generated_pdf_" + System.currentTimeMillis() + ".pdf";

            // Write the PDF content to the file
            FileUtils.writeByteArrayToFile(new File(uploadDir + File.separator + fileName), outputStream.toByteArray());
            Attestation attestation = new Attestation();
            attestation.setName(pdfName); // Set pdfName
            String pdfPath = uploadDir + File.separator + fileName;
            attestation.setPdfPath(pdfPath); // Set pdfName
            attestation.setExist(true); // Set pdfName
            attestationRepository.save(attestation); // Save the object using your repository

            // Return the path to the saved PDF file
            return ResponseEntity.ok(uploadDir + File.separator + fileName);
        } catch (IOException e) {
            e.printStackTrace();
            // Return an error response if PDF generation fails
            return ResponseEntity.status(500).body("Failed to generate PDF");
        }
    }

    // Function to split the content into lines with line breaks every n characters
    private List<String> splitContent(String content, int n) {
        List<String> lines = new ArrayList<>();
        for (int i = 0; i < content.length(); i += n) {
            int endIndex = Math.min(i + n, content.length());
            lines.add(content.substring(i, endIndex));
        }
        return lines;
    }

    @GetMapping("/attestations")
    public ResponseEntity<List<Attestation>> getAllAttestations() {
        List<Attestation> attestations = attestationRepository.findAll();
        return ResponseEntity.ok().body(attestations);


    }

    @GetMapping("/pdfs/{fileName:.+}")
    @ResponseBody
    public ResponseEntity<Resource> getPdf(@PathVariable String fileName) throws IOException {
        // Adjust the base path according to your file storage configuration
        String basePath = "attestations";
        String filePath = Paths.get(basePath, fileName).toString();
        System.out.println("filePath"+filePath);
        Path pdfPath = Paths.get(filePath);
        System.out.println("pdfPath"+pdfPath);
        if (!Files.exists(pdfPath)) {
            System.out.println("aaaaaaaaaaaa");

            return ResponseEntity.notFound().build();
        }

        Resource resource = new UrlResource(pdfPath.toUri());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentLength(resource.contentLength());
        headers.setContentDispositionFormData("attachment", fileName);

        return new ResponseEntity<>(resource, headers, HttpStatus.OK);
    }
    @DeleteMapping("/attestations/{attestationId}")
    public ResponseEntity<?> deleteAttestation(@PathVariable Long attestationId) throws IOException {
        Optional<Attestation> attestationOptional = attestationRepository.findById(attestationId);
        if (attestationOptional.isPresent()) {
            // Delete the PDF file associated with the attestation
            String pdfPath = attestationOptional.get().getPdfPath();
            if (pdfPath != null && !pdfPath.isEmpty()) {

                Files.deleteIfExists(Paths.get(pdfPath));
            }

            // Delete the attestation entry from the database
            attestationRepository.deleteById(attestationId);

            // Return a success response with a custom message
            return ResponseEntity.ok().body("Attestation deleted successfully");
        } else {
            return ResponseEntity.notFound().build();
        }
    }

}
