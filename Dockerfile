FROM openjdk:17-jdk-alpine
EXPOSE 8089
COPY target/tp-foyer-5.0.0.jar tp-foyer-5.0.0.jar
COPY . .
ENTRYPOINT ["java", "-jar", "/tp-foyer-5.0.0.jar"]
