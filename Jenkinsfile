pipeline {
    agent any

    environment {
        SCANNER_HOME = tool 'SonarQube'  
        DOCKERHUB_CREDENTIALS = credentials('dockerhub') 
        TRIVY_GITHUB_TOKEN = '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'
    }

    stages {
        stage('Declarative: Checkout SCM') {
            steps {
                checkout scm
            }
        }

        stage('Declarative: Tool Install') {
            steps {
                // This is typically used to set up any required tools like Maven or Node.js
                echo "Installing necessary tools"
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
