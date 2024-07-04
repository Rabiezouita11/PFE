package com.bezkoder.springjwt.controllers;

import com.bezkoder.springjwt.models.QuestionsRH;
import com.bezkoder.springjwt.repository.QuestionsRHRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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
    @PostMapping("/")
    public QuestionsRH createQuestionsRH(@RequestBody QuestionsRH questionsRH) {
        System.out.println("questionsRH"+questionsRH);
        return questionsRHRepository.save(questionsRH);
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
