/*
These functions should be triggered by the scheduler built in to
the google app scripts platform already. Some functions here are
titled based on when they should be triggered but it is entirely
up you!
*/


function fiveMinDelay() {
   var dataMap = new DataMap();
   dataMap.set('commands', '0');
}

function twoHourDelay() {
  //sendText("2hrs");
}

function dayDelay() {
}

//This function is different from the normal addUser function
//Since there is no post info to read from, therefore it must
//Get the stored groupId from the sheet
function addUserTimed() {
  var dataMap = new DataMap();
  var gId = dataMap.get('groupId');
  var ids = dataMap.get("kickIds").split(",");
  var nicks = dataMap.get("kickNicks").split(",");
  var list = [];

  if(ids.length == 0) {
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
