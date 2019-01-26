// Initialize Firebase
var config = {
  apiKey: "AIzaSyCwVMm6ADZK8vhomncIsLiVcb1y41msKhU",
  authDomain: "classwork-3c0ce.firebaseapp.com",
  databaseURL: "https://classwork-3c0ce.firebaseio.com",
  projectId: "classwork-3c0ce",
  storageBucket: "classwork-3c0ce.appspot.com",
  messagingSenderId: "972609370378"
};
firebase.initializeApp(config);

/////////////
// Get from firebase documentation
// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());

// The start method will wait until the DOM is loaded.
var uiConfig = {
  callbacks: {
    signInSuccessWithAuthResult: function(authResult, redirectUrl) {
      // User successfully signed in.
      // Return type determines whether we continue the redirect automatically
      // or whether we leave that to developer to handle.
      return true;
    },
    uiShown: function() {
      // The widget is rendered.
      // Hide the loader.
      document.getElementById('loader').style.display = 'none';
    }
  },
  // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
  signInFlow: 'popup',
  signInSuccessUrl: 'index.html',
  signInOptions: [
    // Leave the lines as is for the providers you want to offer your users.
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    firebase.auth.TwitterAuthProvider.PROVIDER_ID,
    firebase.auth.GithubAuthProvider.PROVIDER_ID,
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
    firebase.auth.PhoneAuthProvider.PROVIDER_ID
  ],
  // Terms of service url.
  tosUrl: '<your-tos-url>',
  // Privacy policy url.
  privacyPolicyUrl: '<your-privacy-policy-url>'
};
ui.start('#firebaseui-auth-container', uiConfig);

//Function to start game
function submitCreateAccount(){
  var displayName = "";
  var email = "";
  var password = ""; // get from page

  firebase.auth().createUserWithEmailAndPassword(email.value,password.value)
    .then(function(user){
      //add display name
      user.updateProfile({displayName: displayName.value});
    });
}

function googleSignIn(googleUser){
  var credential = firebase.atuh.GoogleAuthProvider.credential(
    {'idToken':googleUser.getAuthResponse().id_token}
  );
  firebase.auth().signInWithCredential(credential);
}

//Parsing User Name from Email-id
function getUserNameFromEmail(email) {
  var ind = email.indexOf("@");
  var uName = email.substr(0, ind);
  return uName;
}

function authStateChangeListener(){
  var user = firebase.auth().currentUser;
  //sign in
  if(user){
    //Chat.onlogin();
    //Game.onlogin();
    console.log("Authorized User");
    console.log("userName : " + user.displayName);
    console.log("email : " + user.email);
    console.log("uid : " + user.uid);


    $("#loginPage").hide();
    $("#gamePage").show();
    $("#gameCardDeck").hide();
    $("#userName").text(user.displayName);

  }else{ //signout
    //$("#message").text("PLEASE LOG IN");
    $("#loginPage").show();
    $("#gamePage").hide();
    $("#gameCardDeck").hide();
  }
}

// Event handlers

// Authentication state changes
firebase.auth().onAuthStateChanged(authStateChangeListener);

// Intialise Variables
var userName="Guest";
var STATE = {OPEN:1,JOINED:2,ICON_DETECTED:3,COMPLETE:4};
var creatorWins = 0;
var joinerWins = 0;
var ties=0;
var gameCounter = 0;

/*
{
  "creator":{"displayName":"player 1","uid":"999"},
  "joiner":{"displayName":"player 1","uid":"999"},
   "state":2 // joined
}
*/

// References to DB firebase
var database = firebase.database();

var chatRef = database.ref("/rps/chat");
var gameRef = database.ref("/rps/game");
var currentGames = database.ref("/rps/game").orderByChild("STATE").equalTo(STATE.ICON_DETECTED);
var openGames = database.ref("/rps/game").orderByChild("STATE").equalTo(STATE.OPEN);

//var connectionsRef = database.ref("/connections");

// Get from firebase documentation

function createGame(){
  var user=firebase.auth().currentUser;
  console.log("in createGame");
  //Set player 1
  $("#player1").text(user.displayName);
  loadChoices("player1Choices");
  $("#status").text("Waiting for an opponent")
  console.log("Create game:" + user.displayName);
  console.log("after exissting createGame");
  var currentGame = {
    "creator":{"uid":user.uid,"displayName":user.displayName},
    "STATE":STATE.OPEN
  }
  gameRef.push().set(currentGame);
}

