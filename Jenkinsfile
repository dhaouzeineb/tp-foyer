pipeline {
    agent any  // Run the pipeline on any available agent
    environment {
        // Define the SonarQube scanner tool to be used for code analysis
        SCANNER_HOME = tool 'SonarQube'  
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

        // Add the Pre-commit stage to run code checks
        stage('Pre-commit') {
            steps {
                // Run pre-commit checks (this assumes pre-commit is installed and configured)
                sh 'pre-commit run --all-files'
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

        // Uncomment to upload artifact to Nexus if required
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

        // Docker stages are disabled for now
        /*
        stage('Build Docker Image') {
            steps {
                // Build the Docker image from the Dockerfile in the project root
                sh 'docker build -t xhalakox/foyer_backend:latest .'
            }
        }

        stage('Docker Login') {
            steps {
                // Log in to DockerHub using credentials from environment variables
                sh 'echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin'
            }
        }

        stage('Push Docker Image to DockerHub') {
            steps {
                // Push the Docker image to DockerHub repository
                sh 'docker push xhalakox/foyer_backend:latest'
            }
        }

        stage('Deploy with Docker Compose') {
            steps {
                // Deploy the application using Docker Compose, detached mode
                sh 'docker-compose up -d'
            }
        }
        */
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
