pipeline {
    agent any

    environment {
        // Directly using the GitHub token in the environment variable (not recommended for production)
        TRIVY_GITHUB_TOKEN = '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'
    }

    stages {
        stage('Checkout') {
            steps {
                // Checkout the code from your Git repository
                checkout scm
            }
        }

        stage('Trivy Scan') {
            steps {
                script {
                    // Run Trivy image scan with a timeout of 10 minutes
                    try {
                        timeout(time: 10, unit: 'MINUTES') {
                            sh '''
                                # Set GitHub Token for Trivy scan
                                export TRIVY_GITHUB_TOKEN=${TRIVY_GITHUB_TOKEN}

                                # Run Trivy scan with specific severity filters and JSON output
                                trivy image --skip-db-update --severity HIGH,CRITICAL --format json --timeout 10m xhalakox/foyer_backend:latest > trivy-report.json
                            '''
                        }
                    } catch (Exception e) {
                        echo "Trivy scan failed: ${e.getMessage()}"
                        currentBuild.result = 'FAILURE'
                    }
                }
            }
        }
    }

    post {
        always {
            // Archive Trivy scan results (optional)
            archiveArtifacts artifacts: 'trivy-report.json', allowEmptyArchive: true
            echo 'Cleaning up after the scan.'
        }

        success {
            echo 'Trivy scan completed successfully.'
        }

        failure {
            echo 'Trivy scan failed.'
        }
    }
}
