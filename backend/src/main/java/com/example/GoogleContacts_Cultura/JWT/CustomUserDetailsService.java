package com.example.GoogleContacts_Cultura.JWT;

import com.example.GoogleContacts_Cultura.entity.UserEntity;
import com.example.GoogleContacts_Cultura.repository.UserRepo;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepo userRepo;

    public CustomUserDetailsService(UserRepo userRepo) {
        this.userRepo = userRepo;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Optional<UserEntity> userEntity = userRepo.findByEmail(email);

        if (userEntity.isEmpty()) {
            throw new UsernameNotFoundException("User not found: " + email);
        }

        return User.withUsername(userEntity.get().getEmail()) // use email
                .password(userEntity.get().getPassword())
                .roles(userEntity.get().getRole().name())
                .build();
    }


}
