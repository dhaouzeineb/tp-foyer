package telcotec.telcotec.controller;

import org.springframework.http.HttpStatus;
import telcotec.telcotec.entity.App;
import telcotec.telcotec.service.AppService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/apps")
@RequiredArgsConstructor
public class AppController {
    private final AppService appService;

    @PostMapping
    public ResponseEntity<App> addApp(@RequestBody App app) {
        return ResponseEntity.ok(appService.addApp(app));
    }

    @PutMapping("/{id}")
    public ResponseEntity<App> updateApp(@PathVariable Long id, @RequestBody App updatedApp) {
        return ResponseEntity.ok(appService.updateApp(id, updatedApp));
    }

    @PatchMapping("/{id}/verifie")
    public ResponseEntity<App> patchAppVerification(@PathVariable Long id, @RequestParam int verifie) {
        return ResponseEntity.ok(appService.patchAppVerification(id, verifie));
    }

    @GetMapping
    public ResponseEntity<List<App>> getAllApps() {
        return ResponseEntity.ok(appService.getAllApps());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<App>> getAppsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(appService.getAppsByUserId(userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApp(@PathVariable Long id) {
        appService.deleteApp(id);
        return ResponseEntity.noContent().build();
    }
    @PostMapping("/validate")
    public ResponseEntity<Map<String, String>> validateApp(@RequestBody App appRequest) {
        Map<String, String> response = new HashMap<>();
        try {
            // Fetch app details from database
            App app = appService.findById(appRequest.getId()); // Ensure this method exists in your service layer

            int verifie = app.getVerifie();
            if (verifie == 0) {
                response.put("status0", "pending");
                response.put("message0", "Your account is awaiting verification.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            } else if (verifie == -1) {
                response.put("status1", "blocked");
                response.put("message1", "Your account has been blocked.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            } else if (verifie == 1) {
                response.put("status2", "valid");
                response.put("message2", "Your account is valid.");
                return ResponseEntity.ok(response);
            } else {
                response.put("status3", "unknown");
                response.put("message3", "Unknown verification status.");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }

        } catch (Exception e) {
            response.put("error", "An error occurred while validating the app: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
