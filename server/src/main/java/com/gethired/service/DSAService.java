package com.gethired.service;

import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class DSAService {

    private static final Map<String, Integer> COMPANY_REQUIREMENTS = new HashMap<>();
    
    static {
        COMPANY_REQUIREMENTS.put("Google", 450);
        COMPANY_REQUIREMENTS.put("Amazon", 350);
        COMPANY_REQUIREMENTS.put("Meta", 400);
        COMPANY_REQUIREMENTS.put("Startup", 150);
    }

    public Map<String, Object> getProgress(int solvedCount, String targetCompany) {
        int required = COMPANY_REQUIREMENTS.getOrDefault(targetCompany, 200);
        double percent = (double) solvedCount / required * 100;
        
        Map<String, Object> result = new HashMap<>();
        result.put("current", solvedCount);
        result.put("required", required);
        result.put("percent", Math.min(100, Math.round(percent)));
        result.put("status", getStatus(percent));
        
        return result;
    }
    
    private String getStatus(double percent) {
        if (percent >= 100) return "Ready for Interviews";
        if (percent >= 70) return "Strong Foundation";
        if (percent >= 40) return "Intermediate";
        return "Beginner";
    }
}
