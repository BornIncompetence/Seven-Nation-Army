import { push } from 'connected-react-router';
import {
  GET_SESSIONS_SUCCESS,
  GET_SESSIONS_FAIL,
  CREATE_SESSION_SUCCESS,
  CREATE_SESSION_FAIL,
  JOIN_SESSION_SUCCESS,
  JOIN_SESSION_FAIL,
  LEAVE_SESSION,
} from './actionTypes';
import objectHash from 'object-hash';

export const getSessions = () => {
  return (dispatch, _, { getFirebase }) => {
    getFirebase()
      .database()
      .ref('root/sessions')
      .once('value')
      .then(res => {
        dispatch({
          type: GET_SESSIONS_SUCCESS,
          payload: res.val(),
        });
      })
      .catch(err => {
        dispatch({
          type: GET_SESSIONS_FAIL,
          payload: err,
        });
      });
  };
};

// Create a new session that shows up in the list of sessions
export const createSession = (title, passcode, adjudicationPeriod) => {
  return (dispatch, getState, { getFirebase }) => {
    const gameMasterUserID = getState().firebase.auth.uid;
    const displayName = getState().firebase.auth.displayName;
    const newSession = {
      title,
      gameMasterUserID,
      passcode,
      adjudicationPeriod,
      running: false,
      participatingUserIDs: {},
    };
    newSession.participatingUserIDs[gameMasterUserID] = { displayName };
    const key = objectHash.sha1(newSession);

    getFirebase()
      .database()
      .ref(`root/sessions/${key}`)
      .set(newSession)
      .then(() => {
        dispatch({
          type: CREATE_SESSION_SUCCESS,
          payload: key,
        });
        dispatch(push('/lobby'));
      })
      .catch(err => {
        dispatch({
          type: CREATE_SESSION_FAIL,
          payload: err,
        });
      });
  };
};

// Start the session, removing it from the session list by saying it's running
export const startSession = () => {
  return (dispatch, getState, { getFirebase }) => {
    const currentSession = getState().session.session;
    const update = {};
    update.running = true;

    const newChat = {
      dummy: 'data',
    };

    getFirebase()
      .database()
      .ref(`root/sessions/${currentSession}`)
      .update(update)
      .then(
        getFirebase()
          .ref(`root/chatrooms/${currentSession}`)
          .set(newChat)
          .then(() => {
            dispatch(push('/game'));
          })
          .catch(err => console.log('Cannot create new chatroom', err))
      )
      .catch(err => console.log('Cannot start game', err));
  };
};

// Push your own ID into the game if it is available to join
export const joinSession = (roomID, roomCode) => {
  return (dispatch, getState, { getFirebase }) => {
    const ownID = getState().firebase.auth.uid;
    const displayName = getState().firebase.auth.displayName;
    const update = {};
    update[ownID] = displayName;

    getFirebase()
      .database()
      .ref(`root/sessions/${roomID}/passcode`)
      .once('value')
      .then(res => {
        // Get the password of the room
        const passcode = res.val();
        if (roomCode === passcode) {
          getFirebase()
            .database()
            .ref(`root/sessions/${roomID}/playerIDs`)
            .update(update)
            .then(() => {
              // Add player to room's list of players
              dispatch({
                type: JOIN_SESSION_SUCCESS,
                payload: roomID,
              });
              dispatch(push('/lobby'));
            })
            .catch(err => {
              console.log('Error:', err);
            });
        } else {
          dispatch({
            type: JOIN_SESSION_FAIL,
            payload: 'Invalid room code',
          });
        }
      })
      .catch(err => {
        console.log(err);
      });
  };
};

export const leaveSession = () => {
  return dispatch => {
    dispatch({
      type: LEAVE_SESSION,
    });
    dispatch(push('./home'));
  };
};
