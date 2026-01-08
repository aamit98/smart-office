import { Box, Typography } from '@mui/material';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import BoltIcon from '@mui/icons-material/Bolt';

interface Props {
    color?: string;
}

export const SmartOfficeLogo = ({ color = '#fff' }: Props) => {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* The icon - combination of briefcase (business) and bolt (smart/fast) */}
            <Box sx={{ position: 'relative', display: 'flex' }}>
                <BusinessCenterIcon sx={{ fontSize: 40, color: '#4fc3f7' }} />
                <BoltIcon sx={{ 
                    fontSize: 24, 
                    color: '#ffb74d', 
                    position: 'absolute', 
                    bottom: -2, 
                    right: -4,
                    filter: 'drop-shadow(2px 2px 0px #1a237e)' // Outline to stand out on blue background
                }} />
            </Box>
            
            {/* The text - weight play */}
            <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 1, color: color }}>
                    SMART
                </Typography>
                <Typography variant="caption" sx={{ color: color === '#fff' ? '#bdbdbd' : 'text.secondary', letterSpacing: 3, textTransform: 'uppercase' }}>
                    OFFICE
                </Typography>
            </Box>
        </Box>
    );
};
