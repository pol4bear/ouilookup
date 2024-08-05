"use client"

import { AppBar, Box, Toolbar, Typography } from "@mui/material";
import logo from '../public/logo.png'
import Image from 'next/image';
import Link from "next/link";

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
      </Toolbar>
    </AppBar>
  );
}
