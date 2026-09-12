package com.gethired.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Service that communicates with the Google Gemini API for AI-powered analysis.
 */
@Service
public class GeminiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);
    private static final String GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

    @Value("${gemini.api.key:}")
    private String apiKey;

    @Value("${gemini.api.model:gemini-2.0-flash}")
    private String model;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private WebClient webClient;

    @PostConstruct
    public void init() {
        this.webClient = WebClient.builder()
                .baseUrl(GEMINI_BASE_URL)
                .build();
    }

    /**
     * Returns true if the Gemini API key is configured and non-empty.
     */
    public boolean isAvailable() {
        return apiKey != null && !apiKey.isBlank();
    }

    /**
     * Sends a prompt to the Gemini API and returns the raw text response.
     */
    public String generateContent(String prompt) {
        if (!isAvailable()) {
            throw new IllegalStateException("Gemini API key is not configured. Set the GEMINI_API_KEY environment variable.");
        }

        // List of candidate models to try in order
        List<String> modelsToTry = new ArrayList<>();
        if (model != null && !model.isBlank()) {
            modelsToTry.add(model);
        }
        for (String fallback : List.of("gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro")) {
            if (!modelsToTry.contains(fallback)) {
                modelsToTry.add(fallback);
            }
        }

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", prompt)
                        ))
                ),
                "generationConfig", Map.of(
                        "temperature", 0.3,
                        "maxOutputTokens", 4096,
                        "responseMimeType", "application/json"
                )
        );

        Exception lastException = null;
        for (String targetModel : modelsToTry) {
            try {
                log.info("Calling Gemini API with model: {}", targetModel);
                // Use URI.create to prevent Spring WebClient from escaping ':' into '%3A'
                URI targetUri = URI.create(String.format("%s/models/%s:generateContent", GEMINI_BASE_URL, targetModel));
                String responseJson = webClient.post()
                        .uri(targetUri)
                        .header("x-goog-api-key", apiKey.trim())
                        .contentType(MediaType.APPLICATION_JSON)
                        .bodyValue(requestBody)
                        .retrieve()
                        .bodyToMono(String.class)
                        .block();

                JsonNode root = objectMapper.readTree(responseJson);
                JsonNode candidates = root.path("candidates");
                if (candidates.isEmpty()) {
                    log.error("Gemini returned no candidates for model {}. Response: {}", targetModel, responseJson);
                    continue;
                }

                String text = candidates.get(0)
                        .path("content")
                        .path("parts")
                        .get(0)
                        .path("text")
                        .asText();

                return text;
            } catch (WebClientResponseException e) {
                String errorBody = e.getResponseBodyAsString();
                String msg = "HTTP " + e.getStatusCode() + ": " + (errorBody != null && !errorBody.isBlank() ? errorBody : e.getMessage());
                lastException = new RuntimeException(msg, e);
                log.warn("Gemini API call failed with model {}: {}. Trying next fallback if available.", targetModel, msg);
            } catch (Exception e) {
                lastException = e;
                log.warn("Gemini API call failed with model {}: {}. Trying next fallback if available.", targetModel, e.getMessage());
            }
        }

        throw new RuntimeException("Failed to get response from Gemini AI: " + (lastException != null ? lastException.getMessage() : "Unknown error"), lastException);
    }
}
