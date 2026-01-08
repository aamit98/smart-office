import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { authStore } from '../stores/AuthStore';
import { resourceStore } from '../stores/ResourceStore';
import { useNavigate } from 'react-router-dom';
import { 
    Box, AppBar, Toolbar, Typography, Button, Container, Grid, Paper, 
    Card, CardContent, CardActions, Chip, IconButton, Tooltip
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DevicesIcon from '@mui/icons-material/Devices';
import RefreshIcon from '@mui/icons-material/Refresh';
import { AddAssetDialog } from '../components/AddAssetDialog';
import { AssetDetailsDialog } from '../components/AssetDetailsDialog';
import { SmartOfficeLogo } from '../components/SmartOfficeLogo';
import type { Asset } from '../stores/ResourceStore';

const DashboardPage = observer(() => {
    const navigate = useNavigate();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
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

    // חישוב סטטיסטיקות
    const totalAssets = resourceStore.assets.length;
    const availableAssets = resourceStore.assets.filter(a => a.isAvailable).length;
    const inUseAssets = totalAssets - availableAssets;

    if (!authStore.isAuthenticated) return null;

    return (
        <Box sx={{ flexGrow: 1, height: '100vh', bgcolor: '#f0f2f5', overflow: 'auto' }}>
            {/* Navbar */}
            <AppBar position="static" elevation={0} sx={{ bgcolor: '#1a237e' }}>
                <Toolbar>
                    <Box sx={{ flexGrow: 1 }}>
                        <SmartOfficeLogo />
                    </Box>
                    <Typography variant="body2" sx={{ mr: 2, opacity: 0.9 }}>
                        Hello, {authStore.username}
                    </Typography>
                    <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>

            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                
                {/* 1. Statistics (Widgets) */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 2, boxShadow: 2, borderBottom: '4px solid #1a237e' }}>
                            <Typography color="text.secondary" variant="overline" sx={{ fontSize: '0.9rem' }}>Total Assets</Typography>
                            <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#1a237e' }}>{totalAssets}</Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 2, boxShadow: 2, borderBottom: '4px solid #4caf50' }}>
                            <Typography color="text.secondary" variant="overline" sx={{ fontSize: '0.9rem' }}>Available</Typography>
                            <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#4caf50' }}>{availableAssets}</Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 2, boxShadow: 2, borderBottom: '4px solid #f44336' }}>
                            <Typography color="text.secondary" variant="overline" sx={{ fontSize: '0.9rem' }}>In Use</Typography>
                            <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#f44336' }}>{inUseAssets}</Typography>
                        </Paper>
                    </Grid>
                </Grid>

                {/* 2. Title and Buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#37474f' }}>
                        Asset Inventory
                    </Typography>
                    <Box>
                        <Tooltip title="Refresh Data">
                            <IconButton onClick={() => resourceStore.loadAssets()} sx={{ mr: 1 }}>
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                        
                        {/* The button will appear only to admin */}
                        {authStore.isAdmin && (
                            <Button 
                                variant="contained" 
                                startIcon={<AddCircleIcon />}
                                onClick={() => setIsDialogOpen(true)}
                                sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
                            >
                                Add New Asset
                            </Button>
                        )}
                    </Box>
                </Box>

                {/* Gird of cards */}
                {resourceStore.isLoading ? (
                    <Typography sx={{ textAlign: 'center', mt: 4 }}>Loading assets...</Typography>
                ) : (
                    <Grid container spacing={3}>
                        {resourceStore.assets.map((asset) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={asset.id}>
                                <Card sx={{ 
                                    height: '100%', 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    borderRadius: 3,
                                    transition: '0.3s',
                                    '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 }
                                }}>
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                            {/* אייקון לפי סוג הנכס */}
                                            <Box sx={{ 
                                                p: 1.5, 
                                                borderRadius: '50%', 
                                                bgcolor: asset.type === 'Room' ? '#e3f2fd' : '#f3e5f5',
                                                color: asset.type === 'Room' ? '#1976d2' : '#9c27b0'
                                            }}>
                                                {asset.type === 'Room' ? <MeetingRoomIcon /> : 
                                                 asset.type === 'Desk' ? <DesktopWindowsIcon /> : <DevicesIcon />}
                                            </Box>
                                            
                                            {/* סטטוס זמינות */}
                                            <Chip 
                                                label={asset.isAvailable ? "Available" : "Taken"} 
                                                color={asset.isAvailable ? "success" : "error"} 
                                                size="small"
                                                variant={asset.isAvailable ? "outlined" : "filled"}
                                            />
                                        </Box>

                                        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                            {asset.name}
                                        </Typography>
                                        <Typography sx={{ mb: 1.5, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: 1 }} color="text.secondary">
                                            {asset.type}
                                        </Typography>
                                        <Typography variant="body2" color="text.primary" sx={{ 
                                            display: '-webkit-box',
                                            overflow: 'hidden',
                                            WebkitBoxOrient: 'vertical',
                                            WebkitLineClamp: 2 // מגביל ל-2 שורות תיאור
                                        }}>
                                            {asset.description}
                                        </Typography>
                                    </CardContent>
                                    
                                    {/* כפתור למטה (אופציונלי לקישוט) */}
                                    <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
                                        <Button size="small" color="primary" onClick={() => setSelectedAsset(asset)}>View Details</Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
                
                {/* Message if no assets */}
                {!resourceStore.isLoading && resourceStore.assets.length === 0 && (
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                        <Typography color="text.secondary">No assets found. Click "Add New Asset" to start.</Typography>
                    </Paper>
                )}
            </Container>

            {/* Add Asset Dialog */}
            <AddAssetDialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
            <AssetDetailsDialog asset={selectedAsset} onClose={() => setSelectedAsset(null)} />        

        </Box>
    );
});

export default DashboardPage;