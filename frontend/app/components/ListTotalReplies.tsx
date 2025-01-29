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

const ListTotalReplies = ({title, endpoint, startTimestamp, endTimestamp}) => {
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
          <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
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
                        Total Comments:&nbsp;
                      </Typography>
                      {item.totalReplies}
                      <br />
                      Market Cap:&nbsp; 
                    <NumericFormat
                      value={item.tokenDetails?.usd_market_cap}
                      prefix="$"
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

  export default ListTotalReplies;