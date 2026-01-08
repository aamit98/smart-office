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
}

export const AddAssetDialog = ({ open, onClose }: Props) => {
    const [name, setName] = useState('');
    const [type, setType] = useState('Room');
    const [description, setDescription] = useState('');
    // הוספנו סטייט לסטטוס (ברירת מחדל: זמין)
    const [status, setStatus] = useState('Available'); 
    const [error, setError] = useState<string | null>(null);

    const handleSave = async () => {
        setError(null);

        const success = await resourceStore.addAsset({
            name,
            type,
            description,
            // המרה מהסטרינג לבוליאני שהשרת מצפה לו
            isAvailable: status === 'Available'
        });

        if (success) {
            // איפוס הטופס
            setName('');
            setDescription('');
            setStatus('Available');
            onClose(); 
        } else {
            setError("Failed to create asset. Check server connection.");
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
                Add New Asset
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
                {/* --- התראה בתוך הדיאלוג --- */}
                {error && (
                    <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
                        {error}
                    </Alert>
                )}
                {/* ------------------------- */}
                
                <TextField
                    autoFocus margin="dense" label="Asset Name" fullWidth
                    placeholder="e.g., Conference Room A"
                    value={name} onChange={(e) => setName(e.target.value)}
                    sx={{ mt: 2 }}
                />
                
                {/* שורה אחת לשני השדות: סוג וסטטוס */}
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
                            <MenuItem value="Equipment">Equipment</MenuItem>
                            
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

