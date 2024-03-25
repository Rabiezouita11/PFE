package com.bezkoder.springjwt;

import com.bezkoder.springjwt.models.ERole;
import com.bezkoder.springjwt.models.Role;
import com.bezkoder.springjwt.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class InitialDataLoader implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Override
    public void run(String... args) throws Exception {
        // Check if roles exist
        if (roleRepository.findByName(ERole.ROLE_MANAGER).isEmpty()) {
            // Roles don't exist, so insert them
            Role managerRole = new Role(ERole.ROLE_MANAGER);
            Role collaborateurRole = new Role(ERole.ROLE_COLLABORATEUR);
            Role gestionnaireRole = new Role(ERole.ROLE_GESTIONNAIRE);

            roleRepository.save(managerRole);
            roleRepository.save(collaborateurRole);
            roleRepository.save(gestionnaireRole);
        }
    }
}
