pipeline {
    agent any  // Run the pipeline on any available agent
    environment {
        // Define DockerHub credentials for image login (if needed)
        DOCKERHUB_CREDENTIALS = credentials('dockerhub') 
    }
    stages {
        stage('Checkout') {
            steps {
                // Checkout code from the Git repository, specifying branch and credentials
                git branch: 'louay', credentialsId: 'github', url: 'https://github.com/dhaouzeineb/tp-foyer.git'
            }
        }

        stage('Trivy Scan') {
            steps {
                script {
                    // Run Trivy scan on the existing image from DockerHub
                    sh 'docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image --severity HIGH,CRITICAL --format json xhalakox/foyer_backend:latest'
                }
            }
        }
    }
    
    post {
        always {
            // Run cleanup steps after the pipeline finishes
            echo 'Pipeline completed, cleaning up...'
        }
        success {
            // Print a success message if the pipeline completes successfully
            echo 'Pipeline executed successfully!'
        }
        failure {
            // Print a failure message if any stage fails
            echo 'Pipeline failed.'
        }
    }
}
