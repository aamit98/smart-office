import { useState } from 'react';
import { authStore } from '../stores/AuthStore';
import { observer } from 'mobx-react-lite';
import { useNavigate, Link } from 'react-router-dom';
import { 
    Box, Button, TextField, Typography, Paper, 
    Avatar, MenuItem, Select, FormControl, InputLabel 
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const RegisterPage = observer(() => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Member');
    const navigate = useNavigate(); 

    const handleRegister = async () => {
        const success = await authStore.register(username, password, role);
        if (success) {
            alert("login successful! please log in.");
            navigate('/login'); 
        } else {
            alert("registration failed, please try again.");
        }
    };

    return (
        <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f0f2f5' }}>
            <Paper elevation={10} sx={{ p: 4, width: '100%', maxWidth: 400, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                        <PersonAddIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Sign Up
                    </Typography>
                    
                    <Box component="form" sx={{ mt: 1, width: '100%' }}>
                        <TextField
                            margin="normal" required fullWidth label="Username"
                            value={username} onChange={(e) => setUsername(e.target.value)}
                        />
                        <TextField
                            margin="normal" required fullWidth label="Password" type="password"
                            value={password} onChange={(e) => setPassword(e.target.value)}
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