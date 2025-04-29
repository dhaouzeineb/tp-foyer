package telcotec.telcotec.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import telcotec.telcotec.entity.App;
import telcotec.telcotec.entity.User;
import telcotec.telcotec.repository.AppRepository;
import telcotec.telcotec.repository.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AppService {

    private final AppRepository appRepository;
    private final UserRepository userRepository;
    private final DeviceInfoService deviceInfoService;
    public App addApp(App app) {
        return appRepository.save(app);
    }

    public App updateApp(Long id, App updatedApp) {
        // Find the existing app or throw an exception if it doesn't exist
        App existingApp = appRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("App not found"));

        // Update fields only if they are provided in updatedApp
        if (updatedApp.getNomPeripherique() != null && !updatedApp.getNomPeripherique().isEmpty()) {
            existingApp.setNomPeripherique(updatedApp.getNomPeripherique());
        }
        if (updatedApp.getType() != null && !updatedApp.getType().isEmpty()) {
            existingApp.setType(updatedApp.getType());
        }
        if (updatedApp.getAdresseIp() != null && !updatedApp.getAdresseIp().isEmpty()) {
            existingApp.setAdresseIp(updatedApp.getAdresseIp());
        }
        if (updatedApp.getMac() != null && !updatedApp.getMac().isEmpty()) {
            existingApp.setMac(updatedApp.getMac());
        }
        if (updatedApp.getOsName() != null && !updatedApp.getOsName().isEmpty()) {
            existingApp.setOsName(updatedApp.getOsName());
        }
        if (updatedApp.getUser() != null) {
            existingApp.setUser(updatedApp.getUser());
        }
        if (updatedApp.getVerifie() != existingApp.getVerifie()) {
            existingApp.setVerifie(updatedApp.getVerifie());
        }

        // Save and return the updated app
        return appRepository.save(existingApp);
    }


    public App patchAppVerification(Long id, int verifie) {
        App app = appRepository.findById(id).orElseThrow(() -> new RuntimeException("App not found"));
        app.setVerifie(verifie);
        return appRepository.save(app);
    }

    public List<App> getAllApps() {
        return appRepository.findAll();
    }

    public List<App> getAppsByUserId(Long userId) {
        return appRepository.findByUserId(userId);
    }

    public void deleteApp(Long id) {
        App app = appRepository.findById(id).orElseThrow(() -> new RuntimeException("App not found"));
        app.setVerifie(-1);
        appRepository.save(app);
    }


   /* public App createOrUpdateApp(Long userId) throws Exception {
        // Retrieve user from database
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Get device details
        String deviceName = deviceInfoService.getDeviceName();
        String deviceType = deviceInfoService.getDeviceType();
        String ipAddress = deviceInfoService.getLocalIp();
        String macAddress = deviceInfoService.getMacAddress();
        String osName = deviceInfoService.getOperatingSystem();

        // Check if an App already exists for this user
        App existingApp = appRepository.findByUser(user);
        if (existingApp != null) {
            // If the MAC address has changed, set verifie to 0
            if (!existingApp.getMac().equals(macAddress)) {
                existingApp.setVerifie(0); // Mark as needing verification due to device change
            }

            // Update the existing App entity with new data
            existingApp.setNomPeripherique(deviceName);
            existingApp.setType(deviceType);
            existingApp.setAdresseIp(ipAddress);
            existingApp.setMac(macAddress);
            existingApp.setOsName(osName);

            // Save the updated App entity
            return appRepository.save(existingApp);
        } else {
            // If no existing app, create a new one with default 'verifie' = 1
            App newApp = App.builder()
                    .nomPeripherique(deviceName)
                    .type(deviceType)
                    .adresseIp(ipAddress)
                    .mac(macAddress)
                    .osName(osName)
                    .user(user)
                    .verifie(1) // Default value for new app
                    .build();

            return appRepository.save(newApp);
        }
    }*/



    public boolean isVerifieValid(App app) {
        int verifie = app.getVerifie();
        return verifie == 1; // Return true only if verifie == 1 (valid)
    }
    public App findById(Long id) {
        return appRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("App not found with id: " + id));
    }

}

