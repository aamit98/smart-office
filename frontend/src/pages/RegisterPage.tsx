import { useState } from 'react';
import { authStore } from '../stores/AuthStore';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { 
    Box, Button, TextField, Typography, Paper, 
    MenuItem, Select, FormControl, InputLabel,
    Alert, Collapse, InputAdornment, IconButton, CircularProgress
} from '@mui/material';
import { Person, Lock, Visibility, VisibilityOff, AppRegistration, Badge } from '@mui/icons-material';
import { SmartOfficeLogo } from '../components/SmartOfficeLogo';

const RegisterPage = observer(() => {
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState(''); // Added Full Name state
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState('Member');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate(); 

    const handleRegister = async () => {
        if (isLoading) return;
        setErrorMessage(null);
        setSuccessMessage(null);

        // Validation
        if (!username || !password || !fullName) { // Validate fullName
            setErrorMessage("All fields are required.");
            return;
        }
        if (password.length < 6) {
            setErrorMessage("Password must be at least 6 characters long.");
            return;
        }

        setIsLoading(true);
        try {
            const result = await authStore.register(username, fullName, password, role); // Pass fullName
            if (result.success) {
                setSuccessMessage("Registration successful! Redirecting...");
                setTimeout(() => navigate('/login'), 1500); 
            } else {
                setErrorMessage(result.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box sx={{ 
            height: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            background: 'linear-gradient(135deg, #FF6B6B 0%, #556270 100%)', // Different gradient for Register to distinguish
            overflow: 'hidden',
            position: 'relative'
        }}>
            {/* Animated Floating Background Shapes */}
            <Box
                sx={{
                    position: 'absolute',
                    top: '-15%',
                    left: '-10%',
                    width: '45%',
                    height: '45%',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    animation: 'float 7s ease-in-out infinite',
                    '@keyframes float': {
                        '0%, 100%': { transform: 'translateY(0px)' },
                        '50%': { transform: 'translateY(-25px)' },
                    },
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    bottom: '-20%',
                    right: '-5%',
                    width: '60%',
                    height: '60%',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    animation: 'float 9s ease-in-out infinite',
                    animationDelay: '1.5s'
                }}
            />

            <Paper elevation={0} sx={{ 
                p: 5, 
                width: '100%', 
                maxWidth: 400, 
                borderRadius: 4,
                position: 'relative', 
                zIndex: 1,
                bgcolor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                animation: 'fadeIn 0.7s cubic-bezier(0.2, 0.8, 0.2, 1)',
                '@keyframes fadeIn': {
                    '0%': { opacity: 0, transform: 'translateY(40px)' },
                    '100%': { opacity: 1, transform: 'translateY(0)' },
                }
            }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box sx={{ mb: 3 }}>
                        <SmartOfficeLogo color="#1a237e" />
                    </Box>
                    <Typography component="h1" variant="h5">
                        Sign Up
                    </Typography>

                    <Collapse in={!!errorMessage || !!successMessage} sx={{ width: '100%', mt: 2 }}>
                        {errorMessage && <Alert severity="error" onClose={() => setErrorMessage(null)}>{errorMessage}</Alert>}
                        {successMessage && <Alert severity="success">{successMessage}</Alert>}
                    </Collapse>
                    
                    <Box component="form" sx={{ mt: 1, width: '100%' }}>
                        <TextField
                            margin="normal" required fullWidth label="Username"
                            value={username} 
                            onChange={(e) => {
                                setUsername(e.target.value);
                                setErrorMessage(null);
                            }}
                            error={!!errorMessage}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Person sx={{ color: 'action.active' }} />
                                    </InputAdornment>
                                ),
                            }}
                        />
                         <TextField
                            margin="normal" required fullWidth label="Full Name"
                            value={fullName}
                            onChange={(e) => {
                                setFullName(e.target.value);
                                setErrorMessage(null);
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Badge sx={{ color: 'action.active' }} />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TextField
                            margin="normal" required fullWidth label="Password"
                            type={showPassword ? 'text' : 'password'}
                            value={password} 
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setErrorMessage(null);
                            }}
                            error={!!errorMessage}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock sx={{ color: 'action.active' }} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Role</InputLabel>
                            <Select
                                value={role}
                                label="Role"
                                onChange={(e) => setRole(e.target.value)}
                                startAdornment={
                                    <InputAdornment position="start">
                                        <Badge sx={{ color: 'action.active', ml: 1 }} />
                                    </InputAdornment>
                                }
                            >
                                <MenuItem value="Member">Member</MenuItem>
                                <MenuItem value="Admin">Admin</MenuItem>
                            </Select>
                        </FormControl>

                        <Button
                            fullWidth variant="contained" sx={{ mt: 3, mb: 2, height: 50 }}
                            onClick={handleRegister}
                            disabled={isLoading}
                            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <AppRegistration />}
                        >
                            {isLoading ? "Creating Account..." : "Register"}
                        </Button>

                        <Button fullWidth onClick={() => navigate('/login')}>
                            Already have an account? Sign In
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
});

export default RegisterPage;