'use client';

import { MyAppBar, Footer } from "@/components";
import { SearchOutlined } from "@mui/icons-material";
import { Autocomplete, Box, IconButton, InputAdornment, OutlinedInput, Typography, useMediaQuery } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTheme } from "@mui/material/styles";

function SearchForm() {
  const [searchValue, setSearchValue] = useState("");
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const theme = useTheme();

  const inputStyles = {
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : theme.palette.background.paper,
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.mode === 'dark' ? theme.palette.primary.main : theme.palette.grey[400],
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.mode === 'dark' ? theme.palette.primary.main : theme.palette.text.primary,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.mode === 'dark' ? theme.palette.primary.main : theme.palette.text.primary,
    },
    '& input': {
      color: theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.text.primary,
    },
    '& .MuiInputAdornment-root': {
      marginRight: 2,
      position: 'absolute',
      right: 0
    }
  };

  return (
    <Box className="flex flex-col items-center">
      <Typography
        variant={isMobile ? "h4" : "h2"}
        component="div"
        sx={{ mb: 5 }}>
        Search OUI information
      </Typography>
      <Autocomplete
        id="search"
        freeSolo
        sx={{
          width: isMobile ? 400 : 700
        }}
        options={[]}
        renderInput={(params) => {
          return (
            <OutlinedInput
              placeholder="MAC Address or Manufacturer"
              inputProps={params.inputProps}
              disabled={params.disabled}
              fullWidth={params.fullWidth}
              sx={inputStyles}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="Search"
                    onClick={() => router.push('/' + searchValue)}
                    edge="end">
                      <SearchOutlined />
                  </IconButton>
                </InputAdornment>
              }
              value={searchValue}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setSearchValue(event.target.value);
              }}
              onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
                if (event.key === "Enter")
                  router.push('/' + searchValue)
              }}
            />
          )
        }} />
    </Box>
  );
}


export default function Home() {
  return (
    <>
      <MyAppBar />
      <main  className="flex flex-col items-center justify-center h-center" style={{ minHeight: 'calc(100vh - 100px)'}}>
        <SearchForm />
      </main>
      <Footer />
    </>
  );
}
