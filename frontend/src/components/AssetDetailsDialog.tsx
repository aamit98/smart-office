import { 
    Dialog, DialogTitle, DialogContent, DialogActions, 
    Button, Typography, Grid, Chip, Divider, Box, IconButton, Tooltip, Snackbar, CircularProgress
} from '@mui/material';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import LaptopMacIcon from '@mui/icons-material/LaptopMac';
import VideocamIcon from '@mui/icons-material/Videocam';
import ChairIcon from '@mui/icons-material/Chair';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CoPresentIcon from '@mui/icons-material/CoPresent';
import DevicesForbidIcon from '@mui/icons-material/DevicesOther';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import ScienceIcon from '@mui/icons-material/Science';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkRemoveIcon from '@mui/icons-material/BookmarkRemove';

import { resourceStore } from '../stores/ResourceStore';
import { authStore } from '../stores/AuthStore';
import type { Asset } from '../stores/ResourceStore';
import { useState } from 'react';
import { observer } from 'mobx-react-lite';

interface Props {
    asset: Asset | null;
    onClose: () => void;
}

export const AssetDetailsDialog = observer(({ asset, onClose }: Props) => {
    const [showCopySuccess, setShowCopySuccess] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    if (!asset) return null;

    const handleCopyId = () => {
        if (asset.id) {
            navigator.clipboard.writeText(asset.id);
            setShowCopySuccess(true);
        }
    };

    const handleToggleStatus = async () => {
        if (!asset.id) return;
        setIsProcessing(true);
        try {
            await resourceStore.updateAsset(asset.id, { 
                ...asset, 
                isAvailable: !asset.isAvailable 
            });
            onClose();
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDelete = async () => {
        if (!asset.id || !confirm("Are you sure you want to delete this asset?")) return;
        setIsProcessing(true);
        try {
            await resourceStore.deleteAsset(asset.id);
            onClose();
        } finally {
            setIsProcessing(false);
        }
    };

    const isBookedByMe = asset.bookedBy === authStore.userId;
    const canRelease = isBookedByMe || authStore.role === 'Admin' || !asset.bookedBy;

    return (
        <>
            <Dialog 
                open={!!asset} 
                onClose={onClose} 
                fullWidth 
                maxWidth="sm"
                PaperProps={{
                    sx: { 
                        borderRadius: 3,
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                    }
                }}
            >
                <DialogTitle sx={{ 
                    bgcolor: '#fff', 
                    borderBottom: '1px solid fade(#e0e0e0, 0.5)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2, 
                    py: 3 
                }}>
                {/* icon in title */}
                {(() => {
                    const iconProps = { sx: { fontSize: 32, color: '#1a237e' } };
                    switch (asset.type) {
                        case 'Room': return <MeetingRoomIcon {...iconProps} />;
                        case 'Desk': return <DesktopWindowsIcon {...iconProps} />;
                        case 'Laptop': return <LaptopMacIcon {...iconProps} />;
                        case 'Projector': return <VideocamIcon {...iconProps} />;
                        case 'Chair': return <ChairIcon {...iconProps} />;
                        case 'Whiteboard': return <CoPresentIcon {...iconProps} />;
                        case 'Parking': return <DirectionsCarIcon {...iconProps} />;
                        case 'Printer': return <PrintIcon {...iconProps} />;
                        case 'Lab': return <ScienceIcon {...iconProps} />;
                        default: return <DevicesForbidIcon {...iconProps} />;
                    }
                })()}
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a237e' }}>{asset.name}</Typography>
                    <Chip 
                        label={asset.type} 
                        size="small" 
                        sx={{ mt: 0.5, height: 20, fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase' }} 
                    />
                </Box>
            </DialogTitle>
            
            <DialogContent sx={{ mt: 3 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Box sx={{ p: 2, bgcolor: asset.isAvailable ? '#f1f8e9' : '#ffebee', borderRadius: 2, border: '1px solid', borderColor: asset.isAvailable ? '#c5e1a5' : '#ffcdd2', display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: asset.isAvailable ? '#4caf50' : '#f44336' }} />
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: asset.isAvailable ? '#33691e' : '#b71c1c' }}>
                                    {asset.isAvailable ? "Available for use" : "Currently in use"}
                                </Typography>
                                {!asset.isAvailable && (asset.bookedByFullName || asset.bookedBy) && (
                                    <Typography variant="caption" sx={{ display: 'block', color: '#b71c1c', mt: 0.5 }}>
                                        Booked by: <strong>{asset.bookedByFullName || asset.bookedBy}</strong>
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 1 }}>Description</Typography>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', color: '#37474f', mt: 1, lineHeight: 1.6 }}>
                            {asset.description || "No description provided."}
                        </Typography>
                    </Grid>
                    
                     <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="caption" color="text.secondary">
                                Asset ID: <span style={{ fontFamily: 'monospace', marginLeft: 4 }}>{asset.id}</span>
                            </Typography>
                            <Tooltip title="Copy ID">
                                <IconButton size="small" onClick={handleCopyId}>
                                    <ContentCopyIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Grid>
                </Grid>
            </DialogContent>
            
            <DialogActions sx={{ p: 3, pt: 0, justifyContent: 'space-between' }}>
                <Box>
                    {authStore.isAdmin && (
                        <Button 
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={handleDelete}
                            disabled={isProcessing}
                            sx={{ borderRadius: 2 }}
                        >
                            Delete
                        </Button>
                    )}
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button onClick={onClose} variant="text" sx={{ borderRadius: 2 }}>Close</Button>
                    <Button 
                        onClick={handleToggleStatus} 
                        variant="contained" 
                        disabled={isProcessing || (!asset.isAvailable && !canRelease)}
                        color={asset.isAvailable ? "warning" : "success"}
                        startIcon={isProcessing ? <CircularProgress size={20} /> : (asset.isAvailable ? <BookmarkIcon /> : <BookmarkRemoveIcon />)}
                        sx={{ borderRadius: 2, minWidth: 120 }}
                    >
                        {asset.isAvailable ? "Book This" : (canRelease ? "Release" : "Reserved")}
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>

        <Snackbar
            open={showCopySuccess}
            autoHideDuration={2000}
            onClose={() => setShowCopySuccess(false)}
            message="Asset ID copied to clipboard"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
        </>
    );
});