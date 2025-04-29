package telcotec.telcotec.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import telcotec.telcotec.entity.User;
import telcotec.telcotec.repository.UserRepository;
import telcotec.telcotec.security.JwtService;
import telcotec.telcotec.exception.AuthExceptions;

import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private PasswordEncoder passwordEncoder;  // Inject the encoder

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    public String login(String email, String password) {
        // Récupérer l'utilisateur par e-mail
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthExceptions.UserNotFoundException("Utilisateur introuvable"));

        // Vérifier le mot de passe (en comparant le mot de passe haché)
        if (!passwordEncoder.matches(password, user.getPassword())) {  // Utilisation de BCrypt pour comparer
            throw new AuthExceptions.IncorrectPasswordException("Mot de passe incorrect");
        }

        // Vérifier si l'utilisateur est vérifié (verified = 1)
        if (user.getVerified() != 1) {
            throw new RuntimeException("Utilisateur non vérifié. Connexion refusée");
        }

        // Obtenir le jeton de l'utilisateur
        String token = user.getToken();
        if (token == null || token.trim().isEmpty()) {
            throw new AuthExceptions.InvalidTokenException("Le jeton d'authentification est introuvable.");
        }

        // Valider le jeton avec JwtService
        User validatedUser = jwtService.validateToken(token);

        if (validatedUser == null) {
            // Le jeton est invalide, générer un nouveau jeton
            token = jwtService.generateAccessToken(user);
            user.setToken(token);
            userRepository.save(user);  // Sauvegarder l'utilisateur avec le nouveau jeton
        } else {
            // Le jeton est valide, utiliser celui de validatedUser
            token = validatedUser.getToken();
        }

        return token;
    }



    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public void updateUser(User user) {
        userRepository.save(user);
    }


}




