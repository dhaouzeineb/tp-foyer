package telcotec.telcotec.service;


import telcotec.telcotec.entity.User;

import java.util.List;

public interface UserService {
    List<User> getAllUsers();
    User getUserById(Long id);
    User addUser(User user, String mac) ;
    User updateUser(Long id, User user);

    void deleteUser(Long id);
    String verifyUser(String token);
    void  sendVerificationEmail(User user, String token);
    User findUserByEmail(String email);
    String resetPassword(String email);
    List<User> getActiveAgentDispatchers();

}

