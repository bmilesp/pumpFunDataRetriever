import { Avatar, Grid2, ListItem, ListItemAvatar, Typography } from "@mui/material";
import React from "react";

const AvatarCardListItem = ({
    itemId = "", 
    title = "",
    tokenImageUri = "",
    primaryFloatRightText,
    secondaryFloatLeftText,
    secondaryFloatRightText,
    linkToPrefix = "https://pump.fun/coin/"
}) => {

    return (

        <ListItem sx={{p:0}} component="a" href={linkToPrefix+itemId} target="_blank" >
            <ListItemAvatar>
                <Avatar alt={title} src={tokenImageUri} />
            </ListItemAvatar>
            <Grid2 size={12} sx={{mb:1}} container justifyContent="space-between">
                <Grid2 container size={12} justifyContent="space-between">
                    <Grid2 size={7} alignItems={"end"} >
                        <Typography variant="h6" >
                        {title}
                        </Typography>
                    </Grid2>
                    <Grid2 size={5} style={{textAlign: "right"}}>
                        <Typography variant="h6" >
                            {primaryFloatRightText}
                        </Typography>
                    </Grid2>
                </Grid2>
                <Grid2 container size={12} justifyContent="space-between">
                    <Grid2 size={8}>
                        {secondaryFloatLeftText}    
                    </Grid2>
                    <Grid2 size={4} style={{textAlign: "right"}}>
                        {secondaryFloatRightText}
                    </Grid2>
                </Grid2>
            </Grid2>
        </ListItem>
    )


};

export default AvatarCardListItem;
