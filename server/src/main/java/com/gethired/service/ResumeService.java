package com.gethired.service;

import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ResumeService {

    private static final Map<String, List<String>> ROLE_SKILLS = Map.of(
        "SDE",            List.of("Java", "SpringBoot", "Docker", "Kubernetes", "System Design", "SQL", "Algorithms", "Data Structures", "Microservices"),
        "Data Scientist", List.of("Python", "TensorFlow", "PyTorch", "Pandas", "Scikit-Learn", "Machine Learning", "Statistics", "SQL", "Data Visualization"),
        "Frontend Dev",   List.of("React", "JavaScript", "CSS", "HTML", "TypeScript", "Tailwind", "Redux", "Framer Motion", "Next.js"),
        "AI/ML Engineer", List.of("Python", "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "NLP", "Computer Vision", "MLOps", "Model Deployment"),
        "DevOps Engineer",List.of("Docker", "Kubernetes", "CI/CD", "Jenkins", "GitHub Actions", "AWS", "Terraform", "Linux", "Bash Scripting", "Monitoring")
    );

    public Map<String, Object> analyzeResume(String resumeText, String role) {
        List<String> targetSkills = ROLE_SKILLS.getOrDefault(role, ROLE_SKILLS.get("SDE"));
        String lowerText = resumeText == null ? "" : resumeText.toLowerCase();

        List<String> matchedSkills = targetSkills.stream()
            .filter(skill -> lowerText.contains(skill.toLowerCase()))
            .collect(Collectors.toList());

        List<String> missingSkills = targetSkills.stream()
            .filter(skill -> !lowerText.contains(skill.toLowerCase()))
            .collect(Collectors.toList());

        double score = targetSkills.isEmpty() ? 0 :
            (double) matchedSkills.size() / targetSkills.size() * 100;

        List<String> roadmap = missingSkills.isEmpty()
            ? List.of("You are ready for " + role + "! Focus on advanced mock interviews.",
                      "Master system scalability",
                      "Contribute to Open Source")
            : missingSkills.stream()
                .map(skill -> "Complete a production project using " + skill + " to bridge the gap.")
                .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("score", (long) Math.round(score));
        result.put("matchedSkills", matchedSkills);
        result.put("missingSkills", missingSkills);
        result.put("roadmap", roadmap);
        result.put("role", role);
        return result;
    }
}
