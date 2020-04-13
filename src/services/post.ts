//Resource: https://stackoverflow.com/questions/48036975/firestore-multiple-conditional-where-clauses

import * as firebase from "firebase/app";
import {Post} from '../shared/models/post.model';
import {authenticateFromStore} from "./user";
import {roles} from "../enums/enums";
import FieldPath from "firebase/firestore";

export const getPosts = async (role: roles): Promise<Post[]> => {
  await authenticateFromStore();
  const user = firebase.auth().currentUser;
  const db = firebase.firestore();
  const posts: Array<Post> = [];

  // Get user id
  let userId = user?.uid;
  console.log("user id: " + userId);

  // Set query options based on whether user is a poster or a receiver
  let queryOptions = [ [<string>"receiverIDs", "array-contains"], ["users", "=="] ];
  let queryWhere = queryOptions[0];     // for receiver
  if (role === roles.poster) {          // else if poster
    queryWhere = queryOptions[1];
  }

  // Get posts
  await db.collection("posts")
    .where(<string>queryWhere[0],                 // FieldPath
      <"==" | "array-contains-any">queryWhere[1], // string Opt
      userId).get()
    .then((snapshot) => {
      if (snapshot.empty) {
        console.log("No posts found for: " + role + ", userID: " + userId);
        return;
      }
      snapshot.forEach(doc => {
      //console.log(doc.id, '->', doc.data());
        let data = doc.data();
        posts.push({
          id: data.id,
          creatorID: data.creatorID,
          from: data.from,
          message: data.message,
          photoURL: data.photoURL,
          read: data.read
        });
      });
    })
    .catch(err => {
      console.log('Error getting documents', err);
    });
  return posts;
}

// todo: createPost