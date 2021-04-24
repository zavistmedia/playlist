/*
 // JPM Playlist Player
 // Copyright (C) 2020-2021 James P. Malloy All Rights Reserved
 // http://www.jpmalloy.com
 // james (@) jpmalloy.com
 // Credit must stay intact for legal use
 // Version 2 (build "1.7")
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
build a better mousetrap ;)
*/

'use strict';
var jpmplayer = {};
(function(p){
	const debug = false;
	p.ini = function(set){
		p.regmatch = (set.regmatch !== undefined) ? set.regmatch :/(http?s:\/\/www\.|http?s:\/\/|www\.)(.+)(\.com|\.be|\.ly)\/(watch\?v\=|video\/|embed\/)(.+)/i;
		p.regmatch2 = /(http?s:\/\/www\.|http?s:\/\/|www\.)(.+)(\.com|\.be|\.ly)\/(.+)/i;
		p.getPlaylist = (set.getPlaylist !== undefined) ? set.getPlaylist : function(id){alert('No popup interface defined for '+id+'.')};
		p.onPlay = (set.onPlay !== undefined) ? set.onPlay : function(id){};
		p.onLoad = (set.onLoad !== undefined) ? set.onLoad : function(id){};
		p.covers = (set.covers !== undefined) ? set.covers : true;
		p.onhover = (set.onhover !== undefined) ? set.onhover : false;
		p.videoheight = '';
		p.videowidth = '';
		p.serverURL = (set.serverURL !== undefined) ? set.serverURL : 'https://www.{domain}/embed/{vid}{query}';
		p.docHeight = window.document.body.clientHeight;
		p.docWidth = window.document.body.clientWidth;
		this.onLoad();
		if(localStorage.getItem("config"+p.playerUID)){

				this.loadConfig();
				//setTimeout(function(){},500)
				try{
					let config = JSON.parse(localStorage.getItem("config"+p.playerUID));
					this.videoheight = config.config.height;
					this.videowidth = config.config.width;
					if(document.getElementsByTagName("link") && config.config.css != ''){
						document.getElementsByTagName("link")[0].href = config.config.css;
					}
					if(document.getElementById("logo") && config.config.logo != ''){
						let logo = document.getElementById("logo");
						logo.src = config.config.logo;
						logo.onload = function(){
							document.getElementById("loadingdiv2").style.display = 'none';
						}
					}else {
						document.getElementById("loadingdiv2").style.display = 'none';
					}
				}catch(e){}
		}			
		p.getPlaylists();
	}
	p.playerUID = 'X2';
	p.edit = false;
	p.iframeReplace = 'https://www.{domain}/embed/{vid}{query}';
	p.iframeURL = '';
	p.domain = '';
	p.playlist = {};
	p.reg = /[^A-Za-z0-9,‘’”“'"*$#^+!()=?&:;/_.-\s]/gm;
	p.urlreg = /[^A-Za-z0-9'"*$#^+!()=?&:/_.-]/gm;
	p.importAll = function(pitems) {
		if(localStorage.getItem("playlists"+p.playerUID)){
			try{
				let list = JSON.parse(localStorage.getItem("playlists"+p.playerUID));
				list = (list === null || list === undefined) ? [] : list;
				let videos = [];
				for(let i = 0;pitems.playlists.length>i;i++){
					var id = pitems.playlists[i].id;
					var title = pitems.playlists[i].title;
					var sort = pitems.playlists[i].sort !== undefined ? pitems.playlists[i].sort : '';
					if(!p.in_array2(id,list)){
						// playlist not in existing array, add it
						list.push({"id":id,"title":title,"sort":sort,"data":pitems.playlists[i].data});
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
				storeJSON(list);
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
			input.setAttribute('id',boxname);
			input.setAttribute('placeholder',"Paste list data here to import.");
			document.getElementById(local).appendChild(input);

			var button = document.createElement('button');
			if(control == 'sidebar'){
				button.setAttribute('onclick','javascript:jpmplayer.import(\'sidebar\')');
			}else{
				button.setAttribute('onclick','javascript:jpmplayer.import(\'main\')');
			}
			button.setAttribute('id','closeimport');
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
				let sort = pitems.playlist.sort !== undefined ? pitems.playlist.sort : '';
				if(!p.in_array2(id,list)){
					list.push({"id":id,"title":title,"sort":sort,"data":pitems.playlist.data});
					try{
						
						storeJSON(list);
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
			alert('Sorry, could not import playlist. The data is corrupted. ' + err + '');
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
							"sort":pitems[i].sort,
							"data":pitems[i].data
						}
						count++;
					}else {
						if(pitems[i].id == listid){
							plist = {
								"id":pitems[i].id,
								"title":pitems[i].title,
								"sort":pitems[i].sort,
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
				alert('Sorry, could not export playlist. The data is corrupted. ' + err +'');
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
		//let title = prompt("Enter a title for this playlist:");
		let titleinput = document.getElementById("playlisttitle");
		let title = titleinput.value;
		if(title != null){
			title = (title == '') ? 'Untitled playlist' : title;
			title = title.replace(this.reg, '');
			if(localStorage.getItem("playlists"+p.playerUID)){
				list = JSON.parse(localStorage.getItem("playlists"+p.playerUID));
			}
			//let d = (new Date()).getTime();
			let d = (Math.floor(Math.random() * 1000000000) + 10000000).toString(36);
			if(!p.in_array2(d,list)){
				list.push({"id":d,"title":title,"sort":"","data":[]});
				titleinput.value = '';
				storeJSON(list);
				p.getPlaylists();
				console.log(list);
				document.getElementById("yourlists").style.display = "block";
			}
		}
		}else {
			alert("Sorry, your browser does not support Local Storage. Please update your browser or allow local storage.");
		}
	}
	p.sortPlaylists = function(sort) {
		this.getPlaylists(sort);
	}
	p.sortList = function(listid,sort) {
		this.getList(listid,sort);
	}
	p.getPlaylists  = function(sort) {
		if(typeof(Storage) !== 'undefined') {
			let list = localStorage.getItem("playlists"+p.playerUID);
			if(list !== null && list !== undefined){
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
					}else if(sort == ''){}
				}				
				
				let total = (items.length - 1);
				for(let i = total;0<=i;i--){
					console.log(items[i]);
					row += '<div class="yourlists-item"><a href="javascript:jpmplayer.getPlaylist(\''+items[i].id+'\')">'+items[i].title+'</a> <span class="removelist" onclick="javascript:jpmplayer.removeList(\''+items[i].id+'\',this)"></span></div>';
				}
				let playlists = document.getElementById("yourlists");
				if(total < 0){
					playlists.style.display = "none";
				}else {

					// this line is optional for version 2, the other credit line cannot be removed
					// credit back welcomed here
					// row += '<div class="yourlists-item"><a href="http://www.jpmalloy.com" target="_blank" style="font-size:11px;color:#ccc">Powered by JPM Playlist</a></div>';
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
		if(this.videowidth != ''){
			video.style.width = this.videowidth+'px';
			video.style.height = this.videoheight+'px';
		}
		let leftface = document.getElementById('left-column');
		let embed = domain+tld;
		embed = (embed == 'youtu.be') ? 'youtube.com' : embed;
		let symbol = vid.indexOf('?') > -1 ? '&' : '?';
		let extend = '';

		this.domain = embed;
		this.onPlay();
		if(localStorage.getItem("config"+p.playerUID)){
			try{
				let list = JSON.parse(localStorage.getItem("config"+p.playerUID));
				list = (list === null || list === undefined) ? {} : list;
				if(list.config.allow !== undefined){
					for(let i = 0;list.config.allow.length>i;i++){
						var iframe = list.config.allow[i].iframe;
						var domain = list.config.allow[i].domain;
						if(this.domain == domain){
							iframe = iframe.replaceAll("(","{");
							iframe = iframe.replaceAll(")","}");
							this.serverURL = iframe;
						}
					}
				}
				//console.log(this.serverURL,'in playvideo');
			}catch(e){}
		}			
		
		let newurl = this.serverURL;

		if(autoplay){
			extend = (embed == 'youtube.com' || embed == 'bitchute.com' || embed == 'dailymotion.com') ? symbol +'autoplay=1' : '';
		}

		newurl = newurl.replace('{query}',extend);
		newurl = newurl.replace('{vid}',vid);
		this.iframeURL = newurl.replace('{domain}',embed);
		
		//console.log(this.iframeURL);
		//return;
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
			let totop = document.querySelector('.overlay');
			window.document.body.scrollTop = window.document.documentElement.scrollTop = 0;
			totop.scrollTop = 0;
			//totop.scrollTo(0, 0);
			totop.pageYOffset = 0;
		}
		if(!debug){
			loading.style.display = 'block';
			video.onload = function () {
				loading.style.display = 'none';
			}
		}
	}
	p.loadConfig = function() {
		if(!document.getElementById('loadingdiv2')){
			let loading = document.createElement('div');
			loading.setAttribute('class','loading');
			loading.setAttribute('id','loadingdiv2');
			let height = window.document.body.clientHeight;
			let width = window.document.body.clientWidth;
			loading.setAttribute('style','display:block;position:absolute;top:0;left:0;width:'+width+'px;height:'+height+'px;padding-top:100px');
			loading.innerHTML = '<div class="loader" style="margin:0 auto;"></div>';
			document.body.appendChild(loading);
		}else {
			let loading2 = document.getElementById('loadingdiv2');
			loading2.style.display = 'block';
			console.log(loading2.style.display);
		}
	}
	p.getListById = function(list,listid,sort) {
		// list is all playlist data object, listid is the list you want to get
		for(let i=0, len=list.length;i<len;i++) {
			if (list[i].id == listid){
				if(typeof(sort) !== 'undefined') {
					list[i].sort = sort;
				}
				p.playlist = {"list":list[i],"id":i};
				break;
			}
		}
		
		if(typeof(sort) !== 'undefined') {
			storeJSON(list);
		}
		return p.playlist;
	}
	p.showImg = function (id,type,elem) {
		if(this.covers){
			if(document.querySelector('#videoimg-'+id)){
				let img = document.querySelector('#videoimg-'+id);
				if(img.style.display == 'block'){
					img.style.display = 'none';
				}else {
					img.style.display = 'block';
				}
			}else {
					// you can add support for other video covers here
					if(type == 'youtube'){
						var imgnode = document.createElement('img');
						imgnode.setAttribute('src','https://i.ytimg.com/vi/'+id+'/default.jpg');
						imgnode.setAttribute('class','videoimg');
						imgnode.setAttribute('style','display:block');
						imgnode.setAttribute('id','videoimg-'+id);
						elem.appendChild(imgnode);
					}
			}
		}
	}
	p.getList = function(listid,sort,edit) {
		if(typeof(Storage) !== 'undefined') {
			let list = localStorage.getItem("playlists"+p.playerUID);
			if(list !== null && list !== undefined){
				let row = '';
				list = JSON.parse(list);
				let playing = this.getListById(list,listid,sort);
				let items = playing.list.data;
				let sortset = false;
				
				if(typeof(sort) === 'undefined') {
					if(playing.sort !== undefined){
						sort = playing.list.sort;
					}
				}else {
					sortset = true;
				}

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
				
				let editlabel = 'Edit';
				let saving = false;
				if(typeof(edit) !== 'undefined') {
					if(edit.innerHTML == 'Edit'){
						this.edit = true;
						editlabel = 'Save';
					}else {
						edit.innerHTML = 'Edit';
						this.edit = false;
						editlabel = 'Edit';
						// save new list
						saving = true;
					}
				}else {
					editlabel = 'Edit';
					this.edit = false;
				}					
				
				for(let i = total;0<=i;i--){
					if(items[i].list == listid){
						
						if(saving){
							let newtitle = document.getElementById('video-'+i).innerHTML;
							if(newtitle != ''){
								newtitle = decodeEntities(newtitle);
								items[i].title = newtitle.replace(this.reg, '');
							}
						}
						
						has_videos = true;
						let img = '';
						
						let ahref = '';
						if(this.edit) {
							ahref = 'href="javascript:jpmplayer.editData(\''+items[i].id+'\',this)" id="video-'+i+'" contenteditable="true" style="border: 1px dashed red"';
						}else {
							ahref = 'href="javascript:jpmplayer.playVideo(\''+items[i].id+'\',\''+items[i].type+'\',\''+items[i].tld+'\',\'video-'+i+'\',true)" id="video-'+i+'"';
						}
						
						if(this.onhover){
							
						row += '<div class="playlist-item" onmouseenter="jpmplayer.showImg(\''+items[i].id+'\',\''+items[i].type+'\',this)" onmouseleave="jpmplayer.showImg(\''+items[i].id+'\',\''+items[i].type+'\',this)"><a '+ahref+' class="itemtitle">'+items[i].title+'</a><span class="removeitem" onclick="javascript:jpmplayer.removeItem(\''+items[i].id+'\',\''+listid+'\',this)"></span></div>';
						
						}else {
							
							/* Note: in the future I will replace these with a onclick event handler callback */
							
							let cleantitle = items[i].title.replaceAll('"',items[i].title);
							
							if(items[i].type == 'youtube'){
								img = '<div class="imghold"><img src="https://i.ytimg.com/vi/'+items[i].id+'/default.jpg" alt="'+cleantitle+'" class="coverimg" onclick="jpmplayer.playVideo(\''+items[i].id+'\',\''+items[i].type+'\',\''+items[i].tld+'\',\'video-'+i+'\',true)" /></div>';
							}
							
							row += '<div class="playlist-item">'+img+'<a '+ahref+' class="itemtitle">'+items[i].title+'</a><span class="removeitem" onclick="javascript:jpmplayer.removeItem(\''+items[i].id+'\',\''+listid+'\',this)"></span></div>';
							
						}
						
						 if(count == 0){
							lasti = i;
						 }
						 count++;
					}
				}
				count--;
				
				if(saving){
					list[playing.id].data = items;
					storeJSON(list);
				}

				row += '<div class="playlist-item"><a href="http://www.jpmalloy.com" target="_blank" style="font-size:12px;">Powered by JPM Playlist</a></div>';

				let pl = document.getElementById("playlist");
				pl.style.display = (total == -1) ? 'none' : 'block';
				pl.innerHTML = '<div style="margin-bottom:20px"><a href="javascript:jpmplayer.sortList(\''+listid+'\',\'a-z\')">A-Z</a> &nbsp; <a href="javascript:jpmplayer.sortList(\''+listid+'\',\'z-a\')">Z-A</a> &nbsp; <a href="javascript:jpmplayer.sortList(\''+listid+'\',\'\')">Newest</a> &nbsp; <a href="javascript:jpmplayer.sortList(\''+listid+'\',\'old\')">Oldest</a> &nbsp; <a href="javascript:void(0)" onclick="jpmplayer.getList(\''+listid+'\',\'a-z\',this)">'+editlabel+'</a></div><div id="jpmplayer">' + row + '</div><div style="margin-top:20px"><a href="javascript:jpmplayer.export(\''+listid+'\')">Export</a> &nbsp; <a href="javascript:jpmplayer.outputHTML(\'sidebar\')">Import</a></div>';

				if(has_videos && !sortset){
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
				storeJSON(list);
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
				storeJSON(list);
			}
		}
	}
	p.setConfig = function(){
		configureApp();
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
	
	const configureApp = function() {
		if(document.getElementById("playlistconfig")){
			let input = document.getElementById("playlistconfig");
			let liststring = input.value.replaceAll('\\','~');
			if(liststring != ''){
				try{
					let pitems = JSON.parse(liststring);
					if(pitems.config.allow !== undefined){
						console.log(pitems.config.allow);
						let settings = [];
						let css = pitems.config.css !== undefined ? pitems.config.css : '';
						let logo = pitems.config.logo !== undefined ? pitems.config.logo : '';
						p.videowidth = pitems.config.videowidth !== undefined ? pitems.config.videowidth : '';
						p.videoheight = pitems.config.videoheight !== undefined ? pitems.config.videoheight : '';
						if(document.getElementsByTagName("link") && css != ''){
							if(document.getElementById("main-container")){
								p.loadConfig();
								let layout = document.getElementById("main-container");
								layout.style.display = 'none';
								setTimeout(function(){
									layout.style.display = 'block';
									document.getElementById("loadingdiv2").style.display = 'none';
								},500);
							}
							document.getElementsByTagName("link")[0].href = css;
						}
						if(document.getElementById("logo") && logo != ''){
							document.getElementById("logo").src = logo;
						}	
						for(let i = 0;pitems.config.allow.length>i;i++){
							var iframe = pitems.config.allow[i].iframe;
							var domain = pitems.config.allow[i].domain;
							settings.push({"iframe":iframe,"domain":domain});
						}
						
						let list = {"config":{"regex":pitems.config.regex,"allow":settings,"css":css,"logo":logo,"height":p.videoheight,"width":p.videowidth}};
						storeJSON(list,"config");

						if(document.getElementById("appstatus")){
							var status = document.getElementById("appstatus");
							status.innerHTML = 'Saving...';
							setTimeout(function(){
								status.innerHTML = 'Configuration saved.';
							},1000);
						}
					}
				}catch (e) {
					alert('Sorry, import configuration data is bad. Default settings will be used instead. ' + e);
				}
			}
		}
	}

	const decodeEntities = function(text) {
		var entities = {'amp': '&','apos': '\'','#x27': '\'','#x2F': '/','#39': '\'','#47': '/','lt': '<','gt': '>','nbsp': ' ','quot': '"'}
		return text.replace(/&([^;]+);/gm, function (match, entity) {
			return entities[entity] || match
		})
	}
	
	const editData = function(vid,elem){
		elem.contentEditable = "true";
	}
	
	const storeJSON = function(key,name){
		name = (name === undefined) ? "playlists" : name;
		try {
			localStorage.setItem(name+p.playerUID, JSON.stringify(key));
		} catch (e) {
			if (e == QUOTA_EXCEEDED_ERR || e.code === "22" || e.code === "1024") {
				alert('Local storage is full. Please remove old playlist videos to add new ones. Error setting key '+name);
			}
		}
	}
	
	const insertData = function(data,list,listid){
		for(let i=0, len=list.length;i<len;i++) {
			if (list[i].id == listid){
				list[i].data.push(data);
				p.playlist = list[i];
			}
		}		
		storeJSON(list);
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
				
				let setregex = '';
				if(localStorage.getItem("config"+p.playerUID)){
					try{
						let config = JSON.parse(localStorage.getItem("config"+p.playerUID));
						config = (config === null || config === undefined) ? {} : config;
						if(config.config.regex !== undefined){
							let regexstring = config.config.regex;
							// it works ;)
							regexstring = regexstring.replaceAll('~','\\');
							console.log(regexstring);
							setregex = eval(regexstring);
						}else {
							setregex = this.regmatch;
						}
					}catch(e){
						setregex = this.regmatch;
					}
				}else {
					setregex = this.regmatch;
				}
				let matches = url.match(setregex);

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
		}else {
			alert('Sorry, your web or mobile browser does not support Local Storage or it\'s disabled in settings. Try another browser that does.');
		}
	}
	return p;
})(jpmplayer);