import { Box, Typography } from "@mui/material";

export default function Footer() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 35,
      }}
    >
      <Typography
        variant="overline"
        component="div"
        sx={{ textAlign: 'center' }}
      >
        © 2023-2024. Pol4bear. All rights reserved.
      </Typography>
    </Box>
  );
}
