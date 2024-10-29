pipeline {
    agent any
 
    stages {
        stage('Checkout') {
            steps {
                // Récupérer le code du dépôt Git en spécifiant la branche
                git branch: 'hassen', credentialsId: 'GitHub-Credentials', url: 'https://github.com/dhaouzeineb/tp-foyer.git'
            }
        }
        stage('Build') {
            steps {
                // Commande pour nettoyer le projet
                sh 'mvn clean'
            }
        }
        stage('Compile') {
            steps {
                // Commande pour compiler le projet
                sh 'mvn compile'
            }
        }
    }
 
    post {
        always {
            echo 'Pipeline terminé, nettoyage...'
        }
        success {
            echo 'Pipeline exécuté avec succès !'
        }
        failure {
            echo 'Échec du pipeline.'
        }
    }
}
