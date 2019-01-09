// Intialise Variables
var userName="USER";
var STATE = {OPEN:1,JOINED:2};

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

// References to DB firebase
var database = firebase.database();
var chatRef = database.ref("/chat");
var rpsRef = database.ref("/rps");
var connectionsRef = database.ref("/connections");

/*

{
  "creator":{"displayName":"player 1","uid":"999"},
  "joiner":{"displayName":"player 1","uid":"999"},
   "state":2 // joined
}
*/

//Function to start game
function createGame(){
  //var user=firebase.auth().currentUser;
  var currentGame = {
    "creator":{"name":userName},
    "state":STATE.OPEN
  }
  rpsRef.push().set(currentGame);
}

function joinGame(key){
  //var user=firebase.auth().currentUser;
  var gameRef = rpsRef.child(key);
  gameRef.transaction(function(game){
    if(!game.joiner){
      game.state=STATE.JOINED;
      game.joiner={"name":userName}
      //game.joiner={"uid":user.uid, "displayName":user.displayName}
    }
    return game;
  })
}


function watchGame(key){
  var gameRef = rpsRef.child(key);
  gameRef.on("value",function(snapshot){
    var game=snapshot.val();
    switch(game.STATE){
      case STATE.JOINED:joinedGame(gameRef,game);break;
      case STATE.ICON_DETECTED:displayDetectedIcon(game);
                                determineWinner(gameRef,game);break;
      case STATE.COMPLETE:showWinner(game);break;
    }
  });
}

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
  $("#chatBox").append(`${userName}:${message}`);
}

//Listener for new message
chatRef.on("child_added",function(snapshot){
  var message = snapshot.val();
  console.log("Message on child_added " + message);
  addChatMessage(message.name, message.message);
},function(errorObject){
  console.log("Error Occured "  + errorObject.code);
});

//Listener for joiners
rpsRef.on("child_added",function(snapshot){
  console.log("inside joiners : " + snapshot.val());
  //joinGame();//key has to be passed
});

// Event handlers
$(document).ready(function(){
  
  //User Sign in
  $("#signIn").on("click",function(){
    event.preventDefault();
    userName = $("#userName").val().trim();
    $("#player1").text(" :" + userName);
    createGame();
  });

  //When user makes his choice
  $(".my-img").on("click",function(){
    var userChoice = $(this).attr("id");
    console.log(`user clicked ${userChoice}`);

    database.ref("/rps").set({
      "choice": userChoice
    });

  });

  // When chat send button is clicked
  $("#msgSend").on("click",function(){
    
    sendChatMessage(userName);
  });

});