import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { authStore } from '../stores/AuthStore';
import { resourceStore } from '../stores/ResourceStore';
import { useNavigate } from 'react-router-dom';
import { 
    Box, AppBar, Toolbar, Typography, Button, Container, Grid, Paper, 
    Card, CardContent, CardActions, Chip, IconButton, Tooltip, Pagination, CircularProgress, CardActionArea
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import AddCircleIcon from '@mui/icons-material/AddCircle';
// import DevicesIcon from '@mui/icons-material/Devices'; // Removed as we handle it dynamicly now
import RefreshIcon from '@mui/icons-material/Refresh';
import LaptopMacIcon from '@mui/icons-material/LaptopMac';
import VideocamIcon from '@mui/icons-material/Videocam';
import ChairIcon from '@mui/icons-material/Chair';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CoPresentIcon from '@mui/icons-material/CoPresent';
import DevicesForbidIcon from '@mui/icons-material/DevicesOther'; // Fallback
import PrintIcon from '@mui/icons-material/Print';
import ScienceIcon from '@mui/icons-material/Science';
import InventoryIcon from '@mui/icons-material/Inventory';
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

    if (!authStore.isAuthenticated) return null;

    return (
        <Box sx={{ 
            flexGrow: 1, 
            height: '100vh', 
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', 
            overflow: 'auto',
            animation: 'fadeIn 0.5s ease-out',
            '@keyframes fadeIn': {
                '0%': { opacity: 0 },
                '100%': { opacity: 1 },
            }
        }}>
            {/* Navbar */}
            <AppBar position="sticky" elevation={0} sx={{ 
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
                color: '#1a237e'
            }}>
                <Toolbar>
                    <Box sx={{ flexGrow: 1 }}>
                        <SmartOfficeLogo color="#1a237e" />
                    </Box>
                    <Typography variant="body2" sx={{ mr: 2, fontWeight: 500 }}>
                        Hello, {authStore.username}
                    </Typography>
                    <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>

            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                
                {/* 1. Statistics (Widgets) - Clickable for filtering */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Paper 
                            onClick={() => resourceStore.setFilter('all')}
                            sx={{ 
                                p: 3, 
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'center', 
                                borderRadius: 4, 
                                background: resourceStore.filter === 'all' 
                                    ? 'rgba(255, 255, 255, 0.9)' 
                                    : 'rgba(255, 255, 255, 0.6)',
                                backdropFilter: 'blur(10px)',
                                border: resourceStore.filter === 'all' 
                                    ? '2px solid #1a237e' 
                                    : '1px solid rgba(255, 255, 255, 0.4)',
                                boxShadow: resourceStore.filter === 'all'
                                    ? '0 8px 32px rgba(26, 35, 126, 0.2)'
                                    : '0 8px 32px rgba(31, 38, 135, 0.05)',
                                transition: 'all 0.3s ease-in-out',
                                cursor: 'pointer',
                                transform: resourceStore.filter === 'all' ? 'translateY(-5px)' : 'none',
                                '&:hover': { transform: 'translateY(-5px)' }
                            }}
                        >
                            <Typography color="text.secondary" variant="overline" sx={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: 1 }}>Total Assets</Typography>
                            <Typography variant="h3" sx={{ fontWeight: '800', background: 'linear-gradient(45deg, #1a237e 30%, #534bae 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{resourceStore.stats.totalAssets}</Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Paper 
                            onClick={() => resourceStore.setFilter('available')}
                            sx={{ 
                                p: 3, 
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'center', 
                                borderRadius: 4, 
                                background: resourceStore.filter === 'available'
                                    ? 'rgba(255, 255, 255, 0.9)'
                                    : 'rgba(255, 255, 255, 0.6)',
                                backdropFilter: 'blur(10px)',
                                border: resourceStore.filter === 'available'
                                    ? '2px solid #2e7d32'
                                    : '1px solid rgba(255, 255, 255, 0.4)',
                                boxShadow: resourceStore.filter === 'available'
                                    ? '0 8px 32px rgba(46, 125, 50, 0.2)'
                                    : '0 8px 32px rgba(31, 38, 135, 0.05)',
                                transition: 'all 0.3s ease-in-out',
                                cursor: 'pointer',
                                transform: resourceStore.filter === 'available' ? 'translateY(-5px)' : 'none',
                                '&:hover': { transform: 'translateY(-5px)' }
                            }}
                        >
                            <Typography color="text.secondary" variant="overline" sx={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: 1 }}>Available</Typography>
                            <Typography variant="h3" sx={{ fontWeight: '800', background: 'linear-gradient(45deg, #2e7d32 30%, #66bb6a 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{resourceStore.stats.availableAssets}</Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Paper 
                            onClick={() => resourceStore.setFilter('inUse')}
                            sx={{ 
                                p: 3, 
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'center', 
                                borderRadius: 4, 
                                background: resourceStore.filter === 'inUse'
                                    ? 'rgba(255, 255, 255, 0.9)'
                                    : 'rgba(255, 255, 255, 0.6)',
                                backdropFilter: 'blur(10px)',
                                border: resourceStore.filter === 'inUse'
                                    ? '2px solid #c62828'
                                    : '1px solid rgba(255, 255, 255, 0.4)',
                                boxShadow: resourceStore.filter === 'inUse'
                                    ? '0 8px 32px rgba(198, 40, 40, 0.2)'
                                    : '0 8px 32px rgba(31, 38, 135, 0.05)',
                                transition: 'all 0.3s ease-in-out',
                                cursor: 'pointer',
                                transform: resourceStore.filter === 'inUse' ? 'translateY(-5px)' : 'none',
                                '&:hover': { transform: 'translateY(-5px)' }
                            }}
                        >
                            <Typography color="text.secondary" variant="overline" sx={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: 1 }}>In Use</Typography>
                            <Typography variant="h3" sx={{ fontWeight: '800', background: 'linear-gradient(45deg, #c62828 30%, #ef5350 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{resourceStore.stats.inUseAssets}</Typography>
                        </Paper>
                    </Grid>
                </Grid>

                {/* 2. Title and Buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: '800', color: '#1a237e', letterSpacing: -0.5 }}>
                        Asset Inventory
                    </Typography>
                    <Box>
                        <Tooltip title="Refresh Data">
                            <IconButton onClick={() => resourceStore.loadAssets()} sx={{ 
                                mr: 1, 
                                bgcolor: 'white', 
                                boxShadow: 1,
                                '&:hover': { bgcolor: '#f5f5f5' }
                            }}>
                                <RefreshIcon color="primary" />
                            </IconButton>
                        </Tooltip>
                        
                        {/* The button will appear only to admin */}
                        {authStore.isAdmin && (
                            <Button 
                                variant="contained" 
                                startIcon={<AddCircleIcon />}
                                onClick={() => setIsDialogOpen(true)}
                                sx={{ 
                                    borderRadius: 3, 
                                    textTransform: 'none', 
                                    px: 3,
                                    background: 'linear-gradient(45deg, #1a237e 30%, #534bae 90%)',
                                    boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)'
                                }}
                            >
                                Add New Asset
                            </Button>
                        )}
                    </Box>
                </Box>

                {/* Gird of cards */}
                {resourceStore.isLoading ? (
                     <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                         <CircularProgress sx={{ color: '#1a237e' }} />
                     </Box>
                ) : (
                    <Grid container spacing={3}>
                        {resourceStore.assets.map((asset, index) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={asset.id}>
                                <Card sx={{ 
                                    height: '100%', 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    borderRadius: 4,
                                    background: 'rgba(255, 255, 255, 0.7)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.5)',
                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    animation: `fadeIn 0.5s ease-out ${index * 0.05}s backwards`,
                                    '&:hover': { 
                                        transform: 'translateY(-8px)', 
                                        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.1)',
                                        border: '1px solid rgba(255, 255, 255, 0.8)'
                                    }
                                }}>
                                <CardActionArea onClick={() => setSelectedAsset(asset)} sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                            {/* icon by asset type */}
                                            <Box sx={{ 
                                                p: 1.5, 
                                                borderRadius: '16px', 
                                                bgcolor: 'rgba(25, 118, 210, 0.08)', 
                                                color: '#1565c0',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'transform 0.3s',
                                                '.MuiCard-root:hover &': {
                                                    transform: 'rotate(5deg) scale(1.1)',
                                                    bgcolor: 'rgba(25, 118, 210, 0.15)',
                                                }
                                            }}>
                                                {(() => {
                                                    switch(asset.type) {
                                                        case 'Room': return <MeetingRoomIcon />;
                                                        case 'Desk': return <DesktopWindowsIcon />;
                                                        case 'Laptop': return <LaptopMacIcon />;
                                                        case 'Projector': return <VideocamIcon />;
                                                        case 'Chair': return <ChairIcon />;
                                                        case 'Whiteboard': return <CoPresentIcon />;
                                                        case 'Parking': return <DirectionsCarIcon />;
                                                        case 'Printer': return <PrintIcon />;
                                                        case 'Lab': return <ScienceIcon />;
                                                        default: return <DevicesForbidIcon />;
                                                    }
                                                })()}
                                            </Box>
                                            
                                            {/* Availability Status */}
                                            <Chip 
                                                label={asset.isAvailable ? "Available" : "In Use"} 
                                                size="small"
                                                sx={{
                                                    borderRadius: '8px',
                                                    fontWeight: 600,
                                                    bgcolor: asset.isAvailable 
                                                        ? 'rgba(76, 175, 80, 0.1)' 
                                                        : 'rgba(244, 67, 54, 0.1)',
                                                    color: asset.isAvailable 
                                                        ? '#2e7d32' 
                                                        : '#c62828',
                                                    border: '1px solid',
                                                    borderColor: asset.isAvailable 
                                                        ? 'rgba(76, 175, 80, 0.2)' 
                                                        : 'rgba(244, 67, 54, 0.2)'
                                                }}
                                            />
                                        </Box>

                                        <Typography variant="h6" component="div" sx={{ fontWeight: '700', mb: 0.5, letterSpacing: -0.5 }}>
                                            {asset.name}
                                        </Typography>
                                        <Typography sx={{ mb: 2, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: '#546e7a' }}>
                                            {asset.type}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ 
                                            display: '-webkit-box',
                                            overflow: 'hidden',
                                            WebkitBoxOrient: 'vertical',
                                            WebkitLineClamp: 2,
                                            lineHeight: 1.6
                                        }}>
                                            {asset.description}
                                        </Typography>
                                    </CardContent>
                                    
                                    <div style={{ padding: '24px', paddingTop: 0, marginTop: 'auto', display: 'flex' }}>
                                        <Button 
                                            size="small" 
                                            className="view-details-btn"
                                            endIcon={<ArrowForwardIcon sx={{ fontSize: '1rem !important' }} />}
                                            sx={{ 
                                                ml: 'auto',
                                                textTransform: 'none', 
                                                fontWeight: 600,
                                                color: '#1565c0',
                                                borderRadius: 2,
                                                '&:hover': { bgcolor: 'rgba(21, 101, 192, 0.08)' }
                                            }}
                                        >
                                            View Details
                                        </Button>
                                    </div>
                                    </CardActionArea>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
                {/* Pagination */}
                {resourceStore.totalPages > 1 && (
                    <Box display="flex" justifyContent="center" mt={6} mb={4}>
                        <Pagination
                            count={resourceStore.totalPages}
                            page={resourceStore.page}
                            onChange={(_, newPage) => {
                                resourceStore.setPage(newPage);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            shape="rounded"
                            size="large"
                            sx={{
                                '& .MuiPaginationItem-root': {
                                    backdropFilter: 'blur(4px)',
                                    bgcolor: 'rgba(255,255,255,0.5)',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    fontWeight: 'bold',
                                    color: '#546e7a',
                                    '&.Mui-selected': {
                                        bgcolor: '#1a237e',
                                        color: 'white',
                                        '&:hover': {
                                            bgcolor: '#303f9f',
                                        }
                                    }
                                }
                            }}
                        />
                    </Box>
                )}
                
                {/* Message if no assets */}
                {!resourceStore.isLoading && resourceStore.assets.length === 0 && (
                    <Paper sx={{ 
                        p: 6, 
                        textAlign: 'center', 
                        mt: 4, 
                        background: 'rgba(255, 255, 255, 0.6)', 
                        backdropFilter: 'blur(10px)',
                        borderRadius: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2
                    }}>
                        <InventoryIcon sx={{ fontSize: 60, color: '#90a4ae', opacity: 0.5 }} />
                        <Box>
                            <Typography variant="h6" color="text.secondary" gutterBottom>No assets found</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Click "Add New Asset" above to start building your inventory.
                            </Typography>
                        </Box>
                    </Paper>
                )}
            </Container>

            {/* Add Asset Dialog */}
            <AddAssetDialog 
                open={isDialogOpen} 
                onClose={() => setIsDialogOpen(false)} 
                onSuccess={() => resourceStore.loadAssets()}
            />
            <AssetDetailsDialog asset={selectedAsset} onClose={() => setSelectedAsset(null)} />        

        </Box>
    );
});

export default DashboardPage;