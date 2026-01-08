import { useState, useEffect } from 'react';
import { authStore } from '../stores/AuthStore';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Paper, Avatar } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const LoginPage = observer(() => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);

    useEffect(() => {
        if (authStore.isAuthenticated) {
            navigate('/dashboard');
        }
    }, [authStore.isAuthenticated, navigate]);

    const handleSubmit = async () => {
        const success = await authStore.login(username, password);
        if (success) {
        
            navigate('/dashboard');
        } else {
            setError(true);
        }
    };

    return (
        <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f0f2f5' }}>
            <Paper elevation={10} sx={{ p: 4, width: '100%', maxWidth: 400, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Sign In
                    </Typography>
                    
                    <Box component="form" noValidate sx={{ mt: 1, width: '100%' }}>
                        <TextField
                            margin="normal" required fullWidth label="Username" autoFocus
                            value={username} onChange={(e) => setUsername(e.target.value)} error={error}
                        />
                        <TextField
                            margin="normal" required fullWidth label="Password" type="password"
                            value={password} onChange={(e) => setPassword(e.target.value)} error={error}
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