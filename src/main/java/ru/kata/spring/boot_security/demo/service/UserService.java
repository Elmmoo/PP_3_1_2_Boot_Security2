package ru.kata.spring.boot_security.demo.service;

import ru.kata.spring.boot_security.demo.dto.AddUserDto;
import ru.kata.spring.boot_security.demo.dto.EditUserDto;
import ru.kata.spring.boot_security.demo.model.User;
import org.springframework.security.core.Authentication;

import java.util.List;

public interface UserService {
    List<User> getAllUsers();
    void save(User user);
    void deleteUser(Long id);
    User findByEmail(String email);
    User getUser(Long id);
    void createUserFromDto(AddUserDto dto);
    void updateUserFromDto(EditUserDto dto);
    User getCurrentUser(Authentication authentication);
}
