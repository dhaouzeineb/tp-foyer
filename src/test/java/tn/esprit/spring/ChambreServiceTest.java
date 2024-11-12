package tn.esprit.spring;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import tn.esprit.tpfoyer.entity.Chambre;
import tn.esprit.tpfoyer.entity.TypeChambre;
import tn.esprit.tpfoyer.repository.ChambreRepository;
import tn.esprit.tpfoyer.service.ChambreServiceImpl;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

class ChambreServiceTest {

    private ChambreRepository chambreRepository;

    @InjectMocks
    private ChambreServiceImpl chambreService; // Your implementation of IChambreService

    private Chambre chambre;

    @BeforeEach
    void setUp() {

        MockitoAnnotations.openMocks(this);

        // Set up a sample chambre entity for testing
        chambre = new Chambre();
        chambre.setIdChambre(1L);
        chambre.setNumeroChambre(101L);
        chambre.setTypeC(TypeChambre.SIMPLE);
    }

    @Test
    void testRetrieveAllChambres() {
        // Mock the repository to return a list of chambres
        List<Chambre> chambres = new ArrayList<>();
        chambres.add(chambre);
        when(chambreRepository.findAll()).thenReturn(chambres);

        List<Chambre> result = chambreService.retrieveAllChambres();
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(chambreRepository, times(1)).findAll();
    }

    @Test
    void testRetrieveChambre() {
        // Mock the repository to return a chambre for a given ID
        when(chambreRepository.findById(1L)).thenReturn(Optional.of(chambre));

        Chambre result = chambreService.retrieveChambre(1L);
        assertNotNull(result);
        assertEquals(101L, result.getNumeroChambre());
        verify(chambreRepository, times(1)).findById(1L);
    }

    @Test
    void testAddChambre() {
        // Mock the repository to save a chambre
        when(chambreRepository.save(any(Chambre.class))).thenReturn(chambre);

        Chambre result = chambreService.addChambre(chambre);
        assertNotNull(result);
        assertEquals(TypeChambre.SIMPLE, result.getTypeC());
        verify(chambreRepository, times(1)).save(chambre);
    }

    @Test
    void testRemoveChambre() {
        // Run the remove method, and verify the repository’s deleteById method is called
        doNothing().when(chambreRepository).deleteById(1L);

        chambreService.removeChambre(1L);
        verify(chambreRepository, times(1)).deleteById(1L);
    }

    @Test
    void testModifyChambre() {
        // Modify and save the chambre entity
        when(chambreRepository.save(any(Chambre.class))).thenReturn(chambre);

        chambre.setTypeC(TypeChambre.DOUBLE); // Changing the type
        Chambre result = chambreService.modifyChambre(chambre);
        assertEquals(TypeChambre.DOUBLE, result.getTypeC());
        verify(chambreRepository, times(1)).save(chambre);
    }

    @Test
    void testRecupererChambresSelonTyp() {
        // Mock repository to find chambres by type
        List<Chambre> chambres = new ArrayList<>();
        chambres.add(chambre);
        when(chambreRepository.findAllByTypeC(TypeChambre.SIMPLE)).thenReturn(chambres);

        List<Chambre> result = chambreService.recupererChambresSelonTyp(TypeChambre.SIMPLE);
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(chambreRepository, times(1)).findAllByTypeC(TypeChambre.SIMPLE);
    }

    @Test
    void testTrouverChambreSelonEtudiant() {
        // Mock repository to return a chambre based on student's CIN
        when(chambreRepository.trouverChselonEt(12345678L)).thenReturn(chambre);

        Chambre result = chambreService.trouverchambreSelonEtudiant(12345678L);
        assertNotNull(result);
        assertEquals(101L, result.getNumeroChambre());
        verify(chambreRepository, times(1)).trouverChselonEt(12345678L);
    }
}
