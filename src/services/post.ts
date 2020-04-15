import * as firebase from "firebase/app";
import 'firebase/storage';
import { Post } from '../shared/models/post.model';
import { authenticateFromStore } from "./user";

export const getPosts = async (): Promise<Post[]> => {
  await authenticateFromStore();
  const user = firebase.auth().currentUser;
  const db = firebase.firestore();

  const posts: Array<Post> = [];

  await db.collection("posts")
                        .where("creatorID", "==", user?.uid).orderBy("date", "desc").get()
                        .then((snapshot) => {
                          if (snapshot.empty) {
                            console.log("No posts found");
                            return;
                          }

                          snapshot.forEach(doc => {
                            //console.log(doc.id, '->', doc.data());
                            let data = doc.data();
                            posts.push({
                              creatorID: data.creatorID,
                              from: data.from,
                              message: data.message,
                              photoURL: data.photoURL,
                              read: data.read,
                              date: data.date,
                              receiverIDs: data.receiverIDs
                            });
                          });
                        })
                        .catch(err => {
                          console.log('Error getting documents', err);
                        });
  
  return posts;
};

export const createPost = async (post: Post) => {
  const db = firebase.firestore();

  try {
    await db.collection("posts").add({
      creatorID: post.creatorID,
      from: post.from,
      message: post.message,
      photoURL: post.photoURL,
      read: post.read,
      date: post.date,
      receiverIDs: post.receiverIDs
    });

    return true;

  } catch(e) {
    console.log(e.message);
    throw Error(e.message);
  }
}

export const uploadFile = async(selectedFile: File) => {
  // Get a unique name to store the file under
  let fileName = Date.now(); 
  let storageRef = firebase.storage().ref().child('/images/'+ fileName); 
  let downloadURL = "";

  let uploadTask = await storageRef.put(selectedFile);
  downloadURL = await uploadTask.ref.getDownloadURL();
  return downloadURL;
}