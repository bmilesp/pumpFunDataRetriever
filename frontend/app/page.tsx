"use client"
import { NumericFormat } from 'react-number-format';
import React, { useEffect, useState } from "react";
import {
  Container,
  Grid2,
  Card,
  CardContent,
  Typography,
  TextField,
  Tab,
  Box,
} from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import ListTotalReplies from './components/ListTotalReplies';
import ListTopDumps from './components/ListTopDumps';
import ListTopPumps from './components/ListTopPumps';
import ListTopVolume from './components/ListTopVolume';
import ListMostTxnsByUser from './components/ListMostTxnsByUser';
import ListSolByUser from './components/ListSolByUser';

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
    <Container maxWidth="xl" style={{ marginTop: "20px", backgroundColor: "#fffffa", padding: "20px", borderRadius: "5px" }}>
    <TextField
      style={{maxWidth: 360, backgroundColor: "#ffffff"}}
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
      style={{marginLeft: 5, maxWidth: 360, backgroundColor: "#ffffff"}}
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


const App = () => {
  const [startTimestamp, setStartTimestamp] = useState(
    Math.floor(new Date(new Date().getTime() - (24 * 60 * 60 * 1000)).getTime())
  );
  const [endTimestamp, setEndTimestamp] = useState(
    Math.floor(Date.now())
  );
  const [value, setValue] = React.useState('1');

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="xl" style={{ marginTop: "20px" }}>
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
        <Box sx={{ p:1, mt:1, width:'100%', backgroundColor: '#fffffa', borderRadius: "5px" }}>
          <TabContext value={value}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <TabList onChange={handleTabChange} aria-label="simple tabs example">
                <Tab label="Coins" value="1" />
                <Tab label="Users" value="2" />
              </TabList>
            </Box>
            <TabPanel value="1">
              <Grid2 container spacing={2} style={{ marginTop: "10px" }}>
                <Grid2 size={{ xs: 12, md: 6 }} key={"topDumpsByDateRange"}>
                  <ListTopDumps
                    title="Coin — Top Dumps"
                    endpoint="topDumpsByDateRange"
                    startTimestamp={startTimestamp}
                    endTimestamp={endTimestamp}
                    backgroundColor={"#ffb3b3"}
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 6 }} key={"topPumpsByDateRange"}>
                  <ListTopPumps
                    title="Coin — Top Pumps"
                    endpoint="topPumpsByDateRange"
                    startTimestamp={startTimestamp}
                    endTimestamp={endTimestamp}
                    backgroundColor={"#b3ffb8"}
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 6 }} key={"topTotalReplies"}>
                  <ListTotalReplies
                    title="Coin — Most Comments"
                    endpoint="topMintsByTotalCommentsAndDateRange"
                    startTimestamp={startTimestamp}
                    endTimestamp={endTimestamp}
                    backgroundColor={"#fff"}
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 6 }} key={"topTotalRepliesAllTime"}>
                  <ListTotalReplies
                    title="Coin — Most Comments - All Time"
                    endpoint="topMintsByTotalComments"
                    startTimestamp={startTimestamp}
                    endTimestamp={endTimestamp}
                    backgroundColor={"#fff"}
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 6 }} key={"topMintsByVolumeAndDateRange"}>
                  <ListTopVolume
                    title="Coin — Most Volume"
                    endpoint="topMintsByVolumeAndDateRange"
                    startTimestamp={startTimestamp}
                    endTimestamp={endTimestamp}
                    backgroundColor={"#fff"}
                  />
                </Grid2>
              </Grid2>
            </TabPanel>
            <TabPanel value="2">
              <Grid2 container spacing={2} style={{ marginTop: "10px" }}>
                <Grid2 size={{ xs: 12, md: 6 }} key={"leastSolByUser"}>
                  <ListSolByUser
                    title="User — Top Sellers"
                    endpoint="leastSolByUser"
                    startTimestamp={startTimestamp}
                    endTimestamp={endTimestamp}
                    backgroundColor={"#ffb3b3"}
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 6 }} key={"mostSolByUser"}>
                  <ListSolByUser
                    title="User — Top Buyers"
                    endpoint="mostSolByUser"
                    startTimestamp={startTimestamp}
                    endTimestamp={endTimestamp}
                    backgroundColor={"#b3ffb8"}
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 6 }} key={"topMostTxnsByUser"}>
                  <ListMostTxnsByUser
                    title="User — Top Volume"
                    endpoint="topMostTxnsByUser"
                    startTimestamp={startTimestamp}
                    endTimestamp={endTimestamp}
                    backgroundColor={"#fff"}
                  />
                </Grid2>
              </Grid2>
            </TabPanel>
          </TabContext>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default App;
