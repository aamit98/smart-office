import { useState } from 'react';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, 
    TextField, Button, MenuItem, Select, FormControl, InputLabel 
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

    const handleSave = async () => {
        const success = await resourceStore.addAsset({
            name,
            type,
            description,
            isAvailable: true 
        });

        if (success) {

            setName('');
            setDescription('');
            onClose(); 
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Add New Asset</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus margin="dense" label="Asset Name" fullWidth
                    value={name} onChange={(e) => setName(e.target.value)}
                />
                
                <FormControl fullWidth margin="dense" sx={{ mt: 2 }}>
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

                <TextField
                    margin="dense" label="Description" fullWidth multiline rows={3}
                    value={description} onChange={(e) => setDescription(e.target.value)}
                    sx={{ mt: 2 }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">Cancel</Button>
                <Button onClick={handleSave} variant="contained">Save Asset</Button>
            </DialogActions>
        </Dialog>
    );
};