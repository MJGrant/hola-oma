import React from 'react';

import { Typography, Container } from '@material-ui/core';

import { Reply } from "../../models/reply.model";
import { replyEmojiArray } from "../../../Icons";

interface IReply {
    // add posts as Post model here
    // For now, I made it a number to show how you might loop through a quantity of things passed in
    reply: Reply; // array of type "Post"
  }

const ModalReply: React.FC<IReply> = ({reply}) => {

    const emojiIcons = replyEmojiArray();

    const messageAsArray = (reply: Reply) => {
        return reply.message as number[];
    }
    
    const isEmoji = (reply: Reply) => {
        return (reply.replyType === "emoji" && typeof reply.message !== "string");
    }

    if (isEmoji(reply)) {
        return (
            <>
                {
                    messageAsArray(reply).map((emojiIndex: number, replyIndex: number) => {
                        return (
                            <Container>
                                {emojiIcons[emojiIndex]}
                            </Container>
                        )
                    })
                }
            </>
        )
    } else {
        return (
            <>
            </>
        )
    }
};

export default ModalReply;