function sendText(text){
  if (typeof text == 'number' || typeof text == 'boolean')
    text+= "";
  if (typeof text === 'string') {
    UrlFetchApp.fetch("https://api.groupme.com/v3/bots/post", {"method":"post", "payload":'{"bot_id":"' + botId + '","text":"' + JSONifyText(text) + '"}'})
  }
}

function sendImage(text, imageURL){
  UrlFetchApp.fetch("https://api.groupme.com/v3/bots/post", {"method":"post", "payload":'{"bot_id":"' + botId + '","text":"' + JSONifyText(text) + '","attachments":[{"type":"image","url":"' + imageURL + '"}]}'})
}

function intMessageCount(postInfo) {
    var gId = postInfo.group_id;
    var fetch = UrlFetchApp.fetch("https://api.groupme.com/v3/groups/"+gId+"?token="+token);
    var list = JSON.parse(fetch);
    return list.response.messages.count;
}

function messageCount(postInfo) {
    sendText("There have been " + intMessageCount(postInfo) + " messages in this chat.");
}

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}

function coinFlip(){
  var x= getRndInteger(0, 10)
  if (x > 5) {
    sendText("Heads");
  } else {
    sendText("Tails");
  }
}

function rando(max) {
  sendText(getRndInteger(1,max).toString());
}


function vote(direction){
  var dataMap = new DataMap();
  var p1 = parseInt(dataMap.get('karma'));
  if (direction){
    p1 ++;
  }else{
    p1 --;
  }
  dataMap.set('karma', p1.toString());
}

function getKarma(name, dataMap){
  var p = dataMap.get('karma');
  sendText(p.toString() + " points");
}



//Given user nickname and group, will return associated user_id, -1 if not found
function findMemberIdNick(groupId, nickName) {
  var fetch = UrlFetchApp.fetch("https://api.groupme.com/v3/groups/"+groupId+"?token="+token);
  var list = JSON.parse(fetch);
  var memes = list.response.members;

  for(var i = 0; i< memes.length; i++) {
    if(memes[i].nickname == nickName) {
      return parseInt(memes[i].id);
    }
  }

  sendText("User not found")
  return -1;
}


//Given the actual user name and group, will return associated user_id, -1 if not found
function findMemberIdReal(groupId, Name) {
  var fetch = UrlFetchApp.fetch("https://api.groupme.com/v3/groups/"+groupId+"?token="+token);
  var list = JSON.parse(fetch);
  var memes = list.response.members;

  for(var i = 0; i< memes.length; i++) {
    if(memes[i].name == Name) {
      return parseInt(memes[i].id);
    }
  }

  sendText("User not found")
  return -1;
}


//Name must be the nickname of the person, not the real name. EX: !kick @Foo
function kickUser(user, postInfo) {
  var dataMap = new DataMap('https://docs.google.com/spreadsheets/d/1B5u4W2oOQmtT4g-E1NMy6xJ-TrpiSKkouaIC2O5ug0E/edit');
  var gId = postInfo.group_id;
  var member_id = findMemberIdNick(gId, user);
  dataMap.set('temp_ban', member_id);

  UrlFetchApp.fetch("https://api.groupme.com/v3/groups/" + gId + "/members/" + member_id + "/remove?token="+token, {"method": "post"});


}



function mostLiked(postInfo, msg) {

  var gId = postInfo.group_id;
  var p2 = msg.substring(11,12);


  if(p2 == "d") {
    p2 = "day"
  } else if (p2 == "w") {
    p2 = "week"
  } else if (p2 == "m") {
    p2 = "month"
  } else if (p2 == "a") {
    mostAllTime(postInfo);
    return;
  } else {
    sendText("format should be !mostliked (d | w | m | a) for day, week, month, or all time");
    return;
  }

  var result = UrlFetchApp.fetch("https://api.groupme.com/v3/groups/" + gId + "/likes?period=" + p2 + "&token="+token);

  var message = JSON.parse(result).response.messages[0];


  var date = new Date(message.created_at * 1000);
  var hour = date.getHours();

  var ma = "pm";

  if(hour < 12) {
    ma = "am";
  } else {
    hour = hour%12;
  }
  if(hour == 0){
    hour = 12;
  }

  sendText("The most liked message in the last " + p2 + " was by " + message.name + " on "+ date.toDateString() + " at " + hour + ":" + date.getMinutes() + ma + " with " + message.favorited_by.length + " likes.");
  sendText("The Message was:");

  for(var i = 0; i < message.attachments.length; i++) {

    if(message.attachments[i].type == "image") {
      sendImage("", message.attachments[i].url);
    }
  }

  sendText("\\\""+JSONifyText(message.text)+"\\\"");

}

