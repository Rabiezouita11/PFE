package com.bezkoder.springjwt.repository;

import com.bezkoder.springjwt.models.SoldeConger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository

public interface soldeCongerRepository extends JpaRepository<SoldeConger, Long> {
    SoldeConger findByUserId(Long userId);

}
