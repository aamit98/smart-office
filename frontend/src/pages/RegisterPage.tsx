import { useState } from 'react';
import { authStore } from '../stores/AuthStore';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { 
    Box, Button, TextField, Typography, Paper, 
    MenuItem, Select, FormControl, InputLabel,
    Alert, Collapse 
} from '@mui/material';
import { SmartOfficeLogo } from '../components/SmartOfficeLogo';

const RegisterPage = observer(() => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Member');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const navigate = useNavigate(); 

    const handleRegister = async () => {
        setErrorMessage(null);
        setSuccessMessage(null);

        // Validation
        if (!username || !password) {
            setErrorMessage("All fields are required.");
            return;
        }
        if (password.length < 6) {
            setErrorMessage("Password must be at least 6 characters long.");
            return;
        }

        const result = await authStore.register(username, password, role);
        if (result.success) {
            setSuccessMessage("Registration successful! Redirecting...");
            setTimeout(() => navigate('/login'), 1500); 
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
                        
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Role</InputLabel>
                            <Select
                                value={role}
                                label="Role"
                                onChange={(e) => setRole(e.target.value)}
                            >
                                <MenuItem value="Member">Member</MenuItem>
                                <MenuItem value="Admin">Admin</MenuItem>
                            </Select>
                        </FormControl>

                        <Button
                            fullWidth variant="contained" sx={{ mt: 3, mb: 2, height: 50 }}
                            onClick={handleRegister}
                        >
                            Register
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