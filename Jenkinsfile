pipeline {
    agent any
    stages {
        stage('Checkout') {
            steps {
                git 'https://github.com/dhaouzeineb/tp-foyer.git' // Remplacez par l'URL de votre repo
            }
        }
        stage('Build') {
            steps {
                sh 'mvn clean compile -U'
            }
        }
        stage('Check Dependencies') {
            steps {
                sh 'mvn dependency:tree'
            }
        }
        stage('Run Tests') {
            steps {
                sh 'mvn test'
            }
        }
    }
}


