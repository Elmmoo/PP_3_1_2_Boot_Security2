package ru.kata.spring.boot_security.demo.Repository;

import ru.kata.spring.boot_security.demo.model.User;

import java.util.List;

public interface UserRepository {
    List<User> getAllUsers();
    void save(User user);
    User getUser(Long id);
    void deleteUser(Long id);
    User searchUser(String username);
}