function allTimeHits(postInfo) {
  var gId = postInfo.group_id;
  var userId = postInfo.user_id;
  var result = UrlFetchApp.fetch("https://api.groupme.com/v3/groups/" + gId + "/messages?limit=100&token="+token);
  var message = JSON.parse(result).response.messages;
  var maxMessage = null;

  do {
    result = UrlFetchApp.fetch("https://api.groupme.com/v3/groups/" + gId + "/messages?limit=100&before_id=" + message[message.length-1].id + "&token="+token);
    message = JSON.parse(result).response.messages;

    for(var i = 0; i < message.length; i++) {
      if (message[i].user_id == userId && (maxMessage == null || message[i].favorited_by.length > maxMessage.favorited_by.length)) {
        maxMessage = message[i];
      }
    }

      if(result.getResponseCode() == 420) {
        sendText("I was moving too fast and finished without a result.");
        return;
      }

  } while (message.length == 100)
  var date = new Date(maxMessage.created_at * 1000 );

  var hour = date.getHours();
  var ma = "pm";

  if(hour < 12) {
    ma = "am";
  } else {
    hour = hour%12;
  }
  if(hour == 0){
    hour = 12;
  }

  sendText(maxMessage.name + " made their most liked post on "+ date.toDateString() + " at " + hour + ":" + date.getMinutes() + ma + " with " + maxMessage.favorited_by.length + " likes.");
  for(var i = 0; i < maxMessage.attachments.length; i++) {
    if(maxMessage.attachments[i].type == "image") {
      sendImage("", maxMessage.attachments[i].url);
    }
  }

  sendText("\\\""+JSONifyText(maxMessage.text)+"\\\"");
}




function mostAllTime(postInfo) {
  var gId = postInfo.group_id;
  var result = UrlFetchApp.fetch("https://api.groupme.com/v3/groups/" + gId + "/messages?limit=100&token="+token);
  var message = JSON.parse(result).response.messages;
  var maxMessage = message[0];
  var lowestId = message[0].id;

  do {
    result = UrlFetchApp.fetch("https://api.groupme.com/v3/groups/" + gId + "/messages?limit=100&before_id=" + lowestId + "&token="+token);
    message = JSON.parse(result).response.messages;

    for(var i = 0; i < message.length; i++) {
      if (message[i].favorited_by.length > maxMessage.favorited_by.length) {
        maxMessage = message[i];
      }
      if(message[i].id < lowestId) {
        lowestId = message[i].id;
      }
    }

      if(result.getResponseCode() == 420) {
        sendText("I was moving too fast and finished without a result.");
        return;
      }

  } while (message.length == 100)
  var date = new Date(maxMessage.created_at * 1000 );

  var hour = date.getHours();
  var ma = "pm";

  if(hour < 12) {
    ma = "am";
  } else {
    hour = hour%12;
  }
  if(hour == 0){
    hour = 12;
  }


  sendText("The most liked message of all time was by " + maxMessage.name + " on "+ date.toDateString() + " at " + hour + ":" + date.getMinutes() + ma + " with " + maxMessage.favorited_by.length + " likes.\\\ The message was: ");

  for(var i = 0; i < maxMessage.attachments.length; i++) {
    if(maxMessage.attachments[i].type == "image") {
      sendImage("", maxMessage.attachments[i].url);
    }
  }

  sendText("\\\""+JSONifyText(maxMessage.text)+"\\\"");
}


