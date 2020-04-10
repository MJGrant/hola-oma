import React, { useState } from 'react';
import { AccountLink } from 'shared/models/accountLink.model';
import { Box, List, ListItem, ListItemAvatar, Avatar, ListItemText, ListItemSecondaryAction, Button } from '@material-ui/core';
import { roles } from 'enums/enums';

import PersonIcon from '@material-ui/icons/Person';
import ManageAccountLinkAlert from './ManageAccountLinkAlert';

interface ILinkedAccountManagement {
  role: string;
  linkedAccounts: AccountLink[];
  pendingAccounts: AccountLink[];
}

const LinkedAccountManagement: React.FC<ILinkedAccountManagement> = ({ role, linkedAccounts, pendingAccounts }) => { 

  const [selectedFriend, setSelectedFriend] = useState<AccountLink>();
  const [manageAccountLinkAlertOpen, setManageAccountLinkAlertOpen] = useState<boolean>(false);

  const unfriendFriend = (friend: AccountLink) => {
    console.log("Stub: Unfriending friend: ", friend);
  }

  const handleManageAccountLinkAlertClose = () => {
    setManageAccountLinkAlertOpen(false);
  }

  const manageAccountLink = (friend: AccountLink) => {
    console.log("Opening alert to manage this friend: ", friend);
    setSelectedFriend(friend);
    setManageAccountLinkAlertOpen(true);
  }

  const acceptAccountLink = (friend: AccountLink) => {
    console.log("accepting friend request");
  }

  const declineAccountLink = (friend: AccountLink) => {
    console.log("declining friend request");
  }

  const manageButton = (friend: AccountLink) => {
    return (
      <Button color="primary" onClick={() => manageAccountLink(friend)}>Remove</Button>
    )
  }

  const acceptButton = (friend: AccountLink) => {
    return (
      <Button color="primary" onClick={() => acceptAccountLink(friend)}>Accept</Button>
    )
  }

  const declineButton = (friend: AccountLink) => {
    return (
      <Button color="primary" onClick={() => declineAccountLink(friend)}>Decline</Button>
    )
  }
  
  const generateLinkedAccountsList = (items: AccountLink[]) => {
    return items.map((friend, index) => {
      return (
        <ListItem key={index}>

          {/* Icon to the left */}
          <ListItemAvatar>
            <Avatar>
              <PersonIcon />
            </Avatar>
          </ListItemAvatar>

          {/* Text */}
          <ListItemText
            primary={friend.id}
            secondary={friend.verified ? 'Verified' : 'Pending'}
          />
          {/* Button to the right */}
          <ListItemSecondaryAction>
            {friend.verified ? <>{manageButton(friend)}</> : <>{declineButton(friend)} {acceptButton(friend)}</>}
          </ListItemSecondaryAction>

        </ListItem>
      );
    })
  };

  return (
    <>
    <Box className="devBox">
      <h3>{role === roles.poster ? 'Sending posts to:' : 'Getting updates from:'}</h3>
      <div>
        <List>
          {generateLinkedAccountsList(linkedAccounts)}
        </List>
      </div>
    </Box>
    <br/>

    <Box className="devBox">
      <h3>Pending invitations</h3>
      <div>
        <List>
          {generateLinkedAccountsList(pendingAccounts)}
        </List>
      </div>
    </Box>
    
    {/* Ensure 'selectedFriend' is set before attempting to render this component */}
    {selectedFriend && 
      <ManageAccountLinkAlert 
        isOpen={manageAccountLinkAlertOpen} 
        friend={selectedFriend} 
        unfriendFriend={() => unfriendFriend(selectedFriend)}
        onClose={handleManageAccountLinkAlertClose} 
      />
    }
    </>
  )
}

export default LinkedAccountManagement;