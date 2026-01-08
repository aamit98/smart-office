import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RegisterPage from './RegisterPage';
import { BrowserRouter } from 'react-router-dom';
import { authStore } from '../stores/AuthStore';

// Mock the AuthStore
vi.mock('../stores/AuthStore', () => ({
    authStore: {
        register: vi.fn(),
    }
}));

// Mock useNavigate
const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => navigateMock,
    };
});

describe('RegisterPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should show specific validation errors when fields are empty', () => {
        render(
            <BrowserRouter>
                <RegisterPage />
            </BrowserRouter>
        );

        // Find the register button (it has text "Register")
        // Note: Button text might be "Register" or "Creating Account..." inside loading state
        // The accessible name should be "Register"
        const registerButton = screen.getByRole('button', { name: /Register/i });
        fireEvent.click(registerButton);

        // Check for helper texts
        expect(screen.getByText('Username is required')).toBeInTheDocument();
        expect(screen.getByText('Full Name is required')).toBeInTheDocument();
        expect(screen.getByText('Password is required')).toBeInTheDocument();
    });

    it('should show password length error', () => {
        render(
            <BrowserRouter>
                <RegisterPage />
            </BrowserRouter>
        );

        // Fill in valid username/fullname but short password
        fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'User1' } });
        fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Test User' } });
        fireEvent.change(screen.getByLabelText(/Password/i, { selector: 'input' }), { target: { value: '123' } });

        const registerButton = screen.getByRole('button', { name: /Register/i });
        fireEvent.click(registerButton);

        expect(screen.getByText('Password must be at least 6 characters long')).toBeInTheDocument();
    });

    it('should call authStore.register when form is valid', () => {
        render(
            <BrowserRouter>
                <RegisterPage />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'validuser' } });
        fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Valid User' } });
        fireEvent.change(screen.getByLabelText(/Password/i, { selector: 'input' }), { target: { value: 'password123' } });

        // Mock success response
        vi.mocked(authStore.register).mockResolvedValue({ success: true, message: 'Success' });

        const registerButton = screen.getByRole('button', { name: /Register/i });
        fireEvent.click(registerButton);

        expect(authStore.register).toHaveBeenCalledWith('validuser', 'Valid User', 'password123', 'Member');
    });
});
