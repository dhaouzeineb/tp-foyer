pipeline {
    agent any  // Run the pipeline on any available agent
    environment {
        // Define the SonarQube scanner tool to be used for code analysis
        SCANNER_HOME = tool 'SonarQube'  
        // Define DockerHub credentials for image login and push stages (currently not used)
        DOCKERHUB_CREDENTIALS = credentials('dockerhub') 
        // GitHub token for Trivy scan
        TRIVY_GITHUB_TOKEN = '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'
    }

            
    stages {

            stage('Declarative: Tool Install') {
            steps {
                // Install Maven
                script {
                    if (!fileExists('/usr/bin/mvn')) {
                        echo "Installing Maven..."
                        sh 'apt-get update && apt-get install -y maven'
                    } else {
                        echo "Maven is already installed"
                    }
                }

                // Install Node.js (if required)
                script {
                    if (!fileExists('/usr/bin/node')) {
                        echo "Installing Node.js..."
                        sh 'curl -sL https://deb.nodesource.com/setup_16.x | bash -'
                        sh 'apt-get install -y nodejs'
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
                // Checkout code from the Git repository, specifying branch and credentials
                git branch: 'louay', credentialsId: 'github', url: 'https://github.com/dhaouzeineb/tp-foyer.git'
            }
        }
        stage('Clean and compile') {
            steps {
                // Clean and compile the project in a single step
                sh 'mvn clean compile'
            }
        }

                stage('JUnit/Mockito Tests') {
            steps {
                sh 'mvn test'
            }
        }
        stage('JaCoCo Coverage Report') {
            steps {
                // Run tests and generate JaCoCo code coverage report
                sh 'mvn clean test jacoco:report'
            }
        }

        stage('JaCoCo Coverage') {
            steps {
                // Publish JaCoCo coverage results
                jacoco execPattern: '**/target/jacoco.exec', 
                       classPattern: '**/target/classes', 
                       sourcePattern: '**/src/main/java', 
                       inclusionPattern: '**/*.class', 
                       exclusionPattern: '**/*Test*'
            }
        }

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
/*
        stage('Push Docker Image to DockerHub') {
            steps {
                // Push the Docker image to DockerHub repository
                sh 'docker push xhalakox/foyer_backend:latest'
            }
        }
*/
        stage('Deploy with Docker Compose') {
            steps {
                // Deploy the application using Docker Compose, detached mode
                sh 'docker-compose up -d'
            }
        }
        
              stage('Prometheus & Grafana (F') {
            steps {
                echo 'Simulating Prometheus & Grafana monitoring...'
                sleep time: 10, unit: 'SECONDS'
            }
        }

        stage('Start Monitoring Containers') {
            steps {
                echo 'Starting to monitor containers...'
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
