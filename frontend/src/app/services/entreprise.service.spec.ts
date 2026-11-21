import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { EntrepriseService } from './entreprise.service';
import { Entreprise } from '../models/entreprise.model';

describe('EntrepriseService', () => {
  let service: EntrepriseService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EntrepriseService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(EntrepriseService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('should fetch all entreprises', () => {
    const entreprises: Entreprise[] = [{ id: 1, nom: 'Acme', adresse: 'Tunis' }];

    service.getAll().subscribe((result) => {
      expect(result).toEqual(entreprises);
    });

    const request = http.expectOne('http://localhost:8080/entreprise/all');
    expect(request.request.method).toBe('GET');
    request.flush(entreprises);
  });

  it('should delete an entreprise by id', () => {
    service.delete(3).subscribe();

    const request = http.expectOne('http://localhost:8080/entreprise/delete/3');
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });
});
