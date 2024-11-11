pipeline {
    agent any

    environment {
        TRIVY_GITHUB_TOKEN = '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'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Trivy Scan') {
            steps {
                script {
                    // Run Trivy scan using cached DB (skipping DB update)
                    try {
                        timeout(time: 10, unit: 'MINUTES') {
                            sh '''
                                export TRIVY_GITHUB_TOKEN=${TRIVY_GITHUB_TOKEN}
                                trivy image --skip-db-update --severity HIGH,CRITICAL --format json xhalakox/foyer_backend:latest
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
        success {
            echo 'Trivy scan completed successfully.'
        }

        failure {
            echo 'Trivy scan failed.'
        }
    }
}
