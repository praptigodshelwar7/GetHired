package com.gethired.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@Service
public class LeetCodeService {
    
    private final RestTemplate restTemplate = new RestTemplate();
    private static final String LEETCODE_STATS_API = "https://leetcode-stats-api.herokuapp.com/";

    public Map<String, Object> getStats(String username) {
        String url = LEETCODE_STATS_API + username;
        try {
            Map<String, Object> stats = restTemplate.getForObject(url, Map.class);
            if ("success".equals(stats.get("status"))) {
                Map<String, Object> result = new HashMap<>();
                result.put("totalSolved", stats.get("totalSolved"));
                result.put("easySolved", stats.get("easySolved"));
                result.put("mediumSolved", stats.get("mediumSolved"));
                result.put("hardSolved", stats.get("hardSolved"));
                result.put("ranking", stats.get("ranking"));
                return result;
            }
            return Collections.singletonMap("error", "User not found or API down");
        } catch (Exception e) {
            return Collections.singletonMap("error", "Could not fetch LeetCode stats");
        }
    }
}
