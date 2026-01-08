import { useState } from 'react';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, 
    TextField, Button, MenuItem, Select, FormControl, InputLabel, Box,
    Alert, Collapse 
} from '@mui/material';
import { resourceStore } from '../stores/ResourceStore';

interface Props {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export const AddAssetDialog = ({ open, onClose, onSuccess }: Props) => {
    const [name, setName] = useState('');
    const [type, setType] = useState('Room');
    const [description, setDescription] = useState('');
    // Added state for status (default: Available)
    const [status, setStatus] = useState('Available'); 
    const [bookedByFullName, setBookedByFullName] = useState(''); // New State for manual booking name
    const [error, setError] = useState<string | null>(null);

    const handleSave = async () => {
        setError(null);

        const isAvailable = status === 'Available';

        const success = await resourceStore.addAsset({
            name,
            type,
            description,
            // Map UI string status to API boolean value
            isAvailable: isAvailable,
            // Admin pre-booking: allows setting a placeholder name for external users
            bookedByFullName: !isAvailable && bookedByFullName ? bookedByFullName : undefined
        });

        if (success) {
            // Reset form
            setName('');
            setDescription('');
            setStatus('Available');
            setBookedByFullName('');
            if (onSuccess) {
                onSuccess();
            }
            onClose(); 
        } else {
            setError("Failed to create asset. Check server connection.");
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            fullWidth 
            maxWidth="sm"
            PaperProps={{
                sx: { borderRadius: 3 }
            }}
        >
            <DialogTitle sx={{ 
                bgcolor: '#fff', 
                borderBottom: '1px solid #f0f0f0',
                fontWeight: 700,
                color: '#1a237e',
                py: 3
            }}>
                Add New Asset
            </DialogTitle>
            <DialogContent sx={{ mt: 3, pb: 4 }}>
                {/* --- Alert within Dialog --- */}
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}
                {/* ------------------------- */}
                
                <TextField
                    autoFocus margin="dense" label="Asset Name" fullWidth
                    placeholder="e.g., Main Conference Room"
                    variant="outlined"
                    value={name} onChange={(e) => setName(e.target.value)}
                    sx={{ mb: 2 }}
                />
                
                {/* Row for two fields: Type and Status */}
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <FormControl fullWidth>
                        <InputLabel>Type</InputLabel>
                        <Select
                            value={type}
                            label="Type"
                            onChange={(e) => setType(e.target.value)}
                        >   
                            <MenuItem value="Room">Room</MenuItem>
                            <MenuItem value="Desk">Desk</MenuItem>
                            <MenuItem value="Laptop">Laptop / Workstation</MenuItem>
                            <MenuItem value="Projector">Projector</MenuItem>
                            <MenuItem value="Chair">Ergonomic Chair</MenuItem>
                            <MenuItem value="Whiteboard">Whiteboard</MenuItem>
                            <MenuItem value="Parking">Parking Spot</MenuItem>
                            <MenuItem value="Equipment">Other Equipment</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel>Initial Status</InputLabel>
                        <Select
                            value={status}
                            label="Initial Status"
                            onChange={(e) => setStatus(e.target.value)}
                            sx={{ color: status === 'Available' ? 'green' : 'red' }}
                        >
                            <MenuItem value="Available" sx={{ color: 'green' }}>Available (Green)</MenuItem>
                            <MenuItem value="In Use" sx={{ color: 'red' }}>In Use (Red)</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                {/* Show 'Booked For' field only when 'In Use' is selected */}
                <Collapse in={status === 'In Use'}>
                    <TextField
                        margin="dense" label="Booked For (Full Name)" fullWidth
                        placeholder="e.g., Guest: Elon Musk"
                        value={bookedByFullName} 
                        onChange={(e) => setBookedByFullName(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                </Collapse>

                <TextField
                    margin="dense" label="Description" fullWidth multiline rows={3}
                    placeholder="Describe location or specs..."
                    value={description} onChange={(e) => setDescription(e.target.value)}
                    sx={{ mt: 2 }}
                />
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 0 }}>
                <Button onClick={onClose} color="inherit">Cancel</Button>
                <Button onClick={handleSave} variant="contained" sx={{ px: 4 }}>
                    Create Asset
                </Button>
            </DialogActions>
        </Dialog>
    );
};

