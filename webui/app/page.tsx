'use client';

import { MyAppBar, Footer } from "@/components";
import { SearchOutlined } from "@mui/icons-material";
import { Autocomplete, Box, IconButton, InputAdornment, OutlinedInput, Typography, useMediaQuery } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";

function SearchForm() {
  const [searchValue, setSearchValue] = useState("");
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 767px)");

  return (
    <Box className="flex flex-col items-center">
      <Typography
        variant={isMobile ? "h5" : "h2"}
        component="div"
        sx={{ mb: 5 }}>
        Search OUI Information
      </Typography>
      <Autocomplete
        id="search"
        freeSolo
        sx={{
          width: isMobile ? 300 : 700
        }}
        options={[]}
        renderInput={(params) => {
          return (
            <OutlinedInput
              placeholder="MAC Address or Manufacturer"
              inputProps={params.inputProps}
              disabled={params.disabled}
              fullWidth={params.fullWidth}
              endAdornment={
                <InputAdornment sx={{ mr: 2 }} position="end">
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
      <main  className="flex flex-col items-center justify-center h-center" style={{ minHeight: 'calc(100svh - 100px)'}}>
        <SearchForm />
      </main>
      <Footer />
    </>
  );
}
