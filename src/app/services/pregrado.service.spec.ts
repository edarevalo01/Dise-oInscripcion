import { TestBed } from '@angular/core/testing';

import { PregradoService } from './pregrado.service';

describe('PregradoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PregradoService = TestBed.get(PregradoService);
    expect(service).toBeTruthy();
  });
});
