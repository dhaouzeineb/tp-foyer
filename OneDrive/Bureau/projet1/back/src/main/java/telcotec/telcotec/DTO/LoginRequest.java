package telcotec.telcotec.DTO;

import lombok.Data;
import telcotec.telcotec.entity.App;

@Data
public class LoginRequest {
    private String email;
    private String password;
    private App app; // App details
}

