package com.bezkoder.springjwt.repository;

import com.bezkoder.springjwt.models.DemandeAttestations;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DemandeAttestationsRepository extends JpaRepository<DemandeAttestations, Long> {
}
