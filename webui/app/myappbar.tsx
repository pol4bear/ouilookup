"use client"

import { AppBar, Box, IconButton, Toolbar, Typography, useMediaQuery } from "@mui/material";
import logo from '../public/logo.png'
import Image from 'next/image';
import Link from "next/link";
import { useTheme } from "next-themes";
import { DarkMode, LightMode } from "@mui/icons-material";
import { useEffect, useState } from "react";

export default function MyAppBar() {
  return (
    <AppBar position="sticky">
      <Toolbar style={{height: 60}}>
        <Box
          sx={{ flexGrow: 1 }}>
          <Link
            color="inherit"
            aria-label="Logo"
            className="inline-block"
            href="/">
              <Image
                src={logo}
                width={50}
                height={50}
                style={{ marginBottom: 5 }}
                className="inline-block"
                alt="Logo" />
              <Typography
                className="inline-block"
                variant="h6"
                component="div"
                sx={{ ml: 2 }}>
                OUI Lookup
              </Typography>
          </Link>
        </Box>
        <ThemeChanger />
      </Toolbar>
    </AppBar>
  );
}

function ThemeChanger() {
  const {theme, setTheme} = useTheme();
  const [loaded, setLoaded] = useState(false);
  const isSystemDarkMode = useMediaQuery("(prefers-color-scheme: dark")

  useEffect(()=> {
    setLoaded(true);
    const currentTheme = localStorage.getItem("theme");
    if (currentTheme == null)
      setTheme(isSystemDarkMode ? 'dark' : 'light');
  }, [isSystemDarkMode, setTheme])

  return (
    <IconButton
      size="large"
      onClick={() => {setTheme(theme == 'light' ? 'dark' : 'light')}}>
      {loaded ? theme == 'light' ? <DarkMode /> : <LightMode /> : <></>}
    </IconButton>
  )
}
