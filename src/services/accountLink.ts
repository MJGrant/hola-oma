import * as firebase from "firebase/app";

import { AccountLink } from "shared/models/accountLink.model";
import { authenticateFromStore } from "./user";
import { getUserDataByID } from "services/user";

export const getLinkedAccounts = async (): Promise<AccountLink[]> => {
  await authenticateFromStore();
  var user = firebase.auth().currentUser;
  const db = firebase.firestore();

  const links = await db.collection("accountLinks").doc(user?.uid).get();
  const linkData = links.data() as Object;

  //return Object?.entries(linkData) ?? AccountLink[];
  let accountLinks: AccountLink[] = [];

  if (linkData) {
    const linkDataEntries = Object.entries(linkData); // turns it into an array of arrays
    for await (let entry of linkDataEntries) {
      let userData = await getUserDataByID(entry[0]);
      if (userData) {
        const obj = {
          id: entry[0],
          verified: entry[1],
          displayName: userData.displayName,
          email: userData.email
        }
        accountLinks.push(obj);
      }
    };
  } else {
    accountLinks = [];
  }

  return accountLinks;
}

// obviously we won't ask users to input the actual ID of the user they want to link with
// this is just for the first-pass implementation 
// later, we'll give the user a simple "pass phrase" to share or allow them to link up by entering the other user's email address
export const createLinkByID = async(otherUserID: string) => {
  const user = firebase.auth().currentUser;
  const db = firebase.firestore();

  try {
    // create a document with the signed in user's ID
    // add the desired account ID as an "accountLink"
    // set it to FALSE because the other user has not accepted the link
    await db.collection("accountLinks").doc(user?.uid).set({
      [otherUserID]: false,
    }, {merge: true});

    // create another document, this one with the pending user's ID 
    // add the desired account ID as an "accountLink"
    // set it to FALSE because it is PENDING at this point
    // we don't know yet if this user approves of the link 
    let userID = user?.uid.toString();
    if (userID) {
      await db.collection("accountLinks").doc(otherUserID).set({
        [userID]: false,
      }, {merge: true});
    } else {
      console.log("error creating linked account entry");
      return false;
    }
    return true;

  } catch(e) {
    console.log(e.message);
    throw Error(e.message);
  }
}

// Retrieves user settings from our users db
export const getUserSettings = async () => {
  await authenticateFromStore();
  var user = firebase.auth().currentUser;
  const db = firebase.firestore();

  const userdoc = await db.collection("users").doc(user?.uid).get();
  return userdoc.data();
}

export const createLinkByEmail = async (otherUserEmail: string) => {
  await authenticateFromStore();
  const db = firebase.firestore();

  // get userdoc that has an email matching the "otherUserEmail" var passed in
  const snapshot = await db.collection("users").where("email", "==", otherUserEmail).get();

  if (snapshot.empty) {
    throw Error("There is no user with this email address: " + otherUserEmail);
  } else {
    const matchingRecord = snapshot.docs[0].data();
    if (!matchingRecord.uid) {
      throw Error("Invited user does not have an ID in their users record");
    } else {
      try {
        createLinkByID(matchingRecord.uid);
      } catch(e) {
        console.log("Something went wrong trying to create a link with this user");
        return false;
      }
    }
  }
  return true;
}

export const acceptLink = async(acceptThisUserLinkID: string) => {
  const user = firebase.auth().currentUser;
  const db = firebase.firestore();

  // Get the document by current user's ID
  // The pending link is the other user's ID within that doc 
  try {
    let userID = user?.uid.toString();
    if (userID) {
      await db.collection("accountLinks").doc(user?.uid).update({
        [acceptThisUserLinkID]: true,
      });

      // tell the "inviter" that their invitation was accepted from this specific user 
      await db.collection("accountLinks").doc(acceptThisUserLinkID).update({
        [userID]: true,
      })
    }

    return true;
  } catch(e) {
    console.log(e.message);
    throw Error(e.message);
  }
}

/* Removes a link, regardless of whether it was pending or verified */
/* Currently, there is no way to remove a link but return it to 'pending' or 'soft delete' it */
export const removeLink = async(removeThisUserLinkID: string) => {
  const user = firebase.auth().currentUser;
  const db = firebase.firestore();

  let userID = user?.uid.toString();

  // Get the document by current user's ID
  // The pending link is the other user's ID within that doc 
  if (userID) {
    try {
      await db.collection("accountLinks").doc(user?.uid).update({
        [removeThisUserLinkID]: firebase.firestore.FieldValue.delete(),
      });
  
      await db.collection("accountLinks").doc(removeThisUserLinkID).update({
          [userID]: firebase.firestore.FieldValue.delete(),
      });
      return true;
    } catch(e) {
      console.log(e.message);
      throw Error(e.message);
    }
  } else {
    console.log("Problem with user ID");
  }
}