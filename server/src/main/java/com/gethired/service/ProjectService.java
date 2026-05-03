package com.gethired.service;

import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class ProjectService {
    
    public Map<String, Object> analyzeProjects(List<String> projectTitles) {
        Map<String, Object> result = new HashMap<>();
        List<String> strengths = new ArrayList<>();
        List<String> weaknesses = new ArrayList<>();
        
        for (String project : projectTitles) {
            if (project.toLowerCase().contains("full stack") || project.toLowerCase().contains("mern")) {
                strengths.add("End-to-end development experience");
            } else if (project.toLowerCase().contains("ai") || project.toLowerCase().contains("ml")) {
                strengths.add("Experience with intelligent systems");
            } else {
                weaknesses.add("Project '" + project + "' could be more complex (add cloud/auth)");
            }
        }
        
        result.put("strengths", strengths);
        result.put("suggestions", weaknesses);
        result.put("reliability", strengths.size() > 0 ? "Reliable" : "Needs work");
        
        return result;
    }
}
