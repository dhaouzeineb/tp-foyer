# Étape 1 : Utiliser une image Maven pour construire l'application
FROM maven:3.8.4-openjdk-17 AS build
WORKDIR /app

# Copier uniquement le fichier pom.xml et télécharger les dépendances au préalable
COPY pom.xml ./
RUN mvn dependency:go-offline -B

# Copier les sources et construire l'application
COPY src ./src
RUN mvn clean package -DskipTests

# Étape 2 : Utiliser une image légère Java pour exécuter l'application
FROM openjdk:17-jdk-slim
WORKDIR /app

# Copier le fichier JAR généré depuis l'étape de construction
COPY --from=build /app/target/*.jar app.jar

# Copier le script wait-for-it.sh
COPY src/main/resources/wait-for-it.sh /app/wait-for-it.sh
RUN chmod +x /app/wait-for-it.sh

# Exposer le port de l'application
EXPOSE 8080

# Configurer l'ENTRYPOINT pour attendre que la base de données soit prête avant de démarrer
ENTRYPOINT ["/app/wait-for-it.sh", "database:3306", "--", "java", "-jar", "app.jar"]


