package tn.esprit.tpfoyer.service;

import tn.esprit.tpfoyer.entity.User;
import java.util.List;

public interface IUserService {
    List<User> retrieveAllUsers();
    User addUser(User user);
    User retrieveUser(Long id);
    User updateUser(User user);
    void deleteUser(Long id);
}
