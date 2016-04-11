function MI(){ /* Media Interface */
	function MediaObject(id){
		this.o=_define(id,_root);
		this.state=false;
		this.context=null;
		this.scale=1;
	};		
	MediaObject.prototype.cloak=function(){ this.o.style.display="none"; };
	MediaObject.prototype.reveal=function(){ this.o.style.display="block"; };
	MediaObject.prototype.clear=function(){ if(this.context!==null) _clear(this.o); };
	MediaObject.prototype.append=function(element){ this.o.appendChild(element); };
	MediaObject.prototype.remove=function(element){ this.o.removeChild(element); };
	MediaObject.prototype.reset=function(){ this.state=false; this.context=null; this.scale=1; };
	MediaObject.prototype.setcss=function(css){ this.o.style.cssText=css; };
	MediaObject.prototype.prev=function(){

	};
	MediaObject.prototype.next=function(){
	 	var next=_findparent(element,"table").nextElementSibling;
	};
	MediaObject.prototype.allowdrag=function(name){
	 	this.o.style.cursor='move';
	 	if(typeof name==='undefined') var name='';
	 	var control=_id("controls_"+name); if(typeof control!=='undefined') controlledElement=control.parentNode;
	 	var d_selected=null, d_x_pos=0, d_y_pos=0, d_x_elem=0, d_y_elem=0;
		function drag_init(elem){
			d_selected=elem;
			d_x_elem=d_x_pos-d_selected.offsetLeft;
			d_y_elem=d_y_pos-d_selected.offsetTop;
		}
		function drag_move_elem(e){
			d_x_pos=document.all?window.event.clientX:e.pageX;
			d_y_pos=document.all?window.event.clientY:e.pageY;
			if(d_selected!==null) {
				d_selected.style.left=(d_x_pos-d_x_elem)+'px';
				d_selected.style.top=(d_y_pos-d_y_elem)+'px';
			}
		}
		function drag_destroy(){ d_selected=null; }
		document.onmousemove=drag_move_elem;
		document.onmouseup=drag_destroy;
		control.onmousedown=function(event){ drag_init(controlledElement); return false; }
	};
	var c={
		imageViewer:'zs-img',
		audioViewer:'zs-aud',
		videoViewer:'zs-vid',
		flashViewer:'zs-fla',
	};
	MI.start=function(){
		for(var v in c) { c[v]=new MediaObject(c[v]); }

		MI.areainit(document);

		/*
		_id('zs-img-openall').onclick=function(){
			this.innerHTML=(this.innerHTML==txt.mi_img_openall ? txt.mi_img_closeall : txt.mi_img_openall);
			_apply('.reply > a, .postnode > a',function(e){ MI.expandImageInline(event,e); });
		};*/
		
		log(tag.mi+txt.module_started);
	};
	MI.areainit=function(area){
		_each(area.querySelectorAll('.reply > a, .postnode > a, .inline-img, .embed'),MI.handlermedia);
		_each(area.querySelectorAll('input[name="post[]"]'),MI.handlerinputs);
	};
	MI.handlerinputs=function(element){
		element.addEventListener('click',function(event){
			if(this.checked) userdelete_i++;
			else userdelete_i--;
			userdelete_b.style.display=(userdelete_i > 0)?"block":"none";
		});
	};
	MI.mediatype=function(url){
		if(url===undefined) return 0;
		switch((/\.((webm(?:&|$)|mp4)|(ogg|mp3|aac|wav)|(swf)|(jpe?g|a?png|gif))(?:$|&)/gi.exec(url))[1]){
			case 'webm':
			case 'mp3':
				return 1;
			case 'ogg':
			case 'mp3':
			case 'aac':
			case 'wav':
				return 2;
			case 'swf':
				return 3;
			case 'jpg': case 'jpeg':
			case 'png': case 'apng':
			case 'gif':
				return 4;
			default: return -1;
		}
		return false;
	};
	MI.handlermedia=function(element){
		element.addEventListener('click',function(event){
			var mediatype=MI.mediatype(this.href);
			switch(mediatype){
				case 0:
				case 1:
				case 2:
				case 3:
					MI.expandEmbed(event,this,mediatype);
					break;
				case 4:
					MI.expandImage(event,this);
					break;
				default:break;
			}
			return false;
		});
	};

	MI.drag=function(e,el){
		if(e.which!==1) return true;
		e.preventDefault();
		var element=e.target; if(el!==undefined) element=el;
		switch (e.type) {
			case 'mousedown'://log(tag.mi+'mousedown');
				drag_moved=false;
				drag_lX=e.clientX; drag_lY=e.clientY;
				element.addEventListener('mouseup',MI.drag);
				element.addEventListener('mousemove',MI.drag);
				return;
			case 'mousemove'://log(tag.mi+'mousemove');
				drag_curX=e.clientX, drag_curY=e.clientY;
				if (drag_curX!==drag_lX || drag_curY!==drag_lY) {
					element.style.left=(drag_lL=parseInt(element.style.left,10)+drag_curX-drag_lX)+'px';
					element.style.top=(drag_lT=parseInt(element.style.top,10)+drag_curY-drag_lY)+'px';
					drag_lX=drag_curX; drag_lY=drag_curY;
					drag_moved=true;
				}
				return;
			case 'mouseup'://log(tag.mi+'mouseup (moved:'+drag_moved+')');
				element.removeEventListener('mousemove',MI.drag);
				element.removeEventListener('mouseup',MI.drag);
				if(!drag_moved) {
					_remove(element);
					c.imageViewer.reset();
					return false;
				}
				return;
			case 'mousewheel'://log(tag.mi+'wheel');
				MI.wheel(this,MI.resize);
				return;
			default:break;
		}
		return false;
	};
	MI.wheel=function(elem,handler){
		if (elem.addEventListener) {
			if ('onwheel' in document) elem.addEventListener("wheel", handler); // IE9+, FF17+
			else if ('onmousewheel' in document) elem.addEventListener("mousewheel", handler); // устаревший вариант события
			else elem.addEventListener("MozMousePixelScroll", handler); // 3.5 <= Firefox < 17, более старое событие DOMMouseScroll пропустим
		} else elem.attachEvent("onmousewheel", handler); // IE8-
	};
	MI.resize=function(e){
		var delta=e.deltaY||e.detail||e.wheelDelta;
		if(c.imageViewer.scale<0.1) c.imageViewer.scale=0.1; if(c.imageViewer.scale>5) c.imageViewer.scale=5;
		if(c.imageViewer.scale>=0.1 && c.imageViewer.scale<=5){ if(delta>0) c.imageViewer.scale-=0.05; else c.imageViewer.scale+=0.05; }
		this.style.transform=this.style.WebkitTransform=this.style.MsTransform='scale('+c.imageViewer.scale+')';
		e.preventDefault();
	};
	MI.getaspect=function(ewidth,eheight,reduced){
		var width=ewidth, height=eheight, aspect=height/width,
			maxw=reduced&&window.innerWidth/2||window.innerWidth, maxh=reduced&&window.innerHeight/2||window.innerHeight, waspect=maxh/maxw;
		if(width>maxw || height>maxh){
			if(aspect>=waspect) { height=maxh; width=height/aspect|0; } // высокая
			else { width=maxw; height=width*aspect; } // щирокая
		}
		return {w:width,h:height,a:aspect,wa:waspect};
	};
	MI.setaspect=function(element){
		var aspect=MI.getaspect(element.width,element.height,false);
		element.width=aspect.w; element.height=aspect.h;
	};
	MI.center=function(element){
		element.style.top=((window.innerHeight-element.offsetHeight)/2)+"px";
		element.style.left=((window.innerWidth-element.offsetWidth)/2)+"px";
	};
	MI.controls=function(name){
		var close=_create('i');
			close.className="fa fa-close";
			close.onclick=function(){ _clear(this.parentNode.parentNode); };
		var _controls=_create('div');
			_controls.id="controls_"; if(name!==undefined) _controls.id+=name;
			_controls.appendChild(close);
			_controls.style.pointer="move";
		return _controls;
	};
	MI.expandImageInline=function(event,element){
		event.preventDefault();
		var thumb=element.children[0]; if(thumb==null) return false;
		if(thumb.dataset.state==1) {
			var image_closed=_create('img');
				image_closed.src=element.dataset.thumbsrc;
				image_closed.width=element.dataset.thumbw;
				image_closed.height=element.dataset.thumbh;
				image_closed.classList.add('thumb');
			_clear(thumb);
			thumb.appendChild(image_closed);
			thumb.dataset.state=0;
		}
		else {
			var image=thumb.children[0];
				image_opened=_create('img');
				image_opened.src=element.href;
				image_opened.alt='full';
				image_opened.classList.add('thumb');
			element.dataset.thumbsrc=image.src;
			element.dataset.thumbw=image.width;
			element.dataset.thumbh=image.height;
			image_opened.onload=function(){
				var max_w=document.documentElement?document.documentElement.clientWidth:document.body.clientWidth,
					offset=100,
					ratio=image_opened.width/image_opened.height,
					new_w=(image_opened.width>max_w ? max_w-offset : image_opened.width-30), new_h=new_w/ratio,
					zoom=1-new_w/image_opened.width,
					notice=_create('div'), br=_create('br');
				notice.classList.add('filesize');
				notice.style.textDecoration='underline';
				notice.innerHTML="Картинка ужата на "+(zoom*100|0)+"%";
				image_opened.width=new_w; image_opened.height=new_h;
				_clear(thumb);
				thumb.appendChild(notice);
				thumb.appendChild(br);
				thumb.appendChild(image_opened);
				thumb.dataset.state=1;
			};
		}				
		return false;
	};
	MI.expandImageFloat=function(event,element){
		event.preventDefault();
		loading(1);
		c.imageViewer.clear();
		if(c.imageViewer.state && c.imageViewer.context===element){
			c.imageViewer.context=null;
			c.imageViewer.state=false;
			document.removeEventListener('keydown',keypressed);
			return false;
		}
		c.imageViewer.context=element;
		document.addEventListener('keydown',keypressed);
		function keypressed(event){
			if(event.keyCode==27) { // esc
				c.imageViewer.clear();
				c.imageViewer.reset();
				document.removeEventListener('keydown',keypressed);
			}
			if(event.keyCode==37) { // left
				c.imageViewer.prev();
			}
			if(event.keyCode==39) { // right
				c.imageViewer.next();
			}
		}
		var expand=function(element){
			c.imageViewer.cloak();
			var img=_create("img");
				img.src=element.href;
				img.id="zs-img-expaned";
				img.style.position="fixed";
				img.style.border="1px solid black";
				img.style.cursor="pointer";
				img.onload=function(){ MI.setaspect(img); MI.center(img); loading(0); };
				img.onmousedown=function(event){ MI.drag(event); return false; };
				img.onclick=function(event){ MI.drag(event); return false; };
				img.onkeydown=function(event){ c.imageViewer.clear(); c.imageViewer.reset(); loading(0); return false; };
				img.onerror=function(event){ c.imageViewer.state=false; _remove(this); loading(0); return false; };
			MI.wheel(img,MI.resize);
			c.imageViewer.context=element;
			c.imageViewer.append(img);
			c.imageViewer.reveal();
			c.imageViewer.scale=1;
			c.imageViewer.state=true;
			return false;
		};
		return expand(element);
	};
	MI.expandImage=function(event,element){ /* image handler :: post image */
		if(typeof element==='undefined') return err(tag.mi+txt.mi_noimage);
		if(event.which===2 || event.which===3) return true;
		if(opt.img && !(event.ctrlKey && element.classList.contains('inline-img'))) return MI.expandImageFloat(event,element);
		return MI.expandImageInline(event,element);
	};

	MI.expandEmbed=function(event,element,type) { /* embed handler :: post embed[ytube/coub/vimeo,audio/video,flash] */
		if(event.ctrlKey || event.which!==1 || element===undefined || type===undefined) return false;
		event.preventDefault();

		switch(type){
			case 0: // external
			case "youtube":
			case "coub":
			case "vimeo": if(!opt.vid) return true;
				var aspect=MI.getaspect(element.dataset.width||640,element.dataset.height||480,true),
					www=element.dataset.id; if(!www) return false;
				c.videoViewer.clear();
				if(c.videoViewer.state && c.videoViewer.context===element){
					c.videoViewer.context=null;
					c.videoViewer.state=false;
					return false;
				}
				c.videoViewer.context=element;
				c.videoViewer.cloak();
				if(element.classList.contains('youtube'))
					c.videoViewer.append(MI.createObject('iframe',{src:txt.mi_link_yt+www+txt.mi_linkargs_yt}));
				if(element.classList.contains('coub'))
					c.videoViewer.append(MI.createObject('iframe'),{src:txt.mi_link_cb+www+txt.mi_linkargs_cb});
				if(element.classList.contains('vimeo'))
					c.videoViewer.append(MI.createObject('iframe',{src:txt.mi_link_vm+www+txt.mi_linkargs_vm}));
				c.videoViewer.append(MI.controls("video"));
				c.flashViewer.allowdrag("video");
				c.flashViewer.setcss('top:100px;left:45%;');
				c.videoViewer.reveal();
				break;
			case 1:
			case "video": if(!opt.vid) return true;
				var aspect=MI.getaspect(element.dataset.width||640,element.dataset.height||480,true),
					www=element.href; if(!www) return false;
				c.videoViewer.clear();
				if(c.videoViewer.state && c.videoViewer.context===element){
					c.videoViewer.context=null;
					c.videoViewer.state=false;
					return false;
				}
				c.videoViewer.context=element;
				c.videoViewer.cloak();
				c.videoViewer.append(MI.createObject('video',{src:www,w:aspect.w,h:aspect.h}));
				c.videoViewer.append(MI.controls("video"));
				c.flashViewer.allowdrag("video");
				c.flashViewer.setcss('top:100px;left:45%;');
				c.videoViewer.reveal();
				break;
			case 2:
			case "audio": if(!opt.aud) return true;
				var www=element.href; if(!www) return false;
				pl.id='audioplayer';
				pl.appendChild(MI.createObject('audio',{src:www}));
				pl.style.display="block";
				break;
			case 3:
			case "flash": if(!opt.fla) return true;
				var aspect=MI.getaspect(element.dataset.width||640,element.dataset.height||480,true),
					www=element.href; if(!www) return false;
				c.flashViewer.clear();
				if(c.flashViewer.state && c.flashViewer.context===element){
					c.flashViewer.context=null;
					c.flashViewer.state=false;
					return false;
				}
				c.flashViewer.context=element;
				c.flashViewer.cloak();
				c.flashViewer.append(MI.createObject('swf',{
					src:www,
					swf:{
						attr:{
							id:'flashobject',
							width:aspect.w,
							height:aspect.h
						},
						param:{
							wmode: 'transparent'
						}
					}
				}));
				c.flashViewer.append(MI.controls("flash"));
				c.flashViewer.allowdrag("flash");
				c.flashViewer.setcss('top:100px;left:45%;');
				c.flashViewer.reveal();
				break;
			default:return true;
		}
		return false;
	};
	MI.createObject=function(type,args){ /* object generator [swf|video|iframe] */
		if(typeof type==='undefined') return;
		console.log(args);
		var swf=function(args){
			var src=args.src,attributes=args.swf.attr||{},parameters=args.swf.param||{};
			function IEobject(url){
				var o=_create("div");
				o.innerHTML="<object classid='clsid:D27CDB6E-AE6D-11cf-96B8-444553540000'><param name='movie' value='"+url+"'></object>";
				return o;
			}
			isMSIE=false,
			obj=(isMSIE?IEobject(src):_create("object"));
			if(!isMSIE){
				obj.setAttribute("type","application/x-shockwave-flash");
				obj.setAttribute("data",src);
			}
			for (i in attributes) { obj.setAttribute(i, attributes[i]); }
			var param_flashvars=_create("param");
			for(i in parameters){ param_flashvars.setAttribute(i, parameters[i]); }
			obj.appendChild(param_flashvars);
			return obj;
		};
		var vid=function(args) {
			var video=_create("video"),
				type='video/'+getext(args.src);
			if (video.canPlayType(type).length > 0) {
				video.src=src;
				video.type=type;
				video.autoPlay=true;
			}
			video.onmousedown=function(event){ MI.drag(event); return false; };
			video.onclick=function(event){ MI.drag(event); return false; };
			video.onerror=function(event){ c.videoViewer.state=false; _remove(this); return false; };
			return video;
		};
		var aud=function(args) { // @todo: real player
			var audio=_create("audio"),
				type='video/'+getext(args.src);
			if (audio.canPlayType(type).length > 0) {
				audio.src=args.src;
				audio.type=type;
				audio.autoPlay=true;
			}
			return audio;
		};
		var frm=function(args) {
			var iframe=_create("iframe");
			iframe.width=args.w||640; iframe.height=args.h||480;
			iframe.src=args.src;
			iframe.allowfullscreen=true;
			iframe.frameborder=0;
			return iframe;
		};
		switch(type){
			case 'swf': return swf(args);
			case 'video': return vid(args);
			case 'audio': return aud(args);
			case 'iframe': return frm(args);
			default: return;
		}
	};
};