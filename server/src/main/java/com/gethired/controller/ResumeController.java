package com.gethired.controller;

import com.gethired.service.ResumeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/resume")
public class ResumeController {

    @Autowired
    private ResumeService resumeService;

    @PostMapping("/analyze")
    public Map<String, Object> analyze(@RequestBody Map<String, String> request) {
        String resumeText = request.get("resumeText");
        String jd = request.get("jd");
        return resumeService.analyzeResume(resumeText, jd);
    }
}
