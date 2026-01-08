import { useEffect, useState } from 'react'; // הוספנו useState
import { observer } from 'mobx-react-lite';
import { authStore } from '../stores/AuthStore';
import { resourceStore } from '../stores/ResourceStore';
import { useNavigate } from 'react-router-dom';
import { 
    Box, AppBar, Toolbar, Typography, Button, Container, Grid, Paper, 
    List, ListItem, ListItemAvatar, Avatar, ListItemText, Chip, Divider 
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { AddAssetDialog } from '../components/AddAssetDialog'; // הייבוא החדש

const DashboardPage = observer(() => {
    const navigate = useNavigate();
    const [isDialogOpen, setIsDialogOpen] = useState(false); // הסטייט החדש

    useEffect(() => {
        if (!authStore.isAuthenticated) {
            navigate('/login');
        } else {
            resourceStore.loadAssets();
        }
    }, [authStore.isAuthenticated, navigate]);

    const handleLogout = () => {
        authStore.logout();
        navigate('/login');
    };

    if (!authStore.isAuthenticated) return null;



    return (
        <Box sx={{ flexGrow: 1, height: '100vh', bgcolor: '#f5f5f5', overflow: 'auto' }}>
            <AppBar position="static" sx={{ bgcolor: '#1976d2' }}>
                <Toolbar>
                    {/* ... (אותו דבר כמו קודם) ... */}
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Smart Office Manager
                    </Typography>
                    <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>Logout</Button>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={8} lg={9}>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', minHeight: 240 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h5" color="primary">Assets Overview</Typography>
                                
                                {/* הכפתור עכשיו פותח את הדיאלוג */}
                                {authStore.isAdmin && (
                                    <Button 
                                        startIcon={<AddCircleIcon />} 
                                        variant="contained" 
                                        size="small"
                                        onClick={() => setIsDialogOpen(true)} // הנה הקסם!
                                    >
                                        Add Asset
                                    </Button>
                                )}
                            </Box>
                            
                            {/* ... (רשימת הנכסים נשארת אותו דבר) ... */}
                             {resourceStore.isLoading ? (
                                <Typography>Loading...</Typography>
                            ) : (
                                <List>
                                    {resourceStore.assets.map((asset) => (
                                        <div key={asset.id}>
                                            <ListItem>
                                                <ListItemAvatar>
                                                    <Avatar sx={{ bgcolor: asset.type === 'Room' ? 'orange' : 'blue' }}>
                                                        {asset.type === 'Room' ? <MeetingRoomIcon /> : <DesktopWindowsIcon />}
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText primary={asset.name} secondary={asset.description} />
                                                <Chip label={asset.isAvailable ? "Available" : "Taken"} color={asset.isAvailable ? "success" : "error"} variant="outlined" />
                                            </ListItem>
                                            <Divider variant="inset" component="li" />
                                        </div>
                                    ))}
                                </List>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </Container>

            <AddAssetDialog 
                open={isDialogOpen} 
                onClose={() => setIsDialogOpen(false)} 
            />
        </Box>
    );
});

export default DashboardPage;