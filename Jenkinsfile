pipeline {
    agent any
    stages {
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

