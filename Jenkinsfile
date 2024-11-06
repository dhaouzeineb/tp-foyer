pipeline {
    agent any
    environment {
        SCANNER_HOME = tool 'SonarQube'  // Declare the SonarQube Scanner tool
    }
    stages {
        stage('Checkout') {
            steps {
                // Get code from the Git repository and specify the branch
                git branch: 'louay', credentialsId: 'github', url: 'https://github.com/dhaouzeineb/tp-foyer.git'
            }
        }
        stage('Build') {
            steps {
                // Command to clean the project
                sh 'mvn clean'
            }
        }
        stage('Compile') {
            steps {
                // Command to compile the project
                sh 'mvn compile'
            }
        }
        stage('SonarQube Analysis') {
            steps {
                // Configure SonarQube analysis
                withSonarQubeEnv('sonar') {
                    sh """
                        $SCANNER_HOME/bin/sonar-scanner \
                        -Dsonar.projectKey=tp-foyer-project \
                        -Dsonar.projectName=tp-foyer \
                        -Dsonar.sources=src \
                        -Dsonar.java.binaries=target/classes
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