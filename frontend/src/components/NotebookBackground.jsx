import { Box } from '@mui/material';

const NotebookBackground = () => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
        background: '#f1f1f1',
        backgroundImage: `
          linear-gradient(
            90deg,
            transparent 50px,
            #ffb4b8 50px,
            #ffb4b8 52px,
            transparent 52px
          ),
          linear-gradient(#e1e1e1 0.1em, transparent 0.1em)
        `,
        backgroundSize: '100% 30px',
      }}
    />
  );
};

export default NotebookBackground; 