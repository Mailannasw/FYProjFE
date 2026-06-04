import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SignupComponent } from './signup.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpClientModule } from '@angular/common/http';
import { DataService } from '../services/data.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let dataService: DataService;
  let router: Router;

  // Before each test, configure these settings
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SignupComponent,
        HttpClientTestingModule,
        HttpClientModule,
        FormsModule,
        DialogModule,
        ButtonModule,
        InputTextModule
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

    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    dataService = TestBed.inject(DataService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Dialog handling', () => {
    it('should show signup dialog when toggleSignupDialog is called', () => {
      component.toggleSignupDialog();
      expect(component.showSignupDialog).toBe(true);
    });

    it('should close dialog and reset fields when closeDialog is called', () => {
      component.showSignupDialog = true;
      component.username = 'testuser';
      component.password = 'password123';
      component.confirmPassword = 'password123';
      component.errorMessage = 'Some error';

      component.closeDialog();

      expect(component.showSignupDialog).toBe(false);
      expect(component.username).toBe('');
      expect(component.password).toBe('');
      expect(component.confirmPassword).toBe('');
      expect(component.errorMessage).toBe('');
    });
  });

  describe('Form validation', () => {
    it('should show error when username is empty', () => {
      component.username = '';
      component.password = 'password123';
      component.confirmPassword = 'password123';

      component.signup();

      expect(component.errorMessage).toBe('Username and password are required');
    });

    it('should show error when password is empty', () => {
      component.username = 'testuser';
      component.password = '';
      component.confirmPassword = '';

      component.signup();

      expect(component.errorMessage).toBe('Username and password are required');
    });

    it('should show error when passwords do not match', () => {
      component.username = 'testuser';
      component.password = 'password123';
      component.confirmPassword = 'different';

      component.signup();

      expect(component.errorMessage).toBe('Passwords do not match');
    });
  });

  describe('Signup functionality', () => {
    it('should call createUser and auto-login when form is valid', fakeAsync(() => {
      const username = 'testuser';
      const password = 'password123';
      const createUserResponse = { id: 1, username: username };
      const loginResponse = { jwt: 'test-token' };

      spyOn(dataService, 'createUser').and.returnValue(of(createUserResponse));
      spyOn(dataService, 'login').and.returnValue(of(loginResponse));
      spyOn(component.signupComplete, 'emit');
      spyOn(window, 'dispatchEvent');
      spyOn(localStorage, 'setItem');

      const originalCloseDialog = component.closeDialog;

      spyOn(component, 'closeDialog').and.callFake(() => {
        component.showSignupDialog = false;
      });

      component.username = username;
      component.password = password;
      component.confirmPassword = password;

      component.signup();
      tick();

      expect(dataService.createUser).toHaveBeenCalledWith(username, password);
      expect(component.signupComplete.emit).toHaveBeenCalledWith(true);
      expect(component.showSignupDialog).toBe(false);

      expect(dataService.login).toHaveBeenCalledWith(username, password);
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'test-token');
      expect(window.dispatchEvent).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/home']);

      component.closeDialog = originalCloseDialog;
    }));

    it('should handle different token format in login response', fakeAsync(() => {
      const username = 'testuser';
      const password = 'password123';
      const createUserResponse = { id: 1, username: username };
      const loginResponse = { token: 'test-token' };

      spyOn(dataService, 'createUser').and.returnValue(of(createUserResponse));
      spyOn(dataService, 'login').and.returnValue(of(loginResponse));
      spyOn(localStorage, 'setItem');

      spyOn(component, 'closeDialog').and.callFake(() => {
        component.showSignupDialog = false;
      });

      component.username = username;
      component.password = password;
      component.confirmPassword = password;

      component.signup();
      tick();

      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'test-token');
    }));

    it('should handle createUser error', fakeAsync(() => {
      const errorResponse = {
        error: {
          message: 'Username already exists'
        }
      };

      spyOn(dataService, 'createUser').and.returnValue(throwError(() => errorResponse));
      spyOn(console, 'error');

      component.username = 'testuser';
      component.password = 'password123';
      component.confirmPassword = 'password123';

      component.signup();
      tick();

      expect(console.error).toHaveBeenCalled();
      expect(component.errorMessage).toBe('Username already exists');
    }));

    it('should handle generic createUser error', fakeAsync(() => {
      const errorResponse = { status: 500 };

      spyOn(dataService, 'createUser').and.returnValue(throwError(() => errorResponse));

      component.username = 'testuser';
      component.password = 'password123';
      component.confirmPassword = 'password123';

      component.signup();
      tick();

      expect(component.errorMessage).toBe('Failed to create account');
    }));

    it('should handle login error after successful signup', fakeAsync(() => {
      const createUserResponse = { id: 1, username: 'testuser' };
      const loginError = new Error('Login failed');

      spyOn(dataService, 'createUser').and.returnValue(of(createUserResponse));
      spyOn(dataService, 'login').and.returnValue(throwError(() => loginError));
      spyOn(console, 'error');

      spyOn(component, 'closeDialog').and.callFake(() => {
        component.showSignupDialog = false;
      });

      component.username = 'testuser';
      component.password = 'password123';
      component.confirmPassword = 'password123';

      component.signup();
      tick();

      expect(console.error).toHaveBeenCalledWith('Auto-login failed after signup', jasmine.any(Error));
    }));
  });
});
