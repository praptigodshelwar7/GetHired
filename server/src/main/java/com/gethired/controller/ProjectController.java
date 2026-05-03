package com.gethired.controller;

import com.gethired.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "*")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @PostMapping("/analyze")
    public Map<String, Object> analyzeProjects(@RequestBody List<String> projectTitles) {
        return projectService.analyzeProjects(projectTitles);
    }
}
