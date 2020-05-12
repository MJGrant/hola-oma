import React, { useState, useEffect } from 'react';

import { useHistory } from "react-router";

import { TextField, Button, Checkbox, Typography } from '@material-ui/core';
import { createPost, updatePostID, uploadFile } from "services/post";
import { getUserProfile } from "services/user";
import { getLinkedAccounts } from "services/accountLink";
import FormError from 'shared/components/FormError/FormError';
import ClearIcon from '@material-ui/icons/Clear';
import Column from 'shared/components/Column/Column';
import Row from 'shared/components/Row/Row';

import './NewFamilyPost.css';
// @ts-ignore
import Resizer from 'react-image-file-resizer';

interface IReceiver {
    id: string
    name: string
    checked: boolean
}

interface IReadObj {
    [key: string]: boolean
}

const NewFamilyPost: React.FC = () => {
    const [selectedFile, setSelectedFile] = useState<Blob | File | null>();
    const [fileType, setFileType] = useState("");
    const [textValue, updateTextValue] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [userId, setUserId] = useState("");
    const [receivers, setReceivers] = useState<IReceiver[]>([]);
    const [error, setError] = useState<string | null>();
    const history = useHistory();

    const submitPost = async (e: any) => {
        e.preventDefault();
        setError(null);
        if (!selectedFile && !textValue) {
            setError("You must provide a message and/or photo.");
            return;
        }
        let receiverIDs = [];
        for (let i = 0; i < receivers.length; i++) {
            if (receivers[i].checked) {
                receiverIDs.push(receivers[i].id);
            }
        }
        if (receiverIDs.length === 0) {
            setError("Please select at least one receiver");
            return;
        }

        let post = {
            pid: "",
            creatorID: userId,
            from: displayName,
            message: textValue,
            photoURL: "",
            videoURL: "",
            read: setRead(receiverIDs),
            date: new Date().getTime(),
            receiverIDs: receiverIDs
        };

        if (selectedFile) {
            const fileURL = await uploadFile(selectedFile);
            if (fileURL && fileType === 'image') {
                post.photoURL = fileURL;
            }
            else if (fileURL && fileType === 'video') {
                post.videoURL = fileURL;
            }
        }
    
        try {
            const postSent = await createPost(post);
            if (postSent) {
                await updatePostID(postSent);       // Add post id to new post document
            }
            if (history) history.push('/posts');
          } catch(e) {
            console.error(e.message);
          }
      };

    const setRead = (receiverIDs: Array<string>) => {
        let readObj: IReadObj;
        readObj = {};
        for (let i = 0; i < receiverIDs.length; i++) {
            readObj[receiverIDs[i]] = false;
        }
        return readObj;
    }

    const handleCheckboxes = (event: any, index: number) => {
        event.persist();
        let newArray = [...receivers];
        newArray[index].checked = event.target.checked;
        setReceivers(newArray);
    }

    const clickFileUpload = () => {
        let element = document.getElementById("file-upload");
        if (element != null) {
            element.click();
        }
    }

    const onSelect = (file: File | null) => {
        if (file && file.type.indexOf('image') !== -1) {
            setFileType('image');
            Resizer.imageFileResizer(
                file,
                600,
                600,
                'JPEG',
                100,
                0,
                (blob: Blob) => {
                    console.log(blob);
                    setSelectedFile(blob);
                },
                'blob'
            );
        } else if (file && file.type.indexOf('video') !== -1) {
            setSelectedFile(file);
            setFileType('video');
        }
    }

    const getImageAsUrl = () => {
        let urlCreator = window.URL || window.webkitURL;
        let imageUrl: string = urlCreator.createObjectURL(selectedFile);
        return imageUrl;
    }

    useEffect(() => {
        getUserProfile()
        .then((userProfile:any) => {
            setDisplayName(userProfile.displayName);
            setUserId(userProfile?.uid);
        });
        //Get connected accounts to populate receiver list
        getLinkedAccounts()
        .then((linkedAccounts) => {
            let rcvrs = [];
            for (let i = 0; i < linkedAccounts.length; i++) {
                if (linkedAccounts[i].verified === true) {
                    let displayName = linkedAccounts[i].displayName ? linkedAccounts[i].displayName : "Unknown Username";
                    let receiver = {
                        id: linkedAccounts[i].id,
                        name: displayName,
                        checked: true};
                    rcvrs.push(receiver);
                }
            }
            setReceivers(rcvrs);
        });
    }, []); // fires on page load if this is empty [] 

    return (
        <>
        <Column justify="center" alignItems="center">
            <Typography component="h2" variant="h5" align="center">
                Create Post
            </Typography>
            <br/>
            <form className="newFamilyPostForm" noValidate onSubmit={e => submitPost(e)}>
            {!selectedFile &&
                <Row justify="center">
                    <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        onClick={clickFileUpload}>
                        Select a photo
                    </Button>
                    <input
                        type="file"
                        id="file-upload"
                        style={{display:'none'}}
                        onChange={(event) => onSelect(event.target.files ? event.target.files[0] : null)} />
                </Row>
            }
            {selectedFile &&
                <>
                    {fileType === 'image' &&
                        <Row justify="center">
                            <img src={getImageAsUrl()}
                                className="photo"
                                alt="Attached img"/>
                        </Row>
                    }
                    {fileType === 'video' &&
                        <Row justify="center">
                            <video src={getImageAsUrl()}
                                className="photo"
                                preload="auto"
                                controls
                            />
                        </Row>
                    }
                    <Row justify="center">
                        <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            onClick={() => setSelectedFile(null)}>
                            <ClearIcon/>Remove file
                        </Button>
                    </Row>
                </>
            }
            <TextField
                multiline
                fullWidth
                margin="normal"
                rows="10"
                variant="outlined"
                label="Type a Message"
                value={textValue}
                onChange={e => updateTextValue(e.target.value)}/>
            <Row justify="center">
                Recipients
            </Row>
            {
                receivers.map((receiver: IReceiver, index: number) => {
                    return (
                        <Row justify="center" key={receiver.id}>
                            <label>
                                {receiver.name}
                                <Checkbox name={receiver.id} checked={receiver.checked} onChange={e => handleCheckboxes(e, index)} />
                            </label>
                        </Row>
                    )
                })
            }
            <br/>
            <Row justify="center">
            <Button
                type="submit"
                variant="contained">
                Send Post
            </Button>
            </Row>
            {error &&
                <FormError error={error}/>
            }
            </form>
        </Column>
     </>
    )
};

export default NewFamilyPost;