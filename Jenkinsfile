pipeline {
    agent any

    environment {
        // Set your GitHub token here
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
                                export TRIVY_GITHUB_TOKEN=${TRIVY_GITHUB_TOKEN}
                                trivy image --skip-db-update --severity HIGH,CRITICAL --format json --timeout 10m xhalakox/foyer_backend:latest
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
            // Cleanup actions (if necessary)
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
