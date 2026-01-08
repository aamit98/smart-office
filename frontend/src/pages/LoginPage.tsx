import { useState, useEffect } from 'react';
import { authStore } from '../stores/AuthStore';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { 
    Box, Button, TextField, Typography, Paper, 
    Alert, Collapse, InputAdornment, IconButton, CircularProgress, Divider
} from '@mui/material';
import { Person, Lock, Visibility, VisibilityOff, Login } from '@mui/icons-material';
import { SmartOfficeLogo } from '../components/SmartOfficeLogo';

const LoginPage = observer(() => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    // State for error message
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (authStore.isAuthenticated) {
            navigate('/dashboard');
        }
    }, [authStore.isAuthenticated, navigate]);

    const handleSubmit = async () => {
        if (isLoading) return;
        setErrorMessage(null);

        // Client-side validation
        if (!username || !password) {
            setErrorMessage("Please enter both username and password.");
            return;
        }
        
        setIsLoading(true);
        try {
            // Call the updated function
            const result = await authStore.login(username, password);
            
            if (result.success) {
                navigate('/dashboard');
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
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            overflow: 'hidden',
            position: 'relative'
        }}>
            {/* Animated Floating Background Shapes */}
            <Box
                sx={{
                    position: 'absolute',
                    top: '-10%',
                    right: '-5%',
                    width: '40%',
                    height: '40%',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    animation: 'float 6s ease-in-out infinite',
                    '@keyframes float': {
                        '0%, 100%': { transform: 'translateY(0px)' },
                        '50%': { transform: 'translateY(-20px)' },
                    },
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    bottom: '-10%',
                    left: '-10%',
                    width: '50%',
                    height: '50%',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.08)',
                    animation: 'float 8s ease-in-out infinite',
                    animationDelay: '1s'
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

                    <Box sx={{ mb: 2 }}>
                        <SmartOfficeLogo color="#1a237e" />
                    </Box>
                    <Typography component="h1" variant="h4" sx={{ fontWeight: 800, color: '#2d3748', mb: 1 }}>
                        Welcome Back
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        Please sign in to access your workspace
                    </Typography>
                    
                    {/* --- Notification Area --- */}
                    <Collapse in={!!errorMessage} sx={{ width: '100%', mb: 2, mt: 2 }}>
                        <Alert severity="error" onClose={() => setErrorMessage(null)}>
                            {errorMessage}
                        </Alert>
                    </Collapse>
                    {/* ------------------- */}

                    <Box component="form" noValidate sx={{ mt: 1, width: '100%' }}>
                        <TextField
                            margin="normal" required fullWidth label="Username" autoFocus
                            value={username} 
                            onChange={(e) => {
                                setUsername(e.target.value);
                                setErrorMessage(null); // Hide error when user starts typing
                            }} 
                            error={!!errorMessage} // Highlight border in red on error
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Person sx={{ color: 'action.active' }} />
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
                        <Button
                            fullWidth variant="contained" size="large" sx={{ mt: 3, mb: 3, height: 48, fontWeight: 700, fontSize: '1rem' }}
                            onClick={handleSubmit}
                            disabled={isLoading}
                            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Login />}
                        >
                            {isLoading ? "Signing In..." : "Sign In"}
                        </Button>

                        <Divider sx={{ my: 2 }}>
                            <Typography variant="caption" color="text.secondary">
                                NEW USER?
                            </Typography>
                        </Divider>

                        <Button 
                            fullWidth 
                            variant="outlined" 
                            size="large"
                            onClick={() => navigate('/register')}
                            sx={{ height: 48, fontWeight: 600 }}
                        >
                             Create an Account
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
});

export default LoginPage;