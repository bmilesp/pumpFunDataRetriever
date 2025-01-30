import { Avatar, Card, CardContent, Grid2, List, ListItem, ListItemAvatar, ListItemText, Typography } from "@mui/material";
import React from "react";
import { NumericFormat } from "react-number-format";

const AvatarCardListItem = ({
    itemId = "", 
    tokenSymbolAndNameText = "",
    tokenImageUri = "",
    primaryFloatRightText = {},
    secondaryFloatLeftText = {},
    secondaryFloatRightText = {},
    linkToPrefix = "https://pump.fun/coin/"
}) => {

    return (

        <ListItem sx={{p:0}} component="a" href={linkToPrefix+itemId} target="_blank" alignItems="flex-start"  key={itemId+tokenSymbolAndNameText}>
        <ListItemAvatar>
            <Avatar alt={tokenSymbolAndNameText} src={tokenImageUri} />
        </ListItemAvatar>
        <ListItemText
            primary={
            <React.Fragment>
                <Grid2 container justifyContent="space-between">
                <Grid2>
                    <Typography>
                    {tokenSymbolAndNameText }
                    </Typography>
                </Grid2>
                <Grid2 alignItems="right">
                    <Typography>
                        {primaryFloatRightText}
                    </Typography>
                </Grid2>
                </Grid2>
            </React.Fragment>
            
            }
            secondary={
            <React.Fragment>
                <Grid2 container justifyContent="space-between">
                <Grid2 >
                    <Typography  variant="body2">
                    {secondaryFloatLeftText}    
                    </Typography>
                </Grid2>
                <Grid2 alignItems="right">
                <Typography variant="body2">
                    {secondaryFloatRightText}
                </Typography>  
                </Grid2>
                </Grid2>
            </React.Fragment>

            }
        />
        </ListItem>
    )


};

export default AvatarCardListItem;
