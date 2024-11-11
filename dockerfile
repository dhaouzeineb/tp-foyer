FROM openjdk:17-jdk-alpine
EXPOSE 8082

# Add the correct JAR file to the image
ADD target/tp-foyer-5.0.0.jar tp-foyer.jar

# Define the entry point for the Spring Boot application
ENTRYPOINT ["java", "-jar", "/tp-foyer.jar"]
