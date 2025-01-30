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

const ListTotalReplies = ({title, endpoint, startTimestamp, endTimestamp, backgroundColor}) => {
    const [data, setData] = useState(
      [{
        _id: "1", 
        totalReplies: 0,
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
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            {title}
          </Typography>
          <List sx={{ p:0, width: '100%', bgcolor: 'background.paper' }}>
          {data.map((item) => {
              const primaryFloatRightText= <>Total Comments:&nbsp;{item.totalReplies}</>
              const secondaryText= <>Market Cap:&nbsp; 
              <NumericFormat
                style={{backgroundColor:backgroundColor, width: "70px", textAlign: "right"}}
                value={item.tokenDetails?.usd_market_cap}
                decimalScale={2} 
                thousandSeparator
              /></>;

              return ( <AvatarCardListItem 
                  itemId={item._id}
                  tokenSymbolAndNameText={item.tokenDetails?.symbol+"  —  "+item.tokenDetails?.name }
                  tokenImageUri={item.tokenDetails?.image_uri}
                  primaryFloatRightText={primaryFloatRightText}
                  secondaryFloatRightText={secondaryText}
                  secondaryFloatLeftText=""
                >
                </AvatarCardListItem>
              )
            })}
          </List>
        </CardContent>
      </Card>
    );
  };

  export default ListTotalReplies;