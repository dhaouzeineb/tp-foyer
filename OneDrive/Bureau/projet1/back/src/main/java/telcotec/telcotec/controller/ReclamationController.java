package telcotec.telcotec.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import telcotec.telcotec.entity.Reclamation;
import telcotec.telcotec.entity.NiveauReclamation;
import telcotec.telcotec.entity.User;
import telcotec.telcotec.repository.UserRepository;
import telcotec.telcotec.service.NotificationService;
import telcotec.telcotec.service.ReclamationService;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/reclamations")
public class ReclamationController {

    @Autowired
    private ReclamationService reclamationService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/search")
    public ResponseEntity<List<Reclamation>> searchReclamations(
            @RequestParam(required = false) Integer cin,
            @RequestParam(required = false) String nom,
            @RequestParam(required = false) Integer tel,
            @RequestParam(required = false) Long id) {
        List<Reclamation> reclamations = reclamationService.searchReclamations(cin, nom, tel, id);
        return ResponseEntity.ok(reclamations);
    }

    @PostMapping("/add")
    public ResponseEntity<Reclamation> addReclamation(
            @RequestParam Long userId,
            @RequestParam String nom,
            @RequestParam String prenom,
            @RequestParam String cin,
            @RequestParam String description,
            @RequestParam String niveau,
            @RequestParam String lieu,
            @RequestParam String tel,
            @RequestParam String lat,
            @RequestParam String lng,
            @RequestParam(required = false) MultipartFile image,
            @RequestParam(required = false) MultipartFile voice,
            @RequestParam(required = false) MultipartFile video) {

        // Retrieve the user from the database
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Create a new Reclamation object and set its properties
        Reclamation reclamation = new Reclamation();
        reclamation.setUser(user);
        reclamation.setNom(nom);
        reclamation.setPrenom(prenom);
        reclamation.setCin(Integer.valueOf(cin));
        reclamation.setDescription(description);
        reclamation.setNiveau(NiveauReclamation.valueOf(niveau));
        reclamation.setLieu(lieu);
        reclamation.setTel(Integer.valueOf(tel));
        reclamation.setLat(lat);
        reclamation.setLng(lng);



        // Handle image file
        if (image != null && !image.isEmpty()) {
            String imagePath = saveFile(image, "images");
            if (imagePath != null) {
                reclamation.setImage(imagePath);
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(null); // Error while saving the file
            }
        }

        // Handle video file
        if (video != null && !video.isEmpty()) {
            String videoPath = saveFile(video, "videos");
            if (videoPath != null) {
                reclamation.setVideo(videoPath);
            }
        }

        // Handle audio file (voice)
        if (voice != null && !voice.isEmpty()) {
            String voicePath = saveFile(voice, "voices");
            if (voicePath != null) {
                reclamation.setVoice(voicePath);
            }
        }

        // Save the reclamation in the database
        Reclamation savedReclamation = reclamationService.addReclamation(reclamation);
        Reclamation saved = reclamationService.addReclamation(reclamation);

        String link = String.format("/reclamations/%d", saved.getId());
        notificationService.createNotification(
                userId,
                "Nouvelle réclamation",
                String.format("Réclamation de %s %s", nom, prenom),
                link
        );

        // Return the saved reclamation with file paths
        return new ResponseEntity<>(savedReclamation, HttpStatus.CREATED);
    }

    // Method to save a file and return its path
    private String saveFile(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("No file provided.");
        }

        // Vérification du dossier valide
        if (!"images".equals(folder) && !"videos".equals(folder) && !"voices".equals(folder)) {
            throw new RuntimeException("Invalid folder type. Allowed: images, videos, voices.");
        }

        try {
            // Base directory for uploads (à la racine du projet)
            String uploadDir = System.getProperty("user.dir") + "/uploads/" + folder + "/";

            // Ensure the directory exists
            java.io.File directory = new java.io.File(uploadDir);
            if (!directory.exists() && !directory.mkdirs()) {
                throw new RuntimeException("Failed to create directory: " + uploadDir);
            }

            // Get original file name and validate it
            String originalFileName = file.getOriginalFilename();
            if (originalFileName == null || originalFileName.isEmpty()) {
                throw new RuntimeException("Invalid file name.");
            }

            // Extract file extension
            String fileExtension = originalFileName.substring(originalFileName.lastIndexOf(".")).toLowerCase();

            // Validate file type based on folder
            if ("images".equals(folder) && !isValidImageExtension(fileExtension)) {
                throw new RuntimeException("Invalid image file type.");
            } else if ("videos".equals(folder) && !isValidVideoExtension(fileExtension)) {
                throw new RuntimeException("Invalid video file type.");
            } else if ("voices".equals(folder) && !isValidVoiceExtension(fileExtension)) {
                throw new RuntimeException("Invalid audio file type.");
            }

            // Generate a unique filename
            String uniqueFileName = java.util.UUID.randomUUID().toString() + fileExtension;

            // Save the file to disk
            java.io.File destFile = new java.io.File(uploadDir + uniqueFileName);
            file.transferTo(destFile);

            // Construct the file URL
            String baseUrl = "http://localhost:8080"; // Update if necessary
            String fileUrl = baseUrl  +"/"+folder + "/" + uniqueFileName;

            return fileUrl;
        } catch (IOException e) {
            throw new RuntimeException("Error while saving file: " + e.getMessage(), e);
        }
    }

    // Methods to validate file extensions for images, videos, and voices
    private boolean isValidImageExtension(String extension) {
        String[] validExtensions = {".jpg", ".jpeg", ".png", ".gif",".jfif"};
        return Arrays.asList(validExtensions).contains(extension.toLowerCase());
    }

    private boolean isValidVideoExtension(String extension) {
        return extension.equals(".mp4") || extension.equals(".avi") || extension.equals(".mov") || extension.equals(".mkv")|| extension.equals(".webm");
    }

    private boolean isValidVoiceExtension(String extension) {
        return extension.equals(".mp3") || extension.equals(".wav") || extension.equals(".ogg");
    }

    @PutMapping("/{id}")
    public ResponseEntity<Reclamation> updateReclamation(@PathVariable Long id, @RequestBody Reclamation reclamation) {
        Reclamation updatedReclamation = reclamationService.updateReclamation(id, reclamation);
        return new ResponseEntity<>(updatedReclamation, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReclamation(@PathVariable Long id) {
        reclamationService.deleteReclamation(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
    @GetMapping("/all")
public ResponseEntity<List<Reclamation>> getAllReclamations() {
    List<Reclamation> reclamations = reclamationService.getAllReclamations();
    return ResponseEntity.ok(reclamations);
}
    @GetMapping("/user/email/{email}")
    public ResponseEntity<List<Reclamation>> getReclamationsByUserEmail(@PathVariable String email) {
        // Retrieve the user from the database by email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Fetch reclamations associated with the user
        List<Reclamation> reclamations = reclamationService.getReclamationsByUser(user);

        // Return the list of reclamations
        return ResponseEntity.ok(reclamations);
    }


}
