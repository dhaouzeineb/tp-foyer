pipeline {
    agent any

    environment {
        // Using the SMTP credentials stored under the 'smtp' credential ID
        SMTP_CREDENTIALS = credentials('smtp')  // Replace 'smtp' with the actual credential ID
    }

    stages {
        stage('Test SMTP Email Notification') {
            steps {
                script {
                    // Fetch SMTP credentials from Jenkins' credentials system
                    def smtpUser = SMTP_CREDENTIALS.username  // Access SMTP username from the credentials
                    def smtpPassword = SMTP_CREDENTIALS.password  // Access SMTP password from the credentials
                    
                    // Send an email using the SMTP credentials
                    emailext (
                        to: 'you@example.com',  // Replace with your email
                        subject: "SMTP Test - Build ${currentBuild.fullDisplayName}",
                        body: "This is a test email sent from Jenkins. The build ${currentBuild.fullDisplayName} finished with status ${currentBuild.result}.",
                        mimeType: 'text/html',
                        smtpHost: 'smtp.example.com',  // Replace with your SMTP server (e.g., smtp.gmail.com)
                        smtpPort: '587',  // Use appropriate SMTP port (587 for TLS)
                        smtpUser: smtpUser,  // Use SMTP username from Jenkins credentials
                        smtpPassword: smtpPassword,  // Use SMTP password from Jenkins credentials
                        debug: true
                    )
                }
            }
        }

        // Commenting out the other stages for now to focus on testing the SMTP functionality

        /*
        stage('Declarative: Checkout SCM') {
            steps {
                checkout scm
            }
        }

        stage('Declarative: Tool Install') {
            steps {
                script {
                    if (!fileExists('/usr/bin/mvn')) {
                        echo "Installing Maven..."
                        sh 'apt-get update && apt-get install -y maven'
                    } else {
                        echo "Maven is already installed"
                    }
                }

                script {
                    if (!fileExists('/usr/bin/node')) {
                        echo "Installing Node.js..."
                        sh 'curl -sL https://deb.nodesource.com/setup_16.x | bash -'
                        sh 'apt-get install -y nodejs'
                    } else {
                        echo "Node.js is already installed"
                    }
                }

                echo "All necessary tools installed"
            }
        }

        stage('GIT') {
            steps {
                git branch: 'louay', credentialsId: 'github', url: 'https://github.com/dhaouzeineb/tp-foyer.git'
            }
        }

        stage('Compile Stage') {
            steps {
                sh 'mvn clean compile'
            }
        }

        stage('JUnit/Mockito Tests') {
            steps {
                sh 'mvn test'
            }
        }

        stage('JaCoCo Report') {
            steps {
                sh 'mvn jacoco:prepare-agent test jacoco:report'
            }
        }

        stage('JaCoCo Coverage Report') {
            steps {
                jacoco execPattern: '**/target/jacoco.exec', 
                       classPattern: '**/target/classes', 
                       sourcePattern: '**/src/main/java', 
                       inclusionPattern: '**/*.class', 
                       exclusionPattern: '**/*Test*'
            }
        }

        stage('Scan : SonarQube') {
            steps {
                withSonarQubeEnv('sonar') {
                    sh '''
                        mvn sonar:sonar \
                          -Dsonar.projectKey=devops \
                          -Dsonar.projectName="devops" \
                          -Dsonar.host.url=http://192.168.33.10:9000 \
                          -Dsonar.token=sqp_2d407004e36c7bfcb71d2f9f8379ca80bdcbd9df
                    '''
                }
            }
        }

        stage('Deploy to Nexus') {
            steps {
                script {
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

        stage('Building Image') {
            steps {
                sh 'docker build -t xhalakox/foyer_backend:latest .'
            }
        }

        stage('Deploy Image') {
            steps {
                sh 'docker push xhalakox/foyer_backend:latest'
            }
        }

        stage('Docker Compose') {
            steps {
                sh 'docker-compose up -d'
            }
        }

        stage('Prometheus & Grafana (Fake Monitoring)') {
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
        */

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
