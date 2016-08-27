function writeChat(text){
	var line = document.createElement('li');
	line[(typeof document.body.style.WebkitAppearance=="string")?"innerText":"innerHTML"] = text;
	document.getElementById("ChatLog").appendChild(line);
}

function updateStatus(text){
	currentStatus[(typeof document.body.style.WebkitAppearance=="string")?"innerText":"innerHTML"] = text;
}

function setWord(w, i){
	channel.socket.emit("setWord", {word: w.substring(0,i),validate: (w.length == i)});
	if (i<w.length && injector.canWrite) {
		setTimeout(function(){setWord(w,++i);},rand(75,175));
	}
}

function rand(min, max){
	return Math.trunc(Math.random()*(max-min)+min);
}

channel.socket.on("setActivePlayerIndex", function (a) {
	if(channel.data.actors[channel.data.activePlayerIndex].authId === app.user.authId){
		injector.canWrite = true
		if (injector.autoInject) {
			setTimeout(injector.inject,rand(400,1100));
		}
	} else {
		injector.canWrite = false;
	}
});
channel.socket.on("failWord", function (a) {
	if(channel.data.actors[channel.data.activePlayerIndex].authId === app.user.authId && injector.autoInject){
		setTimeout(injector.inject,rand(400,1100));
	}
});

var injector = {
	lastWord: 0,
	autoInject: false,
	canWrite: false,

	toggleAutoInject: function(){
		if(injector.autoInject){
			injector.autoInject = false;
			autoInjectIndicator[(typeof document.body.style.WebkitAppearance=="string")?"innerText":"innerHTML"] = 'Auto Inject Off';
		} else {
			injector.autoInject = true;
			autoInjectIndicator[(typeof document.body.style.WebkitAppearance=="string")?"innerText":"innerHTML"] = 'Auto Inject On';
		}
	},

	inject: function() {
		if(window.app.user.authId == channel.data.actors[channel.data.activePlayerIndex].authId){
			updateStatus("Injecting normally");
			var q = new RegExp(channel.data.wordRoot,"i");
			var i = injector.lastWord;
			while(i != ++injector.lastWord && injector.canWrite){
				if(injector.lastWord==words.length){
					injector.lastWord = 0;
				}
				if(words[injector.lastWord].match(q)){
					for(var j = 0;j<channel.data.actorsByAuthId[window.app.user.authId].lockedLetters.length;j++){
						if(words[injector.lastWord].match(new RegExp(channel.data.actorsByAuthId[window.app.user.authId].lockedLetters[j],"i"))) {
							setWord(words[injector.lastWord],1);
							return;
						}
					}
				}
			}
			injector.lastWord = 0;
			updateStatus("Normal Inject Failed");
		}
	}
};

function createInLine(parent,newThingType){
	var line = document.createElement('li');
	var thing = document.createElement(newThingType);
	parent.appendChild(line);
	line.appendChild(thing);
	return thing;
}

parentThing = document.getElementById("SettingsTab");
parentThing.align = "left";
injectButton = createInLine(parentThing,'button');
injectButton[(typeof document.body.style.WebkitAppearance=="string")?"innerText":"innerHTML"] = 'Inject';
injectButton.addEventListener('click',injector.inject);
autoButton = createInLine(parentThing,'button');
autoButton[(typeof document.body.style.WebkitAppearance=="string")?"innerText":"innerHTML"] = 'Auto ';
autoButton.addEventListener('click',injector.toggleAutoInject);
var autoInjectIndicator = document.createElement('li');
parentThing.appendChild(autoInjectIndicator);
var currentStatus = document.createElement('li');
parentThing.appendChild(currentStatus);
var wordScript = document.createElement("script");
wordScript.src = "http://dabsunter.github.io/sparklin-exploder/dictionary.js";
document.head.appendChild(wordScript);﻿