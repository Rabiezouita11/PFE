package com.bezkoder.springjwt.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.bezkoder.springjwt.models.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {


	Boolean existsByUsername(String username);
	Optional<User> findByUsername(String name);
	Optional<User> findByResetToken(String resetToken);
	Optional<User> findByEmail(String email);
	Boolean existsByEmail(String email);
	Optional<User> findById(Long id); // Use findById to retrieve a user by ID

}
