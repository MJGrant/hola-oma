import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { Container, Grid, Card, CardHeader, CardContent, CardMedia, Typography } from '@material-ui/core';
import Alarm from '@material-ui/icons/Alarm';
import { Link } from 'react-router-dom';

import { Post } from 'shared/models/post.model';

import './PostManagement.css';

const useStyles = makeStyles({
  root: {
    minWidth: 250,
    maxWidth: 250
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 16,
  },
  pos: {
    marginBottom: 12,
  },
  media: {
    height: '140px'
  }
});

interface IPostManagement {
  // add posts as Post model here
  // For now, I made it a number to show how you might loop through a quantity of things passed in
  posts: Array<Post>; // array of type "Post"
}

// todo: pass "Posts" into this functional component
const PostManagement: React.FC<IPostManagement> = ({ posts }) => {

  const classes = useStyles();

  const getDateAsString = function(postDate: number) {
    let date = new Date(postDate).toString()
    return date.substring(0, 15);
  }

  const getMessageSubstring = function(message: string) {
    if (message.length > 100) {
      return (message.substring(0, 100) + "...");
    } else {
      return message;
    }
  }

  return (
    <Container>
      <Container>
          <Link to={"/newPost"}>
            <Card>
                <CardContent>
                    Make a new post
                </CardContent>
            </Card>
          </Link>
      </Container>
      <Grid container spacing={2}>
        {
          posts.map((post: Post, index: number) => {
            return (
              <Grid item xs={4} key={index}>
                <div>
                  <Link to={{
                    pathname: "/postDetails",
                    state: {post: post}
                  }}>
                  <Card variant="outlined">

                    {post.photoURL && <CardMedia
                      component="img"
                      className={classes.media}
                      image={post.photoURL}
                    />}

                    <CardHeader
                        title={getMessageSubstring(post.message)}>
                    </CardHeader>

                    <CardContent>
                        <Grid container>
                          <Grid item xs={5}>
                              <Typography variant="subtitle2">
                                  Sent message
                                  <br/>
                                  {getDateAsString(post.date)}
                              </Typography>
                          </Grid>
                          <Grid item xs={5}>
                              <Alarm className="icon"/>
                              <Typography variant="subtitle2">
                                  New replies!
                              </Typography>
                          </Grid>
                        </Grid>
                    </CardContent>
                  </Card>

                </Link>
                </div>
              </Grid>
            )
          })
        }
      </Grid>
    </Container>
  )
}

export default PostManagement;