function joinGame(key){
  var user=firebase.auth().currentUser;
  var gRef = gameRef.child(key);

  //console.log("gRef : " + gRef.val());

  console.log("user.displayName : " + user.displayName);
  //Set player 2 and player 1
  $("#player2").text(user.displayName);
  loadChoices("player2Choices");
  
  
  
  gRef.transaction(function(game){
    
    if(!game.joiner){
      $("#player1").text(game.creator.displayName);
      $("#gamePlayedId").val(key);
      game.STATE=STATE.JOINED;
      //game.joiner={"name":userName}
      game.joiner={"uid":user.uid, "displayName":user.displayName}
    }
    return game;
  })

  $("#gameCardDeck").show();
}

function watchGame(key){
  console.log("Inside watchGame : Key === " + key);
  var gRef = gameRef.child(key);
  console.log("Inside watchGame : gRef === " + gRef);
  gRef.on("value",function(snapshot){
    var game=snapshot.val();
    console.log("GAME STATE : " + game.STATE);
    switch(game.STATE){
      case STATE.JOINED:
        joinedGame(gRef,game);
        break;
      case STATE.ICON_DETECTED:
        setGameId(key);
        displayDetectedIcon(game);
        determineWinner(gRef,game);
        break;
      case STATE.COMPLETE:
        showWinner(game);
        break;
    }
  });
}

//displayDetectedIcon

//Function to send message
function sendChatMessage(userName){
  var message = $("#message").val();
  
  chatRef.push({
    name:userName,
    message:message
  });
  $("#message").val("");
}

//Add message to the Chat Window
function addChatMessage(userName,message){
  $("#chatBox").append(`<p>${userName}:${message}</p>`);
}

/*function setJoinGameButton(userName,uid){
    console.log("SEtting Join Button");
    //$("#joinGameSp").append(`<button id='${uid}'>Join ${userName}</button>`);
}*/

//Set Current User Name
/*function setCurrentUserName(){
  var user=firebase.auth().currentUser;
  if(user){
    userName = user.displayName;
    $("#userName").text(userName);
  }else{
    let userNamels=localStorage.getItem("rpsUserName");
    $("#userName").text(userNamels);
  }
  
};*/

function loadChoices(divId){
  $rImg = createImage("rock");
  $pImg = createImage("paper");
  $sImg = createImage("scissors");

  $("#"+divId).append($rImg,$pImg,$sImg);
  
}

//Create an Image using the name parameter
function createImage(name){
  $img = $("<img>");
  $img.addClass("my-img");
  $img.attr("src","./assets/images/"+name+".jpg");
  $img.attr("alt",name);
  $img.attr("id",name)

  return $img;
}

function getCreatorCard(){
  $card = $("<div class='card'>");
  $cardHeader = $("<div id='player1' class='card-header text-center'>");
  $cardBody = $("<div class='card-body'>");
  $choices = $("<div id='player1Choices'>");

  $choices.appendTo($cardBody);
  $card.append($cardHeader,$cardBody);

}

function getJoinerCard(){

}

function addUserChoice(userChoice,gameKey){
  let userId = firebase.auth().currentUser.uid;

  
  
  gRef = gameRef.child(gameKey);
  //var keyRef = ref.child(key);
  gRef.on('value', (snap) => game = snap.val());
  console.log("game : " + game);

  /*if (game.creator.uid == firebase.auth().currentUser.uid) {
      data["creator/gcsPath"] = gcsPath;
      data["creator/downloadURL"] = downloadURL;
  } else {
      data["joiner/gcsPath"] = gcsPath;
      data["joiner/downloadURL"] = downloadURL;
  }

  gameRef.update(data);*/


  var data = {STATE: STATE.ICON_DETECTED};
  if(userId === game.joiner.uid){
    data["joiner/choice"]=userChoice;
  }else{
    data["creator/choice"]=userChoice;
  }

  database.ref("/rps/game/" + gameKey).update(data);
   
  watchGame(gameKey);

}


