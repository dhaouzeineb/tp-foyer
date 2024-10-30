package tn.esprit.tpfoyer.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.tpfoyer.entity.User;
import tn.esprit.tpfoyer.repository.UserRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;

@ExtendWith(MockitoExtension.class)
class UserServiceImplMock {

    @Mock
    UserRepository userRepository;

    @InjectMocks
    UserServiceImpl userService;

    @Test
    public void testRetrieveAllUsers() {
        List<User> mockUsers = new ArrayList<>();
        mockUsers.add(new User("John Doe", "john@example.com", "password123"));

        Mockito.when(userRepository.findAll()).thenReturn(mockUsers);

        List<User> users = userService.retrieveAllUsers();
        assertNotNull(users);
        assertEquals(1, users.size());
    }

    @Test
    public void testAddUser() {
        User user = new User("Jane Doe", "jane@example.com", "password456");
        Mockito.when(userRepository.save(any(User.class))).thenReturn(user);

        User addedUser = userService.addUser(user);
        assertNotNull(addedUser);
        assertEquals("Jane Doe", addedUser.getName());
    }

    @Test
    public void testRetrieveUser() {
        User user = new User("John Doe", "john@example.com", "password123");
        Mockito.when(userRepository.findById(anyLong())).thenReturn(Optional.of(user));

        User retrievedUser = userService.retrieveUser(1L);
        assertNotNull(retrievedUser);
        assertEquals("john@example.com", retrievedUser.getEmail());
    }

    @Test
    public void testUpdateUser() {
        User user = new User("John Doe", "john@example.com", "password123");
        user.setId(1L);

        Mockito.when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        Mockito.when(userRepository.save(any(User.class))).thenReturn(user);

        user.setName("John Updated");
        User updatedUser = userService.updateUser(user);

        assertEquals("John Updated", updatedUser.getName());
    }

    @Test
    public void testDeleteUser() {
        User user = new User("John Doe", "john@example.com", "password123");
        user.setId(1L);

        Mockito.when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        userService.deleteUser(1L);

        Mockito.verify(userRepository).deleteById(1L);
    }
}
