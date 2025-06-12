package ru.kata.spring.boot_security.demo.dto;

import lombok.Data;

import java.util.List;

@Data
public class AddUserDto {
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private int age;
    private List<Long> roleIds;
}