function randomMessage(postInfo) {
  var gId = postInfo.group_id;
  var userId = postInfo.user_id;
  var result = UrlFetchApp.fetch("https://api.groupme.com/v3/groups/" + gId + "/messages?limit=100&token="+token);
  var message = JSON.parse(result).response.messages;
  var imageCount = intMessageCount(postInfo) / 25;
  var randMessage = null;
  var lowestId = message[0].id;
  var x= getRndInteger(2000, imageCount);
  var y= 0;

  do {
    result = UrlFetchApp.fetch("https://api.groupme.com/v3/groups/" + gId + "/messages?limit=100&before_id=" + lowestId + "&token="+token);
    message = JSON.parse(result).response.messages;
    for(var i = 0; i < message.length; i++) {
      var isImage =  message[i].attachments.length > 0 && message[i].attachments[0].type == "image";
      var hasLike = message[i].favorited_by.length > 0;
      if (isImage && hasLike) {
        y++;
        if (x == y) {
          randMessage = message[i];
        }
      }
      if(message[i].id < lowestId) {
        lowestId = message[i].id;
      }
    }

  } while (message.length == 100 && randMessage == null)

    if (randMessage == null) {
    sendText("Didn't find anything cool.");
    return;
  }

  var date = new Date(randMessage.created_at * 1000 );
  sendImage(randMessage.name + " posted on " + date.toDateString(), randMessage.attachments[0].url);
}


function JSONifyText(str) {
  return str.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t");
}


function allTime(postInfo) {
  var gId = postInfo.group_id;
  var userId = postInfo.user_id;
  var result = UrlFetchApp.fetch("https://api.groupme.com/v3/groups/" + gId + "/messages?limit=100&token="+token);
  var message = JSON.parse(result).response.messages;
  var maxMessage = null;
  var lowestId = message[0].id;
  var x= 0;

  do {
    result = UrlFetchApp.fetch("https://api.groupme.com/v3/groups/" + gId + "/messages?limit=100&before_id=" + lowestId + "&token="+token);
    message = JSON.parse(result).response.messages;
    x += message.length;
    lowestId = message[message.length - 1].id;

  } while (message.length == 100)

  sendText(x + " messages in this chat to date.");
}


function myKarma(postInfo) {
  var dataMap = new DataMap();
  var gId = postInfo.group_id;
  var userId = postInfo.user_id;

  var result = UrlFetchApp.fetch("https://api.groupme.com/v3/groups/" + gId + "/messages?limit=100&token="+token);
  var message = JSON.parse(result).response.messages;
  var maxMessage = null;
  var lowestId = message[0].id;
  var name= postInfo.name;

  var x = 0;
  do {
    result = UrlFetchApp.fetch("https://api.groupme.com/v3/groups/" + gId + "/messages?limit=100&before_id=" + lowestId + "&token="+token);
    message = JSON.parse(result).response.messages;

    for(var i = 0; i < message.length; i++) {
      if (message[i].user_id == userId && message[i].favorited_by.length > 0) {
        x += message[i].favorited_by.length;
        maxMessage = message[i];
      }
      if(message[i].id < lowestId) {
        lowestId = message[i].id;
      }
    }

  } while (message.length == 100)


  sendText("While you've been in this chat, you've gotten " + x + " likes.");
  var leaders = dataMap.get('karmads').split(",");
  var l= [];

  Number.prototype.pad = function(size) {
    var s = String(this);
    while (s.length < (size || 2)) {s = "0" + s;}
    return s;
  }

  var kcount= (x).pad(4);
  var name= postInfo.name;
  //sendText(kcount + " and " + name);

  for (var i=0; i < leaders.length; i++) {
      //sendText(leaders[i]);
      var lname= leaders[i].split("-")[1];
      if (lname != name) {
        var padded= leaders[i].split("-")[0];
        l.push(padded + "-" + lname);
       }
  }

  l.push(kcount + "-" + name);
  l = l.sort();
  dataMap.set("karmads",l + "");

  var spot = 0;

  for (var i=0; i < l.length; i++) {
      if (l[i].indexOf(name) > -1) {
          spot= i;
      }
  }
  sendText(name + ", you're #" + (l.length - spot) + " in terms of likes. (Only counting people who've ran this command)");
}



