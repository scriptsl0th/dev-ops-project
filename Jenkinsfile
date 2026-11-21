pipeline {
    agent any

    tools {
        jdk 'jdk17'
    }

    environment {
        DOCKERHUB_USER = 'scriptsl0th'
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

        stage('Check Tools') {
            steps {
                sh 'java -version'
                sh 'javac -version'
                sh 'chmod +x backend/mvnw'
                sh './backend/mvnw -version'
                sh 'node -v'
                sh 'npm -v'
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

        stage('Deploy to Minikube') {
            steps {
                sh '''
                    kubectl version --client
                    kubectl cluster-info
                    kubectl get nodes
                    kubectl apply --validate=false -f k8s/namespace.yaml
                    kubectl get namespace devops-app
                    sleep 5
                    kubectl apply --validate=false -f k8s/postgres-secret.yaml
                    kubectl apply --validate=false -f k8s/postgres-pvc.yaml
                    kubectl apply --validate=false -f k8s/postgres-service.yaml
                    kubectl apply --validate=false -f k8s/postgres-deployment.yaml
                    kubectl apply --validate=false -f k8s/backend-service.yaml
                    kubectl apply --validate=false -f k8s/backend-deployment.yaml
                    kubectl apply --validate=false -f k8s/frontend-service.yaml
                    kubectl apply --validate=false -f k8s/frontend-deployment.yaml

                    kubectl -n devops-app set image deployment/dev-ops-frontend \
                      frontend="${DOCKERHUB_USER}/${APP_NAME}-frontend:${IMAGE_TAG}"

                    kubectl -n devops-app set image deployment/dev-ops-backend \
                      backend="${DOCKERHUB_USER}/${APP_NAME}-backend:${IMAGE_TAG}"

                    kubectl -n devops-app rollout status deployment/postgres --timeout=180s
                    kubectl -n devops-app rollout status deployment/dev-ops-backend --timeout=180s
                    kubectl -n devops-app rollout status deployment/dev-ops-frontend --timeout=180s

                    kubectl -n devops-app get pods
                    kubectl -n devops-app get services
                '''
            }
        }
    }

    post {
        always {
            sh 'docker image prune -f || true'
        }
    }
}
