package com.serviceconnect.auth;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(
        properties = {
                "spring.profiles.active=test"
        }
)
class AuthServiceApplicationTests {

    @Test
    void contextLoads() {
    }
}