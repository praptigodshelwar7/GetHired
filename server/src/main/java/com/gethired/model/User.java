package com.gethired.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String email;
    private String password;
    
    // Profile Data
    private String githubHandle;
    private String leetcodeHandle;
    private String targetRole;
    
    // Sync Stats
    private int leetcodeSolved;
    private int leetcodeEasy;
    private int leetcodeMedium;
    private int leetcodeHard;
    private int leetcodeStreak;
    
    @Column(length = 2000)
    private String analysisResultJson; // Store as JSON string
    
    @Column(length = 2000)
    private String streakDaysJson; // Store as JSON string
    
    private String role = "USER";
}
