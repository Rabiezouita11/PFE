package com.bezkoder.springjwt.controllers;

import com.bezkoder.springjwt.models.Badge;
import com.bezkoder.springjwt.models.QuestionsRH;
import com.bezkoder.springjwt.repository.QuestionsRHRepository;
import com.bezkoder.springjwt.util.FileUploadUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/QuestionsRH")
public class QuestionsRHController {

    @Autowired
    private QuestionsRHRepository questionsRHRepository;

    // Get all QuestionsRH
    @GetMapping("/")
    public List<QuestionsRH> getAllQuestionsRH() {
        return questionsRHRepository.findAll();
    }

    // Get a single QuestionsRH by ID
    @GetMapping("/{id}")
    public Optional<QuestionsRH> getQuestionsRHById(@PathVariable Long id) {
        return questionsRHRepository.findById(id);
    }

    // Create a new QuestionsRH
    @PostMapping("/add")
    public ResponseEntity<QuestionsRH> createQuestionsRH(
            @RequestParam String categories,
            @RequestParam String sousCategories,
            @RequestParam String titre,
            @RequestParam String descriptions,
            @RequestParam(value = "piecesJoint", required = false) MultipartFile multipartFile,
            @RequestParam Long userId
    ) throws IOException {
        QuestionsRH questionsRH = new QuestionsRH();
        String fileName = null;
        if (multipartFile != null) {
            fileName = StringUtils.cleanPath(Objects.requireNonNull(multipartFile.getOriginalFilename()));
            questionsRH.setPiecesJoint(fileName);
            System.out.println(fileName);
        }
        questionsRH.setCategories(categories);
        questionsRH.setTitre(titre);
        questionsRH.setDescriptions(descriptions);
        questionsRH.setUserId(userId);
        questionsRH.setSousCategories(sousCategories);

        QuestionsRH createdQuestionRh = questionsRHRepository.save(questionsRH);
        if (multipartFile != null) {
            String uploadDir = "QuestionRh/" + createdQuestionRh.getId();
            FileUploadUtil.saveFile(uploadDir, fileName, multipartFile);
        }
        return new ResponseEntity<>(createdQuestionRh, HttpStatus.CREATED);
    }
    // Update a QuestionsRH by ID
    @PutMapping("/{id}")
    public QuestionsRH updateQuestionsRH(@PathVariable Long id, @RequestBody QuestionsRH questionsRH) {
        if (questionsRHRepository.existsById(id)) {
            questionsRH.setId(id);
            return questionsRHRepository.save(questionsRH);
        } else {
            return null; // Handle not found case
        }
    }

    // Delete a QuestionsRH by ID
    @DeleteMapping("/{id}")
    public void deleteQuestionsRH(@PathVariable Long id) {
        questionsRHRepository.deleteById(id);
    }
}
