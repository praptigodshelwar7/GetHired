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
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Service that communicates with the Google Gemini API for AI-powered analysis.
 */
@Service
public class GeminiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);
    private static final String GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

    @Value("${gemini.api.key:}")
    private String rawApiKey;

    @Value("${gemini.api.model:gemini-2.0-flash}")
    private String configuredModel;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private WebClient webClient;
    private final List<String> cachedAvailableModels = new CopyOnWriteArrayList<>();
    private volatile boolean modelsDiscovered = false;

    @PostConstruct
    public void init() {
        this.webClient = WebClient.builder()
                .baseUrl(GEMINI_BASE_URL)
                .build();
    }

    /**
     * Cleans the API key by trimming and removing any surrounding quotes.
     */
    public String getApiKey() {
        if (rawApiKey == null) return "";
        String cleaned = rawApiKey.trim();
        if ((cleaned.startsWith("\"") && cleaned.endsWith("\"")) ||
            (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
            cleaned = cleaned.substring(1, cleaned.length() - 1).trim();
        }
        return cleaned;
    }

    /**
     * Returns true if the Gemini API key is configured and non-empty.
     */
    public boolean isAvailable() {
        return !getApiKey().isBlank();
    }

    /**
     * Discovers all models supported by this API key from Google's ModelService.ListModels.
     */
    public List<String> listAvailableModels() {
        if (!isAvailable()) {
            return Collections.emptyList();
        }
        String key = getApiKey();
        try {
            URI uri = URI.create(String.format("%s/models?key=%s", GEMINI_BASE_URL, key));
            String responseJson = webClient.get()
                    .uri(uri)
                    .header("x-goog-api-key", key)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode root = objectMapper.readTree(responseJson);
            List<String> result = new ArrayList<>();
            if (root.has("models")) {
                for (JsonNode m : root.get("models")) {
                    String name = m.path("name").asText(); // e.g. "models/gemini-1.5-flash"
                    JsonNode methods = m.path("supportedGenerationMethods");
                    boolean canGenerate = false;
                    if (methods.isArray()) {
                        for (JsonNode method : methods) {
                            if ("generateContent".equalsIgnoreCase(method.asText())) {
                                canGenerate = true;
                                break;
                            }
                        }
                    }
                    if (canGenerate) {
                        result.add(name.replaceFirst("^models/", ""));
                    }
                }
            }
            cachedAvailableModels.clear();
            cachedAvailableModels.addAll(result);
            modelsDiscovered = true;
            log.info("Discovered {} Gemini models supporting generateContent: {}", result.size(), result);
            return result;
        } catch (Exception e) {
            log.warn("Failed to discover models via ModelService.ListModels: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    /**
     * Returns diagnostic status about Gemini connection.
     */
    public Map<String, Object> getDiagnostics() {
        String key = getApiKey();
        boolean hasKey = !key.isBlank();
        int keyLength = key.length();
        String maskedKey = hasKey
                ? (keyLength > 8 ? key.substring(0, 4) + "..." + key.substring(keyLength - 4) : "***")
                : "NOT_SET";

        List<String> models = listAvailableModels();
        return Map.of(
                "apiKeyConfigured", hasKey,
                "apiKeyMasked", maskedKey,
                "apiKeyLength", keyLength,
                "configuredModel", configuredModel != null ? configuredModel : "",
                "availableModelsFound", models.size(),
                "availableModels", models
        );
    }

    /**
     * Sends a prompt to the Gemini API and returns the raw text response.
     */
    public String generateContent(String prompt) {
        if (!isAvailable()) {
            throw new IllegalStateException("Gemini API key is not configured. Set the GEMINI_API_KEY environment variable.");
        }
        String key = getApiKey();

        // Discover models for this account if not done yet
        if (!modelsDiscovered) {
            listAvailableModels();
        }

        List<String> modelsToTry = new ArrayList<>();
        List<String> preferredModels = List.of(
                configuredModel != null && !configuredModel.isBlank() ? configuredModel : "gemini-2.0-flash",
                "gemini-2.0-flash",
                "gemini-1.5-flash",
                "gemini-1.5-flash-latest",
                "gemini-2.5-flash",
                "gemini-pro",
                "gemini-1.5-pro"
        );

        if (!cachedAvailableModels.isEmpty()) {
            // Only attempt models that Google verified exist on this key
            for (String pref : preferredModels) {
                if (cachedAvailableModels.contains(pref) && !modelsToTry.contains(pref)) {
                    modelsToTry.add(pref);
                }
            }
            // Add any other valid model returned by Google
            for (String avail : cachedAvailableModels) {
                if (!modelsToTry.contains(avail)) {
                    modelsToTry.add(avail);
                }
            }
        }

        // If list discovery was empty (e.g. rate limit on list), use standard fallbacks
        if (modelsToTry.isEmpty()) {
            for (String pref : preferredModels) {
                if (!modelsToTry.contains(pref)) {
                    modelsToTry.add(pref);
                }
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

        List<String> errors = new ArrayList<>();
        for (String targetModel : modelsToTry) {
            try {
                log.info("Calling Gemini API with model: {}", targetModel);
                // Construct URI with URI.create to prevent Spring from escaping ':' to '%3A'
                URI targetUri = URI.create(String.format("%s/models/%s:generateContent?key=%s", GEMINI_BASE_URL, targetModel, key));
                String responseJson = webClient.post()
                        .uri(targetUri)
                        .header("x-goog-api-key", key)
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
                String msg = targetModel + ": HTTP " + e.getStatusCode().value() + " " + (errorBody != null && !errorBody.isBlank() ? errorBody : e.getMessage());
                errors.add(msg);
                log.warn("Gemini API call failed with model {}: {}", targetModel, msg);
            } catch (Exception e) {
                String msg = targetModel + ": " + e.getMessage();
                errors.add(msg);
                log.warn("Gemini API call failed with model {}: {}", targetModel, e.getMessage());
            }
        }

        throw new RuntimeException("Failed to get response from Gemini AI: " + String.join(" | ", errors));
    }
}
