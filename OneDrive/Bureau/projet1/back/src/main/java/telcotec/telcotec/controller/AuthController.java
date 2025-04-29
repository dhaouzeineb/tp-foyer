package telcotec.telcotec.controller;

import jakarta.annotation.security.PermitAll;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import telcotec.telcotec.DTO.LoginRequest;
import telcotec.telcotec.config.SocketHandler;
import telcotec.telcotec.entity.User;
import telcotec.telcotec.entity.App;
import telcotec.telcotec.service.AuthService;
import telcotec.telcotec.service.AppService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final AppService appService;
    private final SocketHandler socketHandler; // Injection de SocketHandler

    public AuthController(AuthService authService, AppService appService, SocketHandler socketHandler) {
        this.authService = authService;
        this.appService = appService;
        this.socketHandler = socketHandler;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest loginRequest) {
        Map<String, Object> response = new HashMap<>();

        try {
            String email = loginRequest.getEmail();
            String password = loginRequest.getPassword();
            if (loginRequest.getApp() == null) {
                response.put("error", "Les informations de l'appareil sont manquantes.");
                return ResponseEntity.badRequest().body(response);
            }



            // Authenticate user and get token
            String token = authService.login(email, password);

            // Retrieve user by email
            User user = authService.getUserByEmail(email);
            // Mettre à jour le statut de l'utilisateur à 1 (connecté)
            user.setStatus(1);
            authService.updateUser(user); // Assurez-vous que cette méthode existe dans AuthService pour sauvegarder les modifications
            // Générer un identifiant unique pour la session WebRTC
            // Générer le sessionId et le stocker dans l'utilisateur
            String sessionId = UUID.randomUUID().toString();
            user.setWebrtcSessionId(sessionId);
            authService.updateUser(user);

            // Ajouter le sessionId dans la réponse
            response.put("webrtcSessionId", sessionId);
            response.put("message", "Connexion réussie");
            response.put("token", token);



            // Retrieve App details from the request
          App app = loginRequest.getApp();
            app.setUser(user); // Link the app to the authenticated user
            System.out.println("Détails de l'appareil: " + app); //
            // Get the list of apps associated with the user
            List<App> userApps = appService.getAppsByUserId(user.getId());

            // Check if a device with the same MAC address already exists for the user
           boolean macExists = userApps.stream()
                    .anyMatch(existingApp -> existingApp.getMac().equals(app.getMac()));

            // If MAC address exists, skip adding the new app and just login
            if (macExists) {
                response.put("message", "Connexion réussie");
                response.put("token", token); // Include token in response
                return ResponseEntity.ok(response); // Success: return token and message
            } else {
                // If no apps exist for this user, set the first app's verifie to 1
                if (userApps.isEmpty()) {
                    app.setVerifie(1); // Set the first app's verification status to 1
                    appService.addApp(app); // Save the new app with verifie = 1
                    response.put("message", "Connexion réussie");
                    response.put("token", token);
                    return ResponseEntity.ok(response); // Success: return token and message
                } else {
                    // If apps exist for the user, check if the new app has the same MAC address as an existing one
                    boolean appAlreadyVerified = false;
                    boolean isDifferentMac = true;

                    // Check if the new app has the same MAC address as an existing one
                    for (App existingApp : userApps) {
                        if (existingApp.getVerifie() == 1) {
                            appAlreadyVerified = true;
                        }

                        // If MAC addresses are the same, no need to set it to pending verification
                        if (existingApp.getMac().equals(app.getMac())) {
                            isDifferentMac = false;
                            break; // Exit the loop early if the MAC matches
                        }
                    }

                    if (isDifferentMac) {
                        // If the MAC is different, set the new app's verifie to 0 (pending verification)
                        app.setVerifie(0);
                        appService.addApp(app); // Save the new app with verifie = 0
                        response.put("message", "Connexion réussie, votre nouvel appareil est en attente de validation.");
                        response.put("token", token);
                        return ResponseEntity.status(403).body(response); // Forbidden for pending verification
                    }

                    if (appAlreadyVerified) {
                        // If any existing app is verified, proceed with login
                        app.setVerifie(1); // Set the new app as verified
                        appService.addApp(app); // Save the new app
                        response.put("message", "Connexion réussie");
                        response.put("token", token); // Include token in response
                        return ResponseEntity.ok(response); // Success: return token and message
                    } else {
                        // If no verified app exists, set the new app's verifie to 0 (pending verification)
                        app.setVerifie(0);
                        appService.addApp(app); // Save the new app with verifie = 0
                        response.put("message", "Connexion réussie, votre nouvel appareil est en attente de validation.");
                        response.put("token", token);
                        return ResponseEntity.status(403).body(response); // Forbidden for pending verification
                    }
                }
            }

        } catch (Exception e) {
            // Handle unexpected errors
            response.put("error", "Une erreur est survenue lors de la connexion : " + e.getMessage());
            return ResponseEntity.status(500).body(response); // 500 Internal Server Error
        }
    }
    @PermitAll
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(@RequestBody Map<String, String> request) {
        Map<String, String> response = new HashMap<>();
        String email = request.get("email");

        try {
            User user = authService.getUserByEmail(email);
            if (user != null) {
                user.setStatus(0); // Mettre le statut à 0 (déconnecté)
                authService.updateUser(user);
                response.put("message", "Déconnexion réussie.");
                return ResponseEntity.ok(response);
            } else {
                response.put("error", "Utilisateur non trouvé.");
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            response.put("error", "Erreur lors de la déconnexion : " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }


}




