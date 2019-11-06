import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PregradoComponent } from './pregrado.component';

describe('PregradoComponent', () => {
  let component: PregradoComponent;
  let fixture: ComponentFixture<PregradoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PregradoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PregradoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
