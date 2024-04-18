jQuery(document).ready(function($){
	var xx,yy,XX,YY,swipeX,swipeY ;
	$(document).on('touchstart',function(event){
		xx = event.originalEvent.changedTouches[0].screenX;
		yy = event.originalEvent.changedTouches[0].screenY;
		swipeX = true;
		swipeY = true ;
	});
	$(document).on('touchmove',function(event){
		XX = event.originalEvent.changedTouches[0].screenX;
		YY = event.originalEvent.changedTouches[0].screenY;
		if(swipeX && Math.abs(XX-xx)-Math.abs(YY-yy)>0)  //左右滑动
		{
			event.stopPropagation();//组织冒泡
			event.preventDefault();//阻止浏览器默认事件
			swipeY = false ;
			//左右滑动
		}
		else if(swipeY && Math.abs(XX-xx)-Math.abs(YY-yy)<0){  //上下滑动
			if((YY-yy) > 0){
				$('.header').css({'position':'fixed'}).slideDown('50');
			}else{
				$('.header').css({'position':'absolute'}).slideUp('50');
			}
			swipeX = false ;
			//上下滑动，使用浏览器默认的上下滑动
		}
	});
	var scrollTop;
	$(document).on('scroll',function(){
		scrollTop = $(document).scrollTop();
		if(scrollTop<60){
			$('.header').css({'position':'fixed'}).slideDown('50');
		}
	});


	//设置新闻头部高度
	function setTitleH(){
		var titleW = $('.topImg>img').width();
		var tilRatio = 240/150;//图片的宽高比
		var titleH = titleW/tilRatio;
		$('.topImg>img').height(titleH+"px"); 
	}
	setTitleH();

	//最下方评论宽度
	function width(){
		var win_W = $(window).width();
		var focus_W = win_W - 112;
		var comment_main_W=win_W - 80;
		$('.focus').width(focus_W);
		$('.comment_main').width(comment_main_W);//评论内容宽度

	}
	width();
	$('.news_content img').css({'max-width':'100%'});
	$('.news_content embed').css({'max-width':'95%'});
	$('.news_content iframe').css({'max-width':'95%','overflow':'hidden'});

	//设置分割线宽度
	function setline (){
		var winW = $(window).width();
		$('.partLine').width(winW);
	}
	setline();

	//图片下拉时加载
	$(".news_content img").lazyload({effect: "fadeIn", threshold: 80});

	//判断是否显示curr
	if($('.corr').find('.corrcartoon').length == 0 && $('.corr').find('.corrnoval').length == 0){
		$('.corr').remove();
	}
	if($('.corr').find('.corrcartoon').length!= 0 && $('.corr').find('.corrnoval').length != 0){
		$('.corr').find('.corrnoval').css({'margin-top':'25px'})
	}
});
