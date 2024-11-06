FROM openjdk:17-jdk-alpine
EXPOSE 8082

# Create a non-root user
RUN adduser -D myuser

# Add the correct JAR file to the image
COPY target/tp-foyer-5.0.0.jar tp-foyer.jar

# Switch to the non-root user
USER myuser

# Define the entry point for the Spring Boot application
ENTRYPOINT ["java", "-jar", "/tp-foyer.jar"]

# Add a health check to ensure the application is running
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl --fail http://localhost:8082/actuator/health || exit 1
