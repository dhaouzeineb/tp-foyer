package tn.esprit.tpfoyer;
import tn.esprit.tpfoyer.service.ReservationServiceImpl;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.*;
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import tn.esprit.tpfoyer.entity.Reservation;
import tn.esprit.tpfoyer.repository.ReservationRepository;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
//junit test 
@SpringBootTest
@TestMethodOrder(OrderAnnotation.class)
class ReservationServiceImplTest {

    @InjectMocks
    ReservationServiceImpl reservationService;

    @Mock
    ReservationRepository reservationRepository;

    Reservation reservation;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        reservation = new Reservation("1", new Date(), true, new HashSet<>());
    }

    @Test
    @Order(1)
    void testRetrieveAllReservations() {
        List<Reservation> reservations = new ArrayList<>();
        reservations.add(reservation);

        when(reservationRepository.findAll()).thenReturn(reservations);

        List<Reservation> result = reservationService.retrieveAllReservations();
        Assertions.assertEquals(1, result.size());
        Assertions.assertEquals(reservation, result.get(0));
    }

    @Test
    @Order(2)
    void testRetrieveReservation() {
        when(reservationRepository.findById("1")).thenReturn(Optional.of(reservation));

        Reservation result = reservationService.retrieveReservation("1");
        Assertions.assertEquals(reservation, result);
    }

    @Test
    @Order(3)
    void testAddReservation() {
        when(reservationRepository.save(reservation)).thenReturn(reservation);

        Reservation result = reservationService.addReservation(reservation);
        Assertions.assertEquals(reservation, result);
    }

    @Test
    @Order(4)
    void testModifyReservation() {
        when(reservationRepository.save(reservation)).thenReturn(reservation);

        Reservation result = reservationService.modifyReservation(reservation);
        Assertions.assertEquals(reservation, result);
    }

    @Test
    @Order(5)
    void testRemoveReservation() {
        doNothing().when(reservationRepository).deleteById("1");
        reservationService.removeReservation("1");
        verify(reservationRepository, times(1)).deleteById("1");
    }
}
