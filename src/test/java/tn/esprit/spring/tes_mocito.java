package tn.esprit.tpfoyer.control;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import tn.esprit.tpfoyer.entity.Chambre;
import tn.esprit.tpfoyer.entity.TypeChambre;
import tn.esprit.tpfoyer.service.IChambreService;

import java.util.Arrays;
import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

class ChambreRestControllerTest {

    private MockMvc mockMvc;

    @Mock
    IChambreService chambreService;

    @InjectMocks
    ChambreRestController chambreRestController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        this.mockMvc = MockMvcBuilders.standaloneSetup(chambreRestController).build();
    }

    @Test
    void testGetChambres() throws Exception {
        // Arrange
        Chambre chambre1 = new Chambre(1L, 101L, TypeChambre.SIMPLE, null, null);
        Chambre chambre2 = new Chambre(2L, 102L, TypeChambre.DOUBLE, null, null);
        List<Chambre> chambres = Arrays.asList(chambre1, chambre2);
        when(chambreService.retrieveAllChambres()).thenReturn(chambres);

        // Act & Assert
        mockMvc.perform(get("/chambre/retrieve-all-chambres")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].numeroChambre").value(101L))
                .andExpect(jsonPath("$[1].numeroChambre").value(102L));
    }

    @Test
    void testRetrieveChambre() throws Exception {
        // Arrange
        Chambre chambre = new Chambre(1L, 101L, TypeChambre.SIMPLE, null, null);
        when(chambreService.retrieveChambre(1L)).thenReturn(chambre);

        // Act & Assert
        mockMvc.perform(get("/chambre/retrieve-chambre/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.numeroChambre").value(101L));
    }

    @Test
    void testAddChambre() throws Exception {
        // Arrange
        Chambre chambre = new Chambre(1L, 101L, TypeChambre.SIMPLE, null, null);
        when(chambreService.addChambre(any(Chambre.class))).thenReturn(chambre);

        // Act & Assert
        mockMvc.perform(post("/chambre/add-chambre")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"numeroChambre\": 101, \"typeC\": \"SIMPLE\" }"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.numeroChambre").value(101L));
    }

    @Test
    void testRemoveChambre() throws Exception {
        // Act & Assert
        mockMvc.perform(delete("/chambre/remove-chambre/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
        verify(chambreService, times(1)).removeChambre(1L);
    }

    @Test
    void testModifyChambre() throws Exception {
        // Arrange
        Chambre chambre = new Chambre(1L, 101L, TypeChambre.SIMPLE, null, null);
        when(chambreService.modifyChambre(any(Chambre.class))).thenReturn(chambre);

        // Act & Assert
        mockMvc.perform(put("/chambre/modify-chambre")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"numeroChambre\": 101, \"typeC\": \"SIMPLE\" }"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.numeroChambre").value(101L));
    }
}
