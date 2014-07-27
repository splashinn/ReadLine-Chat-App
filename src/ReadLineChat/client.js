// client.js
// splashinn

/* This code has the nickname variable, the socket connection and our
Readline interface.
Socket.io will connect to locahost:3636 in this example. This would be changed
 to your own server's domain and port for a production chat app.
*/

var readline = require('readline');
socketio = require('socket.io-client');
util = require('util');
color = require('ansi-color').set;

var nick;
var socket = socketio.connect('localhost', {port: 3636});
var rl = readline.createInterface(process.stdin, process.stdout);

// Set username
rl.question("Please enter nickname: ", function(name) {
  nick = name;
  var msg = nick + " has joined the chat";
  socket.emit('send', {type: 'notice', message: msg});
  rl.prompt(true);
});

// Rememdy for RL prompt issue w/ console.log
/* This slightly hacky solution ensures that the
current line in the console is empty, and that
the cursor is in the zero position before printing
the output. Then it explicitly calls for the prompt
to be output again, afterwards.
*/

function console_out(msg) {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  console.log(msg);
  rl.prompt(true);
}

// Handling input
rl.on('line', function(line) {
  if (line[0] == "/" && line.length > 1) {
    var cmd = line.match(/[a-z]+\b/)[0];
    var arg = line.substr(cmd.length + 2, line.length);
    chat_command(cmd, arg);
  } else {
    // send chat message
    socket.emit('send', {type: 'chat', message: line, nick: nick});
    rl.prompt(true);
  }
});

function chat_command(cmd, arg) {
  switch (cmd) {
    case 'nick':
      var notice = nick + " changed their name to " + arg;
      nick = arg;
      socket.emit('send', {type: 'notice', message: notice});
      break;

    case 'msg':
      var to = arg.match(/[a-z]+\b/)[0];
      var message = arg.substr(to.length, arg.length);
      socket.emit('send', {type: 'tell', message: message, to: to, from: nick});
      break;

    default:
      console_out("That is not a valid command.");
  }
}

// Handling incoming messages
socket.on('message', function(data) {
  var leader;
  if (data.type == 'chat' && data.nick != nick) {
    leader = color("<" + data.nick + "> ", "green");
    console_out(leader + data.message);
  }
  else if (data.type == "notice") {
    console_out(color(data.message, 'cyan'));
  }
  else if (data.type == "tell" && data.to == nick) {
    leader = color("[" + data.form + "->" + data.to + "]", "red");
    console_out(leader + data.message);
  }
  else if (data.type == "emote") {
    console_out(color(data.message, "cyan"));
  }
});
