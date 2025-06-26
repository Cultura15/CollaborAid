# --- Build Stage ---
# Use Maven with JDK 21 to build the app
FROM maven:3.9.6-eclipse-temurin AS build


# Set working directory inside the container
WORKDIR /app

# Copy Maven project files into the container
COPY backend/pom.xml .
COPY backend/src ./src

# Package the application without running tests
RUN mvn clean package -DskipTests

# --- Runtime Stage ---
# Use a lightweight JDK 21 image to run the app
FROM eclipse-temurin:21-jdk-alpine

# Set working directory
WORKDIR /app

# Copy the built jar from the build stage
COPY --from=build /app/target/*.jar /app/app.jar

# Expose the application port (default for Spring Boot)
EXPOSE 8080

# Run the Spring Boot app
ENTRYPOINT ["java", "-jar", "/app/app.jar"]