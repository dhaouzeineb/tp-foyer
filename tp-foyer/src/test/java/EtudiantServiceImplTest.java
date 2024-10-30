import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.tpfoyer.entity.Etudiant;
import tn.esprit.tpfoyer.repository.EtudiantRepository;
import tn.esprit.tpfoyer.service.EtudiantServiceImpl;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class EtudiantServiceImplTest {

    @Mock
    private EtudiantRepository etudiantRepository;

    @InjectMocks
    private EtudiantServiceImpl etudiantService;

    private Etudiant etudiant;

    @BeforeEach
    void setUp() {
        etudiant = new Etudiant();
        etudiant.setIdEtudiant(1L);
        etudiant.setNomEtudiant("John");
        etudiant.setPrenomEtudiant("Doe");
        etudiant.setCinEtudiant(123456);
        // Initialize other attributes as necessary
    }

    @Test
    public void testAddEtudiant() {
        when(etudiantRepository.save(any(Etudiant.class))).thenReturn(etudiant);

        Etudiant savedEtudiant = etudiantService.addEtudiant(etudiant);

        assertEquals("John", savedEtudiant.getNomEtudiant());
        verify(etudiantRepository, times(1)).save(etudiant);

        // Output result
        System.out.println("Test Add Etudiant: Saved Etudiant Name = " + savedEtudiant.getNomEtudiant());
    }

    @Test
    public void testRetrieveEtudiant() {
        when(etudiantRepository.findById(1L)).thenReturn(Optional.of(etudiant));

        Etudiant foundEtudiant = etudiantService.retrieveEtudiant(1L);

        assertEquals("John", foundEtudiant.getNomEtudiant());
        verify(etudiantRepository, times(1)).findById(1L);

        // Output result
        System.out.println("Test Retrieve Etudiant: Found Etudiant Name = " + foundEtudiant.getNomEtudiant());
    }

    @Test
    public void testModifyEtudiant() {
        when(etudiantRepository.save(any(Etudiant.class))).thenReturn(etudiant);

        etudiant.setNomEtudiant("Updated Name");
        Etudiant updatedEtudiant = etudiantService.modifyEtudiant(etudiant);

        assertEquals("Updated Name", updatedEtudiant.getNomEtudiant());
        verify(etudiantRepository, times(1)).save(etudiant);

        // Output result
        System.out.println("Test Modify Etudiant: Updated Etudiant Name = " + updatedEtudiant.getNomEtudiant());
    }

    @Test
    public void testRemoveEtudiant() {
        doNothing().when(etudiantRepository).deleteById(1L);

        etudiantService.removeEtudiant(1L);

        verify(etudiantRepository, times(1)).deleteById(1L);

        // Output result
        System.out.println("Test Remove Etudiant: Etudiant with ID 1 has been removed.");
    }

    @Test
    public void testRetrieveAllEtudiants() {
        List<Etudiant> etudiants = new ArrayList<>();
        etudiants.add(etudiant);
        when(etudiantRepository.findAll()).thenReturn(etudiants);

        List<Etudiant> allEtudiants = etudiantService.retrieveAllEtudiants();

        assertEquals(1, allEtudiants.size());
        assertEquals("John", allEtudiants.get(0).getNomEtudiant());
        verify(etudiantRepository, times(1)).findAll();

        // Output result
        System.out.println("Test Retrieve All Etudiants: Total Etudiants = " + allEtudiants.size());
    }

    @Test
    public void testRecupererEtudiantParCin() {
        when(etudiantRepository.findEtudiantByCinEtudiant(123456)).thenReturn(etudiant);

        Etudiant foundEtudiant = etudiantService.recupererEtudiantParCin(123456);

        assertEquals("John", foundEtudiant.getNomEtudiant());
        verify(etudiantRepository, times(1)).findEtudiantByCinEtudiant(123456);

        // Output result
        System.out.println("Test Recuperer Etudiant Par CIN: Found Etudiant Name = " + foundEtudiant.getNomEtudiant());
    }
}
