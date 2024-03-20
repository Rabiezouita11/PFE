import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuloginComponent } from './menulogin.component';

describe('MenuloginComponent', () => {
  let component: MenuloginComponent;
  let fixture: ComponentFixture<MenuloginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MenuloginComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuloginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
