import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PregradoContinuarComponent } from './pregrado-continuar.component';

describe('PregradoContinuarComponent', () => {
  let component: PregradoContinuarComponent;
  let fixture: ComponentFixture<PregradoContinuarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PregradoContinuarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PregradoContinuarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
