pipeline {
    agent any  // Run the pipeline on any available agent

    environment {
        // Define DockerHub credentials for image login (optional if required)
        DOCKERHUB_CREDENTIALS = credentials('dockerhub')
    }

    stages {
        stage('Checkout') {
            steps {
                // Checkout code from the Git repository, specifying branch and credentials
                git branch: 'louay', credentialsId: 'github', url: 'https://github.com/dhaouzeineb/tp-foyer.git'
            }
        }

        stage('Build') {
            steps {
                // Clean the project to remove any previous builds
                sh 'mvn clean'
            }
        }

        stage('Compile') {
            steps {
                // Compile the project to prepare for packaging
                sh 'mvn compile'
            }
        }

        // Add Trivy Scan stage here to scan the Docker image
        stage('Trivy Scan') {
            steps {
                script {
                    echo 'Running Trivy scan on Docker image from Docker Hub...'

                    // Login to DockerHub (optional if required)
                    sh '''
                        echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin
                    '''

                    // Scan the pre-built Docker image from Docker Hub
                    sh '''
                        docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image --severity HIGH,CRITICAL --format json xhalakox/foyer_backend:latest > trivy-report.json
                    '''

                    // Optional: Display scan result summary
                    sh 'cat trivy-report.json | jq .'
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
