package com.example.GoogleContacts_Cultura.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @GetMapping("/manage")
    public String manageUsers() {
        return "Admin access granted. You can manage users and tasks.";
    }
}