var botId = "Your bot Id here";
var calendarEmail = 'Your calendar email here';
var token = "Your bot token here";
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function initialize(post) {
	var dataMap = new DataMap();
    if(dataMap.get('groupId') == undefined)
        dataMap.set('groupId', post.group_id);
	if (dataMap.get('karma') == undefined)
		dataMap.set('karma', "0");
	if (dataMap.get('commands') == undefined)
		dataMap.set('commands', "0");
	if (dataMap.get('karmads') == undefined)
		dataMap.set('karmads', "");
    if (dataMap.get('kickIds') == undefined || dataMap.get('kickNicks') == undefined){
        dataMap.set('kickIds', "");
        dataMap.set('kickNicks', "");
    }



}

///////////////////////////////////////////////////////
//respond to messages sent to the group. Recieved as POST
function doPost(e) {
	var admins = ["Admin usernames here"]; //array of admin nicknames
	var dataMap = new DataMap();
	var post = JSON.parse(e.postData.getDataAsString());

	var otext = post.text;
	var text = post.text.toLowerCase();
	var name = post.name;
	var SPAMLIMIT = 8;
	var admin = false

	for (var i = 0; i < admins.length; i++) {
		if (name == admins[i]) {
			admin = true;
		}
	}

	initialize(post);

	//prevent adding bots
	if (post.system && post.text.indexOf("added the") > -1) {
		var deleto = post.text.substring(0, post.text.indexOf("added the") - 1);
		sendText("You can not add bots to this chat " + deleto);
		kickUser(deleto, post);
	}

	var p1 = 0;
	if (text.substring(0, 1) == "!") {
		p1 = parseInt(dataMap.get('commands')) + 1;
		dataMap.set('commands', p1.toString());
	}

	if (p1 == SPAMLIMIT) {
		sendText("Spam limit reached. Stop bothering me!");
	}

	if (p1 < SPAMLIMIT || admin) {
		if (text == "!hi") {
			sendText("Hello, " + name);

		//STATISTICS
  } else if (text == "!goodbot") {
			vote(true);
		} else if (text == "!badbot") {
			vote(false);
		} else if (text == "!karma") {
			getKarma(name, dataMap);
		} else if (text == "!messagecount") {
			messageCount(post);
		} else if (text == "!coinflip") {
			coinFlip();
		} else if (text.substring(0, 7) == "!random") {
			var y = text.substring(8);
			rando(parseInt(y));
		} else if (text.substring(0, 10) == "!mostliked") {
			mostLiked(post, text);
		} else if (text.substring(0, 10) == "!fuelmyego") {
			allTimeHits(post, text);
		} else if (text == "!myKarma") {
			myKarma(post);
      } else if (text == "!content") {
        facts();

        //GROUP SPECIFIC
		} else if (text == "!playlist") {
			sendText("Link to music playlist");
		} else if (text == "!discord") {
			sendText("Link to discord");
		} else if (text == '!nextevent') {
			nextCalenderEvent();
		} else if (text.toLowerCase().substring(0,10) == '!getevents') {
         var endDate = parseInt(text.substring(11, text.length));

         if(isNaN(endDate)) {
           sendText("type !getevents followed by the amount of days after today you want to search through ex: !getevents 14");
           return;
         }
         getEvents(endDate);
		} else if (text == '!help') {
			sendImage("", "Help image url");
        } else if (text == '!tbt') {
            randomMessage(post);
        } else if (text.substring(0,9) == "!rename @") {
               var sp= otext.split(" ");
               for (var i = 0; i < admins.length; i++) { //can't kick admins
                    if (sp[1].substring(1) == admins[i]) {
                        sendText("I'm legally unable to do that");
                        tempKick(name, post);
                        return;
                    }
               }
               rename(sp[1], post);
		//MODERATION / ADMIN ONLY
		} else if (admin) {
			if (text.substring(0, 7) == "!kick @") {
				var kicked = otext.substring(7, text.length - 1);
				for (var i = 0; i < admins.length; i++) { //can't kick admins
					if (kicked == admins[i]) {
						var gId = post.group_id;
						sendText("Guess again");
						UrlFetchApp.fetch("https://api.groupme.com/v3/groups/" + gId + "/members/" + findMemberIdReal(gId, name) + "/remove?token=" + token, {
							"method": "post"
						});
						return;
					}
				}
				sendText("Kicking " + kicked);
				kickUser(kicked, post);

			} else if (text == "!add") {
                addUser(post);
			} else if (text.substring(0,10) == "!timeout @") {
               tempKick(otext.substring(10,text.length-1), post);
            }
		}
	}
}
