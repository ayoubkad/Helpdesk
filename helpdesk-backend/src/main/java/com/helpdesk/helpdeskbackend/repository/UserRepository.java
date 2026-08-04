package com.helpdesk.helpdeskbackend.repository;

import com.helpdesk.helpdeskbackend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findAllById(Long id);

    Optional<User> findAllByEmail(String email);

    boolean existsAllByEmail(String email);

    List<User> findAllByActif(boolean actif);

    List<User> findByRoleNom(String nomRole);
}