function addUser(postInfo) {
  var dataMap = new DataMap();
  var gId = postInfo.group_id;
  var ids = dataMap.get("kickIds").split(",");
  var nicks = dataMap.get("kickNicks").split(",");
  var list = [];

  if(ids.length == 1) {
    return;
  }

  if(ids.length != nicks.length) {
    sendText("something ain't right");
    return;
  }

  for(var i = 0; i<ids.length-1; i++){
    list.push({
      "nickname": nicks[i],
      "user_id": ids[i]
    });
  }

  var mem= {"members": list};
  var help = {
    'method' : 'POST',
    'payload' : JSON.stringify(mem),
    'headers': { 'Content-Type': "application/json", 'Accept': "application/json"},
    'contentType': "application/json",
    'validateHttpsCertificates': false
  };
  UrlFetchApp.fetch("https://api.groupme.com/v3/groups/" + gId + "/members/add?token="+token,help);
  dataMap.set('kickIds', "");
  dataMap.set('kickNicks', "");
}


function tempKick(user, postInfo){
  var dataMap = new DataMap();

  var gId = postInfo.group_id;
  var nickname = user;
  var userId = findUserIdNick(gId, user);

  if(userId == -1) {
    userId = findUserIdReal(gId, user);
  }

  if(userId == -1) {
    return;
  }

  var ids = dataMap.get("kickIds");
  var nicks = dataMap.get("kickNicks");

  dataMap.set("kickIds", ids+userId+",");
  dataMap.set("kickNicks", nicks+nickname+",");

  kickUser(nickname, postInfo);
}


//Given user nickname and group, will return associated user_id, -1 if not found
function findUserIdNick(groupId, nickName) {
  var fetch = UrlFetchApp.fetch("https://api.groupme.com/v3/groups/"+groupId+"?token="+token);
  var list = JSON.parse(fetch);
  var memes = list.response.members;

  for(var i = 0; i< memes.length; i++) {
    if(memes[i].nickname == nickName) {
      return parseInt(memes[i].user_id);
    }
  }

  return -1;
}

//Given user name and group, will return associated user_id, -1 if not found
function findUserIdReal(groupId, nickName) {
  var fetch = UrlFetchApp.fetch("https://api.groupme.com/v3/groups/"+groupId+"?token="+token);
  var list = JSON.parse(fetch);
  var memes = list.response.members;

  for(var i = 0; i< memes.length; i++) {
    if(memes[i].name == nickName) {
      return parseInt(memes[i].user_id);
    }
  }

  sendText("User not found")
  return -1;
}


function rename(user, postInfo){
  var dataMap = new DataMap();
  var gId = postInfo.group_id;
  var nickname = user;
  var newName = "";

  var fetch = UrlFetchApp.fetch("https://api.groupme.com/v3/groups/"+gId+"?token="+token);
  var list = JSON.parse(fetch);
  var mems = list.response.members;
  var userId= - 1;

  for(var i = 0; i< mems.length; i++) {
    if(postInfo.text.indexOf(mems[i].nickname) > -1) {
      user= mems[i].nickname;
      newName= postInfo.text.split(user)[1].trim();
      userId= mems[i].user_id;
    }
  }

  if(userId == -1) {
    sendText("Couldn't find user");
    return;
  }

  kickUser(user, postInfo);

  var list = [];
  list.push({
      "nickname": newName,
      "user_id": userId,
    });

  var mem= {"members": list};
  var help = {
    'method' : 'POST',
    'payload' : JSON.stringify(mem),
    'headers': { 'Content-Type': "application/json", 'Accept': "application/json"},
    'contentType': "application/json",
    'validateHttpsCertificates': false
  };
  UrlFetchApp.fetch("https://api.groupme.com/v3/groups/" + gId + "/members/add?token="+token,help);
}


