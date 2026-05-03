package com.gethired.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@Service
public class GithubService {
    
    private final RestTemplate restTemplate = new RestTemplate();
    private static final String GITHUB_API_URL = "https://api.github.com/users/";

    public Map<String, Object> getUserStats(String username) {
        String url = GITHUB_API_URL + username;
        try {
            Map<String, Object> stats = restTemplate.getForObject(url, Map.class);
            Map<String, Object> result = new HashMap<>();
            result.put("publicRepos", stats.get("public_repos"));
            result.put("followers", stats.get("followers"));
            result.put("bio", stats.get("bio"));
            result.put("reliabilityScore", calculateReliability(stats));
            return result;
        } catch (Exception e) {
            return Collections.singletonMap("error", "User not found");
        }
    }
    
    private double calculateReliability(Map<String, Object> stats) {
        int repos = (int) stats.get("public_repos");
        int followers = (int) stats.get("followers");
        // Simple mock algorithm
        double score = (repos * 5) + (followers * 2);
        return Math.min(100, score);
    }
}
