package ru.kata.spring.boot_security.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import ru.kata.spring.boot_security.demo.dto.AddUserDto;
import ru.kata.spring.boot_security.demo.dto.EditUserDto;
import ru.kata.spring.boot_security.demo.model.User;
import ru.kata.spring.boot_security.demo.repository.UserRepository;
import org.springframework.security.core.Authentication;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final RoleService roleService;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           RoleService roleService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.roleService = roleService;
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.getAllUsers();
    }

    @Override
    @Transactional
    public void save(User user) {
        if (user.getId() == null || user.getPassword() == null || user.getPassword().isEmpty()) {
            throw new IllegalArgumentException("Password is required for new users.");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        userRepository.deleteUser(id);
    }

    @Override
    public User findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public User getUser(Long id) {
        return userRepository.getUser(id);
    }

    @Override
    @Transactional
    public void createUserFromDto(AddUserDto dto) {
        User user = new User();
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setAge(dto.getAge());
        user.setRoles(roleService.getRolesByIds(dto.getRoleIds()));
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void updateUserFromDto(EditUserDto dto) {
        User user = getUser(dto.getId());

        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setEmail(dto.getEmail());
        user.setAge(dto.getAge());

        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        if (dto.getRoleIds() != null && !dto.getRoleIds().isEmpty()) {
            user.setRoles(roleService.getRolesByIds(dto.getRoleIds()));
        }

        userRepository.save(user);
    }

    @Override
    public User getCurrentUser(Authentication authentication) {
        return findByEmail(authentication.getName());
    }
}