function facts() {
  var f=  ["Farts have been clocked at a speed of 10 feet per second.",
  "Donkeys kill more people annually than plane crashes.",
  "You are born with 300 bones, by the time you are an adult you will have 206.",
  "A cockroach will live for weeks without its head before it starves to death",
  "No word in the English language rhymes with month, orange, silver or purple.",
  "In Tokyo, a bicycle is faster than a car for most trips of less than 50 minutes!",
  "An ostrich’s eye is bigger than its brain",
  "Every year, kids in North America spend close to half a billion dollars on chewing gum!",
  "Every day more money is printed for monopoly than the US Treasury.",
  "Cost of raising a medium-sized dog to the age of 11: $5500",
  "The phrase rule of thumb is derived from an old English law which stated that you couldn't beat your wife with anything wider than your thumb.",
  "Coca Cola was originally green.",
  "Elephants are the only mammals that can't jump.",
  "A rat can last longer without water than a camel.",
  "Its possible to lead a cow upstairs...but not downstairs.",
  "What's orange and sounds like a parrot? A carrot.",
  "Did you hear about the italian chef that died? He pasta way.",
  "Why couldn't the bicycle stand up? Because it was two tired!",
  "Where do you find a cow with no legs? Right where you left it.",
  "When a deaf person sees someone yawn do they think it’s a scream?",
  "As I suspected, someone has been adding soil to my garden. The plot thickens.",
  "And the lord said unto John, 'Come forth and you will receive eternal life'. John came fifth and won a toaster.",
  "These facts/jokes stink but you can add your own!"];
   var x = getRndInteger(1, f.length);
   sendText(f[x]);
 }



//gets events from now until now+dayRange
function getEvents(dayRange) {
  var cal = CalendarApp.getCalendarById(calendarEmail);
  var now = new Date();
  var endDate = new Date(now.getTime() + (1000*60*60*24*dayRange))

  var output = "";
  var truncate = "";
  var hour;
  var minutes;
  var ap = "am";
  var events = cal.getEvents(now,endDate);


  if(events.length == 0) {
    sendText("There aren't any events coming up..");
    return;
  }


  sendText(events.length + " events are coming up in the next "+dayRange+" days.");

  for(var i = 0; i<events.length; i++) {

    minutes = events[i].getStartTime().getMinutes();
    hour = events[i].getStartTime().getHours();


    if(hour < 12 ) {
      ap = "pm";
    }


    if(hour != 12) {
      hour = hour % 12;
    }


    if(minutes < 10){
      minutes = "0"+minutes;
    }

    truncate = events[i].getTitle() + " is occuring on " + events[i].getStartTime().toLocaleDateString().split(",")[0] + (events[i].getStartTime().getHours() == 0 ? "" : (" at "+hour+":" + minutes))+"\n";

    ///Groupme has a 1000 char limit on messages, this ensures
    //that nothing gets cut off in a message and a new message gets sent
    if(output.length + truncate.length < 1000) {
      output = output.concat(truncate);
    } else {
      sendText(output);
      output = truncate;
    }
  }

  sendText(output);
}


//Retrieves the next calender even from the cal
function nextCalenderEvent() {
  var cal = CalendarApp.getCalendarById(calendarEmail);
  var now = new Date();
  //Default range is 1 year
  var endDate = new Date(now.getTime() + (1000*60*60*24*365))
  var output = "";
  var truncate = "";
  var ap = "am";
  var cal = spdCal.getEvents(now,endDate);


  if(events.length == 0) {
    sendText("There aren't any events coming up in the next year...");
    return;
  }


    var minutes = events[0].getStartTime().getMinutes();
    var hour = events[0].getStartTime().getHours();


    if(hour < 12 ) {
      ap = "pm";
    }


    if(hour != 12) {
      hour = hour % 12;
    }


    if(minutes < 10){
      minutes = "0"+minutes;
    }

  truncate = events[0].getTitle() + " on " + events[0].getStartTime().toLocaleDateString().split(",")[0] + (events[0].getStartTime().getHours() == 0 ? "" : (" at "+hour+":" + minutes));
  sendText("The next event is "+truncate);

}
