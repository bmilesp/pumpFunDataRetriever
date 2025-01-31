import { Avatar, Card, CardContent, Grid2, List, ListItem, ListItemAvatar, ListItemText, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { NumericFormat } from "react-number-format";
import AvatarCardListItem from "./AvatarCardListItem";


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

  const ListTopVolume = ({title, endpoint, startTimestamp, endTimestamp, backgroundColor}) => {
    const [data, setData] = useState(
      [{
        _id: "1", 
        totalTxns: 0,
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
      <Card sx={{ backgroundColor: backgroundColor}}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            {title}
          </Typography>
          <List style={{backgroundColor:backgroundColor}} sx={{ p:"0 30px 0 0", width: '100%', bgcolor: 'background.paper' }}>
            {data.map((item) => {
              const secondaryFloatLeftText= <>AVG Sale (SOL):&nbsp; 
              <NumericFormat
                style={{backgroundColor:backgroundColor}}
                value={item.averageSolAmount / 10**9}
                decimalScale={2} 
                thousandSeparator
              /></>;
              const secondaryFloatRightText=<>Total SOL:&nbsp;
                <NumericFormat
                  style={{backgroundColor:backgroundColor, width: "50px", textAlign: "right"}}
                  value={item.totalSolAmount / 10**9}
                  decimalScale={2} 
                  thousandSeparator
                /></>


              return ( <AvatarCardListItem 
                  itemId={item._id}
                  key={endpoint+item._id}
                  title={item.tokenDetails?.symbol+"  —  "+item.tokenDetails?.name }
                  tokenImageUri={item.tokenDetails?.image_uri}
                  primaryFloatRightText={"Total Txns: "+item.totalTxns}
                  secondaryFloatRightText={secondaryFloatRightText}
                  secondaryFloatLeftText={secondaryFloatLeftText}
                >
                </AvatarCardListItem>
              )
            })}
          </List>
        </CardContent>
      </Card>
    );
  };

  export default ListTopVolume;