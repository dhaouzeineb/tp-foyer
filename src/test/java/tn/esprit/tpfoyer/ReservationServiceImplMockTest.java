package tn.esprit.tpfoyer;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.*;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import tn.esprit.tpfoyer.entity.Reservation;
import tn.esprit.tpfoyer.repository.ReservationRepository;
import tn.esprit.tpfoyer.service.ReservationServiceImpl;

import java.util.*;

class ReservationServiceImplMockTest {

    @InjectMocks
    private ReservationServiceImpl reservationService;

    @Mock
    private ReservationRepository reservationRepository;

    private Reservation reservation;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        reservation = new Reservation("1", new Date(), true, new HashSet<>());
    }

    @Test
    void testRetrieveAllReservations() {
        List<Reservation> reservations = new ArrayList<>();
        reservations.add(reservation);

        when(reservationRepository.findAll()).thenReturn(reservations);

        List<Reservation> result = reservationService.retrieveAllReservations();

        assertEquals(1, result.size());
        assertEquals(reservation, result.get(0));
    }

    @Test
    void testRetrieveReservation() {
        when(reservationRepository.findById("1")).thenReturn(Optional.of(reservation));

        Reservation foundReservation = reservationService.retrieveReservation("1");

        assertNotNull(foundReservation);
        assertEquals(reservation, foundReservation);
    }

    @Test
    void testAddReservation() {
        when(reservationRepository.save(reservation)).thenReturn(reservation);

        Reservation createdReservation = reservationService.addReservation(reservation);

        assertNotNull(createdReservation);
        assertEquals(reservation, createdReservation);
    }

    @Test
    void testModifyReservation() {
        when(reservationRepository.save(reservation)).thenReturn(reservation);

        Reservation updatedReservation = reservationService.modifyReservation(reservation);

        assertNotNull(updatedReservation);
        assertEquals(reservation, updatedReservation);
    }

    @Test
    void testRemoveReservation() {
        doNothing().when(reservationRepository).deleteById("1");

        reservationService.removeReservation("1");

        verify(reservationRepository, times(1)).deleteById("1");
    }
}
