package com.bezkoder.springjwt.repository;

import com.bezkoder.springjwt.models.Badge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository

public interface BadgeRepository extends JpaRepository<Badge, Long> {
}
