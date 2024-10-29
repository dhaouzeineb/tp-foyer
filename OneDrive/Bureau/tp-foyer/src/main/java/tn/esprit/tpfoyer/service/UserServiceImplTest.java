package tn.esprit.tpfoyer.service;

import org.junit.jupiter.api.BeforeEach; // Ajoutez ceci
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import tn.esprit.tpfoyer.entity.User;

import java.util.List;

@SpringBootTest
@TestMethodOrder(OrderAnnotation.class)
class UserServiceImplTest {

    @Autowired
    IUserService userService;

    private User testUser;

    @BeforeEach // Utilisez ceci pour initialiser les données de test
    public void setup() {
        testUser = new User();
        testUser.setName("Test User");
        // Ajoutez d'autres propriétés si nécessaire
        userService.addUser(testUser); // Assurez-vous que l'utilisateur est créé avant les tests
    }

    @Test
    @Order(1)
    public void testRetrieveAllUsers() {
        List<User> listUsers = userService.retrieveAllUsers();
        Assertions.assertNotNull(listUsers);
        Assertions.assertTrue(listUsers.size() > 0); // Vérifiez que la liste n'est pas vide
    }

    @Test
    @Order(2)
    public void testAddUser() {
        User user = new User();
        user.setName("New User");
        User createdUser = userService.addUser(user);
        Assertions.assertNotNull(createdUser);
        Assertions.assertEquals(user.getName(), createdUser.getName());
    }

    @Test
    @Order(3)
    public void testRetrieveUser() {
        Long id = testUser.getId();
        User user = userService.retrieveUser(id);
        Assertions.assertNotNull(user);
        Assertions.assertEquals(id, user.getId());
    }

    @Test
    @Order(4)
    public void testUpdateUser() {
        Long id = testUser.getId();
        testUser.setName("Updated User");
        User updatedUser = userService.updateUser(testUser);
        Assertions.assertEquals("Updated User", updatedUser.getName());
    }

    @Test
    @Order(5)
    public void testDeleteUser() {
        Long id = testUser.getId();
        userService.deleteUser(id);
        User deletedUser = userService.retrieveUser(id);
        Assertions.assertNull(deletedUser);
    }
}
