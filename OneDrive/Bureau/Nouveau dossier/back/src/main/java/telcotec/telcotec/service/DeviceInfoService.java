package telcotec.telcotec.service;

import org.springframework.stereotype.Service;

import java.net.InetAddress;
import java.net.NetworkInterface;

@Service
public class DeviceInfoService {

    // Retrieve the local IP address
    public String getLocalIp() throws Exception {
        InetAddress localHost = InetAddress.getLocalHost();
        return localHost.getHostAddress();
    }

    // Retrieve the MAC address
    public String getMacAddress() throws Exception {
        InetAddress localHost = InetAddress.getLocalHost();
        NetworkInterface networkInterface = NetworkInterface.getByInetAddress(localHost);

        if (networkInterface != null) {
            byte[] macBytes = networkInterface.getHardwareAddress();
            if (macBytes != null) {
                StringBuilder macAddress = new StringBuilder();
                for (byte b : macBytes) {
                    macAddress.append(String.format("%02X:", b));
                }
                return macAddress.substring(0, macAddress.length() - 1); // Remove trailing colon
            }
        }
        return "Unknown";
    }

    // Get the device name (hostname)
    public String getDeviceName() throws Exception {
        InetAddress localHost = InetAddress.getLocalHost();
        return localHost.getHostName();
    }

    // Determine the device type (PC or mobile)
    public String getDeviceType() {
        String os = System.getProperty("os.name").toLowerCase();
        if (os.contains("win") || os.contains("mac") || os.contains("linux")) {
            return "PC";
        } else if (os.contains("android") || os.contains("ios")) {
            return "Mobile";
        }
        return "Unknown";
    }

    // Retrieve the operating system name
    public String getOperatingSystem() {
        return System.getProperty("os.name");
    }
}
