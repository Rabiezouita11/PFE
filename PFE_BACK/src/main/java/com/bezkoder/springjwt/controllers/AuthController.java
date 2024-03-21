package com.bezkoder.springjwt.controllers;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;

import com.bezkoder.springjwt.security.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.bezkoder.springjwt.models.ERole;
import com.bezkoder.springjwt.models.Role;
import com.bezkoder.springjwt.models.User;
import com.bezkoder.springjwt.payload.request.LoginRequest;
import com.bezkoder.springjwt.payload.request.SignupRequest;
import com.bezkoder.springjwt.payload.response.JwtResponse;
import com.bezkoder.springjwt.payload.response.MessageResponse;
import com.bezkoder.springjwt.repository.RoleRepository;
import com.bezkoder.springjwt.repository.UserRepository;
import com.bezkoder.springjwt.security.jwt.JwtUtils;
import com.bezkoder.springjwt.security.services.UserDetailsImpl;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
	@Autowired
	AuthenticationManager authenticationManager;

	@Autowired
	UserRepository userRepository;

	@Autowired
	RoleRepository roleRepository;

	@Autowired
	PasswordEncoder encoder;

	@Autowired
	JwtUtils jwtUtils;
    @Autowired
    PasswordEncoder passwordEncoder; // Add this import
	@Autowired
	private UserService userService;
	private static final long EXPIRE_TOKEN_AFTER_MINUTES = 30;

	@PostMapping("/signin")
	public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

		Authentication authentication = authenticationManager.authenticate(
				new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

		SecurityContextHolder.getContext().setAuthentication(authentication);
		String jwt = jwtUtils.generateJwtToken(authentication);
		
		UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();		
		List<String> roles = userDetails.getAuthorities().stream()
				.map(item -> item.getAuthority())
				.collect(Collectors.toList());

		return ResponseEntity.ok(new JwtResponse(jwt, 
												 userDetails.getId(), 
												 userDetails.getUsername(), 
												 userDetails.getEmail(), 
												 roles));
	}

	@PostMapping("/signup")
	public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
		if (userRepository.existsByUsername(signUpRequest.getUsername())) {
			return ResponseEntity
					.badRequest()
					.body(new MessageResponse("Error: Username is already taken!"));
		}

		if (userRepository.existsByEmail(signUpRequest.getEmail())) {
			return ResponseEntity
					.badRequest()
					.body(new MessageResponse("Error: Email is already in use!"));
		}

		// Create new user's account
		User user = new User(signUpRequest.getUsername(), 
							 signUpRequest.getEmail(),
							 encoder.encode(signUpRequest.getPassword()));

		Set<String> strRoles = signUpRequest.getRole();
		Set<Role> roles = new HashSet<>();

		if (strRoles == null) {
			Role userRole = roleRepository.findByName(ERole.ROLE_COLLABORATEUR)
					.orElseThrow(() -> new RuntimeException("Error: Role is not found."));
			roles.add(userRole);
		} else {
			strRoles.forEach(role -> {
				switch (role) {
				case "admin":
					Role adminRole = roleRepository.findByName(ERole.ROLE_GESTIONNAIRE)
							.orElseThrow(() -> new RuntimeException("Error: Role is not found."));
					roles.add(adminRole);

					break;
				case "mod":
					Role modRole = roleRepository.findByName(ERole.ROLE_MANAGER)
							.orElseThrow(() -> new RuntimeException("Error: Role is not found."));
					roles.add(modRole);

					break;
				default:
					Role userRole = roleRepository.findByName(ERole.ROLE_COLLABORATEUR)
							.orElseThrow(() -> new RuntimeException("Error: Role is not found."));
					roles.add(userRole);
				}
			});
		}

		user.setRoles(roles);
		userRepository.save(user);

		return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
	}


    @GetMapping("/users/verif/{email}/{pwd}")
    public ResponseEntity<String> findUserByEmail(@PathVariable String email, @PathVariable String pwd, HttpServletRequest request) {
        Optional<User> user = userService.findUserByEmail(email);
        String appUrl = request.getScheme() + "://" + request.getServerName() + ":4200";
        if (!user.isPresent()) {
            System.out.println("We didn't find an account for that e-mail address.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("We didn't find an account for that e-mail address.");
        } else {
            User userr = user.get();
            if (passwordEncoder.matches(pwd, userr.getPassword())) {
                userr.setDateToken(LocalDateTime.now());
                userr.setResetToken(UUID.randomUUID().toString());
                userService.save(userr);
                SimpleMailMessage simpleMailMessage = new SimpleMailMessage();
                simpleMailMessage.setFrom("testab.symfony@gmail.com");
                simpleMailMessage.setTo(userr.getEmail());
                simpleMailMessage.setSubject("Password Reset Request");
                simpleMailMessage.setText("Pou récupérer votre Mot De passe cliquer sur ce Lien :\n" + appUrl
                        + "/resetpwd?token=" + userr.getResetToken());
                System.out.println(userr.getResetToken());
                userService.sendEmail(simpleMailMessage);
                return ResponseEntity.status(HttpStatus.OK).body("1");
            } else {
                System.out.println("Mot de Passe Incorrecte");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Mot de Passe Incorrecte");
            }
        }
    }
	@GetMapping("/users/rest/{resetToken}/{password}")
	public String findUserByResetToken (@PathVariable String resetToken,@PathVariable String password) {
		System.out.println("Get  User By resetToken..");

		Optional<User> user = userService.findUserByResetToken(resetToken);
		if (!user.isPresent()) {
			System.out.println( "We didn't find an account for that Token");
			return "0";
		} else {
			User userr = user.get();
			LocalDateTime tokenCreationDate = userr.getDateToken();

			if (isTokenExpired(tokenCreationDate)) {
				System.out.println("Token expired.");
				return "1";
			}
			userr.setPassword(password.trim());
			userr.setResetToken(null);
			userr.setDateToken(null);
			userService.save(userr);
			return "2";
		}
	}



	/**
	 * Check whether the created token expired or not.
	 *
	 * @param tokenCreationDate
	 * @return true or false
	 */
	private boolean isTokenExpired(final LocalDateTime tokenCreationDate) {

		LocalDateTime now = LocalDateTime.now();
		Duration diff = Duration.between(tokenCreationDate, now);

		return diff.toMinutes() >= EXPIRE_TOKEN_AFTER_MINUTES;
	}


}

