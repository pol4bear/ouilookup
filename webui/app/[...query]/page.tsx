"use client";

import { useState, useEffect } from 'react';
import { Footer, MyAppBar } from "@/components";
import { List, ListItem, ListItemText, Pagination, Skeleton, Alert, Box, Container, Grid, Typography, Link } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTheme, styled } from '@mui/material';

interface Params {
  params: {
    query: string[];
  };
}

interface ApiResponse {
  count: number;
  total: number;
  data?: {
    Registry: string;
    Assignment: string;
    "Organization Name": string;
    "Organization Address": string;
  }[];
  info?: string;
}

const StyledLink = styled(Link)(({ theme }) => ({
  color: theme.palette.text.primary,
  textDecoration: 'none',
}));

const ListItemTextPrimary = styled('span')(({ theme }) => ({
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: 'inline-block',
  maxWidth: 'calc(100% - 100px)',
  color: theme.palette.text.primary,
}));

const ListItemTextSecondary = styled('span')(({ theme }) => ({
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: 'inline-block',
  maxWidth: 'calc(100% - 100px)',
  color: theme.palette.text.primary,
}));

function formatMAC(assignment: string): string {
  const baseMac = assignment.toUpperCase();
  const padLength = 12 - baseMac.length;
  return (baseMac + '0'.repeat(padLength)).match(/.{1,2}/g)?.join(':')!;
}

export default function Query({ params }: Params) {
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = params.query[0];
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/${query}?page=${currentPage}&limit=${itemsPerPage}`;
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred');
        }
      }
      setLoading(false);
    };

    fetchData();
  }, [query, currentPage]);

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    router.push(`?page=${page}`);
  };

  return (
    <>
      <MyAppBar />
      <Container
        maxWidth="md"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: 'calc(100svh - 100px)',
          justifyContent: 'center',
          color: theme.palette.text.primary,
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            my: 4,
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
          }}
        >
          {loading ? (
            <Grid container spacing={2} justifyContent="center">
              {Array.from(new Array(10)).map((_, index) => (
                <Grid item xs={12} key={index}>
                  <Skeleton variant="rectangular" width="100%" height={30} />
                </Grid>
              ))}
            </Grid>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : data && data.count > 0 ? (
            <>
              <List>
                {data.data?.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={
                        <ListItemTextPrimary>
                          {item["Organization Name"]}
                        </ListItemTextPrimary>
                      }
                      secondary={
                        <ListItemTextSecondary>
                          <StyledLink
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item["Organization Address"])}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {item["Organization Address"]}
                          </StyledLink>
                        </ListItemTextSecondary>
                      }
                    />
                    <Box ml="auto">
                      <Typography variant="body2">
                        {formatMAC(item["Assignment"])}
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
              <Grid container justifyContent="center" sx={{ marginTop: 20 }}>
                <Pagination
                  count={Math.ceil(data.total / itemsPerPage)}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Grid>
            </>
          ) : (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
              }}
            >
              <Typography variant="h6">
                {data?.info || "No data available"}
              </Typography>
            </Box>
          )}
        </Box>
      </Container>
      <Footer />
    </>
  );
}
