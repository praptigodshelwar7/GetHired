package com.gethired.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ResumeService {

    private static final Logger log = LoggerFactory.getLogger(ResumeService.class);

    @Autowired
    private GeminiService geminiService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // ─── Fallback: rule-based skill map with synonyms/aliases ───────────────
    private static final Map<String, List<List<String>>> ROLE_SKILLS_ALIASES = Map.of(
        "SDE", List.of(
            List.of("Java"),
            List.of("Spring Boot", "SpringBoot", "Spring"),
            List.of("Docker", "Container"),
            List.of("Kubernetes", "K8s"),
            List.of("System Design", "System Architecture", "HLD", "LLD", "Distributed Systems"),
            List.of("SQL", "PostgreSQL", "MySQL", "Database"),
            List.of("Algorithms", "Algorithm", "DSA"),
            List.of("Data Structures", "Data Structure", "DSA"),
            List.of("Microservices", "REST", "API")
        ),
        "Data Scientist", List.of(
            List.of("Python"),
            List.of("TensorFlow"),
            List.of("PyTorch"),
            List.of("Pandas"),
            List.of("Scikit-Learn", "Sklearn"),
            List.of("Machine Learning", "ML"),
            List.of("Statistics", "Statistical"),
            List.of("SQL"),
            List.of("Data Visualization", "Matplotlib", "Seaborn", "Tableau")
        ),
        "Frontend Dev", List.of(
            List.of("React", "React.js"),
            List.of("JavaScript", "JS"),
            List.of("CSS", "CSS3"),
            List.of("HTML", "HTML5"),
            List.of("TypeScript", "TS"),
            List.of("Tailwind", "TailwindCSS"),
            List.of("Redux"),
            List.of("Framer Motion"),
            List.of("Next.js", "NextJS")
        ),
        "AI/ML Engineer", List.of(
            List.of("Python"),
            List.of("Machine Learning", "ML"),
            List.of("Deep Learning", "DL", "Neural Networks"),
            List.of("TensorFlow"),
            List.of("PyTorch"),
            List.of("NLP", "Natural Language Processing", "LLM"),
            List.of("Computer Vision", "CV", "OpenCV"),
            List.of("MLOps"),
            List.of("Model Deployment")
        ),
        "DevOps Engineer", List.of(
            List.of("Docker", "Containers"),
            List.of("Kubernetes", "K8s"),
            List.of("CI/CD", "Continuous Integration"),
            List.of("Jenkins"),
            List.of("GitHub Actions"),
            List.of("AWS", "Cloud"),
            List.of("Terraform"),
            List.of("Linux", "Unix"),
            List.of("Bash Scripting", "Bash", "Shell"),
            List.of("Monitoring", "Prometheus", "Grafana")
        )
    );

    /**
     * Primary entry point: tries AI-powered analysis first, falls back to rule-based.
     */
    public Map<String, Object> analyzeResume(String resumeText, String role) {
        if (geminiService.isAvailable()) {
            try {
                return analyzeWithAI(resumeText, role);
            } catch (Exception e) {
                log.warn("AI analysis failed, falling back to rule-based analysis: {}", e.getMessage());
            }
        } else {
            log.info("Gemini API key not configured. Using rule-based analysis.");
        }
        return analyzeWithRules(resumeText, role);
    }

    // ─── AI-Powered Analysis ─────────────────────────────────────────────────
    private Map<String, Object> analyzeWithAI(String resumeText, String role) {
        // Truncate to ~8000 chars to keep within token limits
        String truncated = resumeText != null && resumeText.length() > 8000
                ? resumeText.substring(0, 8000) : (resumeText != null ? resumeText : "");

        String prompt = buildPrompt(truncated, role);
        String aiResponse = geminiService.generateContent(prompt);

        // Strip markdown code fences if present (e.g. ```json ... ```)
        String cleanedJson = aiResponse != null ? aiResponse.trim() : "";
        if (cleanedJson.startsWith("```json")) {
            cleanedJson = cleanedJson.substring(7);
        } else if (cleanedJson.startsWith("```")) {
            cleanedJson = cleanedJson.substring(3);
        }
        if (cleanedJson.endsWith("```")) {
            cleanedJson = cleanedJson.substring(0, cleanedJson.length() - 3);
        }
        cleanedJson = cleanedJson.trim();

        try {
            Map<String, Object> parsed = objectMapper.readValue(
                    cleanedJson, new TypeReference<Map<String, Object>>() {});

            // Validate & normalize required fields
            Map<String, Object> result = new HashMap<>();
            result.put("score", toScore(parsed.get("score")));
            result.put("matchedSkills", toStringList(parsed.get("matchedSkills")));
            result.put("missingSkills", toStringList(parsed.get("missingSkills")));
            result.put("roadmap", toStringList(parsed.get("roadmap")));
            result.put("summary", parsed.getOrDefault("summary", ""));
            result.put("strengths", toStringList(parsed.get("strengths")));
            result.put("role", role);
            result.put("aiPowered", true);

            return result;
        } catch (Exception e) {
            log.error("Failed to parse AI response: {}", aiResponse, e);
            throw new RuntimeException("Failed to parse AI analysis result", e);
        }
    }

    private String buildPrompt(String resumeText, String role) {
        return """
            You are an elite career coach, senior tech recruiter, and hiring manager at a top tech company.
            Analyze the following resume thoroughly for a candidate targeting the "%s" role.

            RESUME TEXT:
            ---
            %s
            ---

            Provide your analysis as a JSON object with EXACTLY these fields:

            {
              "score": <number 0-100, fair assessment of how well the candidate matches the target role>,
              "matchedSkills": [<list of relevant skills, tools, frameworks, and concepts explicitly found or demonstrated in the resume>],
              "missingSkills": [<list of important skills for the target role that are genuinely missing from the resume>],
              "strengths": [<3-5 standout strengths you identified in this candidate's profile>],
              "summary": "<A 2-3 sentence executive summary of the candidate's profile and fit for the role>",
              "roadmap": [<5-7 specific, actionable next steps the candidate should take to level up for this role>]
            }

            CRITICAL ACCURACY RULES FOR SKILLS:
            - Inspect EVERY section of the resume (Skills, Technical Experience, Projects, Internships, Education, Coursework, Bullet Points).
            - If a skill or technology is present anywhere in the resume (for example: Spring Boot, Java, Kubernetes, Docker, System Design, Algorithms, Data Structures, DSA, SQL, Git, etc.), you MUST categorize it under "matchedSkills" and NEVER in "missingSkills"!
            - Normalize skill names cleanly (e.g. "Spring Boot", "Data Structures & Algorithms", "System Design", "Docker", "Kubernetes").
            - "missingSkills" must ONLY contain technologies or concepts that are key for the "%s" role but COMPLETELY ABSENT from the resume.
            - Return ONLY valid JSON, with NO surrounding markdown backticks and NO extra text.
            """.formatted(role, resumeText, role);
    }

    // ─── Rule-Based Fallback ─────────────────────────────────────────────────
    private Map<String, Object> analyzeWithRules(String resumeText, String role) {
        List<List<String>> skillGroups = ROLE_SKILLS_ALIASES.getOrDefault(role, ROLE_SKILLS_ALIASES.get("SDE"));
        String lowerText = resumeText == null ? "" : resumeText.toLowerCase();

        List<String> matchedSkills = new ArrayList<>();
        List<String> missingSkills = new ArrayList<>();

        for (List<String> aliases : skillGroups) {
            String primaryName = aliases.get(0);
            boolean matched = aliases.stream()
                .anyMatch(alias -> lowerText.contains(alias.toLowerCase()));

            if (matched) {
                matchedSkills.add(primaryName);
            } else {
                missingSkills.add(primaryName);
            }
        }

        double score = skillGroups.isEmpty() ? 0 :
            (double) matchedSkills.size() / skillGroups.size() * 100;

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
        result.put("summary", "Analysis completed using rule-based profile matching.");
        result.put("strengths", List.of("Demonstrated profile experience in " + String.join(", ", matchedSkills)));
        result.put("role", role);
        result.put("aiPowered", false);
        return result;
    }

    // ─── Utility methods ─────────────────────────────────────────────────────
    private long toScore(Object value) {
        if (value instanceof Number) return ((Number) value).longValue();
        try { return Long.parseLong(String.valueOf(value)); }
        catch (Exception e) { return 0; }
    }

    @SuppressWarnings("unchecked")
    private List<String> toStringList(Object value) {
        if (value instanceof List) {
            return ((List<?>) value).stream()
                    .map(String::valueOf)
                    .collect(Collectors.toList());
        }
        return List.of();
    }
}
