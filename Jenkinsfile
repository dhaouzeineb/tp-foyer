pipeline {
    agent any

    environment {
        SCANNER_HOME = tool 'SonarQube'  
        DOCKERHUB_CREDENTIALS = credentials('dockerhub') 
    }

    stages {
        stage('Declarative: Checkout SCM') {
            steps {
                checkout scm
            }
        }

        stage('Declarative: Tool Install') {
            steps {
                // Install Maven
                script {
                    if (!fileExists('/usr/bin/mvn')) {
                        echo "Installing Maven..."
                        sh 'apt-get update && apt-get install -y maven'
                    } else {
                        echo "Maven is already installed"
                    }
                }

                // Install Node.js (if required)
                script {
                    if (!fileExists('/usr/bin/node')) {
                        echo "Installing Node.js..."
                        sh 'curl -sL https://deb.nodesource.com/setup_16.x | bash -'
                        sh 'apt-get install -y nodejs'
                    } else {
                        echo "Node.js is already installed"
                    }
                }

                // Add more tools here as needed
                echo "All necessary tools installed"
            }
        }

        stage('GIT') {
            steps {
                git branch: 'louay', credentialsId: 'github', url: 'https://github.com/dhaouzeineb/tp-foyer.git'
            }
        }

        stage('Compile Stage') {
            steps {
                sh 'mvn clean compile'
            }
        }

        stage('JUnit/Mockito Tests') {
            steps {
                sh 'mvn test'
            }
        }

        stage('JaCoCo Report') {
            steps {
                sh 'mvn jacoco:prepare-agent test jacoco:report'
            }
        }

        stage('JaCoCo Coverage Report') {
            steps {
                jacoco execPattern: '**/target/jacoco.exec', 
                       classPattern: '**/target/classes', 
                       sourcePattern: '**/src/main/java', 
                       inclusionPattern: '**/*.class', 
                       exclusionPattern: '**/*Test*'
            }
        }

        stage('Scan : SonarQube') {
            steps {
                withSonarQubeEnv('sonar') {
                    sh '''
                        mvn sonar:sonar \
                          -Dsonar.projectKey=devops \
                          -Dsonar.projectName="devops" \
                          -Dsonar.host.url=http://192.168.33.10:9000 \
                          -Dsonar.token=sqp_2d407004e36c7bfcb71d2f9f8379ca80bdcbd9df
                    '''
                }
            }
        }

        stage('Deploy to Nexus') {
            steps {
                script {
                    nexusArtifactUploader(
                        artifacts: [[
                            artifactId: 'tp-foyer',
                            classifier: '',
                            file: 'target/tp-foyer-5.0.0.jar',
                            type: 'jar'
                        ]],
                        credentialsId: 'nexus',   // Ensure this credential is correctly configured in Jenkins
                        groupId: 'esprit.tn',
                        nexusUrl: 'http://192.168.33.10:8081',  // Ensure full URL with protocol
                        nexusVersion: 'nexus3',    // If using Nexus 3, this is correct
                        protocol: 'http',
                        repository: 'maven-hosted',   // Ensure 'maven-hosted' repository is available in Nexus
                        version: "0.0.1-${env.BUILD_NUMBER}"   // Correct dynamic version using Jenkins environment variable
                    )
                }
            }
        }

        stage('Building Image') {
            steps {
                sh 'docker build -t xhalakox/foyer_backend:latest .'
            }
        }

        stage('Deploy Image') {
            steps {
                sh 'docker push xhalakox/foyer_backend:latest'
            }
        }

        stage('Docker Compose') {
            steps {
                sh 'docker-compose up -d'
            }
        }

        stage('Prometheus & Grafana (Fake Monitoring)') {
            steps {
                echo 'Simulating Prometheus & Grafana monitoring...'
                sleep time: 10, unit: 'SECONDS'
            }
        }

        stage('Start Monitoring Containers') {
            steps {
                // Add your monitoring command or script here
                echo 'Starting to monitor containers...'
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
