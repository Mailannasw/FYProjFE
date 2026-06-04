import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { DataService } from '../services/data.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { HttpClientModule } from '@angular/common/http';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let dataService: DataService;
  let router: Router;

  // Before each test, configure these settings
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        HttpClientModule,
        FormsModule,
        DialogModule,
        ButtonModule,
        InputTextModule,
        LoginComponent
      ],
      providers: [
        DataService,
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate')
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    dataService = TestBed.inject(DataService);
    router = TestBed.inject(Router);
    localStorage.clear(); // Clear localStorage before each test
  });

  // Clear local storage after each test due to dealing with JWTs
  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with correct default values', () => {
      expect(component.isLoggedIn).toBe(false);
      expect(component.showLoginDialog).toBe(false);
      expect(component.username).toBe('');
      expect(component.password).toBe('');
      expect(component.errorMessage).toBe('');
    });
  });

  describe('Dialog handling', () => {
    it('should show login dialog when not logged in', () => {
      component.toggleLoginDialog();
      expect(component.showLoginDialog).toBe(true);
    });

    it('should close dialog and clear fields', () => {
      component.showLoginDialog = true;
      component.username = 'test';
      component.password = 'test';
      component.errorMessage = 'error';

      component.closeDialog();

      expect(component.showLoginDialog).toBe(false);
      expect(component.username).toBe('');
      expect(component.password).toBe('');
      expect(component.errorMessage).toBe('');
    });
  });

  describe('Login functionality', () => {
    it('should show error when login fields are empty', () => {
      component.login();
      expect(component.errorMessage).toBe('Username and password are required');
    });

    it('should handle successful login', () => {
      const mockResponse = { jwt: 'test-token' };
      spyOn(dataService, 'login').and.returnValue(of(mockResponse));
      spyOn(component.loginStatusChange, 'emit');

      component.username = 'test';
      component.password = 'test';
      component.login();

      expect(localStorage.getItem('token')).toBe('test-token');
      expect(component.isLoggedIn).toBe(true);
      expect(component.showLoginDialog).toBe(false);
      expect(component.loginStatusChange.emit).toHaveBeenCalledWith(true);
    });

    it('should handle failed login', () => {
      spyOn(dataService, 'login').and.returnValue(throwError(() => new Error('Invalid credentials')));

      component.username = 'test';
      component.password = 'test';
      component.login();

      expect(component.errorMessage).toBe('Invalid username or password');
      expect(localStorage.getItem('token')).toBeNull();
      expect(component.isLoggedIn).toBe(false);
    });

    it('should handle invalid token format in response', () => {
      const mockResponse = { invalid: 'format' };
      spyOn(dataService, 'login').and.returnValue(of(mockResponse));

      component.username = 'test';
      component.password = 'test';
      component.login();

      expect(component.errorMessage).toBe('Authentication failed: Invalid response format');
      expect(localStorage.getItem('token')).toBeNull();
      expect(component.isLoggedIn).toBe(false);
    });
  });

  describe('Logout functionality', () => {
    it('should call logout when logged in', () => {
      localStorage.setItem('token', 'test-token');
      component.isLoggedIn = true;
      spyOn(component.loginStatusChange, 'emit');

      component.toggleLoginDialog();

      expect(localStorage.getItem('token')).toBeNull();
      expect(component.isLoggedIn).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/home']);
      expect(component.loginStatusChange.emit).toHaveBeenCalledWith(false);
    });

    it('should remove token and update login status', () => {
      localStorage.setItem('token', 'test-token');
      component.isLoggedIn = true;
      spyOn(component.loginStatusChange, 'emit');

      component.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(component.isLoggedIn).toBe(false);
      expect(component.loginStatusChange.emit).toHaveBeenCalledWith(false);
      expect(router.navigate).toHaveBeenCalledWith(['/home']);
    });
  });
});
