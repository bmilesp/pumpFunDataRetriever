"use client"
import React, { useEffect, useState } from "react";
import {
  Container,
  Grid2,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#007BFF",
    },
  },
});

const fetchData = async (endpoint:string, params:any) => {
  const url = new URL(`http://127.0.0.1:3010/${endpoint}`);
  console.log(url);
  Object.keys(params).forEach((key) =>
    url.searchParams.append(key, params[key])
  );
  try {
    const response = await fetch(url);
    console.log(response)
    return response.json();
  }catch(e){
    console.log(e)

  }
};

const DashboardComponent = ({ title, endpoint }) => {
  const [data, setData] = useState([]);
  const [startTimestamp, setStartTimestamp] = useState(
    Math.floor(Date.now()) - 24 * 60 * 60
  );
  const [endTimestamp, setEndTimestamp] = useState(
    Math.floor(Date.now())
  );

  useEffect(() => {
    const loadData = async () => {
      const result = await fetchData(endpoint, {
        startTimestamp,
        endTimestamp,
      });
      setData(result);
    };
    loadData();
  }, [startTimestamp, endTimestamp, endpoint]);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <TextField
          label="Start Timestamp"
          type="datetime-local"
          InputLabelProps={{ shrink: true }} 
          defaultValue={new Date(startTimestamp).toISOString().slice(0, -8)}
          onChange={(e) =>
            setStartTimestamp(Math.floor(new Date(e.target.value).getTime()))
          }
          fullWidth
          margin="normal"
        />
        <TextField
          label="End Timestamp"
          type="datetime-local"
          slotProps={{ inputLabel: { shrink: true } }}
          defaultValue={new Date(endTimestamp).toISOString().slice(0, -8)}
          onChange={(e) =>
            setEndTimestamp(Math.floor(new Date(e.target.value).getTime()))
          }
          fullWidth
          margin="normal"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={async () => {
            const result = await fetchData(endpoint, {
              startTimestamp,
              endTimestamp,
            });
            setData(result);
          }}
        >
          Refresh
        </Button>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </CardContent>
    </Card>
  );
};

const App = () => {
  const endpoints = [
    {
      title: "Latest Transactions",
      endpoint: "latestTransactions",
    },
    {
      title: "Top Mints By Total Sell Txns And Date Range",
      endpoint: "topMintsByTotalSellTxnsAndDateRange",
    },
    {
      title: "Top Mints By Total Comments And Date Range",
      endpoint: "topMintsByTotalCommentsAndDateRange",
    },
    {
      title: "Top Mints By Total Comments",
      endpoint: "topMintsByTotalComments",
    },
    {
      title: "Top Mints By Total Buy Txns And Date Range",
      endpoint: "topMintsByTotalBuyTxnsAndDateRange",
    },
    {
      title: "Top Mints By Total All Txns And Date Range",
      endpoint: "topMintsByTotalAllTxnsAndDateRange",
    },
    {
      title: "Top Mints By Biggest Dump Txns And Date Range",
      endpoint: "topMintsByBiggestDumpTxnsAndDateRange",
    },
  ];

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg" style={{ marginTop: "20px" }}>
        <Typography variant="h4" gutterBottom>
          PumpFun Dashboard
        </Typography>
        <Grid2 container spacing={4}>
          {endpoints.map((endpoint) => (
            <Grid2 size={{ xs: 12, md: 6 }} key={endpoint.endpoint}>
              
              <DashboardComponent
                title={endpoint.title}
                endpoint={endpoint.endpoint}
              />
            </Grid2>
          ))}
        </Grid2>
      </Container>
    </ThemeProvider>
  );
};

export default App;
