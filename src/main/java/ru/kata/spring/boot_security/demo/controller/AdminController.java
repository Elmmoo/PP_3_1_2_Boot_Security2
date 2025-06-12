package ru.kata.spring.boot_security.demo.controller;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import ru.kata.spring.boot_security.demo.dto.AddUserDto;
import ru.kata.spring.boot_security.demo.dto.EditUserDto;
import ru.kata.spring.boot_security.demo.model.User;
import ru.kata.spring.boot_security.demo.service.RoleService;
import ru.kata.spring.boot_security.demo.service.UserService;

import java.util.List;

@Controller
@RequestMapping("/admin")
public class AdminController {
    private final UserService userService;
    private final RoleService roleService;

    public AdminController(UserService userService, RoleService roleService) {
        this.userService = userService;
        this.roleService = roleService;
    }

    @GetMapping
    public String showUsers(Model model, Authentication authentication) {
        model.addAttribute("users", userService.getAllUsers());
        model.addAttribute("allRoles", roleService.getAllRoles());
        model.addAttribute("user", userService.getCurrentUser(authentication));
        return "admin";
    }

    @PostMapping("/add")
    public String addUser(@ModelAttribute AddUserDto addUserDto) {
        userService.createUserFromDto(addUserDto);
        return "redirect:/admin";
    }

    @PostMapping("/edit")
    public String editUser(@ModelAttribute EditUserDto userDto) {
        userService.updateUserFromDto(userDto);
        return "redirect:/admin";
    }

    @PostMapping("/delete/{id}")
    public String deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return "redirect:/admin";
    }
}
