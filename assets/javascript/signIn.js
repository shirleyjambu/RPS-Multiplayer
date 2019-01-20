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
//var connectionsRef = database.ref("/connections");


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
    
    $("#loginPage").hide();
    $("#gamePage").show();
    $("#userName").text(user.displayName);

  }else{ //signout
    $("#message").text("PLEASE LOG IN");
    $("#loginPage").show();
    $("#gamePage").hide();
  }
}

// Event handlers

// Authentication state changes
firebase.auth().onAuthStateChanged(authStateChangeListener);