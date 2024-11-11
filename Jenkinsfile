pipeline {
    agent any  // Run the pipeline on any available agent

    environment {
        // Define DockerHub credentials for image login and push stages (currently not used)
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

        // Uncomment to run SonarQube code analysis if required
        /*
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('sonar') {
                    // Run SonarQube analysis on the code, setting project properties dynamically
                    sh '''
                        mvn clean verify sonar:sonar \
                          -Dsonar.projectKey=devops \
                          -Dsonar.projectName="devops" \
                          -Dsonar.host.url=http://192.168.33.10:9000 \
                          -Dsonar.token=sqp_2d407004e36c7bfcb71d2f9f8379ca80bdcbd9df
                    '''
                }
            }
        }
        */

        // Uncomment to upload artifact to Nexus if required
        /*
        stage("NEXUS") {
            steps {
                script {
                    // Upload generated JAR artifact to Nexus repository
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
        */

        // Docker build and Trivy scan stages
        stage('Build Docker Image') {
            steps {
                // Build the Docker image from the Dockerfile in the project root
                sh 'docker build -t xhalakox/foyer_backend:latest .'
            }
        }

        // Add Trivy Scan stage here
        stage('Trivy Scan') {
            steps {
                script {
                    echo 'Running Trivy scan...'

                    // Run Trivy scan using Docker container
                    sh '''
                        docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image --severity HIGH,CRITICAL --format json xhalakox/foyer_backend:latest > trivy-report.json
                    '''

                    // Optional: Display scan result summary
                    sh 'cat trivy-report.json | jq .'
                }
            }
        }

        stage('Deploy with Docker Compose') {
            steps {
                // Deploy the application using Docker Compose, detached mode
                sh 'docker-compose up -d'
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
