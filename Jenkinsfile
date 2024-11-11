pipeline {
    agent any

    environment {
        IMAGE_NAME = 'xhalakox/foyer_backend:latest'
    }

    stages {
        stage('Build') {
            steps {
                echo "Building the Docker image..."
                script {
                    // Assuming you have a Dockerfile in your repository
                    docker.build("${IMAGE_NAME}")
                }
            }
        }
        
        stage('Trivy Scan') {
            steps {
                echo "Running Trivy scan for vulnerabilities..."
                script {
                    // Run Trivy scan with --skip-db-update flag
                    sh """
                        trivy image --skip-db-update --severity HIGH,CRITICAL --format json ${IMAGE_NAME} > trivy-report.json
                    """
                }
            }
        }

        stage('Post-Scan Actions') {
            steps {
                echo "Processing Trivy scan results..."
                script {
                    // You can process or publish the scan result as needed
                    // For example, you can archive the result or send a notification based on the scan outcome
                    def trivyReport = readFile('trivy-report.json')
                    echo "Trivy scan results: ${trivyReport}"
                    
                    // Optionally, you can fail the build if there are vulnerabilities
                    def json = readJSON text: trivyReport
                    def criticalIssues = json.findAll { it.Vulnerability.Severity == 'CRITICAL' }
                    def highIssues = json.findAll { it.Vulnerability.Severity == 'HIGH' }

                    if (criticalIssues.size() > 0 || highIssues.size() > 0) {
                        currentBuild.result = 'FAILURE'
                        error("High or Critical vulnerabilities found in image.")
                    }
                }
            }
        }
    }

    post {
        always {
            echo "Cleaning up or finalizing the process..."
            // You can also archive or publish the scan report here, if needed
            archiveArtifacts artifacts: 'trivy-report.json', allowEmptyArchive: true
        }
        success {
            echo "Pipeline completed successfully!"
        }
        failure {
            echo "Pipeline failed. Check Trivy scan for vulnerabilities."
        }
    }
}
