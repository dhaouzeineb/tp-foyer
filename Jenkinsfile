pipeline {

    agent any
 
    environment {

        SCANNER_HOME = tool 'SonarQube'  // Déclarer l'outil SonarQube Scanner

    }
 
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

        stage('SonarQube Analysis') {

            steps {

                // Configuration de l'analyse SonarQube

                withSonarQubeEnv('SonarQubeToken') {

                    sh '''

                        $SCANNER_HOME/bin/sonar-scanner \

                        -Dsonar.projectKey=sonar-qube-analysis \

                        -Dsonar.projectName=sonar-qube-analysis \

                        -Dsonar.sources=src \

                        -Dsonar.java.binaries=target/classes

                    '''

                }

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

 
