package telcotec.telcotec.controller;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import telcotec.telcotec.entity.User;
import telcotec.telcotec.repository.UserRepository;
import telcotec.telcotec.security.JwtService;
import telcotec.telcotec.service.AuthService;
import telcotec.telcotec.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final AuthService authService;
    private final UserRepository userRepository;
    private final JwtService jwtService;




    public UserController(UserService userService, AuthService authService, UserRepository userRepository,JwtService jwtService) {
        this.userService = userService;
        this.authService = authService;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @Operation(summary = "Get all users", description = "Retrieve all users from the database.")
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @Operation(summary = "Add a new user", description = "Add a new user to the database.")

    @PostMapping("/addUser")
    public User addUser(@RequestBody User user, @RequestParam String mac) {
        return userService.addUser(user, mac); // Pass mac as a parameter
    }

    @Operation(summary = "Delete a user", description = "Delete a user from the database by ID.")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Update an existing user", description = "Update a user in the database by ID.")
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        User updatedUser = userService.updateUser(id, user);
        return ResponseEntity.ok(updatedUser);
    }
    // New endpoint to find a user by email
    @GetMapping("/email/{email}")
    public ResponseEntity<User> findUserByEmail(@PathVariable String email) {
        User user = userService.findUserByEmail(email);
        if (user == null) {
            System.out.println("User not found for email: " + email);
        } else {
            System.out.println("User found: " + user);
        }
        return ResponseEntity.ok(user);
    }


    @Operation(summary = "Reset password", description = "Generate a new password and send it to the user's email.")
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestParam String email) {
        String response = userService.resetPassword(email);
        return ResponseEntity.ok(response);
    }
    @GetMapping("/verify")
    public ResponseEntity<String> verifyEmail(@RequestParam("token") String token) {
        // Extract email from token
        String email = jwtService.extractEmail(token);

        // Find user by email from the database
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Validate token
        boolean isValid = jwtService.isTokenValid(token, user);
        if (isValid) {
            // Call service method to update the user's verified status
            String result = userService.verifyUser(token); // Assuming userService is your service class

            return ResponseEntity.ok(result); // Return success message
        } else {
            return ResponseEntity.status(400).body("Invalid or expired token.");
        }
    }
    @GetMapping("/agents")
    public ResponseEntity<List<User>> getAgents() {
        List<User> users = userService.getActiveAgentDispatchers();
        if (users.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        }
        return ResponseEntity.ok(users);
    }
    @GetMapping("/api/connected-users")
    public ResponseEntity<List<User>> getConnectedUsers() {
        List<User> connectedUsers = userRepository.findByStatus(1); // Fetch users with status 1 (online)
        if (connectedUsers.isEmpty()) {
            return ResponseEntity.noContent().build(); // Return 204 if no users are online
        }
        return ResponseEntity.ok(connectedUsers); // Return 200 and the list of connected users
    }
}
