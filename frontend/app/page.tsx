"use client"
import { NumericFormat } from 'react-number-format';
import React, { useEffect, useState } from "react";
import {
  Container,
  Grid2,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  Grid,
  ListItemAvatar,
  Avatar,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import ListTotalReplies from './components/ListTotalReplies';
import ListTopDumpsByMostSellTxns from './components/ListTopDumpsByMostSellTxns';
import ListTopGainsByMostBuyTxns from './components/ListTopGainsByMostBuyTxns';
import ListTopDumps from './components/ListTopDumps';
import ListTopPumps from './components/ListTopPumps';

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



const DateRangeComponent = ({startTimestamp, endTimestamp, setStartTimestampHandler, setEndTimestampHandler}) => {
  return (
    <Container maxWidth="lg" style={{ marginTop: "20px", backgroundColor: "#fff", padding: "20px" }}>
    <TextField
      label="Start Timestamp"
      type="datetime-local"
      slotProps={{ inputLabel: { shrink: true } }}
      defaultValue={ new Date(startTimestamp).toISOString().slice(0, -8)}
      onChange={(e) =>
        setStartTimestampHandler(Math.floor(new Date(e.target.value).getTime()))
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
        setEndTimestampHandler(Math.floor(new Date(e.target.value).getTime()))
      }
      fullWidth
      margin="normal"
    />
    </Container>

  );
}

const GenericListComponent = ({ title, endpoint, startTimestamp, endTimestamp }) => {
  const [data, setData] = useState([]);

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
        <Typography variant="h4" gutterBottom>
          {title}
        </Typography>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </CardContent>
    </Card>
  );
};



const App = () => {
  const [startTimestamp, setStartTimestamp] = useState(
    Math.floor(new Date(new Date().getTime() - (24 * 60 * 60 * 1000)).getTime())
  );
  const [endTimestamp, setEndTimestamp] = useState(
    Math.floor(Date.now())
  );


  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg" style={{ marginTop: "20px" }}>
        <Typography variant="h4" gutterBottom>
          PumpFun Dashboard
        </Typography>
        <Grid2 container spacing={4}>
          <DateRangeComponent 
            startTimestamp={startTimestamp} 
            endTimestamp={endTimestamp} 
            setStartTimestampHandler={setStartTimestamp} 
            setEndTimestampHandler={setEndTimestamp} 
          />
        </Grid2>
        <Grid2 container spacing={4} style={{ marginTop: "20px" }}>
        <Grid2 size={{ xs: 12, md: 6 }} key={"topTotalReplies"}>
              <ListTotalReplies
                title="Most Comments"
                endpoint="topMintsByTotalCommentsAndDateRange"
                startTimestamp={startTimestamp}
                endTimestamp={endTimestamp}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 6 }} key={"topTotalRepliesAllTime"}>
              <ListTotalReplies
                title="Most Comments - All Time"
                endpoint="topMintsByTotalComments"
                startTimestamp={startTimestamp}
                endTimestamp={endTimestamp}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 6 }} key={"topDumpsByDateRange"}>
              <ListTopDumps
                title="Top Dumps"
                endpoint="topDumpsByDateRange"
                startTimestamp={startTimestamp}
                endTimestamp={endTimestamp}
                backgroundColor={"#ffb3b3"}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 6 }} key={"topPumpsByDateRange"}>
              <ListTopPumps
                title="Top Pumps"
                endpoint="topPumpsByDateRange"
                startTimestamp={startTimestamp}
                endTimestamp={endTimestamp}
                backgroundColor={"#b3ffb8"}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 6 }} key={"topMintsByTotalSellTxnsAndDateRange"}>
              <ListTopDumpsByMostSellTxns
                title="Most Sell Txns"
                endpoint="topMintsByTotalSellTxnsAndDateRange"
                startTimestamp={startTimestamp}
                endTimestamp={endTimestamp}
                backgroundColor={"#ffb3b3"}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 6 }} key={"topMintsByTotalBuyTxnsAndDateRange"}>
              <ListTopGainsByMostBuyTxns
                title="Most Buy Txns"
                endpoint="topMintsByTotalBuyTxnsAndDateRange"
                startTimestamp={startTimestamp}
                endTimestamp={endTimestamp}
                backgroundColor={"#b3ffb8"}
              />
            </Grid2>
        </Grid2>
      </Container>
    </ThemeProvider>
  );
};

export default App;
