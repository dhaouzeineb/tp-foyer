package telcotec.telcotec.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import telcotec.telcotec.entity.User;
import telcotec.telcotec.repository.UserRepository;

import java.util.Date;
import java.util.Optional;

@Service
public class JwtService {

    private static final String SECRET_KEY = "cf9a7e70fe28157c4fa82fcf459418ba2c3cd3ab5817b39e4d156b0184bca1400b12ddba4039657da03fce00ed85fcd5f9b94d6ff63c1b8d0a276f941609e2709ee9e6f1cc940994663f8910601d0486859ff74810a6df64a5c5d503010a032f8807d2159dc699aefde7540e727f53f7caf49d005b2deec370f464ef703e1d6b25e885ac5f4f26e481e052de97a6a71455b2c02f0e2de71546db31609211e9bf6d6874ba73812aad1bd24189ac5b59295a8c2de625d48cc7bfdc9d340b2640154d1ec7fa3a6fe84b4b78a4a00bb9b58887c4d98c0aac1d41ead6960cba81648bbee8c82f3d5c11161bcdebbf07d01426799410a074245baaa40329a03f11e180"; // Use a secure secret key
    private static final long ACCESS_TOKEN_EXPIRATION_TIME = 900000L; // 15 minutes in milliseconds

    @Autowired
    private UserRepository userRepository;

    // Generate Access Token for a specific user
    public String generateAccessToken(User user) {
        return Jwts.builder()
                .setSubject(user.getEmail())
                .claim("name", user.getNom())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + ACCESS_TOKEN_EXPIRATION_TIME))
                .signWith(SignatureAlgorithm.HS256, SECRET_KEY)
                .compact();
    }

    // Validate token and retrieve the user, generate new token if expired
    // Validate token and retrieve the user, generate new token if expired
    public User validateToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .setSigningKey(SECRET_KEY)
                    .parseClaimsJws(token)
                    .getBody();

            String email = claims.getSubject();
            Optional<User> optionalUser = userRepository.findByEmail(email);

            if (optionalUser.isPresent()) {
                User user = optionalUser.get();

                if (isTokenExpired(token)) {
                    // Le jeton est expiré, générer un nouveau jeton d'accès
                    String newToken = generateAccessToken(user);
                    user.setToken(newToken); // Mettre à jour le jeton de l'utilisateur
                    userRepository.save(user); // Enregistrer l'utilisateur mis à jour avec le nouveau jeton
                    return user; // Retourner l'utilisateur avec le nouveau jeton
                }
                return user; // Retourner l'utilisateur si le jeton est toujours valide
            } else {
                return null; // Utilisateur non trouvé
            }
        } catch (Exception e) {
            System.out.println("Erreur de validation du jeton : " + e.getMessage());
            return null; // Retourner null si le jeton est invalide ou expiré
        }
    }



    // Check if the token has expired
    private boolean isTokenExpired(String token) {
        Date expiration = extractExpiration(token);
        return expiration.before(new Date());
    }


    // Extract the expiration date from the token
    private Date extractExpiration(String token) {
        return Jwts.parser()
                .setSigningKey(SECRET_KEY)
                .parseClaimsJws(token)
                .getBody()
                .getExpiration();
    }
    public boolean isTokenValid(String token, User user) {
        String email = extractEmail(token);
        return (email.equals(user.getEmail()) && !isTokenExpired(token));
    }
    public String extractEmail(String token) {
        return Jwts.parser()
                .setSigningKey(SECRET_KEY)
                .parseClaimsJws(token)
                .getBody()
                .getSubject(); // Retrieve the user's email
    }
    public boolean checkIfTokenExpired(String token) {
        return isTokenExpired(token);
    }

}
