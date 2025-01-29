import { Avatar, Card, CardContent, List, ListItem, ListItemAvatar, ListItemText, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { NumericFormat } from "react-number-format";


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

  const ListTopDumpsByMostSellTxns = ({title, endpoint, startTimestamp, endTimestamp, backgroundColor}) => {
    const [data, setData] = useState(
      [{
        _id: "1", 
        totalSells: 0,
        totalSolAmount: 0,
        averageSolAmount:0,
        tokenDetails: {
          symbol: "Loading...",
          name: "Loading...",
          image_uri: "",
          usd_market_cap: "Loading...",
        },
      }]
    );
  
    useEffect(() => {
      const loadData = async () => {
        const result = await fetchData(endpoint, {
          startTimestamp,
          endTimestamp,
        });
        setData(result);
        console.log(result)
      };
      loadData();
    }, [startTimestamp, endTimestamp, endpoint]);
  
    return (
      <Card sx={{ backgroundColor: backgroundColor, marginBottom: "20px" }}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            {title}
          </Typography>
          <List style={{backgroundColor:backgroundColor}} sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {data.map((item) => (
            
              <ListItem component="a" href={"https://pump.fun/coin/"+item._id} target="_blank" alignItems="flex-start"  key={item._id}>
                <ListItemAvatar>
                  <Avatar alt={item.tokenDetails?.symbol+" "+item.tokenDetails?.name} src={item.tokenDetails?.image_uri} />
                </ListItemAvatar>
                <ListItemText
                  primary={item.tokenDetails?.symbol+"  —  "+item.tokenDetails?.name }
                  secondary={
                    <React.Fragment>
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{ color: 'text.primary', display: 'inline' }}
                      >
                        Total Sells:&nbsp;
                      </Typography>
                      {item.totalSells}
                      <br />
                      AVG Sale (SOL):&nbsp; 
                      <NumericFormat
                        style={{backgroundColor:backgroundColor}}
                        value={item.averageSolAmount / 10**9}
                        decimalScale={2} 
                        thousandSeparator
                      />
                      <br />
                      Total SOL:&nbsp; 
                      <NumericFormat
                        style={{backgroundColor:backgroundColor}}
                        value={item.totalSolAmount / 10**9}
                        decimalScale={2} 
                        thousandSeparator
                      />
                    </React.Fragment>
  
                  }
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    );
  };

  export default ListTopDumpsByMostSellTxns;