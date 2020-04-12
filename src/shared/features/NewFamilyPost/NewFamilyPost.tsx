import React, { useState } from 'react';

import { Box, TextField, Button } from '@material-ui/core';
import { createPost } from "services/post";

import './NewFamilyPost.css';

const NewFamilyPost: React.FC = () => {
    const [selectedFile, onSelect] = useState<File | null>();
    const [textValue, updateTextValue] = useState("");

    const submitPost = async (e: any) => {
        e.preventDefault();
    
        try {
            const postSent = await createPost(mockPost);
            if (postSent) {
                console.log("success sending post!");
            }
          } catch(e) {
            console.error(e.message);
          }
      };

    let mockPost =
    {creatorID: "APFeMtfQFUacmEAk5pDD1TuMNHn2", from: "Stephanie", message: "Hello, Grandpa!", photoURL: "", read: false, date: new Date().getTime(), receiverIDs: ["xyz789"]};

    return (
        <>
        <form noValidate onSubmit={e => submitPost(e)}>
        <Box>
            <input
                type="file"
                onChange={(event) => onSelect(event.target.files ? event.target.files[0] : null)} />
        </Box>
        <TextField
            multiline
            fullWidth
            margin="normal"
            rows="10"
            variant="outlined"
            label="Type a Message"
            value={textValue}
            onChange={e => updateTextValue(e.target.value)}/>
        <Button
            type="submit"
            variant="contained">
            Send Post
        </Button>
        </form>
     </>
    )
};

export default NewFamilyPost;