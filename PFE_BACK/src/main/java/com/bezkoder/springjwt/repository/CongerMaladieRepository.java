package com.bezkoder.springjwt.repository;

import com.bezkoder.springjwt.models.Conger_Maladie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository

public interface CongerMaladieRepository extends JpaRepository<Conger_Maladie, Long> {
}
