# Utiliser l'image officielle de OpenJDK comme image de base
FROM openjdk:17-jdk-slim

# Spécifier le répertoire de travail dans l'image
WORKDIR /app

# Copier le fichier JAR généré par Maven dans l'image
COPY --from=build /app/target/*.jar app.jar

# Exposer le port sur lequel l'application va écouter
EXPOSE 8089

# Commande pour exécuter l'application Java
ENTRYPOINT ["java", "-jar", "app.jar"]
