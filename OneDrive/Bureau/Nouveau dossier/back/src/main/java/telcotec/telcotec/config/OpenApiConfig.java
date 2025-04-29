package telcotec.telcotec.config;

import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public GroupedOpenApi publicApi() {
        return GroupedOpenApi.builder()
                .group("public-api")
                .packagesToScan("telcotec.telcotec.controller")  // Specify your controller package
                .pathsToMatch("/**")  // All paths
                .build();
    }
}