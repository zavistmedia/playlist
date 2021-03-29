/*
 // JPM Playlist Player
 // Copyright (C) 2020-2021 James P. Malloy All Rights Reserved
 // http://www.jpmalloy.com
 // james (@) jpmalloy.com
 // Credit must stay intact for legal use
 // Version 1 (build "1.2")
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
*/

'use strict';
var jpmplayer = {};
(function(p){
	p.playerUID = 'X2';
	p.reg = /[^A-Za-z0-9,‘’”“'"*$#^+!()=?&:/_.-\s]/g;
	p.urlreg = /[^A-Za-z0-9'"*$#^+!()=?&:/_.-]/g;
	p.regmatch = /(http?s:\/\/www\.|http?s:\/\/|www\.)(.+)(\.com|\.be|\.ly)\/(watch\?v\=|video\/|embed\/)(.+)/i;
	p.regmatch2 = /(http?s:\/\/www\.|http?s:\/\/|www\.)(.+)(\.com|\.be|\.ly)\/(.+)/i;
	p.import = function(mode,control) {

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
				button.setAttribute('onclick','javascript:jpmplayer.import(\'ini\',\'sidebar\')');
			}else{
				button.setAttribute('onclick','javascript:jpmplayer.import(\'ini\',\'main\')');
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

		if(mode != 'create'){
			let input = document.getElementById(boxname);
			let liststring = input.value;
			try{
				let pitems = JSON.parse(liststring);
				let list = [];
				let playlist = [];
				let title = pitems.playlist.title;
				if(title !== undefined){
					title = (title == '') ? 'Untitled playlist' : title;
					title = title.replace(this.reg, '');
					if(localStorage.getItem("playlists"+p.playerUID)){
						list = JSON.parse(localStorage.getItem("playlists"+p.playerUID));
					}
					let id = pitems.playlist.id;
					if(!p.in_array2(id,list)){
						list.push({"id":id,"title":title});
						try{
							let lists = JSON.stringify(list);
							let list2 = localStorage.getItem("playlist"+p.playerUID);
							if(list2){
								let items = JSON.parse(list2);
								let newvideos = items.concat(pitems.data);
								var videos = JSON.stringify(newvideos);
							}else{
								var videos = JSON.stringify(pitems.data);
							}
							localStorage.setItem("playlists"+p.playerUID, lists);
							localStorage.setItem("playlist"+p.playerUID, videos);
							p.getPlaylists();
							if(control == 'sidebar'){
								p.getList(id);
								document.getElementById('mainimport').innerHTML = '';
							}else {
								document.getElementById('mainimport').innerHTML = '';
							}
						}
						catch(err) {
							alert('Sorry, could not import playlist. The data is corrupted. ' + err);
						}
					}else {
						alert('This playlist already exists.');
					}
				}else {
					alert('This data format is not supported.');
				}
			}
			catch(err){
				alert('Sorry, could not import playlist. The data is corrupted. ' + err);
			}
		}else {
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
	}
	p.export = function(listid) {

		let playlist = localStorage.getItem("playlists"+p.playerUID);
		if(playlist){
			console.log(playlist);
			let pitems = JSON.parse(playlist);
			let total = (pitems.length - 1);
			var plist = [];
			let count = 0;
			for(let i = total;0<=i;i--){
				if(pitems[i].id == listid){
					plist[count] = {
						"id":pitems[i].id,
						"title":pitems[i].title
					}
					break;
				}
			}
		}
		let list = localStorage.getItem("playlist"+p.playerUID);
		if(list){
			let items = JSON.parse(list);
			let total = (items.length - 1);
			let count = 0;
			let newList = [];
			for(let i = total;0<=i;i--){
				if(items[i].list == listid){
					newList[count] = {
						"list":items[i].list,
						"tld":items[i].tld,
						"title":items[i].title,
						"type":items[i].type,
						"id":items[i].id
					}
					count++;
				}
			}
			let liststring = JSON.stringify(newList);
			let pliststring = JSON.stringify(plist[0]);
			liststring = '{"playlist":'+pliststring+',"data":'+liststring+'}';
			if(!document.getElementById('exported')){

				var input = document.createElement('textarea');
				input.setAttribute('id','exported');
				document.getElementById('sidebarlist').appendChild(input);

				var button = document.createElement('button');
				button.setAttribute('onclick','javascript:jpmplayer.import(\'ini\',\'sidebar\')');button.setAttribute('id','importbutton');
				button.setAttribute('style','margin-top:20px;width:auto');
				button.innerHTML = 'Import';
				document.getElementById('sidebarlist').appendChild(button);

			}else {
				var input = document.getElementById('exported');
			}
			input.innerHTML = liststring;
			input.select();
			input.setSelectionRange(0, 99999);
			// document.execCommand("copy"); // not reliable!!
			alert("Playlist has been exported to the textarea.");
		}
	}
	p.createPlaylist = function() {
		let list = [];
		document.getElementById('mainimport').innerHTML = '';
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
				list.push({"id":d,"title":title});
				try {
					localStorage.setItem("playlists"+p.playerUID, JSON.stringify(list));
				} catch (e) {
					if (e == QUOTA_EXCEEDED_ERR || e.code === "22" || e.code === "1024") {
						alert('Local storage is full. Please remove old playlist videos to add new ones.');
					}
				}
				p.getPlaylists();
				console.log(list);
			}
		}
	}
	p.sortList = function(listid,sort) {
		p.getList(listid,sort);
	}
	p.getPlaylists  = function() {
		if(typeof(Storage) !== 'undefined') {
			let list = localStorage.getItem("playlists"+p.playerUID);
			if(list){
				let row = '';
				let items = JSON.parse(list);
				let total = (items.length - 1);
				for(let i = total;0<=i;i--){
					console.log(items[i]);
					row += '<div class="yourlists-item"><a href="javascript:popUp(\''+items[i].id+'\')">'+items[i].title+'</a> <span class="removelist" onclick="javascript:jpmplayer.removeList(\''+items[i].id+'\',this)"></span></div>';
				}
				row += '<div class="yourlists-item"><a href="http://www.jpmalloy.com" target="_blank" style="font-size:12px;color:#ccc">Powered by JPM Playlist</a></div>';
				let playlists = document.getElementById("yourlists");
				playlists.style.display = "block";
				playlists.innerHTML = row;
			}
		}else {
			let playlists = document.getElementById("yourlists");
			playlists.style.display = "block";
			playlists.innerHTML = '<div class="yourlists-item">Sorry, cannot access local storage from your browser. Please allow local storage or try another browser.</div>';
		}
	}
	p.playVideo = function (vid,domain,tld,clicked,autoplay) {
		// auto play is set for YT... may not work if YT blocks
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

		video.src = "https://www."+embed+"/embed/"+vid+extend;
		if(!document.getElementById('loadingdiv')){
			var loading = document.createElement('div');
			loading.setAttribute('class','loading');
			loading.setAttribute('id','loadingdiv');
			loading.innerHTML = '<div class="loader"></div>';
			leftface.appendChild(loading);
		}else {
			var loading = document.getElementById('loadingdiv');
		}

		loading.style.display = 'block';
		video.onload = function () {
			loading.style.display = 'none';
		}
	}
	p.getList  = function(listid,sort) {
		if(typeof(Storage) !== 'undefined') {
			let list = localStorage.getItem("playlist"+p.playerUID);
			if(list){
				let row = '';
				let items = JSON.parse(list);

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
					}
				}
				console.log(items,'2');
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
						 row += '<div class="playlist-item"><a href="javascript:jpmplayer.playVideo(\''+items[i].id+'\',\''+items[i].type+'\',\''+items[i].tld+'\',\'video-'+i+'\',true)" id="video-'+i+'">'+items[i].title+'</a><span class="removeitem" onclick="javascript:jpmplayer.removeItem(\''+items[i].id+'\',this)"></span></div>';
						 if(count == 0){
							lasti = i;
						 }
						 count++;
					}
				}
				count--;

				row += '<div class="playlist-item"><a href="http://www.jpmalloy.com" target="_blank" style="font-size:12px;color:#ccc">Powered by JPM Playlist</a></div>';
				document.getElementById("playlist").innerHTML = '<div style="margin-bottom:20px"><a href="javascript:jpmplayer.sortList(\''+listid+'\',\'a-z\')">A-Z</a> &nbsp; <a href="javascript:jpmplayer.sortList(\''+listid+'\',\'z-a\')">Z-A</a> &nbsp; <a href="javascript:jpmplayer.sortList(\''+listid+'\',\'\')">Newest</a></div><div id="jpmplayer">' + row + '</div><div style="margin-top:20px"><a href="javascript:jpmplayer.export(\''+listid+'\')">Export</a> &nbsp; <a href="javascript:jpmplayer.import(\'create\',\'sidebar\')">Import</a></div>';

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
	p.in_array = function(needle, haystack, listid){
		let found = 0;
		for(let i=0, len=haystack.length;i<len;i++) {
			if (haystack[i].id == needle && haystack[i].list == listid) return true;
		}
		return false;
	}
	p.removeList = function(listid,elem) {
		elem.parentElement.remove();
		if(typeof(Storage) !== 'undefined') {
			// fixed bug in build 1
			let playlist = localStorage.getItem("playlist"+p.playerUID);
			if(playlist){
				let pitems = JSON.parse(playlist);
				let newList = []
				for(let i = 0;pitems.length>i;i++){
					if(pitems[i].list == listid)
					{
						console.log(pitems[i],listid,'removed');
					}else {
						newList.push(pitems[i]);
					}
				}
				console.log(newList);
				localStorage.setItem("playlist"+p.playerUID, JSON.stringify(newList));
			}

			let list = localStorage.getItem("playlists"+p.playerUID);
			if(list){
				let items = JSON.parse(list);
				for(let i = 0;items.length>i;i++){
					if(items[i].id == listid)
					{
						//console.log(items[i]);
						items.splice(i, 1);
					}
				}
				localStorage.setItem("playlists"+p.playerUID, JSON.stringify(items));
			}
		}
	}
	p.removeItem = function(item,elem) {
		elem.parentElement.remove();
		if(typeof(Storage) !== 'undefined') {
			let list = localStorage.getItem("playlist"+p.playerUID);
			if(list){
				let items = JSON.parse(list);
				for(let i = 0;items.length>i;i++){
					if(items[i].id == item)
					{
						console.log(items[i])
						items.splice(i, 1);
					}
				}
				localStorage.setItem("playlist"+p.playerUID, JSON.stringify(items));
				console.log(items);
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
    p.addItem = function(listid) {
		if(typeof(Storage) !== 'undefined') {
			let list = [];
			//let url = prompt("Enter video URL:");
			let urlinput = document.getElementById("videourl");
			let url = urlinput.value;
			// for debugging ... do not uncomment
			//url = 'http://www.youtube.com/x2-' + (Math.floor(Math.random() * 1000000000) + 10000000).toString(36);
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
				if(localStorage.getItem("playlist"+p.playerUID)){
					list = JSON.parse(localStorage.getItem("playlist"+p.playerUID));
				}
				console.log(list);
				if(matches != null) {
					let vid = matches[5].replace(/\/$/, "");
					let type = matches[2];
					let tld = matches[3];
					if(!p.in_array(vid,list,listid)){
						list.push({"id":vid,"title":title,"type":type,"list":listid,"tld":tld});
						try {
							localStorage.setItem("playlist"+p.playerUID, JSON.stringify(list));
						} catch (e) {
							if (e == QUOTA_EXCEEDED_ERR || e.code === "22" || e.code === "1024") {
								alert('Local storage is full. Please remove old playlist videos to add new ones.');
							}
						}
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
							list.push({"id":vid,"title":title,"type":type,"list":listid,"tld":tld});
							try {
								localStorage.setItem("playlist"+p.playerUID, JSON.stringify(list));
							} catch (e) {
								if (e == QUOTA_EXCEEDED_ERR || e.code === "22" || e.code === "1024") {
									alert('Local storage is full. Please remove old playlist videos to add new ones.');
								}
							}
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