pipeline {
    agent any
    environment {
        SCANNER_HOME = tool 'SonarQube'
        DOCKERHUB_CREDENTIALS = credentials('dockerhub')
    }
    stages {
        stage('Checkout') {
            steps {
                git branch: 'louay', credentialsId: 'github', url: 'https://github.com/dhaouzeineb/tp-foyer.git'
            }
        }

        stage('Build') {
            steps {
                sh 'mvn clean'
            }
        }

        stage('Compile') {
            steps {
                sh 'mvn compile'
            }
        }

        stage('Jacoco Report') {
            steps {
                sh 'mvn jacoco:report'
            }
        }

        stage('Publish Coverage') {
            steps {
                jacoco execPattern: '**/target/jacoco.exec',
                       classPattern: '**/target/classes',
                       sourcePattern: '**/src/main/java',
                       inclusionPattern: '*/.class',
                       exclusionPattern: '*/*Test'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('sonar') {
                    sh '''
                        mvn clean verify sonar:sonar \
                          -Dsonar.projectKey=devops \
                          -Dsonar.projectName="devops" \
                          -Dsonar.host.url=http://192.168.33.10:9000 \
                          -Dsonar.token=sqp_2d407004e36c7bfcb71d2f9f8379ca80bdcbd9df
                    '''
                }
            }
        }

        stage('NEXUS') {
            steps {
                script {
                    nexusArtifactUploader artifacts: [[
                        artifactId: 'tp-foyer',
                        classifier: '',
                        file: 'target/tp-foyer-5.0.0.jar',
                        type: 'jar'
                    ]],
                    credentialsId: 'nexus',
                    groupId: 'esprit.tn',
                    nexusUrl: '192.168.33.10:8081',
                    nexusVersion: 'nexus3',
                    protocol: 'http',
                    repository: 'maven-hosted',
                    version: "0.0.1-$BUILD_NUMBER"
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t xhalakox/foyer_backend:latest .'
            }
        }

        stage('Docker Login') {
            steps {
                sh 'echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin'
            }
        }

        stage('Push Docker Image to DockerHub') {
            steps {
                sh 'docker push xhalakox/foyer_backend:latest'
            }
        }

        stage('Deploy with Docker Compose') {
            steps {
                sh 'docker-compose up -d'
            }
        }

        // New stages for monitoring with Prometheus and Grafana
        stage('Start Prometheus') {
            steps {
                sh 'docker run -d --name prometheus -p 9090:9090 prom/prometheus'
            }
        }

        stage('Start Grafana') {
            steps {
                sh 'docker run -d --name grafana -p 3000:3000 grafana/grafana'
            }
        }

        stage('Configure Prometheus for Jenkins') {
            steps {
                script {
                    sh """
                    docker exec -it prometheus sh -c '
                    echo "
                    - job_name: jenkins
                      metrics_path: /prometheus
                      static_configs:
                        - targets: [\\"192.168.1.244:8080\\"]" >> /etc/prometheus/prometheus.yml
                    '
                    docker restart prometheus
                    """
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline completed, cleaning up...'
        }
        success {
            echo 'Pipeline executed successfully!'
        }
        failure {
            echo 'Pipeline failed.'
        }
    }
}
