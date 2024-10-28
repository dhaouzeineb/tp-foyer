pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                // Récupération du code source depuis le dépôt Git
                checkout scm
            }
        }

        stage('Build') {
            steps {
                // Compilation du projet
                sh 'mvn clean compile'
            }
        }

        stage('Test') {
            steps {
                // Exécution des tests avec Mockito
                sh 'mvn test'
            }
        }

        stage('Publish Test Results') {
            steps {
                // Publication des résultats de tests JUnit
                junit '**/target/surefire-reports/*.xml'
            }
        }

        stage('Code Quality Analysis') {
            steps {
                // Analyse de qualité de code avec SonarQube
                // Remplacez 'sonar:sonar' par votre commande SonarQube si nécessaire
                sh 'mvn sonar:sonar'
            }
        }

        stage('Package') {
            steps {
                // Création du package, par exemple un fichier .jar
                sh 'mvn package'
            }
        }

        stage('Docker Build & Publish') {
            steps {
                // Construction et push de l'image Docker si nécessaire
                sh '''
                docker build -t your_docker_repo/your_image_name:latest .
                docker push your_docker_repo/your_image_name:latest
                '''
            }
        }
    }

    post {
        success {
            echo 'Pipeline exécuté avec succès !'
        }
        failure {
            echo 'Échec du pipeline, vérifiez les logs pour plus de détails.'
        }
        always {
            // Nettoyage des fichiers temporaires de l'espace de travail
            cleanWs()
        }
    }
}