// Event handlers
$(document).ready(function(){
   
  //Set Current User Name  
  //setCurrentUserName();

  //On Click of Start Game
  $("#startGameBtn").on("click",function(){
    console.log("call createGame");
    createGame();
  });

  //When user makes his choice

  $(document).on("click",".my-img",function(){
    var userChoice = $(this).attr("id");
    console.log(`user clicked ${userChoice} and gameid : `);
    console.log($("#gamePlayedId").val());

    addUserChoice(userChoice,$("#gamePlayedId").val());

  });
    
  // When chat send button is clicked
  $("#msgSend").on("click",function(){
      sendChatMessage(userName);
  });

  $("#logout").on("click",function(){
    
    firebase.auth().signOut();
    console.log("User logged out");   
  });

  $(document).on("click",".joinGameBtn",function(){
    console.log("Joining Game");
    let gameId = $(this).attr("id");
    console.log("Joining Game" + gameId);
    joinGame(gameId);
  });

});

/****************** */
//Listeners
//For new chat message
chatRef.on("child_added",function(snapshot){
  var message = snapshot.val();
  console.log("Message on child_added " + message);
  addChatMessage(message.name, message.message);
},function(errorObject){
  console.log("Error Occured "  + errorObject.code);
});

//Listener for joiners
/*gameRef.on("child_added",function(snapshot){
  let gRef = snapshot.val();
  //ignore our own games
  if(gRef.creator.uid != firebase.auth().currentUser.uid){
    joinGame(snapshot.key); // to be called if it is second
  };
  
});*/


//Listener for Open Games
openGames.on("child_added",function(snapshot){
  console.log("Child added called");
  let gameId=snapshot.key;
  let gRef = snapshot.val();
  let createrName = gRef.creator.displayName;

  //ignore our own games
  if(gRef.creator.uid != firebase.auth().currentUser.uid){
    
    //addJoinbutton
    $("#joinGameSp").append(`<button class="joinGameBtn" id='${gameId}'>Join ${createrName}</button>`);
    
    //setJoinGameButton(createrName,gameId);
  }
});

//Remove games that are joined 
openGames.on("child_removed",function(snapshot){
  console.log("Child removed called");
  var item = document.querySelector("#"+snapshot.key);
  if(item){
    item.remove();
  }
});

//Games been playing currently
currentGames.on("child_added",function(snapshot){
  console.log("Child added on current games called");
  
  console.log("Call watchGame" + snapshot.key);
  watchGame(snapshot.key);

});

function setGameId(gameKey){
  $("#gamePlayedId").val(gameKey);
}

//Function display user Choice
function displayDetectedIcon(game){
  console.log("displayDetectedIcon(game)");

  $("#player1").text(game.creator.displayName);
  $("#player2").text(game.joiner.displayName);
  $("#gameCardDeck").show();  

  
  for(var key in game){
    console.log("KEY  : " + key + " val : " + game[key]);
  }

  //check if user is joiner or creator
  if(game.creator.uid == firebase.auth().currentUser.uid){
    //if creator, display all choices, load joiner choice
    $("#player1Choices").empty();
    loadChoices("player1Choices");

    if(game.joiner.choice){
      let $img = createImage(game.joiner.choice);
  
      $("#player2Choice").empty();
      $("#player2Choice").append($img);
    }

  }else if(game.joiner.uid == firebase.auth().currentUser.uid){
    //if joiner, load all images for joiner, load creator choice
    $("#player2Choices").empty();
     loadChoices("player2Choices");
     if(game.creator.choice){
      let $img = createImage(game.creator.choice);
  
      $("#player1Choice").empty();
      $("#player1Choice").append($img);
    }
  }
}

//Determine Winner

function determineWinner(gRef,game){
  let creatorChoice = game.creator.choice;
  let joinerChoice = game.joiner.choice;

  if ((creatorChoice === "rock" && joinerChoice === "scissors") ||
    (creatorChoice === "scissors" && joinerChoice === "paper") || 
    (creatorChoice === "paper" && joinerChoice === "rock")) {
    creatorWins++;
    $("#pOneScore").text(creatorWins);
    $("#result").text("Player 1 Wins");
  } else if (creatorChoice === joinerChoice) {
    ties++;
    $("#result").text("It was a Draw");
  } else {
    joinerWins++;
    $("#pTwoScore").text(joinerWins);
    $("#result").text("Player 2 Wins");
  }
  
}

//Games been playing currently
currentGames.on("child_changed",function(snapshot){
  console.log("Game changed jflhdjlhjl");
});