FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /workspace
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw mvnw.cmd ./
RUN mvn dependency:go-offline -B
COPY src src
RUN mvn package -B

FROM eclipse-temurin:17-jre

WORKDIR /app
COPY --from=build /workspace/target/backend-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
