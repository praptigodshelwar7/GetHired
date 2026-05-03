package com.gethired.service;

import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ResumeService {
    
    private static final Set<String> TECH_KEYWORDS = Set.of(
        "Java", "Python", "React", "SpringBoot", "Docker", "Kubernetes", "AWS", "SQL", "NoSQL", "Algorithms", "Data Structures"
    );

    public Map<String, Object> analyzeResume(String resumeText, String jobDescription) {
        List<String> resumeKeywords = extractKeywords(resumeText);
        List<String> jdKeywords = extractKeywords(jobDescription);
        
        List<String> missingKeywords = jdKeywords.stream()
            .filter(keyword -> !resumeKeywords.contains(keyword))
            .collect(Collectors.toList());
            
        double score = jdKeywords.isEmpty() ? 0 : 
            (double)(jdKeywords.size() - missingKeywords.size()) / jdKeywords.size() * 100;
            
        Map<String, Object> result = new HashMap<>();
        result.put("score", Math.round(score));
        result.put("missingSkills", missingKeywords);
        result.put("roadmap", generateRoadmap(missingKeywords));
        
        return result;
    }
    
    private List<String> extractKeywords(String text) {
        if (text == null) return Collections.emptyList();
        String lowerText = text.toLowerCase();
        return TECH_KEYWORDS.stream()
            .filter(keyword -> lowerText.contains(keyword.toLowerCase()))
            .collect(Collectors.toList());
    }
    
    private List<String> generateRoadmap(List<String> missingSkills) {
        return missingSkills.stream()
            .map(skill -> "Learn " + skill + " to improve your alignment.")
            .collect(Collectors.toList());
    }
}
