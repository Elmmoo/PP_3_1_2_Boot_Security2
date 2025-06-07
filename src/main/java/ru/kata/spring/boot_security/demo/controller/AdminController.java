package ru.kata.spring.boot_security.demo.controller;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
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

        // Ключевое изменение: добавляем список всех ролей
        model.addAttribute("allRoles", roleService.getAllRoles());

        // Добавляем текущего пользователя для отображения в шапке
        User currentUser = userService.findByEmail(authentication.getName());
        model.addAttribute("user", currentUser);

        return "admin";
    }



    @PostMapping("/add")
    public String addUser(
            @RequestParam String firstName,
            @RequestParam String lastName,
            @RequestParam String email,
            @RequestParam String password,
            @RequestParam int age,
            @RequestParam List<Long> roleIds
    ) {
        User user = new User();
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);
        user.setPassword(password);
        user.setAge(age);
        user.setRoles(roleService.getRolesByIds(roleIds));

        userService.save(user);
        return "redirect:/admin";
    }

    // УДАЛЯЕМ метод showEditForm, так как редактирование теперь в модальном окне
    // @GetMapping("/edit/{id}") - больше не нужен

    @PostMapping("/edit")
    public String editUser(
            @RequestParam Long id,
            @RequestParam String firstName,
            @RequestParam String lastName,
            @RequestParam String email,
            @RequestParam(required = false) String password,
            @RequestParam int age,
            @RequestParam(required = false) List<Long> roleIds // Ключевое изменение: делаем необязательным
    ) {
        User user = userService.getUser(id);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);
        user.setAge(age);

        // Обновляем пароль только если он указан
        if (password != null && !password.isEmpty()) {
            user.setPassword(password);
        }

        // Ключевое изменение: обновляем роли только если они выбраны
        if (roleIds != null && !roleIds.isEmpty()) {
            user.setRoles(roleService.getRolesByIds(roleIds));
        } else {
            // Если роли не выбраны, сохраняем текущие
            // Можно добавить логику для обработки пустых ролей
        }

        userService.save(user);
        return "redirect:/admin";
    }

    @PostMapping("/delete/{id}")
    public String deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return "redirect:/admin";
    }
}
