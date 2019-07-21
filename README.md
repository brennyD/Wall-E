# Wall-E, the friendly GroupMe bot

Some commands may be slow due to GroupMe API limitations and chat size

* * *

### Public Commands:

*   **!mostliked d/w/m/a** - most liked message in the chat within the last day, week, month, or all time
*   **!fuelmyego** - most liked message in the chat **from the current user** of all time
*   **!tbt** - a random image from the chat history  

*   **!myKarma** - total likes received on your messages in the chat
*   **!messagecount** - how many messages have been sent in the chat

*   **!nextevent** - next event from the google calendar
*   **!getevents {days}** - google calendar events for the next {days} days  

*   **!playlist** - Link spotify playlist
*   **!discord** - Link to discord server
*   **!linkedin** - Link to LinkedIn

*   **!goodbot / !badbot** - increases or decreases the bot's karma
*   **!karma** - shows bots overall rating
*   **!coinflip** - randomly returns heads or tails
*   **!random #** - returns a random number between 0 and the supplied number
*   **!rename #** - Renames a mentioned user of the sender's choice

### Admin Commands:

*   **!kick @user** - kicks tagged user by nickname
*   **!timeout** - kicks someone then re-adds them automatically in 30 mins
*   **!add** - adds all temp kicked users

### Helper Functions

*   sendText(string text) - sends a message to the current chat
*   sendImage(string text, string imageUrl) - sends a captioned image message to the current chat
*   getRndInteger(int min, int max) - returns a random int within the range
*   findMemberIdNick(int groupId, String nickName) - Returns MEMBER id given a nick name and group id (member id is different from user id)
*   findMemberIdReal(int groupId, String nickName) - Returns MEMBER id given a the original name of the user and group id (member id is different from user id)
*   JSONifyText(String str) - converts special character notation in javascript to JSON formatting
*   botDefense(String str) - detects if a user added a bot to the chat, removes user.

**Developed with love by Brendan DeMilt and Andrew Chalfant.**  
Written with GoogleScripts
