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
                withSonarQubeEnv('sonar') {
                    // Run SonarQube analysis with dynamic project keys for each branch
                    sh """
                        $SCANNER_HOME/bin/sonar-scanner \
                        -Dsonar.projectKey=tp-foyer-project-${env.BRANCH_NAME} \
                        -Dsonar.projectName=tp-foyer-${env.BRANCH_NAME} \
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
