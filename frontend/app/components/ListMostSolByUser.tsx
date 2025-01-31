import { Avatar, Card, CardContent, List, ListItem, ListItemAvatar, ListItemText, Typography } from "@mui/material";
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

  const ListMostSolByUser = ({title, endpoint, startTimestamp, endTimestamp, backgroundColor}) => {
    const [data, setData] = useState(
      [{
        _id: "1", 
        totalSolAmount: 0,
        averageSolAmount:0,
        totalTxns:0
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
          <List style={{backgroundColor:backgroundColor}} sx={{ p:0, width: '100%', bgcolor: 'background.paper' }}>

            {data.map((item) => {
            
              const primaryFloatRightText= <>Total SOL:&nbsp; 
              <NumericFormat
                style={{backgroundColor:backgroundColor, width: "40px", textAlign: "right"}}
                value={item.totalSolAmount / 10**9}
                decimalScale={2} 
                thousandSeparator
              /></>;
              const secondaryText= <>Total Txns:&nbsp;
              <NumericFormat
                style={{backgroundColor:backgroundColor, width: "80px", textAlign: "right"}}
                value={item.totalTxns}
                decimalScale={2} 
                suffix=" SOL"
                thousandSeparator
              /></>;
              const secondaryLeftText= <>Average SOL per Txn:&nbsp; 
              <NumericFormat
                style={{backgroundColor:backgroundColor, width: "40px", textAlign: "right"}}
                value={item.averageSolAmount / 10**9}
                decimalScale={3} 
                thousandSeparator
              /></>;

              return ( <AvatarCardListItem 
                  itemId={item._id}
                  linkToPrefix="https://solscan.io/account/"
                  tokenSymbolAndNameText={item._id}
                  tokenImageUri={item.tokenDetails?.image_uri}
                  primaryFloatRightText={primaryFloatRightText}
                  secondaryFloatRightText={secondaryText}
                  secondaryFloatLeftText={secondaryLeftText}
                >
                </AvatarCardListItem>
              )
            })}
          </List>
        </CardContent>
      </Card>
    );
  };

  export default ListMostSolByUser;