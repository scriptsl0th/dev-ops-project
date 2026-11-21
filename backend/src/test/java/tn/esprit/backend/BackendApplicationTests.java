package tn.esprit.backend;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import tn.esprit.backend.entity.Entreprise;
import tn.esprit.backend.repository.EntrepriseRepository;
import tn.esprit.backend.service.impl.EntrepriseServiceImpl;

class BackendApplicationTests {

    private final EntrepriseRepository entrepriseRepository = Mockito.mock(EntrepriseRepository.class);

    @Test
    void addsAnEntreprise() {
        Entreprise entreprise = new Entreprise();
        entreprise.setNom("Acme");
        entreprise.setAdresse("Tunis");
        EntrepriseServiceImpl service = new EntrepriseServiceImpl(entrepriseRepository);
        Mockito.when(entrepriseRepository.save(entreprise)).thenReturn(entreprise);

        org.junit.jupiter.api.Assertions.assertSame(entreprise, service.addEntreprise(entreprise));
        Mockito.verify(entrepriseRepository).save(entreprise);
    }
}
