package com.gethired.controller;

import com.gethired.model.User;
import com.gethired.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<User> getProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByUsername(auth.getName())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping
    public ResponseEntity<User> updateProfile(@RequestBody User profileData) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByUsername(auth.getName())
                .map(user -> {
                    // Update only profile-related fields
                    if (profileData.getGithubHandle() != null) user.setGithubHandle(profileData.getGithubHandle());
                    if (profileData.getLeetcodeHandle() != null) user.setLeetcodeHandle(profileData.getLeetcodeHandle());
                    if (profileData.getTargetRole() != null) user.setTargetRole(profileData.getTargetRole());
                    
                    // Stats
                    user.setLeetcodeSolved(profileData.getLeetcodeSolved());
                    user.setLeetcodeEasy(profileData.getLeetcodeEasy());
                    user.setLeetcodeMedium(profileData.getLeetcodeMedium());
                    user.setLeetcodeHard(profileData.getLeetcodeHard());
                    user.setLeetcodeStreak(profileData.getLeetcodeStreak());
                    
                    if (profileData.getAnalysisResultJson() != null) user.setAnalysisResultJson(profileData.getAnalysisResultJson());
                    if (profileData.getStreakDaysJson() != null) user.setStreakDaysJson(profileData.getStreakDaysJson());
                    
                    return ResponseEntity.ok(userRepository.save(user));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
