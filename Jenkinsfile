pipeline {
    agent any
    environment {
        SCANNER_HOME = tool 'SonarQube'  // SonarQube Scanner tool
        DOCKERHUB_CREDENTIALS = credentials('dockerhub')
    }
    stages {
        stage('Checkout') {
            steps {
                // Get code from the Git repository and specify the branch
                git branch: 'louay', credentialsId: 'github', url: 'https://github.com/dhaouzeineb/tp-foyer.git'
            }
        }
        stage('Build') {
            steps {
                // Clean the project
                sh 'mvn clean'
            }
        }
        stage('Compile') {
            steps {
                // Compile the project
                sh 'mvn compile'
            }
        }
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('sonar') {
                    // Run SonarQube analysis with dynamic project keys for each branch
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
        stage('Build Docker Image') {
            steps {
                sh 'docker build -t xhalakox/foyer_backend:latest .'
            }
        }
        /* 
        stage('Docker Login') {
            steps {
                sh 'echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin'
            }
        }
        
        stage('Push Docker Image to DockerHub') {
            steps {
                sh 'docker push xhalakox/foyer_backend:latest'
            }
        }
        */
        stage('Deploy with Docker Compose') {
            steps {
                sh 'docker-compose up -d'
            }
        }
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
