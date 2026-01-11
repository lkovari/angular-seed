import { email, minLength, required, schema } from "@angular/forms/signals";

export interface SignIn {
    email: string,
    password: string,
}

export const signInItialData: SignIn = {
    email: '',
    password: '',
}

export const signInSchema = schema<SignIn>((rootPath) => {
    required(rootPath.email, { message: 'Email is required' });
    email(rootPath.email, { message: 'Enter a valid email address' });
    required(rootPath.password, { message: 'Password is required' });
    minLength(rootPath.password, 5, {
        message: 'Password must be at least 5 characters',
    });    
});

export interface SignUp extends SignIn {
    email: string,
    password: string,
    confirmPassword: string,
}

export const signUpInitialData: SignUp = {
    email: '',
    password: '',
    confirmPassword: ''
}

export const signUpSchema = schema<SignUp>((rootPath) => {
    required(rootPath.email, { message: 'Email is required' });
    email(rootPath.email, { message: 'Enter a valid email address' });
    required(rootPath.password, { message: 'Password is required' });
    minLength(rootPath.password, 5, {
        message: 'Password must be at least 5 characters',
    });
    required(rootPath.confirmPassword, {
        message: 'Confirm password is required',
    });
    minLength(rootPath.confirmPassword, 5, {
        message: 'Confirm password must be at least 5 characters',
    });
});