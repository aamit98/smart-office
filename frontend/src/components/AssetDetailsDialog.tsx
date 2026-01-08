import { 
    Dialog, DialogTitle, DialogContent, DialogActions, 
    Button, Typography, Grid, Chip, Divider, Box 
} from '@mui/material';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import DevicesIcon from '@mui/icons-material/Devices';
import type { Asset } from '../stores/ResourceStore';

interface Props {
    asset: Asset | null; // אם זה null הדיאלוג סגור
    onClose: () => void;
}

export const AssetDetailsDialog = ({ asset, onClose }: Props) => {
    if (!asset) return null;

    return (
        <Dialog open={!!asset} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: 2 }}>
                {/* אייקון בכותרת */}
                {asset.type === 'Room' ? <MeetingRoomIcon color="primary" /> : 
                 asset.type === 'Desk' ? <DesktopWindowsIcon color="secondary" /> : <DevicesIcon color="action" />}
                <Typography variant="h6">{asset.name}</Typography>
            </DialogTitle>
            
            <DialogContent sx={{ mt: 2 }}>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    {/* ID (נחמד לדיבוג ולהראות שזה מונגו) */}
                    <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary">Asset ID</Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{asset.id}</Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Type</Typography>
                        <Typography variant="body1">{asset.type}</Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Status</Typography>
                        <Box sx={{ mt: 0.5 }}>
                            <Chip 
                                label={asset.isAvailable ? "Available" : "In Use"} 
                                color={asset.isAvailable ? "success" : "error"} 
                                size="small"
                            />
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary">Description / Location</Typography>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                            {asset.description || "No description provided."}
                        </Typography>
                    </Grid>
                </Grid>
            </DialogContent>
            
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} variant="contained">Close</Button>
            </DialogActions>
        </Dialog>
    );
};