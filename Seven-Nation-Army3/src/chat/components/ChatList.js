import React, { Component, Fragment } from 'react';
import Person from './Person';
import { getFirebase } from 'react-redux-firebase';

export default class ChatList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      players: [],
    };
    const firebase = getFirebase();
    this.firebase = firebase;
    this.playerRef = firebase
      .database()
      .ref('root/sessions/-LeTFyD10JE1O-GKaU14/participatingUserIDs/');
  }

  listenForPlayers(playerRef) {
    this.firebase.auth().onAuthStateChanged(user => {
      const playerList = [];
      playerRef.once('value').then(snapshot => {
        snapshot.forEach(element => {
          if (user.uid != element.key) {
            playerList.push({
              id: element.key,
              username: element.val().username,
              country: element.val().country,
            });
          }
        });
        this.setState({
          players: playerList,
        });
      });
    });
  }

  componentDidMount() {
    this.listenForPlayers(this.playerRef);
  }

  render() {
    // console.log(this.state.players);
    const players = this.state.players.map(el => {
      return (
        <Person
          key={el.id}
          id={el.id}
          name={el.username}
          isOnline
          status={el.country}
        />
      );
    });

    return (
      <Fragment>
        {players}
        {/* <Person
          name="Vincent Port"
          isOnline
          status="Italy"
          source="https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_01.jpg"
        />
        <Person
          name="Aiden Chavez"
          isOnline={false}
          status="Germany"
          source="https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_02.jpg"
        />
        <Person
          name="Mike Thomas"
          isOnline
          status="France"
          source="https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_03.jpg"
        />
        <Person
          name="Erica Hughes"
          isOnline
          status="Russia"
          source="https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_04.jpg"
        />
        <Person
          name="Ginger John"
          isOnline
          status="Turkey"
          source="https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_05.jpg"
        />
        <Person
          name="Tracy Carp"
          isOnline={false}
          status="Austria"
          source="https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_06.jpg"
        /> */}
      </Fragment>
    );
  }
}
