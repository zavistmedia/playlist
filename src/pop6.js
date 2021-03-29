/*
 // JPM Pop-up
 // Copyright (C) 2020-2021 James P. Malloy All Rights Reserved
 // http://www.jpmalloy.com
 // james (@) jpmalloy.com
 // Credit must stay intact for legal use
 // Version 4 (build "6.2")
 // *** 100% free, do with what you like ***
 // No outside plugins required
 // Feel free to share with others
 // to do
 // build a better mousetrap ;) Version 5 will have a lot of the code optimized
 // Note: build 5.1 had some bugs with the drag feature, please update to 5.4
 // for support, see my blog: https://jimswebtech.blogspot.com/

 // example usage
 function popUp(){
	jpmx2.item = {
	'id':'1',
	'type':'image',
	'file':'x.jpg',
	'html':'<div class="wrap-container"><div class="left-column" id="left-column"></div><div class="right-column" id="right-column"><div style="padding:20px"><h2>Comments</h2><p>comment interface can go here</p></div></div>'
	};
	jpmx2.container = 'test';
	jpmx2.style = 'width:100%;z-index:5;background-color:rgba(0, 0, 0, 0.4)';
	jpmx2.fullScreen(jpmx2.item.html);
}
 */
	'use strict';
	function jpmpopup(set){
		this.itemlist = Array();
		this.set = (set !== undefined) ? set : {};
		var set = this.set;
		this.style = (set.style !== undefined) ? set.style.split(';') : '';
		this.mode = (set.mode !== undefined) ? set.mode : 'html';
		this.loading = (set.loading !== undefined) ? set.loading : '<div class="loader"></div>';
		this.header = (set.header !== undefined) ? set.header : '';
		this.button = (set.button !== undefined) ? set.button : 'off';
		var gallery = (set.gallery !== undefined) ? set.gallery.container : undefined;
		if(set.gallery !== undefined){
			if(typeof(gallery) == 'string'){
				this.gallery = Array();
				this.gallery[0] = gallery;
			}else {
				this.gallery = gallery;
			}
		}else {
			this.gallery = gallery;
		}
		this.newOverlay = (set.cleanup !== undefined) ? set.cleanup : true;
		this.container = (set.container !== undefined) ? set.container : undefined;
		this.underlay = (set.underlay !== undefined) ? set.underlay : undefined;
		this.class = (set.class !== undefined) ? set.class : 'a.popup';
		this.onopen = (set.onopen !== undefined) ? set.onopen : function(){};
		this.onclose = (set.onclose !== undefined) ? set.onclose : function(){};
		this.docwidth = window.document.body.clientWidth;
		this.docheight = window.document.body.clientHeight;
		this.item = {'clicked':''};
		this.html = '';
		this.ytotal = 0;
		this.console = [];
		this.eventlist = [];
		this.registered = [];
		this.wrapdiv = (set.wrap !== undefined) ? set.wrap : 'wrap-container';
		this.slideDivs = (set.slideDivs !== undefined) ? set.slideDivs : {'left':'left-column','right':'right-column'};
		jpmpopup.console = this.console;
		jpmpopup.eventlist = this.eventlist;
		jpmpopup.toConsole = this.toConsole;
		this.ini(set);
	}
	jpmpopup.prototype = {

		setAnimation : function(elem,mode,left,right,event,instance){
			switch (mode) {
				case 'slideIn' :
					var mstyle = elem.newm.style;
					mstyle.position = 'absolute';
					mstyle.transition = 'transform .6s ease';
					if(instance.thumbitem.clickedid == 'navitem-1'){
						mstyle.left = right + 'px';
						mstyle.transform = 'translateX(-'+left+'px)';
					}else {
						mstyle.left = '-'+ left + 'px';
						mstyle.transform = 'translateX('+right+'px)';
					}
				break;
				case 'slideOut' :
					elem.oldm.style.transition = 'transform .6s ease';
					if(instance.thumbitem.clickedid == 'navitem-1'){
						elem.oldm.style.transform = 'translateX(-'+right+'px)';
					}else {
						elem.oldm.style.transform = 'translateX('+left+'px)';
					}
				break;
				case 'fadeOut' :
					elem.oldm.style.transition = 'all .2s linear';
					elem.newm.style.opacity = '.1';
					elem.oldm.style.opacity = '1';
				break;
				case 'fadeIn' :
					elem.newm.style.transition = 'all .2s linear';
					elem.newm.style.opacity = '1';
					elem.oldm.style.opacity = '.1';
				break;
				case 'flipIn' :
					var mstyle = elem.newm.style;
						mstyle.position = 'absolute';
						mstyle.transition = 'transform 1s ease';
					if(instance.thumbitem.clickedid == 'navitem-1'){
						mstyle.left = right + 'px';
						mstyle.transform = 'translateX(-'+left+'px) rotateX(10deg) rotateY(360deg)';
					}else {
						mstyle.left = '-'+ left + 'px';
						mstyle.transform = 'translateX('+right+'px) rotateX(10deg) rotateY(360deg)';
					}
				break;
				case 'flipOut' :
					elem.oldm.style.transition = 'transform 1s ease';
					if(instance.thumbitem.clickedid == 'navitem-1'){
						elem.oldm.style.transform = 'translateX(-'+right+'px) rotateX(10deg) rotateY(90deg)';
					}else {
						elem.oldm.style.transform = 'translateX('+left+'px) rotateX(10deg) rotateY(90deg)';
					}
				break;
			}
		},
		setNewFrameStyle : function (newmedia,instance){
			newmedia.style.position = 'unset';
			newmedia.style.left = 'unset';
			newmedia.style.maxWidth = '100%';
			newmedia.style.maxHeight = '100%';
			if(instance.thumbitem.type == 'iframe'){
				if(instance.thumbitem.width != 'undefined' && instance.thumbitem.width != 'null'){
					newmedia.style.height = instance.thumbitem.height;
					newmedia.style.width = instance.thumbitem.width;
				}else {
					newmedia.style.height = '100%';
					newmedia.style.width = '100%';
				}
				newmedia.style.border = 'none';

			}else {
				newmedia.style.height = 'auto';
			}
			if(instance.animation == 'flip')
			{
				newmedia.style.transform = 'rotateX(0deg) rotateY(360deg)';
			}else {
				newmedia.style.transform = 'unset';
			}
			newmedia.style.transition = 'unset';
		},
		showLoading : function(item,loading,instance,leftface) {

			var mediaon = '';
			if(!instance.itemlist[item.item].loaded){
				loading.style.display = 'block';
			}
			var newmedia = document.getElementById('media-'+item.index);
			if(item.type == 'video'){

				newmedia.oncanplay = function(e) {
					if(!instance.itemlist[item.item].loaded){
						instance.itemlist[item.item].loaded = true;
						loading.style.display = 'none';
					}
				}

			}else {
				newmedia.onload = function(e) {
					instance.itemlist[item.item].loaded = true;
					loading.style.display = 'none';
				}
			}

			newmedia.onerror = function(){
				instance.errorLoading(instance,newmedia,mediaon,leftface,'Sorry, there was a error loading the item.');
			}
		},
		createNewItem : function(instance,leftface,loading){

			if(loading == ''){
				// called from animate
				var item = instance.thumbitem;
			}else {
				// called from fullScreen
				var item = instance.item;
			}
			var nomediatype = false;

			if(item.type == 'image'){
				var newmedia = document.createElement('img');
				newmedia.setAttribute('src',item.file);
				newmedia.setAttribute('alt',item.about);
				var style = '';
				//console.log(item.height);
				if(item.width != undefined && item.width != null && item.width != 'null'){
					style = 'height: '+item.height+'; width:'+item.width+'; ';
				}else {
					style = 'height: auto; ';
				}
				newmedia.setAttribute('style',style+'position: unset; left: unset; max-width: 100%; max-height: 100%; border:none');

			}else if(item.type ==  'video'){
				var newmedia = document.createElement('video');
				const source = document.createElement('source');
				newmedia.setAttribute('autoplay','true');
				newmedia.setAttribute('controls','true');
				source.setAttribute('src',item.file);
				source.setAttribute('type',item.srctype);
				var style = '';
				if(item.width != undefined && item.width != null && item.width != 'null'){
					style = 'height: '+item.height+'; width:'+item.width+'; ';
				}else {
					style = 'height: auto; ';
				}
				newmedia.setAttribute('style',style+'position: unset; left: unset; max-width: 100%; max-height: 100%; border:none');
				newmedia.appendChild(source);

			}else if(item.type ==  'iframe'){
				var newmedia = document.createElement('iframe');
				newmedia.setAttribute('src',item.file);
				newmedia.setAttribute('allow',item.allow);
				newmedia.setAttribute('controls','true');
				newmedia.setAttribute('allowfullscreen','true');
				var style = '';

				if(item.width != undefined && item.width != null && item.width != 'null'){
					style = 'height:'+item.height+'; width:'+item.width+'; ';
				}else {
					style = 'height: 100%; width:100%; ';
				}
				newmedia.setAttribute('style',style+'position: unset; left: unset; max-width: 100%; max-height: 100%; border:none');
			}else {
				nomediatype = true;
				var newmedia = document.createElement('div');
			}

			newmedia.setAttribute('id','media-'+item.index);
			newmedia.setAttribute('class','maxmedia');

			if(loading == ''){
				newmedia.style.display = 'none';
				leftface.appendChild(newmedia);
			}else {
				if(!nomediatype){
					leftface.appendChild(newmedia);
					leftface.appendChild(loading);
					instance.showLoading(item,loading,instance,leftface);
				}
			}
			return newmedia;
		}
	}
	jpmpopup.prototype.registerItems = function(){

		var instance = this;
		// if set, select all gallery items
		var y = this.ytotal;
		for(var x = 0;x < this.gallery.length;x++){

		var items = document.querySelectorAll(this.gallery[x]);
		if(!this.in_array(this.gallery[x],this.registered)){
			this.registered.push(this.gallery[x]);
			console.log(this.registered);

		for(var k = 0;k < items.length;k++){

			for(var i = 0;i < items[k].children.length;i++){

				//jpmpopup.toConsole(items[k].children[i]);
				var gitem = items[k].children[i].children[0];

				// if not registered
				if(!document.getElementById('item-'+y)){

					gitem.setAttribute('data-index',i);
					gitem.setAttribute('data-item',y);
					gitem.setAttribute('id','item-'+y);
					this.connectEvent(gitem,'click',function (e){
						var item = {
							'id' : this.dataset.id,
							'type' : this.dataset.type,
							'file' : this.dataset.file,
							'about': this.dataset.about,
							'width': this.dataset.width,
							'height': this.dataset.height,
							'allow': this.dataset.allow,
							'srctype': this.dataset.filetype,
							'index': parseInt(this.dataset.index),
							'item': parseInt(this.dataset.item),
							'src': this.getAttribute('src'),
							'clicked':'thumbnail'
						};
						//jpmpopup.instance = instance;
						instance.item = item;
						jpmpopup.pop = instance;
						jpmpopup.pop.onclick(item);
						instance.animate();
						//instance.onclick(item);
						// make instance of this container
						var popcode = item.id.replace('-','');

					});

					// pre load all images for this instance
					var itype = gitem.getAttribute('data-type');
					var ifile = gitem.getAttribute('data-file');
					if(this.preload){
						if(itype == 'image'){
							var img = new Image();
							console.log(ifile);
							img.src = ifile;
						}
					}

				}else {
					var itype = gitem.getAttribute('data-type');
					var ifile = gitem.getAttribute('data-file');
				}

				this.itemlist[y] = {'width':gitem.getAttribute('data-width'),'height':gitem.getAttribute('data-height'),'allow':gitem.getAttribute('data-allow'),'src':gitem.src,'about':gitem.getAttribute('data-about'),'type':itype,'file':ifile,'index':gitem.getAttribute('data-index'),'item':gitem.getAttribute('data-item'),'id':gitem.getAttribute('data-id'),'srctype':gitem.getAttribute('data-filetype'),'loaded':false};
				y++;
			}
			this.ytotal = y;
			this.gallerytotal = i;
		}
		}
		}

	}
	jpmpopup.prototype.ini = function(set){

		var instance = this;

		if(document.getElementById(this.container)){
			var popup = document.getElementById(this.container);
			popup.style.display = 'none';
		}

		if(this.gallery !== undefined) {

			/* for gallery */
			this.mode = 'javascript';
			this.onclick = (set.gallery.onclick !== undefined) ? set.gallery.onclick : function(){};
			this.onslide = (set.gallery.onslide !== undefined) ? set.gallery.onslide : function(){};
			this.preload = (set.gallery.preload !== undefined) ? set.gallery.preload : false;
			this.onslideend = (set.gallery.onslideend !== undefined) ? set.gallery.onslideend : function(){};
			this.galleryButton = (set.gallery.galleryButton !== undefined) ? set.gallery.galleryButton : 'closeposition';
			this.thumbnav = (set.gallery.thumbnav !== undefined) ? set.gallery.thumbnav : 'on';
			this.sidebar = (set.gallery.sidebar !== undefined) ? set.gallery.sidebar : 'on';
			this.animation = (set.gallery.animation !== undefined) ? set.gallery.animation : 'slide';
			this.registerItems();
		}

		// escape
		this.connectEvent(window.document,'keydown',this.escClose);

		// on resize
		this.connectEvent(window,'resize',this.resizeDoc);

		this.galleryButton = (this.galleryButton !== undefined) ? this.galleryButton : 'closeposition';
		this.sidebar = (this.sidebar !== undefined) ? this.sidebar : 'on';

		if(this.mode == 'html'){
			var x = document.querySelectorAll(this.class);
			for(var i = 0;i < x.length;i++){
				this.connectEvent(x[i],'click',function (e){
					jpmpopup.instance = instance;
					instance.container = this.getAttribute('href').substring(1);
					if(document.getElementById(instance.container).getAttribute('data-style') !== null){
						instance.style = document.getElementById(instance.container).getAttribute('data-style').split(';');
					}else {
						instance.style = '';
					}
					if(document.getElementById(instance.container).getAttribute('data-header') !== null){
						instance.header = document.getElementById(instance.container).getAttribute('data-header');
					}else {
						instance.header = '';
					}
					instance.fullScreen();
				});
			}
		}
	}
	jpmpopup.prototype.resizeDoc = function (e){

		if(document.querySelectorAll('.overlay')[0]){

			jpmpopup.toConsole('resized');

			var x = document.querySelectorAll('.maxmedia');

			var leftface = document.getElementById(jpmpopup.controller.slideDivs.left);

			for(var i = 0;i < x.length;i++){
				leftface.style.height = 'auto';
				x[i].style.position = 'unset';
				x[i].style.left = 'unset';
				x[i].style.maxWidth = '100%';
				x[i].style.maxHeight = '100%';
				x[i].style.transform = 'unset';
				x[i].style.transition = 'unset';
				if(jpmpopup.controller.item.type == 'iframe'){

					if(jpmpopup.controller.item.width != 'undefined'){
						x[i].style.height = jpmpopup.controller.item.height;
						//x[i].style.height = 'auto';
						x[i].style.width = jpmpopup.controller.item.width;
					}else {
						x[i].style.height = '100%';
						x[i].style.width = '100%';
					}
					x[i].setAttribute("allow",jpmpopup.controller.item.allow);

				}else {
					x[i].style.height = 'auto';
				}
			}

		}
	}
	jpmpopup.prototype.escClose = function (e){
		e = e || window.event;
		if(e.keyCode == '27') {
			jpmpopup.controller.close(jpmpopup.controller.container);
		}
	}
	jpmpopup.prototype.splitHorizontal = function(mode){
		if(document.getElementById(this.slideDivs.right)){
			var sidebar = jpmpopup.pop.wrap.querySelector('#'+this.slideDivs.right).style;
			if(sidebar.flexBasis == 'auto' || mode == 'sidebar'){
				sidebar.flexBasis = 'max-content';
				sidebar.width = 'auto';
				sidebar.maxWidth = '340px';
				sidebar.height = '100%';
				sidebar.overflow = 'auto';
				if(document.getElementById("comments")){
					const comments = document.getElementById("comments").style;
					comments.height = '380px';
					comments.overflowY = 'auto';
				}
			}else {
				sidebar.flexBasis = 'auto';
				sidebar.width = '100%';
				sidebar.maxWidth = '100%';
				sidebar.height = 'auto';
				sidebar.overflow = 'hidden';
				if(document.getElementById("comments")){
					const comments = document.getElementById("comments").style;
					comments.maxHeight = '100%';
					comments.overflowY = 'unset';
					comments.height = 'auto';
				}
			}
		}
	}
	jpmpopup.prototype.hideSidebar = function(){
		if(document.getElementById(this.slideDivs.right)){
			var sidebar = jpmpopup.pop.wrap.querySelector('#'+this.slideDivs.right);
			var nav = jpmpopup.pop.wrap.querySelector('.navigation');
			if(sidebar.style.display == 'none'){
				sidebar.style.display = 'flex';
				nav.style.top = '0';
				nav.style.bottom = 'unset';
			}else {
				sidebar.style.display = 'none';
				nav.style.top = 'unset';
				nav.style.bottom = '0';
			}
		}
	}
	jpmpopup.prototype.fullScreen = function(content){

		jpmpopup.toConsole(jpmpopup);
		jpmpopup.pop = this;
		if(document.getElementById(this.slideDivs.right)){
			var sidebar = document.querySelector('#'+this.slideDivs.right);
			sidebar.scrollTop = 0;
		}

		window.document.body.style.overflow = 'hidden';

		var popup = '';
		var id = this.container;
		var instance = this;

		jpmpopup.controller = {
			"item":instance.item,
			"container":instance.container,
			"onclose":instance.onclose,
			"slideDivs":{'left':instance.slideDivs.left,'right':instance.slideDivs.right},
			"newOverlay":instance.newOverlay,
			"close":instance.close,
			"galleryButton":instance.galleryButton+'-'+id,
			"underlay":instance.underlay,
			"hideSidebar":instance.hideSidebar,
			"splitHorizontal":instance.splitHorizontal
		}

		// if animation, return false
		if(this.item.clicked == 'navigation'){
			return false;
		}

		jpmpopup.pop.animationStatus = 'open';

		// create gallery close button dynamicly

		if(!document.getElementById(this.galleryButton+'-'+id)){

			var button = document.createElement('div');
			button.setAttribute('id',this.galleryButton+'-'+this.container);
			button.setAttribute('class',this.galleryButton);
			button.innerHTML = '<a href="javascript:void(0)" onclick="jpmpopup.controller.close(\''+ this.container +'\')" class="closebutton2"></a>';
		}

		if(this.underlay !== undefined) {
			if(this.underlay == 'on'){
				if(!document.getElementById('underlay-'+id)){
					var underlay = document.createElement('div');
					underlay.setAttribute('class','underlay');
					underlay.setAttribute('id','underlay-'+id);
					document.body.appendChild(underlay);
					underlay.style.display = 'block';
				}else {
					var underlay = document.getElementById('underlay-'+id);
					underlay.style.display = 'block';
				}
			}
		}

		if(content !== undefined) {
			// create a dynamic container
			if(!document.getElementById(id)){
				popup = document.createElement('div');
				popup.setAttribute('id',id);
				popup.setAttribute('class','overlay');
				document.body.appendChild(popup);
			}else {
				popup = document.getElementById(id);
			}
			//var fillin = document.createTextNode();
			//popup.appendChild(fillin);
			popup.innerHTML = content;
			document.querySelector('.'+this.wrapdiv).appendChild(button);
			jpmpopup.toConsole('container opened:',this.container);
		}
		else if (document.getElementById(this.container)){
			popup = document.getElementById(this.container);
			document.body.appendChild(button);
			jpmpopup.toConsole('container opened:',this.container);
		}

		if(document.getElementById(this.slideDivs.right)){
			this.wrap = document.querySelector('.'+this.wrapdiv);
			var sidebar = this.wrap.querySelector('#'+this.slideDivs.right);
			if(this.sidebar == 'off'){
				sidebar.style.display = 'none';
			}
		}

		if(document.getElementById(this.galleryButton+'-'+id)){
			document.getElementById(this.galleryButton+'-'+id).style.display = 'block';
		}

		if(this.button == 'on'){
			if(!document.getElementById('top-section-'+id)){
				var closebutton = document.createElement('div');
				closebutton.setAttribute('class','top-section');
				closebutton.setAttribute('id','top-section-'+id);
				var headerHTML = '';
				if(this.header != ''){
					closebutton.setAttribute('style','display:flex;justify-content:space-between;');
					headerHTML = '<h1 style="margin:0">'+this.header+'</h1>';
				}else {
					closebutton.setAttribute('style','display:flex;justify-content:flex-end;');
				}
				jpmpopup.toConsole(this);
				closebutton.innerHTML = headerHTML+'<a href="#" class="closebutton" id="closebutton-'+id+'"></a>';
				popup.insertBefore(closebutton, popup.firstElementChild);

				this.connectEvent(document.getElementById('closebutton-'+id),'click',function (e){
					instance.close(id);
				});
			}
		}

		if(document.getElementById(this.slideDivs.left)){

			var leftface = this.wrap.querySelector('#'+this.slideDivs.left);

			if(!document.getElementById('loadingdiv')){
				var loading = document.createElement('div');
				loading.setAttribute('class','loading');
				loading.setAttribute('id','loadingdiv');
				loading.style.display = 'none';
				loading.innerHTML = instance.loading;
				leftface.appendChild(loading);
			}else {
				var loading = document.getElementById('loadingdiv');
			}

			popup.style.display = 'block';
			this.createNewItem(this,leftface,loading);

			// stop never ending loading
			setTimeout(function(){
				//loading.style.display = 'none';
			},12000);
		}

		if(popup != ''){

			var bg = popup.style;
			// defaults
			bg.visibility = 'hidden';
			bg.position = 'fixed';
			bg.display = 'block';
			bg.top = '0';
			bg.left = '0';
			bg.bottom = '0';
			bg.right = '0';
			bg.width = '100%';
			bg.height = '100%';
			bg.objectFit = 'contain';
			bg.overflow = 'auto';
			/*bg.zIndex = '1';*/
			bg.boxSizing = 'border-box';
			bg.backgroundColor = '#cccccc';
			bg.visibility = '';
			// override

			//check if is an object
			if(typeof(this.style) != 'object'){
				this.style = this.style.split(';')
			}

			for(var i = 0;i < this.style.length;i++){
				var rule = this.style[i].split(':');
				var propname = rule[0].split('-');
				if(propname[1] !== undefined){
					var item = propname[0] + propname[1].charAt(0).toUpperCase() + propname[1].slice(1);
				}else {
					var item = propname[0];
				}
				eval("bg." + item + "= '" + rule[1] + "';");
			}

			if(this.docwidth < 460 && document.getElementById(this.galleryButton+'-'+id)){

				document.getElementById(this.galleryButton+'-'+id).style.top = '5px';
				document.getElementById(this.galleryButton+'-'+id).style.right = '5px';
			}

			if(this.gallery !== undefined) {

				this.navigation(id);
				if(document.getElementById("nextarrow")){
					this.connectEvent(document.querySelector('#'+this.slideDivs.left),'mouseleave',function (e){
						document.getElementById('nextarrow').style.visibility = 'hidden';
						document.getElementById('prevarrow').style.visibility = 'hidden';
						if(document.getElementById('fullsizeimg')){
							document.getElementById('fullsizeimg').style.visibility = 'hidden';
						}
					});
					this.connectEvent(document.querySelector('#'+this.slideDivs.left),'mouseenter',function (e){
						document.getElementById('nextarrow').style.visibility = 'visible';
						document.getElementById('prevarrow').style.visibility = 'visible';
						if(document.getElementById('fullsizeimg')){
							document.getElementById('fullsizeimg').style.visibility = 'visible';
						}
					});
				}

			}
			this.onopen(id);
		}
	}

	jpmpopup.prototype.animate = function() {

		if(jpmpopup.pop !== undefined){
			var instance = jpmpopup.pop;
		}else {
			var instance = this;
		}

		if(instance.item.clicked == 'thumbnail' || instance.item.clicked == ''){

			// No animation

		}else {

			// prevents flooding
			if(!document.getElementById('media-'+instance.thumbitem.index) && jpmpopup.pop.animationStatus != 'inprogress')
			{
				// navthumb clicked
				// slide out old image displayed, slide in new one
				instance.onslide();

					// load image, if container exist add slide animation
					jpmpopup.pop.animationStatus = 'inprogress';
					var leftface = instance.wrap.querySelector('#'+instance.slideDivs.left);

					// if no data type item exist
					if(!document.getElementById('media-'+instance.item.index))
					{
						var emptydiv = document.createElement('div');
						emptydiv.setAttribute('class','maxmedia');
						emptydiv.setAttribute('id','media-'+instance.item.index);
						emptydiv.style.display = 'none';
						leftface.appendChild(emptydiv);
					}

					var mediaon = document.getElementById('media-'+instance.item.index);

					if(instance.item.index == '0'){
						instance.thumbitem.clickedid = 'navitem-1';
					}

					instance.item = instance.thumbitem;
					//leftface.style.height = leftface.clientHeight + 'px';

					// center image
					// var width = (leftface.clientWidth / 2) - (mediaon.clientWidth / 2);
					// hide image
					var width = ((leftface.clientWidth / 2) - (mediaon.clientWidth / 2)) + mediaon.clientWidth;

					mediaon.style.position = 'absolute';
					mediaon.setAttribute('class','oldmedia');

					var newmedia = instance.createNewItem(instance,leftface,'');

					if(instance.animation == 'fade'){
						instance.setAnimation({'oldm':mediaon,'newm':newmedia},'fadeOut',width,width,'start',instance);
					}else if(instance.animation == 'flip'){
						instance.setAnimation({'oldm':mediaon,'newm':newmedia},'flipOut',width,width,'start',instance);
					}else {
						instance.setAnimation({'oldm':mediaon,'newm':newmedia},'slideOut',width,width,'start',instance);
					}

					if(!document.getElementById('loadingdiv')){
						var loading = document.createElement('div');
						loading.setAttribute('class','loading');
						loading.setAttribute('id','loadingdiv');
						loading.style.display = 'none';
						loading.innerHTML = instance.loading;
						leftface.appendChild(loading);
					}else {
						var loading = document.getElementById('loadingdiv');
					}

					// hide arrows when loading
					if(document.getElementById('nextarrow')){
						document.getElementById('nextarrow').style.display = 'none';
						document.getElementById('prevarrow').style.display = 'none';
					}

					instance.loadeditem = false;
					if(instance.thumbitem.type == 'video'){

						setTimeout(function(){
							loading.style.display = 'block';
						},500);

						var xtime = 0;
						// fallback - if still has not played by 6 seconds load video element
						var runtime = setInterval(function(){
							if(xtime > 6){
								// jpmpopup.toConsole(newmedia.readyState);
								clearInterval(runtime);
								if(!instance.loadeditem){
									instance.loadeditem = true;
									instance.onload(instance,newmedia,leftface,mediaon,loading);
								}
							}
							xtime++;
						},1000);

						// onloadeddata onloadstart
						newmedia.oncanplay = function(e) {
							clearInterval(runtime);
							if(!instance.loadeditem){
								instance.loadeditem = true;
								instance.onload(instance,newmedia,leftface,mediaon,loading);
							}
						}

					}else if(instance.thumbitem.type == 'image') {
						if(!instance.itemlist[instance.thumbitem.item].loaded){
							loading.style.display = 'block';
						}

						var xtime = 0;
						// fallback - if still has not loaded by 6 secs force load
						var runtime = setInterval(function(){
							if(xtime > 6){
								// jpmpopup.toConsole(newmedia.readyState);
								clearInterval(runtime);
								if(!instance.loadeditem){
									instance.loadeditem = true;
									instance.onload(instance,newmedia,leftface,mediaon,loading);
								}
							}
							xtime++;
						},1000);

						newmedia.onload = function(e) {
							clearInterval(runtime);
							if(!instance.loadeditem){
								instance.loadeditem = true;
								instance.onload(instance,newmedia,leftface,mediaon,loading);
							}
						}
					}else if(instance.thumbitem.type == 'iframe') {
						loading.style.display = 'block';
						newmedia.onload = function(e) {
							instance.onload(instance,newmedia,leftface,mediaon,loading);
						}
					}else {
						instance.onload(instance,newmedia,leftface,mediaon,loading);
					}

					// in case of error, remove item
					newmedia.onerror = function(){
						instance.errorLoading(instance,newmedia,mediaon,leftface,'Sorry, there was a error loading the item.');
					}
			}
		}
	}

	jpmpopup.prototype.errorLoading = function (instance,newmedia,mediaon,leftface,mesg){

		jpmpopup.pop.animationStatus = 'error';
		if(mediaon != ''){
			mediaon.style.display = 'none';
			mediaon.remove();
		}
		newmedia.style.display = 'none';
		newmedia.remove();
		if(!document.getElementById('errmsgdiv')){
			var errmsg = document.createElement('div');
			errmsg.setAttribute('class','errmsg');
			errmsg.setAttribute('id','errmsgdiv');
			errmsg.style.display = 'block';
			leftface.appendChild(errmsg);
		}else {
			var errmsg = document.getElementById('errmsgdiv');
			errmsg.style.display = 'block';
		}
		errmsg.innerHTML = '<span style="color:red;font-size:1.5em">'+mesg+'</span>';

		if(document.getElementById('nextarrow')){
			document.getElementById('nextarrow').style.display = 'block';
			document.getElementById('prevarrow').style.display = 'block';
		}
	}

	jpmpopup.prototype.onload = function (instance,newmedia,leftface,mediaon,loading) {

		if(document.getElementById('loadingdiv')){
			loading.remove();
		}

		if(document.getElementById('nextarrow')){
			document.getElementById('nextarrow').style.display = 'block';
			document.getElementById('prevarrow').style.display = 'block';
		}

		if(instance.thumbitem.type == 'video'){
			newmedia.oncanplay = function(e) {};
			newmedia.onloadeddata = function(e) {};
		}
		newmedia.style.display = 'block';

		var width = ((leftface.clientWidth / 2) - (newmedia.clientWidth / 2)) + newmedia.clientWidth;

		if(instance.animation == 'fade')
		{
			instance.setAnimation({'oldm':mediaon,'newm':newmedia},'fadeIn',width,leftface.clientWidth,'onload',instance);
		} else if(instance.animation == 'flip') {
			instance.setAnimation({'oldm':mediaon,'newm':newmedia},'flipIn',width,leftface.clientWidth,'onload',instance);
		}else {
			instance.setAnimation({'oldm':mediaon,'newm':newmedia},'slideIn',width,leftface.clientWidth,'onload',instance);
		}

		jpmpopup.pop.mediaon = mediaon;
		jpmpopup.pop.newmedia = newmedia;
		jpmpopup.pop.leftfaceElement = leftface;
		jpmpopup.pop.loadingElement = loading;

		instance.disconnectEvent(newmedia,'transitionend',jpmpopup.prototype.endOfAnimation);
		instance.connectEvent(newmedia,'transitionend',jpmpopup.prototype.endOfAnimation);

		instance.onslideend();
		instance.navigation(instance.container);
		instance.itemlist[instance.thumbitem.item].loaded = true;

	}

	jpmpopup.prototype.endOfAnimation = function (e){

		var mediaon = jpmpopup.pop.mediaon;
		var newmedia = jpmpopup.pop.newmedia;
		var leftface = jpmpopup.pop.leftfaceElement;
		var loading = jpmpopup.pop.loadingElement;
		var instance = jpmpopup.pop;
		instance.disconnectEvent(newmedia,'transitionend',jpmpopup.prototype.endOfAnimation);

		if(document.getElementById('loadingdiv')){
			loading.remove();
		}
		mediaon.style.display = 'none';
		mediaon.remove();
		var oldmedia = document.querySelectorAll('.oldmedia');
		for(var k = 0;k < oldmedia.length;k++){
			oldmedia[k].remove();
		}
		leftface.style.height = 'auto';
		jpmpopup.prototype.setNewFrameStyle(newmedia,instance);
		jpmpopup.pop.animationStatus = 'done';
		console.log(jpmpopup.pop.animationStatus);
	}

	jpmpopup.prototype.onKeyDown = function (e){
		e = e || window.event;
		if(e.target.matches("input") || e.target.matches("textarea")) return;
		if(e.keyCode == '39') {
			if(document.getElementById('navitem-1')){
				document.getElementById('navitem-1').click();
			}else {
				document.getElementById('navitem-0').click();
			}
		}else if(e.keyCode == '37') {
			if(document.getElementById('navitem-0')){
				document.getElementById('navitem-0').click();
			}
		}
	}

	jpmpopup.prototype.navigation = function(id){

		var instance = this;
		if(document.getElementById('navigation-'+id)){
			document.getElementById('navigation-'+id).remove();
		}

		// make sure left column exists with id
		if(document.getElementById(this.slideDivs.left) && this.item.index !== undefined){

		var popup = document.getElementById(id);
		var viewer = this.wrap.querySelector('#'+this.slideDivs.left);
		var zindex = popup.style.zIndex;
		var index = parseInt(zindex) + 2;
		var nav = document.createElement('div');
		nav.setAttribute('class','navigation');
		nav.setAttribute('id','navigation-'+id);
		viewer.appendChild(nav);
		nav.style.zIndex = index;
		nav.style.position = 'absolute';
		//nav.style.bottom = '0';
		//nav.style.left = '0';
		var next = this.item.item + 1;
		var prev = this.item.item - 1;

		if(this.item.type == 'image'){
			if(!document.getElementById('fullsizeimg')){
				var fullsizeimg = document.createElement('div');
				fullsizeimg.setAttribute('class','fullsizeimg');
				fullsizeimg.setAttribute('id','fullsizeimg');
				fullsizeimg.innerHTML = '<a href="'+this.item.file+'" target="_blank" class="newtab"></a><a href="javascript:void(0)" onclick="jpmpopup.controller.hideSidebar()" class="hidesidebar"></a>';
				viewer.appendChild(fullsizeimg);
			}
		}else {
			if(!document.getElementById('fullsizeimg')){
				var fullsizeimg = document.createElement('div');
				fullsizeimg.setAttribute('class','fullsizeimg');
				fullsizeimg.setAttribute('id','fullsizeimg');
				fullsizeimg.innerHTML = '<a href="javascript:void(0)" onclick="jpmpopup.controller.hideSidebar()" class="hidesidebar"></a>';
				viewer.appendChild(fullsizeimg);
			}
		}

		if(instance.itemlist.length == 1){
			document.getElementById("media-"+this.item.index).style.cursor = 'unset';
			nav.style.display = 'block';
			return false;
		}

		// create left/right navigation arrows
		// place under navigation thumbs

		if(!document.getElementById('arrow-right-'+id)){
			var arrowRight = document.createElement('div');
			arrowRight.setAttribute('class','arrow-right');
			arrowRight.setAttribute('id','arrow-right-'+id);
			arrowRight.style.zIndex = index - 1;
			arrowRight.innerHTML = '<a href="javascript:void(0)" onclick="document.getElementById(\'navitem-1\').click();" data-uid="5fc4a4cb9ed310-48740143" id="nextarrow"><i class="arrow arrowright"></i></a>';
			arrowRight.style.display = 'none';
			viewer.appendChild(arrowRight);
		}else {
			var arrowRight = document.getElementById('arrow-right-'+id);
			arrowRight.style.display = 'none';
		}

		if(!document.getElementById('arrow-left-'+id)){
			var arrowLeft = document.createElement('div');
			arrowLeft.setAttribute('class','arrow-left');
			arrowLeft.setAttribute('id','arrow-left-'+id);
			arrowLeft.style.zIndex = index - 1;
			arrowLeft.innerHTML = '<a href="javascript:void(0)" onclick="document.getElementById(\'navitem-0\').click();" data-uid="5fc4a4cb9ed310-48740143" id="prevarrow"><i class="arrow arrowleft"></i></a>';

			arrowLeft.style.display = 'none';
			viewer.appendChild(arrowLeft);

			// keydown
			this.disconnectEvent(document,'keydown',this.onKeyDown);
			this.connectEvent(document,'keydown',this.onKeyDown);

		}else {
			var arrowLeft = document.getElementById('arrow-left-'+id);
			arrowLeft.style.display = 'none';
		}


		// on last item
		if(this.gallerytotal == this.item.index + 1){
			arrowLeft.style.display = 'flex';
			arrowRight.style.display = 'none';
			arrowLeft.innerHTML = '<a href="javascript:void(0)" onclick="document.getElementById(\'navitem-0\').click();" data-uid="5fc4a4cb9ed310-48740143" id="prevarrow"><i class="arrow arrowleft"></i></a>';
			next = 0;
			var list = this.itemlist[prev];
			if(list.type == 'image' && !this.preload){
				var img = new Image();
				img.src = list.file;
			}
			nav.innerHTML = '<span class="nav"><img class="navthumb" src="'+list.src+'" alt="'+list.about+'" data-id="'+list.id+'" data-type="'+list.type+'" data-file="'+list.file+'" data-about="'+list.about+'" data-index="'+list.index+'" data-item="'+list.item+'" data-height="'+list.height+'" data-width="'+list.width+'" data-allow="'+list.allow+'" data-filetype="'+list.srctype+'" /></span>';
		}
		else if(this.item.index == 0){
		// on first item
			arrowRight.style.display = 'flex';
			arrowLeft.style.display = 'none';
			arrowRight.innerHTML = '<a href="javascript:void(0)" onclick="document.getElementById(\'navitem-0\').click();" data-uid="5fc4a4cb9ed310-48740143" id="nextarrow"><i class="arrow arrowright"></i></a>';
			prev = this.gallerytotal - 1;
			var list = this.itemlist[next];
			if(list.type == 'image' && !this.preload){
				var img = new Image();
				console.log(list.file);
				img.src = list.file;
			}
			nav.innerHTML = '<span class="nav"><img class="navthumb" src="'+list.src+'" alt="'+list.about+'" data-id="'+list.id+'" data-type="'+list.type+'" data-file="'+list.file+'" data-about="'+list.about+'" data-index="'+list.index+'" data-item="'+list.item+'" data-height="'+list.height+'" data-width="'+list.width+'" data-allow="'+list.allow+'" data-filetype="'+list.srctype+'" /></span>';
		}
		else {
			arrowLeft.style.display = 'flex';
			arrowLeft.innerHTML = '<a href="javascript:void(0)" onclick="document.getElementById(\'navitem-0\').click();" data-uid="5fc4a4cb9ed310-48740143" id="prevarrow"><i class="arrow arrowleft"></i></a>';
			arrowRight.style.display = 'flex';
			arrowRight.innerHTML = '<a href="javascript:void(0)" onclick="document.getElementById(\'navitem-1\').click();" data-uid="5fc4a4cb9ed310-48740143" id="nextarrow"><i class="arrow arrowright"></i></a>';
			var list = this.itemlist[prev];
			if(list.type == 'image' && !this.preload){
				var img = new Image();
				img.src = list.file;
			}
			var list2 = this.itemlist[next];
			if(list2.type == 'image' && !this.preload){
				var img2 = new Image();
				img2.src = list2.file;
			}
			nav.innerHTML = '<span class="nav"><img class="navthumb" src="'+list.src+'" alt="'+list.about+'" data-id="'+list.id+'" data-type="'+list.type+'" data-file="'+list.file+'" data-about="'+list.about+'" data-index="'+list.index+'" data-item="'+list.item+'" data-height="'+list.height+'" data-width="'+list.width+'" data-allow="'+list.allow+'" data-filetype="'+list2.srctype+'" /></span> <span class="nav"><img class="navthumb" src="'+list2.src+'" alt="'+list.about+'" data-id="'+list2.id+'" data-type="'+list2.type+'" data-file="'+list2.file+'" data-about="'+list2.about+'" data-index="'+list2.index+'" data-item="'+list2.item+'" data-height="'+list2.height+'" data-width="'+list2.width+'" data-allow="'+list2.allow+'" data-filetype="'+list2.srctype+'" /></span>';
		}


		if(instance.thumbnav == 'off'){
			nav.style.visibility = 'hidden';
		}

		nav.style.display = 'block';
		jpmpopup.pop = instance;
			// add onclick event for next prev thumbs
			var items = document.querySelectorAll('.nav');
			for(var k = 0;k < items.length;k++){
				var gitem = items[k].children[0];
					gitem.setAttribute('id','navitem-'+k);
					this.connectEvent(gitem,'click',this.addNavClicks);
				}
			this.touchDetect();
		}
	}

	jpmpopup.prototype.addNavClicks = function (e){

		if(document.getElementById('fullsizeimg')){
			document.getElementById('fullsizeimg').remove();
		}
		jpmpopup.controller.splitHorizontal('sidebar');
		var item = {
			'id' : this.getAttribute('data-id'),
			'type' : this.getAttribute('data-type'),
			'file' : this.getAttribute('data-file'),
			'about': this.getAttribute('data-about'),
			'width': this.getAttribute('data-width'),
			'height': this.getAttribute('data-height'),
			'allow': this.getAttribute('data-allow'),
			'srctype': this.getAttribute('data-filetype'),
			'index': parseInt(this.getAttribute('data-index')),
			'item': parseInt(this.getAttribute('data-item')),
			'src': this.getAttribute('src'),
			'clickedid': this.getAttribute('id'),
			'clicked':'navigation'
		};
		jpmpopup.pop.thumbitem = item;
		jpmpopup.pop.item.clicked = 'navigation';

		jpmpopup.prototype.animate();

		//instance.onclick(instance.item);
		var popcode = item.id.replace('-','');

		eval("jpmpopup.pop.onclick(item);");
		var sidebar = jpmpopup.pop.wrap.querySelector("#"+jpmpopup.pop.slideDivs.right);
		if(jpmpopup.pop.sidebar == 'off'){
			sidebar.style.display = 'none';
		}else {
			sidebar.innerHTML = jpmpopup.pop.item.data;
			sidebar.style.display = 'flex';
		}
	}

	jpmpopup.prototype.close = function(id){

		window.document.body.style.overflow = 'auto';
		var popup = document.getElementById(id);

		// if cleanup set
		// always clean for now
		//if(jpmpopup.controller.newOverlay){
			if(popup){
				popup.remove();
			}
		//}

		if(document.getElementById(jpmpopup.controller.slideDivs.left)){
			jpmpopup.pop.wrap.querySelector("#"+jpmpopup.controller.slideDivs.left).innerHTML = '';
		}

		if(document.getElementById('navigation-'+id)){
			document.getElementById('navigation-'+id).remove();
		}

		if(document.getElementById(jpmpopup.controller.galleryButton)){
			document.getElementById(jpmpopup.controller.galleryButton).style.display = 'none';
		}
		if(popup){
			var bg = popup.style;
			bg.display = 'none';
		}
		if(jpmpopup.controller.underlay !== undefined) {
			if(document.getElementById('underlay-'+id)){
				document.getElementById('underlay-'+id).style.display = 'none';
			}
		}
		jpmpopup.controller.onclose(id);
	}
	jpmpopup.prototype.in_array = function in_array(needle, haystack){
		var found = 0;
		for (var i=0, len=haystack.length;i<len;i++) {
			if (haystack[i] == needle) return i;
			found++;
		}
		return false;
	}
	jpmpopup.prototype.connectEvent = function(e,a,func,mode,index) {
		if(e !== null){

			// collect event listeners attached
			//var args = [arguments[1],arguments[0]];
			//if(!jpmpopup.prototype.in_array(index,jpmpopup.eventlist)){
				//jpmpopup.eventlist.push.apply(jpmpopup.eventlist,args);
			//}

			if(mode === undefined){
				(e.addEventListener) ? e.addEventListener(a,func,false) : e.attachEvent('on'+a,func);
			}else {
				(e.addEventListener) ? e.addEventListener(a,func,mode) : e.attachEvent('on'+a,func);
			}
		}
	}
	jpmpopup.prototype.disconnectEvent = function(e,a,func,mode) {
		if(e !== null){
			if(mode === undefined){
				(e.removeEventListener) ? e.removeEventListener(a,func,false) : e.detachEvent('on'+a,func);
			}else {
				(e.removeEventListener) ? e.removeEventListener(a,func,mode) : e.detachEvent('on'+a,func);
			}
		}
	}

	jpmpopup.prototype.dragFace = function (e){
		e = e || window.event;
		e.preventDefault();
		jpmpopup.pop.item.clicked = 'dragging';
		if(document.getElementById('media-'+jpmpopup.controller.item.index)){
			var item = document.getElementById('media-'+jpmpopup.controller.item.index);
			item.style.cursor = 'grabbing';
			item.style.position = 'absolute';
			item.style.transition = 'transform 1s ease';
			var leftface = jpmpopup.pop.wrap.querySelector("#"+jpmpopup.controller.slideDivs.left);
			//var pos1 = jpmpopup.controller.ydown - e.clientY;
			//var pos2 = jpmpopup.controller.xdown - e.clientX;
			var center = (leftface.clientWidth / 2) - (item.clientWidth / 2);
			//item.style.left = center + 'px';
			var offset = parseInt(center - item.offsetTop);
			if (e.clientX < jpmpopup.controller.xdown) {
				if(offset < 1)
				{
					item.style.transform = 'translateX(0px)';
				}else {
					item.style.transform = 'translateX(-'+offset+'px)';
				}
			}else {
				if(offset < 1)
				{
					item.style.transform = 'translateX(0px)';
				}else {
					item.style.transform = 'translateX('+offset+'px)';
				}
			}
		}
		//this.style.top = (this.offsetTop - pos2) + 'px';
		//e.dataTransfer.setDragImage(new Image(), 0, 0);
	}

	jpmpopup.prototype.dragStartFace = function (e){
		e = e || window.event;
		e.preventDefault();
		jpmpopup.controller.splitHorizontal('sidebar');
		jpmpopup.controller.xdown = e.clientX;
		jpmpopup.controller.ydown = e.clientY;
		var leftface =  document.getElementById(jpmpopup.controller.slideDivs.left);
		jpmpopup.prototype.connectEvent(leftface,'mouseup',jpmpopup.prototype.dragEndFace);
		jpmpopup.prototype.connectEvent(leftface,'mousemove',jpmpopup.prototype.dragFace);
		//e.dataTransfer.setDragImage(new Image(), 0, 0);
		//jpmpopup.controller.xdown = e.screenX;
	}

	jpmpopup.prototype.dragEndFace = function (e){

		e = e || window.event;
		e.preventDefault();

		var leftface = jpmpopup.pop.wrap.querySelector("#"+jpmpopup.controller.slideDivs.left);
		jpmpopup.prototype.disconnectEvent(leftface,'mouseup',jpmpopup.prototype.dragEndFace);
		jpmpopup.prototype.disconnectEvent(leftface,'mousemove',jpmpopup.prototype.dragFace);

		if(document.getElementById('media-'+jpmpopup.controller.item.index)){
			var item = document.getElementById('media-'+jpmpopup.controller.item.index);
			item.style.cursor = 'grabbing';
		}
		if (!jpmpopup.controller.xdown ) {
			return;
		}

		var xUp = e.clientX;
		var yUp = e.clientY;
		var xDifference = jpmpopup.controller.xdown - xUp;
		var yDifference = jpmpopup.controller.ydown - yUp;

		if (Math.abs(xDifference) > Math.abs(yDifference)) {
			if (xDifference > 0) {
				//next
				if(document.getElementById('navitem-1')){
					document.getElementById('navitem-1').click();
				}else {
					document.getElementById('navitem-0').click();
				}
			} else {
				if(document.getElementById('navitem-0')){
					document.getElementById('navitem-0').click();
				}
			}
		} else {
			if (yDifference > 0) {
				jpmpopup.toConsole('up');
			} else {
				jpmpopup.toConsole('down');
			}
		}
		jpmpopup.controller.xdown = null;
		jpmpopup.controller.ydown = null;

		/*
		if (e.clientX < jpmpopup.controller.xdown) {
			if(document.getElementById('navitem-1')){
				document.getElementById('navitem-1').click();
			}else {
				if(document.getElementById('navitem-0')){
					document.getElementById('navitem-0').click();
				}
			}
		} else if (e.clientX > jpmpopup.controller.xdown) {
			if(document.getElementById('navitem-0')){
				document.getElementById('navitem-0').click();
			}
		}
	   jpmpopup.controller.xdown = e.screenX;
	   */
	}

	jpmpopup.prototype.touchStartFace = function (e){
		e = e || window.event;
		jpmpopup.controller.xdown = e.touches[0].clientX;
		jpmpopup.controller.ydown = e.touches[0].clientY;
	}

	jpmpopup.prototype.touchFace = function (e){

		e = e || window.event;
	var leftface = jpmpopup.pop.wrap.querySelector("#"+jpmpopup.controller.slideDivs.left);
		if (!jpmpopup.controller.xdown || !jpmpopup.controller.ydown) {
			return;
		}
		var xUp = e.touches[0].clientX;
		var yUp = e.touches[0].clientY;
		var xDifference = jpmpopup.controller.xdown - xUp;
		var yDifference = jpmpopup.controller.ydown - yUp;

		if (Math.abs(xDifference) > Math.abs(yDifference)) {
			if (xDifference > 0) {
				//next
				if(document.getElementById('navitem-1')){
					document.getElementById('navitem-1').click();
				}else {
					document.getElementById('navitem-0').click();
				}
			} else {
				if(document.getElementById('navitem-0')){
					document.getElementById('navitem-0').click();
				}
			}
		} else {
			if (yDifference > 0) {
				jpmpopup.toConsole('up');
			} else {
				jpmpopup.toConsole('down');
			}
		}
		jpmpopup.controller.xdown = null;
		jpmpopup.controller.ydown = null;
	}

	jpmpopup.prototype.toConsole = function(){

		//jpmpopup.console.push.apply(jpmpopup.console, arguments);
		console.log.apply(console, arguments);
	}

	jpmpopup.prototype.touchDetect = function(){

		// for swipe events, face touching ;)
		// jpmpopup.toConsole('connecting drag and touch events');

		if(document.getElementById(this.slideDivs.left)){

			var leftface = this.wrap.querySelector("#"+this.slideDivs.left);
			var item = document.getElementById('media-'+this.item.index);
			jpmpopup.controller.item.index = this.item.index;
			if ("ontouchstart" in window || window.TouchEvent || navigator.maxTouchPoints){
				// touch
				this.disconnectEvent(leftface,'mouseup',this.dragEndFace);
				this.disconnectEvent(leftface,'mousemove',this.dragFace);
				this.disconnectEvent(leftface,'mousedown',this.dragStartFace);
				this.connectEvent(leftface,'mousedown',this.dragStartFace);
				this.disconnectEvent(leftface,'touchmove',this.touchFace,'{capture: true, passive: true}');
				this.connectEvent(leftface,'touchmove',this.touchFace,'{capture: true, passive: true}');
				this.disconnectEvent(leftface,'touchstart',this.touchStartFace,'{capture: true, passive: true}');
				this.connectEvent(leftface,'touchstart',this.touchStartFace,'{capture: true, passive: true}');

			}else {
				// drag
				this.disconnectEvent(leftface,'mouseup',this.dragEndFace);
				this.disconnectEvent(leftface,'mousemove',this.dragFace);
				this.disconnectEvent(leftface,'mousedown',this.dragStartFace);
				this.connectEvent(leftface,'mousedown',this.dragStartFace);
			}
		}
	}
