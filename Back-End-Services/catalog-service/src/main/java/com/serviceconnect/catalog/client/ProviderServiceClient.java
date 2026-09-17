package com.serviceconnect.catalog.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ProviderServiceClient {

    private final RestClient.Builder restClientBuilder;

    @Value("${services.provider.url}")
    private String providerServiceUrl;


    // ============================================================
    // GET APPROVED PROVIDERS
    // ============================================================

    public List<ProviderResponse> getApprovedProviders(
            String authorizationHeader) {

        ProviderPageResponse response =
                restClientBuilder
                        .baseUrl(providerServiceUrl)
                        .build()
                        .get()
                        .uri("/api/v1/providers")
                        .header(
                                HttpHeaders.AUTHORIZATION,
                                authorizationHeader
                        )
                        .retrieve()
                        .body(ProviderPageResponse.class);

        if (response == null
                || response.content() == null) {

            return List.of();
        }

        return response.content();
    }


    // ============================================================
    // GET PROVIDER BY USER ID
    // ============================================================
    //
    // JWT contains USER ID, not provider ID.
    //
    // We resolve:
    //
    // userId -> provider profile -> providerId
    //
    // This is the basis for ownership validation.
    // ============================================================

    public ProviderResponse getProviderByUserId(
            Long userId,
            String authorizationHeader) {

        try {

            ProviderResponse response =
                    restClientBuilder
                            .baseUrl(providerServiceUrl)
                            .build()
                            .get()
                            .uri(
                                    "/api/v1/providers/user/{userId}",
                                    userId
                            )
                            .header(
                                    HttpHeaders.AUTHORIZATION,
                                    authorizationHeader
                            )
                            .retrieve()
                            .body(ProviderResponse.class);

            if (response == null) {

                throw new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Provider profile not found"
                );
            }

            return response;

        } catch (ResponseStatusException exception) {

            throw exception;

        } catch (Exception exception) {

            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Provider profile not found"
            );
        }
    }


    // ============================================================
    // VALIDATE APPROVED PROVIDER
    // ============================================================

    public void validateApprovedProvider(
            Long providerId,
            String authorizationHeader) {

        try {

            var requestSpec =
                    restClientBuilder
                            .baseUrl(providerServiceUrl)
                            .build()
                            .get()
                            .uri(
                                    "/api/v1/providers/{providerId}/public",
                                    providerId
                            );

            if (authorizationHeader != null
                    && !authorizationHeader.isBlank()) {

                requestSpec.header(
                        HttpHeaders.AUTHORIZATION,
                        authorizationHeader
                );
            }

            ProviderResponse response =
                    requestSpec
                            .retrieve()
                            .body(ProviderResponse.class);

            if (response == null
                    || !"APPROVED".equalsIgnoreCase(
                    response.status())) {

                throw new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Approved provider not found"
                );
            }

        } catch (ResponseStatusException exception) {

            throw exception;

        } catch (Exception exception) {

            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Approved provider not found"
            );
        }
    }


    // ============================================================
    // PROVIDER PAGE RESPONSE
    // ============================================================
    //
    // provider-service returns:
    //
    // {
    //   "content": [...],
    //   "page": 0,
    //   "size": 20,
    //   "totalElements": 1,
    //   "totalPages": 1,
    //   "first": true,
    //   "last": true
    // }
    //
    // We only need the content list here.
    // ============================================================

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record ProviderPageResponse(
            List<ProviderResponse> content
    ) {
    }


    // ============================================================
    // PROVIDER RESPONSE
    // ============================================================

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record ProviderResponse(

            Long id,

            Long userId,

            String businessName,

            String description,

            String phone,

            String email,

            String address,

            String city,

            String state,

            String postalCode,

            Double latitude,

            Double longitude,

            String status,

            OffsetDateTime createdAt,

            OffsetDateTime updatedAt,

            Object photos

    ) {
    }
}