import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpClientModule } from '@angular/common/http';
import { DataService } from './services/data.service';
import { RouterTestingModule } from '@angular/router/testing';

describe('AppComponent', () => {

  // Before each test, configure these settings
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        HttpClientTestingModule,
        HttpClientModule,
        RouterTestingModule
      ],
      providers: [
        DataService
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeDefined();
  });

  it(`should have the 'FYProjFE' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toBe('FYProjFE');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('p-menubar')).toBeDefined();
    expect(compiled.querySelector('router-outlet')).toBeDefined();
  });
});
