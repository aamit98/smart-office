import { useState, useEffect } from 'react';
import { authStore } from '../stores/AuthStore';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { 
    Box, Button, TextField, Typography, Paper, 
    Alert, Collapse 
} from '@mui/material';
import { SmartOfficeLogo } from '../components/SmartOfficeLogo';

const LoginPage = observer(() => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    
    // סטייט להודעת השגיאה
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (authStore.isAuthenticated) {
            navigate('/dashboard');
        }
    }, [authStore.isAuthenticated, navigate]);

    const handleSubmit = async () => {
        setErrorMessage(null);

        // Client-side validation
        if (!username || !password) {
            setErrorMessage("Please enter both username and password.");
            return;
        }
        
        // Call the updated function
        const result = await authStore.login(username, password);
        
        if (result.success) {
            navigate('/dashboard');
        } else {
            setErrorMessage(result.message);
        }
    };

    return (
        <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f0f2f5' }}>
            <Paper elevation={10} sx={{ p: 4, width: '100%', maxWidth: 400, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box sx={{ mb: 3 }}>
                        <SmartOfficeLogo color="#1a237e" />
                    </Box>
                    <Typography component="h1" variant="h5">
                        Sign In
                    </Typography>
                    
                    {/* --- אזור ההתראות --- */}
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
                                setErrorMessage(null); // מסתיר את השגיאה כשהמשתמש מתחיל להקליד
                            }} 
                            error={!!errorMessage} // צובע את המסגרת באדום
                        />
                        <TextField
                            margin="normal" required fullWidth label="Password" type="password"
                            value={password} 
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setErrorMessage(null);
                            }} 
                            error={!!errorMessage}
                        />
                        <Button
                            fullWidth variant="contained" size="large" sx={{ mt: 3, mb: 2 }}
                            onClick={handleSubmit}
                        >
                            Sign In
                        </Button>
                        <Button fullWidth onClick={() => navigate('/register')}>
                            Don't have an account? Register
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
});

export default LoginPage;