package telcotec.telcotec.service;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import telcotec.telcotec.entity.Reclamation;
import telcotec.telcotec.repository.AppRepository;
import telcotec.telcotec.security.JwtService;
import telcotec.telcotec.entity.User;
import telcotec.telcotec.entity.App;
import telcotec.telcotec.repository.UserRepository;
import org.springframework.stereotype.Service;
import telcotec.telcotec.security.PasswordUtils;



import java.util.List;

@Service
public class UserServiceImp implements UserService {

    private final UserRepository userRepository;
    private final AppRepository appRepository;

    private final JwtService jwtService; // Injection de JwtService
    @Autowired
    private JavaMailSender mailSender;

    public UserServiceImp(UserRepository userRepository, JwtService jwtService, AppRepository appRepository) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.appRepository = appRepository;
    }


    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public User addUser(User user, String mac) {
        // Check if the email already exists
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already in use");
        }

        // Set verified to 0 when creating a new user
        user.setVerified(0);

        // Generate JWT token for verification
        String token = jwtService.generateAccessToken(user); // Generate a token for email verification

        // Set the token for the user
        user.setToken(token);

        // Save the user in the database
        userRepository.save(user);

        // Create a new App for the user and manually set the mac address
        App newApp = new App();
        newApp.setUser(user);  // Link the App to the user
        newApp.setMac(mac);  // Set the MAC address manually

        // Add the App to the User's app list
        user.getApps().add(newApp);

        // Save the App in the database
        appRepository.save(newApp);

        // Send verification email
        sendVerificationEmail(user, token);

        return user;
    }




    @Override

    public String verifyUser(String token) {
        // Extract email from token
        String email = jwtService.extractEmail(token);

        // Find user by email from the database
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Validate token
        boolean isValid = jwtService.isTokenValid(token, user);
        if (isValid) {
            // Update the user's verified status (use 1 for true and 0 for false)
            user.setVerified(1);  // 1 represents true (verified)
            userRepository.save(user);

            System.out.println("User verified: " + user); // Log for debugging
            return "Account successfully verified.";
        } else {
            throw new RuntimeException("Invalid or expired token");
        }
    }
    @Override

    public void sendVerificationEmail(User user, String token) {
        try {
            // Use localhost for local testing (adjust the port and endpoint as needed)
            String verificationLink = "http://localhost:8080/api/users/verify?token=" + token;

            // Create the email message
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(user.getEmail());
            helper.setSubject("Verify your email address");

            // Creating an HTML email with a button
            String emailContent = "<html><body>"
                    + "<p>Hello " + user.getNom() + ",</p>"
                    + "<p>Please click the button below to verify your email address:</p>"
                    + "<p><a href=\"" + verificationLink + "\" style=\"padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;\">Verify Email</a></p>"
                    + "</body></html>";

            helper.setText(emailContent, true);  // true to indicate HTML

            // Send the email
            mailSender.send(message);
        } catch (Exception e) {
            e.printStackTrace(); // Handle the exception as needed
        }
    }



    @Override
    public User updateUser(Long id, User user) {
        // Recherche de l'utilisateur existant
        User existingUser = getUserById(id);

        // Mise à jour des champs modifiables seulement si la nouvelle valeur est non nulle
        if (user.getNom() != null) {
            existingUser.setNom(user.getNom());
        }
        if (user.getPrenom() != null) {
            existingUser.setPrenom(user.getPrenom());
        }
        if (user.getEmail() != null) {
            existingUser.setEmail(user.getEmail());
        }
        if (user.getPassword() != null) {
            existingUser.setPassword(user.getPassword());
        }
        if (user.getVerified() != 0) { // Vérifie si l'attribut verified a été défini
            existingUser.setVerified(user.getVerified());
        }
        if (user.getToken() != null) {
            existingUser.setToken(user.getToken());
        }
        if (user.getLocalisation() != null) {
            existingUser.setLocalisation(user.getLocalisation());
        }
        if (user.getRole() != null) {
            existingUser.setRole(user.getRole());
        }

        return userRepository.save(existingUser);
    }

    @Override
    public void deleteUser(Long id) {
        // Récupérer l'utilisateur par son ID
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        // Mettre à jour l'état de vérification pour simuler une suppression
        user.setVerified(-1); // -1 pour indiquer qu'il a été "soft deleted"

        // Sauvegarder l'utilisateur avec l'état mis à jour
        userRepository.save(user);
    }
    @Override
    public User findUserByEmail(String email) {
        // Utiliser la méthode du repository pour trouver l'utilisateur par email
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur avec cet email introuvable"));
    }
    @Override

    public String resetPassword(String email) {
        // Find user by email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Generate a new password
        String newPassword = PasswordUtils.generateRandomPassword();

        // Update the user's password in the database
        user.setPassword(newPassword);
        userRepository.save(user);

        // Send the new password via email
        sendPasswordResetEmail(user, newPassword);

        return "Password reset successfully. A new password has been sent to the email.";
    }

    private void sendPasswordResetEmail(User user, String newPassword) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        message.setSubject("Password Reset");
        message.setText("Hello " + user.getNom() + ",\n\nYour password has been reset. Your new password is: " + newPassword + "\n\nRegards,\nYour Company");

        // Send the email
        mailSender.send(message);
    }


    public List<User> getActiveAgentDispatchers() {
        return userRepository.findByRoleAndStatus(User.Role.AGENT_DISPATCHER, 1);
    }


}