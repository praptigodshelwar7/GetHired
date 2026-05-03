package com.gethired.controller;

import com.gethired.service.DSAService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/dsa")
@CrossOrigin(origins = "*")
public class DSAController {

    @Autowired
    private DSAService dsaService;

    @GetMapping("/progress")
    public Map<String, Object> getProgress(@RequestParam int solved, @RequestParam String company) {
        return dsaService.getProgress(solved, company);
    }
}
