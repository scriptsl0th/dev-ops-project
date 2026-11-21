pipeline {
    agent any

    environment {
        DOCKERHUB_USER = 'your-dockerhub-username'
        APP_NAME       = 'dev-ops-project'
        IMAGE_TAG      = "${env.BUILD_NUMBER}"
        CI             = 'true'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Backend') {
            steps {
                dir('backend') {
                    sh 'chmod +x mvnw'
                    sh './mvnw clean package -DskipTests'
                }
            }
        }

        stage('Test Backend') {
            steps {
                dir('backend') {
                    sh './mvnw test'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm ci'
                    sh 'npm run build'
                }
            }
        }

        stage('Test Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm test'
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh '''
                        sonar-scanner \
                          -Dsonar.host.url=${SONAR_HOST_URL} \
                          -Dsonar.token=${SONAR_AUTH_TOKEN}
                    '''
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Build & Push Frontend + Backend') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DH_USER',
                    passwordVariable: 'DH_PASS'
                )]) {
                    sh '''
                        echo "$DH_PASS" | docker login -u "$DH_USER" --password-stdin

                        docker build \
                          -t "${DOCKERHUB_USER}/${APP_NAME}-frontend:${IMAGE_TAG}" \
                          -t "${DOCKERHUB_USER}/${APP_NAME}-frontend:latest" \
                          ./frontend

                        docker build \
                          -t "${DOCKERHUB_USER}/${APP_NAME}-backend:${IMAGE_TAG}" \
                          -t "${DOCKERHUB_USER}/${APP_NAME}-backend:latest" \
                          ./backend

                        docker push "${DOCKERHUB_USER}/${APP_NAME}-frontend:${IMAGE_TAG}"
                        docker push "${DOCKERHUB_USER}/${APP_NAME}-frontend:latest"
                        docker push "${DOCKERHUB_USER}/${APP_NAME}-backend:${IMAGE_TAG}"
                        docker push "${DOCKERHUB_USER}/${APP_NAME}-backend:latest"

                        docker logout
                    '''
                }
            }
        }
    }

    post {
        always {
            sh 'docker image prune -f || true'
        }
    }
}
