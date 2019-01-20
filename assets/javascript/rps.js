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



// Intialise Variables
var userName="Guest";
var STATE = {OPEN:1,JOINED:2};

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
var openGames = database.ref("/rps/game").orderByChild("state").equalTo(STATE.OPEN);

//var connectionsRef = database.ref("/connections");

// Get from firebase documentation

function createGame(){
  var user=firebase.auth().currentUser;
  console.log("Create game:" + user.displayName);

  var currentGame = {
    "creator":{"uid":user.uid,"displayName":user.displayName},
    "state":STATE.OPEN
  }
  gameRef.push().set(currentGame);
}

function joinGame(key){
  var user=firebase.auth().currentUser;
  var gRef = gameRef.child(key);
  gRef.transaction(function(game){
    if(!game.joiner){
      game.state=STATE.JOINED;
      //game.joiner={"name":userName}
      //game.joiner={"uid":user.uid, "displayName":user.displayName}
    }
    return game;
  })
}

function watchGame(key){
  var gRef = gameRef.child(key);
  gRef.on("value",function(snapshot){
    var game=snapshot.val();
    switch(game.STATE){
      case STATE.JOINED:joinedGame(gRef,game);break;
      case STATE.ICON_DETECTED:displayDetectedIcon(game);
                                determineWinner(gRef,game);break;
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
  $("#chatBox").append(`<p>${userName}:${message}</p>`);
}

function setJoinGameButton(userName,uid){
    $("#joinGameSp").append(`<button id='${uid}'>Join ${userName}</button>`);
}

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

// Event handlers
$(document).ready(function(){
   
  //Set Current User Name  
  //setCurrentUserName();

  //On Click of Start Game
  $("#startGameBtn").on("click",function(){
    createGame();
  });

  //When user makes his choice

  $(".my-img").on("click",function(){
    var userChoice = $(this).attr("id");
    console.log(`user clicked ${userChoice}`);

    watchGame();

  });
    
  // When chat send button is clicked
  $("#msgSend").on("click",function(){
      sendChatMessage(userName);
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
gameRef.on("child_added",function(snapshot){
  

  //Set Join Mode for Open Games
  if(!gRef.joiner){
    
  }
  //setCurrentUserName();
  joinGame(snapshot.key); // to be called if it is second
});


//Listener for Open Games
openGames.on("child_added",function(snapshot){
  
  let gameId=snapshot.key;
  let gRef = snapshot.val();
  let createrName = gRef.creator.displayName;

  //ignore our own games
  if(gRef.creator.uid != firebase.auth().currentUser.uid){
    //addJoinbutton
    setJoinGameButton(createrName,gameId);
  }
});

//Remove games that are joined 
openGames.on("child_removed",function(snapshot){
  var item = document.querySelector("#"+snapshot.key);
  if(item){
    item.remove();
  }
});


