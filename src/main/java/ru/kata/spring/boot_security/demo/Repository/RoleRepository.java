package ru.kata.spring.boot_security.demo.Repository;

import ru.kata.spring.boot_security.demo.model.Role;

import java.util.List;

public interface RoleRepository {
    List<Role> getAllRoles();
    Role getRoleById(Long id);
}
