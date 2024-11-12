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
                // Install Maven (with sudo)
                script {
                    if (!fileExists('/usr/bin/mvn')) {
                        echo "Installing Maven..."
                        sh 'sudo apt-get update && sudo apt-get install -y maven'
                    } else {
                        echo "Maven is already installed"
                    }
                }

                // Install Node.js (with sudo)
                script {
                    if (!fileExists('/usr/bin/node')) {
                        echo "Installing Node.js..."
                        sh 'curl -sL https://deb.nodesource.com/setup_16.x | sudo bash -'
                        sh 'sudo apt-get install -y nodejs'
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

        // ... Other stages follow
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
