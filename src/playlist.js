/*
 // JPM Playlist Player
 // Copyright (C) 2020-2021 James P. Malloy All Rights Reserved
 // http://www.jpmalloy.com
 // james (@) jpmalloy.com
 // Credit must stay intact for legal use
 // Version 2 (build "1.1")
 // *** 100% free, do with what you like with credit back ***
 // No outside plugins required
 // Feel free to share with others
 // for support, see my blog: https://jimswebtech.blogspot.com/

Supported URLs:

(domain)/watch?v=(video_id)
(domain)/embed/(video_id)
(domain)/(video_id)
(domain)/video/(video_id)

To-do Notes:
in the future all alerts will be replaced with a custom alert box
data input checks will be improved for import option
clean up code, create error handling function etc
create separate function for HTML interface creation etc... a controller
*/

'use strict';
var jpmplayer = {};
(function(p){
	const debug = false;
	window.onload = function() {
		p.docHeight = window.document.body.clientHeight;
		p.docWidth = window.document.body.clientWidth;
		p.ini();
	};
	p.ini = (p.ini !== undefined) ? p.ini : function(){};
	p.serverURL = (p.serverURL !== undefined) ? p.serverURL : 'https://www.{domain}/embed/{vid}{query}';
	p.playerUID = 'X2';
	p.iframeReplace = "https://www.{domain}/embed/{vid}{query}";
	p.iframeURL = '';
	p.playlist = {};
	p.reg = /[^A-Za-z0-9,‘’”“'"*$#^+!()=?&:/_.-\s]/g;
	p.urlreg = /[^A-Za-z0-9'"*$#^+!()=?&:/_.-]/g;
	p.regmatch = (p.regmatch !== undefined) ? p.regmatch :/(http?s:\/\/www\.|http?s:\/\/|www\.)(.+)(\.com|\.be|\.ly)\/(watch\?v\=|video\/|embed\/)(.+)/i;
	p.regmatch2 = /(http?s:\/\/www\.|http?s:\/\/|www\.)(.+)(\.com|\.be|\.ly)\/(.+)/i;
	p.importAll = function(pitems) {
		if(localStorage.getItem("playlists"+p.playerUID)){
			try{
				let list = JSON.parse(localStorage.getItem("playlists"+p.playerUID));
				list = (list === null || list === undefined) ? [] : list;
				let videos = [];
				for(let i = 0;pitems.playlists.length>i;i++){
					var id = pitems.playlists[i].id;
					var title = pitems.playlists[i].title;
					if(!p.in_array2(id,list)){
						// playlist not in existing array, add it
						list.push({"id":id,"title":title,"data":pitems.playlists[i].data});
						if(document.getElementById("exported2")){
							let exported2 = document.getElementById("exported2");
							exported2.value = '';
							exported2.innerHTML = '';
						}
						if(document.getElementById("exported")){
							let exported = document.getElementById("exported");
							exported.value = '';
							exported.innerHTML = '';
						}
						document.getElementById("yourlists").style.display = "block";
					}else {
						alert('Could not add playlist '+title+' ('+id+'), because it already exists.');
					}
				}
				try {
					localStorage.setItem("playlists"+p.playerUID, JSON.stringify(list));
				} catch (e) {
					if (e == QUOTA_EXCEEDED_ERR || e.code === "22" || e.code === "1024") {
						alert('Local storage is full. Please remove old playlist videos to add new ones.');
					}
				}
				p.getPlaylists();
			}catch(err) {
				alert('Sorry, could not import playlist. The data is corrupted. ' + err);
			}
		}
	}
	p.outputHTML = function(control) {
		
		if(control == 'main'){
			var boxname = 'exported2';
			var buttonname = 'importbutton2';
			var local = 'mainimport';
		}else {
			var boxname = 'exported';
			var buttonname = 'importbutton';
			var local = 'sidebarlist';
		}
		if(!document.getElementById(boxname)){
			var input = document.createElement('textarea');
			if(control == 'sidebar'){
				//input.setAttribute('style','display:block;width:auto;height:160px;margin:20px;box-sizing:border-box');
			}else {
				input.setAttribute('style','display:block;width:100%;height:160px;margin-top:20px;box-sizing:border-box');
			}
			input.setAttribute('id',boxname);
			input.setAttribute('placeholder',"Paste list data here to import.");
			document.getElementById(local).appendChild(input);

			var button = document.createElement('button');
			if(control == 'sidebar'){
				button.setAttribute('onclick','javascript:jpmplayer.import(\'sidebar\')');
			}else{
				button.setAttribute('onclick','javascript:jpmplayer.import(\'main\')');
			}
			button.setAttribute('id',buttonname);
			if(control == 'sidebar'){
				button.setAttribute('style','margin-top:20px;width:auto');
			}else {
				button.setAttribute('style','margin-top:20px;width:auto');
			}
			button.innerHTML = 'Import';
			document.getElementById(local).appendChild(button);
		}		
		
		if(control != 'sidebar'){
			let importbutton = document.getElementById(buttonname);
			let importbox = document.getElementById(local);
			let importbuttonval = importbutton.innerHTML.toLowerCase();
			if(importbuttonval == 'import'){
				importbox.style.display = 'block';
				importbutton.innerHTML = 'Close Import';
			}else {
				importbox.style.display = 'none';
				importbutton.innerHTML = 'Import';
			}
		}
	}
	p.import = function(control) {
		if(typeof(Storage) === 'undefined') {
			alert("Warning! You cannot import data, because your browser does not support storage.");
		}
		if(control == 'main'){
			var boxname = 'exported2';
			var buttonname = 'importbutton2';
			var local = 'mainimport';
		}else {
			var boxname = 'exported';
			var buttonname = 'importbutton';
			var local = 'sidebarlist';
		}
		let input = document.getElementById(boxname);
		let liststring = input.value;
		try{
			let pitems = JSON.parse(liststring);
			if(pitems.playlist !== undefined){
				let title = pitems.playlist.title;
				title = (title == '') ? 'Untitled playlist' : title;
				title = title.replace(this.reg, '');
				let list = JSON.parse(localStorage.getItem("playlists"+p.playerUID));
				list = (list === null || list === undefined) ? [] : list;
				let id = pitems.playlist.id;
				if(!p.in_array2(id,list)){
					list.push({"id":id,"title":title,"data":pitems.playlist.data});
					try{
						var videos = JSON.stringify(list);
						localStorage.setItem("playlists"+p.playerUID, videos);
						p.getPlaylists();
						if(control == 'sidebar'){
							p.getList(id);
							let exported = document.getElementById("exported");
							exported.value = '';
							exported.innerHTML = '';
						}else {
							let exported2 = document.getElementById("exported2");
							exported2.value = '';
							exported2.innerHTML = '';
						}
						document.getElementById("yourlists").style.display = "block";
					}
					catch(err) {
						alert('Sorry, could not import playlist. The data is corrupted. ' + err);
					}
				}else {
					alert('This playlist already exists.');
				}
			}else {
				if(pitems.playlists.length != 0)
				{
					this.importAll(pitems);
				}else {
					alert('No playlists found.');
				}
			}
		}
		catch(err){
			alert('Sorry, could not import playlist. The data is corrupted. ' + err + ' line 164');
		}
	}
	p.export = function(listid) {

		if(typeof(Storage) === 'undefined') {
			alert("Warning! You cannot export data, because your browser does not support storage.");
		}
		const is_all = (listid === false) ? true : false;
		let json = {};
		let playlist = localStorage.getItem("playlists"+p.playerUID);
		if(playlist){
			//console.log(playlist);
			try {
				let pitems = JSON.parse(playlist);
				let total = (pitems.length - 1);
				var plist = [];
				let count = 0;
				for(let i = total;0<=i;i--){
					if(is_all){
						plist[count] = {
							"id":pitems[i].id,
							"title":pitems[i].title,
							"data":pitems[i].data
						}
						count++;
					}else {
						if(pitems[i].id == listid){
							plist = {
								"id":pitems[i].id,
								"title":pitems[i].title,
								"data":pitems[i].data
							}
							break;
						}
					}
				}
				if(is_all){
					json = {"playlists":plist};
				}else {
					json = {"playlist":plist};
				}
			}
			catch(err) {
				alert('Sorry, could not export playlist. The data is corrupted. ' + err +' line 208');
			}
		}

		try {
			let pliststring = JSON.stringify(json);
			if(is_all){
				var input = document.getElementById('exported2');
			}else {
				if(!document.getElementById('exported')){

					var input = document.createElement('textarea');
					input.setAttribute('id','exported');
					document.getElementById('sidebarlist').appendChild(input);

					var button = document.createElement('button');
					button.setAttribute('onclick','javascript:jpmplayer.import(\'sidebar\')');button.setAttribute('id','importbutton');
					button.setAttribute('style','margin-top:20px;width:auto');
					button.innerHTML = 'Import';
					document.getElementById('sidebarlist').appendChild(button);

				}else {
					var input = document.getElementById('exported');
				}
			}

			input.innerHTML = pliststring;
			input.value = pliststring;
			input.select();
			input.setSelectionRange(0, 99999);
			// document.execCommand("copy"); // not reliable!!
			alert("Playlist(s) has been exported to the textarea.");
		} catch(err) {
			alert('Sorry, could not export playlist. The data is corrupted. ' + err);
		}
	}
	// build 1.3 added
	p.exportAll = function() {
		this.outputHTML('main');
		this.export(false);
	}
	p.createPlaylist = function() {
		let list = [];
		if(typeof(Storage) !== 'undefined') {
		
		document.getElementById('importbutton2').innerHTML = 'Import';
		let title = prompt("Enter a title for this playlist:");
		if(title != null){
			title = (title == '') ? 'Untitled playlist' : title;
			title = title.replace(this.reg, '');
			if(localStorage.getItem("playlists"+p.playerUID)){
				list = JSON.parse(localStorage.getItem("playlists"+p.playerUID));
			}
			//let d = (new Date()).getTime();
			let d = (Math.floor(Math.random() * 1000000000) + 10000000).toString(36);
			if(!p.in_array2(d,list)){
				list.push({"id":d,"title":title,"data":[]});
				try {
					localStorage.setItem("playlists"+p.playerUID, JSON.stringify(list));
				} catch (e) {
					if (e == QUOTA_EXCEEDED_ERR || e.code === "22" || e.code === "1024") {
						alert('Local storage is full. Please remove old playlist videos to add new ones.');
					}
				}
				p.getPlaylists();
				console.log(list);
				document.getElementById("yourlists").style.display = "block";
			}
		}
		}else {
			alert("Sorry, your browser does not support Local Storage. Please update your browser or allow local storage.");
		}
	}
	p.sortList = function(listid,sort) {
		p.getList(listid,sort);
	}
	p.getPlaylists  = function() {
		if(typeof(Storage) !== 'undefined') {
			let list = localStorage.getItem("playlists"+p.playerUID);
			if(list !== null && list !== undefined){
				let row = '';
				let items = JSON.parse(list);
				let total = (items.length - 1);
				for(let i = total;0<=i;i--){
					console.log(items[i]);
					row += '<div class="yourlists-item"><a href="javascript:popUp(\''+items[i].id+'\')">'+items[i].title+'</a> <span class="removelist" onclick="javascript:jpmplayer.removeList(\''+items[i].id+'\',this)"></span></div>';
				}
				let playlists = document.getElementById("yourlists");
				if(total < 0){
					playlists.style.display = "none";
				}else {
					
					// this line is optional for version 2, the other credit line cannot be removed
					// credit back welcomed here
					row += '<div class="yourlists-item"><a href="http://www.jpmalloy.com" target="_blank" style="font-size:11px;color:#ccc">Powered by JPM Playlist</a></div>';
					playlists.style.display = "block";
				}
				playlists.innerHTML = row;
			}
		}else {
			let playlists = document.getElementById("yourlists");
			playlists.style.display = "block";
			playlists.innerHTML = '<div class="yourlists-item">Sorry, cannot access local storage from your browser. Please allow local storage or try another browser.</div>';
		}
	}
	p.playVideo = function (vid,domain,tld,clicked,autoplay) {
		
		this.docHeight = window.document.body.clientHeight;
		this.docWidth = window.document.body.clientWidth;
		// auto play is set for YT... may not work if YT blocks
		// this will be integrated into the jpmpopup in the future
		let cssclicked = document.querySelector('.clickeditem');
		if(cssclicked !== null && cssclicked !== undefined){
			cssclicked.setAttribute('class','visiteditem');
		}
		document.getElementById(clicked).setAttribute('class','clickeditem');
		let video = document.getElementById('videoframe');
		let leftface = document.getElementById('left-column');
		let embed = domain+tld;
		embed = (embed == 'youtu.be') ? 'youtube.com' : embed;
		let symbol = vid.indexOf('?') > -1 ? '&' : '?';
		let extend = '';
		if(autoplay){
			extend = (embed == 'youtube.com' || embed == 'bitchute.com' || embed == 'dailymotion.com') ? symbol +'autoplay=1' : '';
		}
		
		let newurl = this.serverURL;
		newurl = newurl.replace('{query}',extend);
		newurl = newurl.replace('{vid}',vid);
		this.iframeURL = newurl.replace('{domain}',embed);
		
		//this.iframeURL = "https://www."+embed+"/embed/"+vid+extend;
		
		if(!debug){
			video.src = this.iframeURL;
		}
		if(debug){
			if(!document.getElementById('itemstats')){
				// future design maybe
				var stats = document.createElement('div');
				stats.setAttribute('class','itemstats');
				stats.setAttribute('id','itemstats');
				stats.style.display = 'block';
				stats.innerHTML = this.iframeURL;
				leftface.appendChild(stats);
			}else {
				var stats = document.getElementById('itemstats');
				stats.style.display = 'block';
				stats.innerHTML = this.iframeURL;
			}
		}
		if(!document.getElementById('loadingdiv')){
			var loading = document.createElement('div');
			loading.setAttribute('class','loading');
			loading.setAttribute('id','loadingdiv');
			loading.innerHTML = '<div class="loader"></div>';
			leftface.appendChild(loading);
		}else {
			var loading = document.getElementById('loadingdiv');
		}
		if(this.docWidth < 480){
			document.body.scrollTop = document.documentElement.scrollTop = 0;
		}
		if(!debug){
			loading.style.display = 'block';
			video.onload = function () {
				loading.style.display = 'none';
			}
		}
	}
	p.getListById = function(list,listid) {
		// list is all playlist data object, listid is the list you want to get
		for(let i=0, len=list.length;i<len;i++) {
			if (list[i].id == listid){
				p.playlist = list[i];
				return p.playlist;
			}
		}
	}
	p.getList = function(listid,sort) {
		if(typeof(Storage) !== 'undefined') {
			let list = localStorage.getItem("playlists"+p.playerUID);
			if(list !== null && list !== undefined){
				let row = '';
				list = JSON.parse(list);
				let items = this.getListById(list,listid).data;

				if(typeof(sort) !== 'undefined') {
					if(sort == 'a-z'){
						items.sort(function(a, b){
							var titleA = a.title.toLowerCase(), titleB = b.title.toLowerCase();
							if(titleA > titleB){
								return -1
							}
							if(titleA < titleB){
								return 1
							}
							return 0
						})
					}else if(sort == 'z-a'){
						items.sort(function(a, b){
							var titleA = a.title.toLowerCase(), titleB = b.title.toLowerCase();
							if(titleA < titleB){
								return -1
							}
							if(titleA > titleB){
								return 1
							}
							return 0
						})
					}else if(sort == 'old'){
						items.sort(function(a, b){
							var dateA = a.date, dateB = b.date;
							if(dateA > dateB){
								return -1
							}
							if(dateA < dateB){
								return 1
							}
							return 0
						})
					}else if(sort == ''){
						items.sort(function(a, b){
							var dateA = a.date, dateB = b.date;
							if(dateA < dateB){
								return -1
							}
							if(dateA > dateB){
								return 1
							}
							return 0
						})
					}
				}
				console.log(items);
				let total = (items.length - 1);
				let count = 0;
				let lasti = 0;
				let has_videos = false;
				for(let i = total;0<=i;i--){
					if(items[i].list == listid){
						has_videos = true;
						let img = '';
						if(items[i].type == 'youtube'){
							//img = '<img src="https://i.ytimg.com/vi/'+items[i].id+'/hqdefault.jpg" alt="" style="width:100px;height:auto" />'
							//<div class="videoimg">'+img+'</div>
						}
						 row += '<div class="playlist-item"><a href="javascript:jpmplayer.playVideo(\''+items[i].id+'\',\''+items[i].type+'\',\''+items[i].tld+'\',\'video-'+i+'\',true)" id="video-'+i+'">'+items[i].title+'</a><span class="removeitem" onclick="javascript:jpmplayer.removeItem(\''+items[i].id+'\',\''+listid+'\',this)"></span></div>';
						 if(count == 0){
							lasti = i;
						 }
						 count++;
					}
				}
				count--;

				row += '<div class="playlist-item"><a href="http://www.jpmalloy.com" target="_blank" style="font-size:12px;color:#ccc">Powered by JPM Playlist</a></div>';
				document.getElementById("playlist").innerHTML = '<div style="margin-bottom:20px"><a href="javascript:jpmplayer.sortList(\''+listid+'\',\'a-z\')">A-Z</a> &nbsp; <a href="javascript:jpmplayer.sortList(\''+listid+'\',\'z-a\')">Z-A</a> &nbsp; <a href="javascript:jpmplayer.sortList(\''+listid+'\',\'\')">Newest</a> &nbsp; <a href="javascript:jpmplayer.sortList(\''+listid+'\',\'old\')">Oldest</a></div><div id="jpmplayer">' + row + '</div><div style="margin-top:20px"><a href="javascript:jpmplayer.export(\''+listid+'\')">Export</a> &nbsp; <a href="javascript:jpmplayer.outputHTML(\'sidebar\')">Import</a></div>';

				if(has_videos){
					this.playVideo(''+items[lasti].id+'',''+items[lasti].type+'',''+items[lasti].tld+'','video-'+lasti,false);
				}
			}
		}
	}
	p.in_array2 = function(needle, haystack){
		let found = 0;
		for(let i=0, len=haystack.length;i<len;i++) {
			if (haystack[i].id == needle) return true;
		}
		return false;
	}
	// changed v2
	p.in_array = function(needle, haystack, listid){
		let found = 0;
		for(let i=0, len=haystack.length;i<len;i++) {
			if (haystack[i].id == listid){
				//console.log(haystack[i].data);
				for(let x=0,len=haystack[i].data.length;x<len;x++) {
					if (haystack[i].data[x].id == needle){
						return true;
					}
				}
			}
		}
		return false;
	}
	p.removeList = function(listid,elem) {
		elem.parentElement.remove();
		if(typeof(Storage) !== 'undefined') {
			let list = localStorage.getItem("playlists"+p.playerUID);
			if(list){
				list = JSON.parse(list);
				//console.log(list);
				for(let x=0, len=list.length;x<len;x++) {
					if(list[x].id == listid){
						console.log(list[x]);
						list.splice(x, 1);
						break;
					}
				}
				if(list.length == 0){
					document.getElementById("yourlists").style.display = "none";
				}
				localStorage.setItem("playlists"+p.playerUID, JSON.stringify(list));
			}
		}
	}
	p.removeItem = function(item,listid,elem) {
		elem.parentElement.remove();
		if(typeof(Storage) !== 'undefined') {
			let list = localStorage.getItem("playlists"+p.playerUID);
			if(list){
				list = JSON.parse(list);
				for(let x=0, len=list.length;x<len;x++) {
					if(list[x].id == listid){
						let items = list[x].data;
						console.log(items);
						for(let i = 0;items.length>i;i++){
							if(items[i].id == item)
							{
								console.log(items[i])
								items.splice(i, 1);
							}
						}
						console.log(items);
						list[x].data = items;
					}
				}
				localStorage.setItem("playlists"+p.playerUID, JSON.stringify(list));
			}
		}
	}
	p.addForm = function(mode){
		if(mode == 'add'){
			document.getElementById("addform").style.display = 'none';
			document.getElementById("addvideoform").style.display = 'block';
		}else {
			document.getElementById("addvideoform").style.display = 'none';
			document.getElementById("addform").style.display = 'block';
		}
	}
	// added v2
	const insertData = function(data,list,listid){
		for(let i=0, len=list.length;i<len;i++) {
			if (list[i].id == listid){
				list[i].data.push(data);
				p.playlist = list[i];
			}
		}
		try {
			localStorage.setItem("playlists"+p.playerUID, JSON.stringify(list));
		} catch (e) {
			if (e == QUOTA_EXCEEDED_ERR || e.code === "22" || e.code === "1024") {
				alert('Local storage is full. Please remove old playlist videos to add new ones.');
			}
		}
	}
    p.addItem = function(listid) {
		if(typeof(Storage) !== 'undefined') {
			let list = [];
			let dt = (new Date()).getTime();
			//let url = prompt("Enter video URL:");
			let urlinput = document.getElementById("videourl");
			let url = urlinput.value;
			// for debugging ... do not uncomment
			if(debug){
				url = 'http://www.youtube.com/' + (Math.floor(Math.random() * 1000000000) + 10000000).toString(36);
			}
			if(url != null && url != ''){
				if(url.indexOf('&') > -1){
					var spliturl = url.split('&');
					url = spliturl[0];
				}
				url = url.replace(this.urlreg, '');
				//let title = prompt("Enter video title:");
				let titleinput = document.getElementById("videotitle");
				let title = titleinput.value;
				if(title == null || title == ''){
					title = 'Untitled video';
				}else {
					title = title.replace(this.reg, '');
				}
				let matches = url.match(this.regmatch);

				if(localStorage.getItem("playlists"+p.playerUID)){
					list = JSON.parse(localStorage.getItem("playlists"+p.playerUID));
				}

				if(matches != null) {
					let vid = matches[5].replace(/\/$/, "");
					let type = matches[2];
					let tld = matches[3];
					if(!p.in_array(vid,list,listid)){
						insertData({"id":vid,"title":title,"type":type,"list":listid,"tld":tld,"date":dt},list,listid);
						urlinput.value = '';
						titleinput.value = '';
					}else {
						alert('This video already exists in the playlist.');
					}
				}else {
					let matches = url.match(this.regmatch2);
					if (matches != null) {
						let vid = matches[4].replace(/\/$/, "");
						let type = matches[2];
						let tld = matches[3];
						if(!p.in_array(vid,list,listid)){
							insertData({"id":vid,"title":title,"type":type,"list":listid,"tld":tld,"date":dt},list,listid);
							urlinput.value = '';
							titleinput.value = '';
						}else {
							alert('This video already exists in the playlist.');
						}
					}else {
						alert('Sorry, this video URL is not supported. Make sure to include full URL with https://.');
					}
				}
				p.getList(listid);
			}else {
				alert('A video URL is required input.');
			}
		}
	}
	return p;
})(jpmplayer);