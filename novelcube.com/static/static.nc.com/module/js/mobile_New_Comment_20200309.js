

var static_domain = '';

(function($){
    $.fn.imgLoad=function(options){
        var defaults={
            imgEle:'.imgLoad',
            callBack:function(){}
        };

        opts=$.extend(defaults,options);
        var img=this.find(opts.imgEle),
            imgNum=img.length,
            imgSrcs=[],
            imgcounter=0;

        img.each(function(){
            if($(this).attr('src')){
                var imgSrc=$(this).attr('src');
                imgSrcs.push(imgSrc);
            }else{
                var urlStr=$(this).css('backgroundImage');
                var imgSrc=(urlStr.replace(/\"/g,'')).slice(4,-1);
                imgSrcs.push(imgSrc);
            };
        });
        $.each(imgSrcs,function(i,e){
            var imgDom=$('<img>');
            imgDom.attr('src',e);
            imgDom.get(0).onload=function(){
                imgcounter+=1;
                if(imgcounter===imgNum){
                    opts.callBack();
                };
            };
        });

    };
})(jQuery)

if($('#Comment_m_Box').length == 0 ){
    console.log('无评论载入div');
}else{
    $('body').append('<link rel="stylesheet" type="text/css" href="https://'+static_domain+'static.dmzj.com/public/css/swiper.min.css"><link rel="stylesheet" type="text/css" href="https://'+static_domain+'static.dmzj.com/module/css/mobile_n_comment2_17.3.css">  <script type="text/javascript" src="https://'+static_domain+'static.dmzj.com/public/js/swiper.min.js"></script>');

    var comicUrl ="https://interface.dmzj.com";//接口连接
    var Img_url = 'https://images.dmzj.com/';//图片地址
    var cb_url = "http://"+window.location.host+"/images";//当前窗口地址下图片
    var isIE = /msie/i.test(navigator.userAgent) && !window.opera;//IE浏览器当前窗口地址下图片
    var cur_page=1;//页数
    var upload_imgArr=[];//上传图片


    var htmlStr = '<div class="newsmain_review" id="Comment_main"> <a name="comm"></a><div class="newsHot"><a name="comm"></a><h3 class="comment_til">热门评论</h3><ul></ul></div><div class="partLine"></div><div class="newsAll"><h3 class="comment_til">最新评论</h3><ul> </ul> </div></div><div class="review_btm"><div class="fl" style="position:relative;width:75px;height:45px;display:inline-block;float:left;"><a href="#comm"><img src="/static.nc.com/module/images/review3.png" height="16" width="21"><span>11</span></a></div><div class="fl focus" style="position:relative;float:left;">吐槽来一发...</div></div><div class="hide" id="replyeff">发表成功 !</div><div class="mask hide"></div><div class="review_pop hide" style="display: none;"><textarea maxlength="1000" name="textareadiv"></textarea><div class="visiblity">请输入评论内容...</div><div class="text_length"><span>0</span>/1000字</div><div class="file_img"><ul><li class="add_img"></li></ul></div><div class="icon_com hide"><img src="/static.nc.com/module/images/icon_com_1.png" height="22" width="22"><img src="/static.nc.com/module/images/icon_com_2.png" height="22" width="22"><img src="/static.nc.com/module/images/icon_com_3.png" height="22" width="22"></div><div class="submit"><a id="cancel">取消回复</a><a id="submit">发表回复</a></div><iframe id="upload_target" name="upload_target" src="about:blank" style="display: none"></iframe><input type="hidden" id="hiddenInput" value=""><form class="hide" enctype="multipart/form-data" id="uploadForm" action="'+comicUrl+'/api/NewComment2/addImg?cb='+location.origin+'/images/conmment_cd.html" method="post" target="upload_target"><input type="file" id="fileupload" accept="image/*" multiple="multiple" name="userfile[]"><input type="submit" id="submitImg"></form></div>';

   // $('#Comment_m_Box').html(htmlStr);
    
    //获取登陆信息
    var comInfo = {
        user_photo:'',
        user_name : '',
        user_id : '',
        is_login : false,
        auth:function(myinfo){
            if(myinfo==''){
                return;
            }
            var photo = "https://avatar.dmzj.com/"+myinfo[3].substr(0,2)+"/"+myinfo[3].substr(2,2)+"/"+myinfo[3]+".png";
            comInfo.user_photo = photo;
            comInfo.user_name = decodeURI(myinfo[1]);
            comInfo.user_id = myinfo[0];
            comInfo.is_login = true;
        }
    };
    //获取Cookie
    function getCookie(){
        if($.cookie("my")!=='' && $.cookie("my") !=null){
            var myinfo = $.cookie("my").split("|");
            if(myinfo[0] == '' || myinfo[1] == '' ){
                $.cookie('my',null, {expires: -1, path: '/', domain: '.dmzj.com', secure: true});
                alert("请重新登陆！");
                myinfo = '';
            }
            comInfo.auth(myinfo);
        }
    }

    
    if( isToggle ){
        function toggloBTN (){
            var commToTop = $('#Comment_m_Box').offset().top;
            var window_height = $(window).height();
            var scroll_top=$(document).scrollTop();
            if( ( commToTop - window_height ) >= scroll_top ){
                $('.review_btm').hide();
            }else{
                $('.review_btm').show();
            }
        }

        toggloBTN();

        $(window).on('scroll',function(){
            toggloBTN();
        })
        
    }
   
    //获取评论总数
    function total(){
        
	var type;
        if(typeof(commment_type) == "undefined"){
            type = comment_type;
        }else{
            type = commment_type;
        }
	
        //var type = 4;
        var data = 'type='+type+'&obj_id='+obj_id+'&countType=1&authorId='+authoruid;
        var url = comicUrl+'/api/NewComment2/total';
        var success = function(callback){
            if(callback.result == 1000){
                $('#review em').html('('+callback.data+')');
                $('.review_btm .fl span').html(callback.data);

                if($('.fl span').html() == 0){
                    width();
                    var newsHot = $('.newsHot');
                    newsHot.next('.partLine').remove();
                    newsHot.remove();
                    $('#loading').remove();
                    $('.newsAll ul').append('还没有评论，快来抢占沙发吧！');
                }else{
                    hotComment();
                    allComment();
                }

            }
        };
        get_json(url,data,success);
    }
    total();

    // 对Date的扩展，将 Date 转化为指定格式的String
    // 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
    // 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
    // 例子：
    // (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
    // (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
    Date.prototype.Format = function(fmt)
    { //author: meizz
        var o = {
            "M+" : this.getMonth()+1,                 //月份
            "d+" : this.getDate(),                    //日
            "h+" : this.getHours(),                   //小时
            "m+" : this.getMinutes(),                 //分
            "s+" : this.getSeconds(),                 //秒
            "q+" : Math.floor((this.getMonth()+3)/3), //季度
            "S"  : this.getMilliseconds()             //毫秒
        };
        if(/(y+)/.test(fmt))
            fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
        for(var k in o)
            if(new RegExp("("+ k +")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
        return fmt;
    };

    //get跨域请求
    function get_json(url,data,callback,success_jsonpCallback) {
            $.ajax({
                type: 'get',
                url: url,
                cache: false,
                dataType: 'jsonp',
                jsonpCallback: success_jsonpCallback,
                data: data,
                timeout: 30000,
                success: function (json) {
                    callback(json);
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    callback({"succ": false, "msg": "未知错误"});
                }
            });
        }
    //请求热门评论
    var hotComment=function(){
        var url=comicUrl+"/api/NewComment2/list";
        if(!dt){
        	dt = '';
        }
        var data = "type="+comment_type+"&obj_id="+obj_id+"&hot=1&page_index=1&dt="+dt;
        get_json(url,data,function(json){
            if(json == ""){
                $('.newsHot ul').html("暂无评论");
                return false
            }else if(json.length <= 5){
                for(var i=0;i<json.length;i++){
                    var data =json[i];
                    var orig_comid=data.id;//原始评论id
                    var louName="0"+data.sender_uid+data.create_time+data.id+"1";//评论的lou的name值
                    var html = '';
                        html += '<li><div class="auimg"><img src="'+data.avatar_url+'" class="user_img" onerror="this.src='+"'https://avatar.dmzj1.com/default.png'"+'">';
                        if(data.sender_id==authoruid){
                            html +=  '<img src="https://'+static_domain+'static.dmzj.com/module/images/lable_author.png" class="user_label">';
                        }
                        html +=  '</div><div class="comment_main"><span class="user_name">'+data.nickname+'</span>'; 
                        console.log(html);
                        if(data.sex){html +=  '<img src="https://'+static_domain+'static.dmzj.com/module/images/sex_'+data.sex+'.png" class="sex">';}
                        if(data.isgood==1){
                            html +=  '<img src="https://'+static_domain+'static.dmzj.com/module/images/jing.png" class="jing">';
                        }      
                        html +=  '<div class="com_container">';
                        if(data.masterCommentNum!=0){
                            var masterjson=data.masterComment;//主评论数组
                            html += '<div class="masterCom">';
                            for(var j=0;j<masterjson.length;j++) {
                                var data2 = masterjson[j];
                                if(data2.content.length>100){
                                    html += '<div class="lou" name="'+louName+'"><p class="hei"><span><em>' + data2.nickname + '</em>：</span><span class="replyLou" onclick="reply(this,'+data2.sender_uid+','+data2.id+','+orig_comid+')">';
                                    html +=  ''+data2.content+'</p><span class="qw" onclick="opentext(this)">显示全文</span>';
                                }else{
                                    html += '<div class="lou" name="'+louName+'"><p><span><em>' + data2.nickname + '</em>：</span><span class="replyLou" onclick="reply(this,'+data2.sender_uid+','+data2.id+','+orig_comid+')">';
                                    html +=  ''+data2.content+'</p>';
                                }
                                if (data2.upload_images != "") {
                                    html += '<p class="reImg">';
                                    var upImg = data2.upload_images.split(",");
                                    for (var x = 0; x < upImg.length; x++) {
                                        var file_img = upImg[x].split(".")[0];
                                        var file_img_suffix = upImg[x].split(".")[1];
                                        html += '<span><img src="'+Img_url+'commentImg/'+data2.obj_id%500+'/'+ file_img+'_small.'+file_img_suffix + '" onclick="bigImg(this)">'+'</span>';
                                    }
                                    html += '</p>';
                                }
                                html += '<div class="masterNum">' + (j + 1) + '</div></div>';
                            }
                            html += '</div>';
                        }
                        if(data.content.length>100){
                            html +=  '<p class="hei">'+data.content+'</p><span class="qw" onclick="opentext(this)">显示全文</span>';
                        }else{
                            html +=  '<p>'+data.content+'</p>';
                        }
                        if(data.upload_images != ""){
                            html += '<p class="reImg">';
                            var upImg2 = data.upload_images.split(",");
                            for(var x=0; x < upImg2.length; x++){
                                var file_img = upImg2.split[x](".")[0];
                                var file_img_suffix = upImg2.split[x](".")[1];
                                html += '<span><img src="'+Img_url+'commentImg/'+data.obj_id%500+'/' + file_img+'_small.'+file_img_suffix + '" onclick="bigImg(this)">'+'</span>';
                            }
                            html += '</p>';
                        }
                        html +=  '</div>';
                        html +=  '<span class="user_time">'+(new Date(parseInt(data.create_time)*1000)).Format("MM-dd hh:mm:ss")+'</span>';
                        html +=  '<span class="review" onclick="reply(this,'+data.sender_uid+','+data.id+','+orig_comid+')">'+data.reply_amount+'</span>';
                        html +=  '<span class="praise" onclick="agree(this,'+data.id+')">'+data.like_amount+'</span></div></li>';
                    $('.newsHot ul').append(html);
                    if(data.masterCommentNum>3){
                        $("div.lou[name='"+louName+"']").hide().last().before('<div class="show_morelou" onclick="moreLou(this)">展开隐藏次元</div>');
                        $("div.lou[name='"+louName+"']:first,div.lou[name='"+louName+"']:last").show();
                    }
                    width();
                    del_line();
                    autoHeight();
                }
            }else{
                 for(var i=0;i<5;i++){
                    var data =json[i];
                     var orig_comid=data.id;//原始评论id
                     var louName="0"+data.sender_uid+data.create_time+data.id+"1";//评论的lou的name值
                    var html = '';
                        html += '<li><div class="auimg"><img src="'+data.avatar_url+'" class="user_img" onerror="this.src='+"'https://avatar.dmzj.com/default.png'"+'">';
                        if(data.sender_id==authoruid){
                            html +=  '<img src="https://'+static_domain+'static.dmzj.com/module/images/lable_author.png" class="user_label">';
                        }
                        html +=  '</div><div class="comment_main"><span class="user_name">'+data.nickname+'</span>';
                        if(data.sex){html +=  '<img src="https://'+static_domain+'static.dmzj.com/module/images/sex_'+data.sex+'.png" class="sex">'  ;}
                        if(data.isgood==1){
                            html +=  '<img src="https://'+static_domain+'static.dmzj.com/module/images/jing.png" class="jing">';
                        }      
                        html +=  '<div class="com_container">';
                        if(data.masterCommentNum!=0){
                            var masterjson=data.masterComment;//主评论数组
                            html += '<div class="masterCom">';
                            for(var j=0;j<masterjson.length;j++) {
                                var data2 = masterjson[j];
                                if(data2.content.length>100){
                                    html += '<div class="lou" name="'+louName+'"><p class="hei"><span><em>' + data2.nickname + '</em>：</span><span class="replyLou" onclick="reply(this,'+data2.sender_uid+','+data2.id+','+orig_comid+')">';
                                    html +=  ''+data2.content+'</p><span class="qw" onclick="opentext(this)">显示全文</span>';
                                }else{
                                    html += '<div class="lou" name="'+louName+'"><p><span><em>' + data2.nickname + '</em>：</span><span class="replyLou" onclick="reply(this,'+data2.sender_uid+','+data2.id+','+orig_comid+')">';
                                    html +=  ''+data2.content+'</p>';
                                }
                                if (data2.upload_images != "") {
                                    html += '<p class="reImg">';
                                    var upImg = data2.upload_images.split(",");
                                    for (var x = 0; x < upImg.length; x++) {
                                        var file_img = upImg[x].split(".")[0];
                                        var file_img_suffix = upImg[x].split(".")[1];
                                        html += '<span><img src="'+Img_url+'commentImg/'+data2.obj_id%500+'/' + file_img+'_small.'+file_img_suffix + '" onclick="bigImg(this)">'+'</span>';
                                    }
                                    html += '</p>';
                                }
                                html += '<div class="masterNum">' + (j + 1) + '</div></div>';
                            }
                            html += '</div>';
                        }
                         if(data.content.length>100){
                             html +=  '<p class="hei">'+data.content+'</p><span class="qw" onclick="opentext(this)">显示全文</span>';
                         }else{
                             html +=  '<p>'+data.content+'</p>';
                         };
                        if(data.upload_images != ""){
                            html += '<p class="reImg">';
                            var upImg2 = data.upload_images.split(",");
                            for(var x=0; x < upImg2.length; x++){
                                var file_img = upImg2[x].split(".")[0];
                                var file_img_suffix = upImg2[x].split(".")[1];
                                html += '<span><img src="'+Img_url+'commentImg/'+data.obj_id%500+'/'  + file_img+'_small.'+file_img_suffix + '" onclick="bigImg(this)">'+'</span>';
                            }
                            html += '</p>';
                        }
                        html +=  '</div>';
                        html +=  '<span class="user_time">'+(new Date(parseInt(data.create_time)*1000)).Format("MM-dd hh:mm:ss")+'</span>';
                        html +=  '<span class="review" onclick="reply(this,'+data.sender_uid+','+data.id+','+orig_comid+')">'+data.reply_amount+'</span>';
                        html +=  '<span class="praise" onclick="agree(this,'+data.id+')">'+data.like_amount+'</span></div></li>';
                    $('.newsHot ul').append(html);
                     if(data.masterCommentNum>3){
                         $("div.lou[name='"+louName+"']").hide().last().before('<div class="show_morelou" onclick="moreLou(this)">展开隐藏次元</div>');
                         $("div.lou[name='"+louName+"']:first,div.lou[name='"+louName+"']:last").show();
                     }
                     width();
                     del_line();
                     autoHeight();
                }
            }
            autoHeight();
        },"hotComment_s");
    };
    //请求最新评论
    var allComment=function(){
        var url=comicUrl+"/api/NewComment2/list";
        var data = "type="+comment_type+"&obj_id="+obj_id+"&hot=0&page_index="+cur_page;
        get_json(url,data,function(json){
            if(json == ""){
                $('.newsAll ul').append("<div style='width:100%;text-align:center;padding-top: 20px;float:left;'>No more comments</div>");
                $('#loading').remove();
                return false
            }else{
                for(var i=0;i<json.length;i++){
                    var data =json[i];
                    var orig_comid=data.id;//原始评论id
                    var louName="0"+data.sender_uid+data.create_time+data.id+"0";//评论的lou的name值
                    var html = '';
                        html += '<li class="hide"><div class="auimg"><img src="'+data.avatar_url+'" class="user_img" onerror="this.src='+"'https://avatar.dmzj.com/default.png'"+'">';
                        if(data.sender_id==authoruid){
                            html +=  '<img src="https://'+static_domain+'static.dmzj.com/module/images/lable_author.png" class="user_label">';
                        }
                        html +=  '</div><div class="comment_main"><span class="user_name">'+data.nickname+'</span>';
                        if(data.sex){html +=  '<img src="https://'+static_domain+'static.dmzj.com/module/images/sex_'+data.sex+'.png" class="sex">'  ;}
                        if(data.isgood==1){
                            html +=  '<img src="https://'+static_domain+'static.dmzj.com/module/images/jing.png" class="jing">';
                        }      
                        html +=  '<div class="com_container">';
                        if(data.masterCommentNum!=0){
                            var masterjson=data.masterComment;//主评论数组
                            orig_comid=masterjson[0].id;
                            html += '<div class="masterCom">';
                            for(var j=0;j<masterjson.length;j++) {
                                    var data2 = masterjson[j];
                                    if(data2.content.length>100){
                                        html += '<div class="lou" name="'+louName+'"><p class="hei"><span><em>' + data2.nickname + '</em>：</span><span class="replyLou" onclick="reply(this,'+data2.sender_uid+','+data2.id+','+orig_comid+')">';
                                        html +=  ''+data2.content+'</p><span class="qw" onclick="opentext(this)">显示全文</span>';
                                    }else{
                                        html += '<div class="lou" name="'+louName+'"><p><span><em>' + data2.nickname + '</em>：</span><span class="replyLou" onclick="reply(this,'+data2.sender_uid+','+data2.id+','+orig_comid+')">';
                                        html +=  ''+data2.content+'</p>';
                                }
                                //html += data2.content + '</span></p>';
                                    if (data2.upload_images != "") {
                                        html += '<p class="reImg">';
                                        var upImg = data2.upload_images.split(",");
                                        for (var x = 0; x < upImg.length; x++) {
                                            var file_img = upImg[x].split(".")[0];
                                            var file_img_suffix = upImg[x].split(".")[1];
                                            html += '<span><img src="'+Img_url+'commentImg/'+data2.obj_id%500+'/' + file_img+'_small.'+file_img_suffix + '" onclick="bigImg(this)">'+'</span>';
                                        }
                                        html += '</p>';
                                    }
                                    html += '<div class="masterNum">' + (j + 1) + '</div></div>';
                            }
                            html += '</div>';
                        }
                        if(data.content.length>100){
                            html +=  '<p class="hei">'+data.content+'</p><span class="qw" onclick="opentext(this)">显示全文</span>';
                        }else{
                            html +=  '<p>'+data.content+'</p>';
                        }
                        if(data.upload_images != ""){
                            html += '<p class="reImg">';
                            var upImg2 = data.upload_images.split(",");
                            for(var x=0; x < upImg2.length; x++){
                                var file_img = upImg2[x].split(".")[0];
                                var file_img_suffix = upImg2[x].split(".")[1];
                                html += '<span><img src="'+Img_url+'commentImg/'+data.obj_id%500+'/' + file_img+'_small.'+file_img_suffix + '" onclick="bigImg(this)">'+'</span>';
                            }
                            html += '</p>';
                        }
                        html +=  '</div>';
                        html +=  '<span class="user_time">'+(new Date(parseInt(data.create_time)*1000)).Format("MM-dd hh:mm:ss")+'</span>';
                        html +=  '<span class="review" onclick="reply(this,'+data.sender_uid+','+data.id+','+orig_comid+')">'+data.reply_amount+'</span>';
                        html +=  '<span class="praise" onclick="agree(this,'+data.id+')">'+data.like_amount+'</span></div></li>';
                    $('.newsAll ul').append(html);
                    if(data.masterCommentNum>3){
                        $("div.lou[name='"+louName+"']").hide().last().before('<div class="show_morelou" onclick="moreLou(this)">展开隐藏次元</div>');
                        $("div.lou[name='"+louName+"']:first,div.lou[name='"+louName+"']:last").show();
                    }
                    width();
                    del_line();
                    autoHeight();
                }
            }
            cur_page++;
            //前10条渐显
            fadeIn();
            autoHeight();
        },"comment_list_s");
    };
    //渐显10条
    function fadeIn(){
        for( var o=0;o<10;o++){
            $('.newsAll ul li.hide').first().addClass('li_fadeInUp').removeClass("hide");
        }
        $('#loading').removeClass('loading_more').html('点击查看更多');
        var li_Hide=$('.newsAll ul li.hide').length;
        if(li_Hide<=20 && li_Hide>10){
            //下拉加载中间10条
            $(window).on('scroll',request_func);
        }
        if(li_Hide <= 10 && li_Hide!=0){
            //下拉加载最后10条
            $(window).on('scroll',request_func2);
        }
        if(li_Hide == 0){
            $('#loading').on('click',more_click);
        }
        autoHeight();
    }
    // 下拉加载
    var request_func=function(){
        var document_height =$(document).height();
        if($(window).scrollTop()+$(window).height()>=(document_height-150)) {
            $('.n_more_btm').addClass('loading_more').html('<img src="https://'+static_domain+'static.dmzj.com/module/images/loading.gif"/>');
            $(window).off('scroll',request_func);
            setTimeout(function(){fadeIn();autoHeight();},800);
        }
    };
    var request_func2=function(){
        var document_height =$(document).height();
        if($(window).scrollTop()+$(window).height()>=(document_height-150)) {
            $('.n_more_btm').addClass('loading_more').html('<img src="https://'+static_domain+'static.dmzj.com/module/images/loading.gif"/>');
            $(window).off('scroll',request_func2);
            setTimeout(function(){fadeIn();autoHeight();},800);
        }
    };

    //图片上传
    var upload_pic = {
        show_uploadImg:function(){
        },
        //限制图片大小
        fileSize:function(obj){
            var fileSize = 0;
            if (isIE && !obj.files) {

            } else {
                fileSize = obj.files[0].size;
            }
            var size = fileSize / 1024;
            if(size>1000){
                alert("附件不能大于1M");
            }else{
                $("#submitImg").click();
            }
        },
        //显示上传图片格式
        imgformat:function(){
            var f=document.getElementById("fileupload").value;
            if(!/\.(gif|jpg|jpeg|png|GIF|JPG|PNG)$/.test(f))
            {
                alert("图片类型必须是.gif,jpeg,jpg,png中的一种");
                return false;
            }else{
                $("#submitImg").click();
            }
        },
        //选择图片
        uploadImg:function(obj){
            var li_len = 3-$(".file_li").size();
            if(!isIE && obj.files.length>li_len){
                if(li_len==3){
                    alert("只能上传3张图片")
                }else{
                    alert("还可以再上传"+parseInt(li_len)+"张图片")
                }
            }else{
                upload_pic.fileSize(obj);
                upload_pic.imgformat();
            }
        },
        //图片上传后展示
        getIframeVal:function(json){
            var data_arry = decodeURI(json).split("&")[0];
            var data = data_arry.split(",");
            if(data==""){
                if (isIE) {
                    alert(decodeURI(json).split("&")[1]);
                }
                return false
            }
            for(var i=0; i<data.length; i++){
                var file_img = data[i].split(".")[0];
                var file_img_suffix = data[i].split(".")[1];
                var str = '<li class="tableCell" id="file-'+file_img+'">';
                    str +='<a class="delImg" onclick="upload_pic.delImg(\''+file_img+'\',\''+file_img_suffix+'\')"></a>';
                    str +='<img src="'+Img_url+'temComment/'+ data[i]+'"  /></li>';
                $('.add_img').before(str);
                upload_imgArr.push(data[i]);
                var imgStr = upload_imgArr.join(",");
                $("#hiddenInput").val(imgStr);
            }
            if(upload_imgArr.length==3){
                $('.file_img ul li.tableCell').eq(2).css({'margin-right':0});
                $(".add_img").hide();
            }else{
                $(".add_img").show();
            }
        },
        //删除图片
        delImg:function(imgId,suffix){
            $("#file-" + imgId).remove();
            if($(".tableCell").length==3){
                $(".add_img").hide();
            }else{
                $('.file_img ul li.tableCell').css({'margin-right':'10px'});
                $(".add_img").show();
            }
            upload_imgArr.remove(imgId+"."+suffix);
            var imgStr = upload_imgArr.join(",");
            $("#hiddenInput").val(imgStr);
        }
    };
    //回复图片点击查看大图
    var bigImg = function(obj){
        var img_index = $(obj).parent().index();
        var img_list = "";
        var imgClub = $(obj).closest('.reImg').find('img');
        var img_length= $(obj).closest('.reImg').find('img').length;
        var img_src = [];
        img_list += '<div class="swiper-container bigImg hide"><div class="swiper-wrapper bigImgcon">';
        for(var i=0;i<img_length;i++){
            img_src[i] = imgClub.eq(i).attr('src');
            var big_img = img_src[i].split("_small")[0];
            var big_img_suffix = img_src[i].split("_small")[1];
            img_list += '<div class="swiper-slide img_list"><img id="img1" src="'+big_img+big_img_suffix+'"></div>';
        }
        img_list +='</div><div class="swiper-pagination ontop"></div>';
        if(img_length>0){
            img_list += '<div class="swiper-button-next hide"></div><div class="swiper-button-prev hide"></div><div class="close_Bigimg" onclick="closeBigImg()"></div></div>';
        }
        $('body').append(img_list);
        $('.mask').show();
        $('.bigImg').show();
        //设置宽高适应屏幕
        bigImgstyle(obj);
        //初始化swiper插件
        var swiper4 = new Swiper('.bigImg', {
            pagination: '.swiper-pagination',
            paginationType: 'fraction'
        });
        swiper4.slideTo(img_index,0);

        return swiper4
    };
    var closeBigImg=function(){
      $('.mask').hide();
        $('.bigImg').remove();
        swiper4 = null;
        return swiper4
    };
    //动态设置样式
    var bigImgstyle=function(obj){
        //获取图片信息
        function getImageWidth(url,callback){
            var img = new Image();
            img.src = url;
            // 如果图片被缓存，则直接返回缓存数据
            if(img.complete){
                callback(img.width, img.height);
            }else{
                img.onload=function(){
                    callback(img.width, img.height);
                };
            }


        }
        $.each($('.img_list img'),function(index){
            var img_W,img_H;
            var tImg = $(this);
            var imgSrc = $(this).attr("src");
                getImageWidth(imgSrc,function(w,h){

                    img_W = w;
                    img_H = h;
                    var window_W = tImg.parent().width();
                    var window_H = tImg.parent().height();
                    var img_ratio = img_W/img_H;

                    if(img_W>img_H){
                        tImg.width(window_W);
                        var after_W = tImg.width();
                        var after_H = after_W/img_ratio;
                        if(after_H>window_H){
                            tImg.height(window_H);
                            tImg.width(window_H*img_ratio);
                        }else{
                            tImg.height(after_H);
                        }

                    }else{
                        tImg.height(window_H);
                        var after_H = tImg.height();
                        var after_W = after_H*img_ratio;
                        if(after_W>window_W){
                            console.log('kayu')
                            tImg.width(window_W);
                            tImg.height(window_W/img_ratio);
                        }else{
                            tImg.width(after_W);
                        }

                    }
                });

        });
    };
    //回复功能
    var reply=function (obj,to_uid,to_comment_id,origin_comment_id){
        getCookie();
        if(!comInfo.is_login){
            alert('您必须登录后才能评论');
            window.location.href="/novelcube.com/login.html#str"+encodeURI(window.location.href);
            return false;
        }
        $('.reply_').remove();
        var replyNUM = 'ture';//当前可回复状态
        var ifarme_v = $('.news_content iframe');
        ifarme_v.hide();
        if(to_uid!=0){
            var reText="";
            if($(obj).hasClass('replyLou')){
                var reName=$(obj).siblings('span').children('em').text();
                var reContent=$(obj).text();
            }else{
                var reName=$(obj).siblings('.user_name').text();
                var reContent=$(obj).siblings('div.com_container').children('p').text();
            }

            reText += "<div class='reply_'>回复<em>"+reName+"</em>："+reContent+"</div>";
            $('.review_pop').prepend(reText);
        }
        $('.mask,.review_pop').show();
        $('a#submit').html('发表回复');
        $('a#cancel').html('取消回复');
        $('textarea').focus();
        $('a#submit').on('click',addCom);
        //发表评论函数
        function addCom(){
                var clickText = $('a#submit').html();
                var content = encodeURIComponent($.trim($("textarea[name=textareadiv]").val()));
                if(content==""){
                    alert("评论不能为空");
                    return false;
                }
                $('a#submit').off('click').html('发表中..');
                var _to_uid = (to_uid==0)?0:to_uid;
                var _to_comment_id = (to_comment_id==0)?0:to_comment_id;
                var _origin_comment_id = (to_uid==0)?0:origin_comment_id;
                var img_src= $("#hiddenInput").val();
                var url = comicUrl+'/api/NewComment2/add';
                var data = "&type="+comment_type+"" +
                    "&obj_id="+obj_id +
                    "&sender_uid="+comInfo.user_id +
                    "&content="+content +
                    "&to_uid=" +_to_uid +
                    "&to_comment_id=" +_to_comment_id+
                    "&origin_comment_id=" +_origin_comment_id+
                    "&sender_terminal=1"+
                    "&img="+img_src;
                var callback=function(json){
                    if(json.result==1000){
                        var data = json.data;
                        $('li.add_img').show().siblings('li.tableCell').remove();
                        $('input#hiddenInput').val('');
                        upload_imgArr=[];
                        $('textarea[name=textareadiv]').val('');
                        $('.review_pop,.mask').hide();
                        $('#replyeff').show().html(json.msg+'!');
                        setTimeout(function(){$('#replyeff').hide();ifarme_v.show();},2000);
                        addliBefore(json.data);//添加到最新评论前
                        var spanFl = $('.fl span');
                        var spanNum = parseInt(spanFl.html());//评论数
                        spanFl.html(spanNum+1);

                        //建立Cookie设置发表间隔
                        // setCommentTime(comInfo.user_id,json.limitTime);
                    }else{
                        alert(json.msg);
                        $('a#submit').html(clickText);
                        $('a#submit').on('click',addCom);
                    }
                };
                get_json(url,data,callback,"add_sucess");
            }
        $('#cancel').on('click',function(){
            $('#submit').off('click');
            $('.text_length span').html('0');
            upload_imgArr=[];
            $('li.tableCell').remove();
            $('li.add_img').show();
            $('input#hiddenInput').val('');
            $('textarea[name=textareadiv]').val('');
            $('.review_pop,.mask').hide();
            replyNUM = 'false';
            ifarme_v.show();
        });
    };
    //回复成功添加到最新评论前
    var addliBefore=function(data){
                    var orig_comid=data.id;//原始评论id
                    var louName="0"+data.sender_uid+data.create_time+data.id+"0";//评论的lou的name值
                    var html = '';
                    html += '<li class="hide"><div class="auimg"><img src="'+data.avatar_url+'" class="user_img" onerror="this.src='+"'https://avatar.dmzj.com/default.png'"+'">';
                    if(data.sender_id==authoruid){
                        html +=  '<img src="https://'+static_domain+'static.dmzj.com/module/images/lable_author.png" class="user_label">';
                    }
                    html +=  '</div><div class="comment_main"><span class="user_name">'+data.nickname+'</span>';
                    if(data.sex){html +=  '<img src="https://'+static_domain+'static.dmzj.com/module/images/sex_'+data.sex+'.png" class="sex">'  ;}
                    if(data.isgood==1){
                        html +=  '<img src="https://'+static_domain+'static.dmzj.com/module/images/jing.png" class="jing">';
                    }
                    html +=  '<div class="com_container">';
                    if(data.masterCommentNum!=0){
                        var masterjson=data.masterComment;//主评论数组
                        orig_comid=masterjson[0].id;
                        html += '<div class="masterCom">';
                        for(var j=0;j<masterjson.length;j++) {
                            var data2 = masterjson[j];
                            if(data2.content.length>100){
                                html += '<div class="lou" name="'+louName+'"><p class="hei"><span><em>' + data2.nickname + '</em>：</span><span class="replyLou" onclick="reply(this,'+data2.sender_uid+','+data2.id+','+orig_comid+')">';
                                html +=  ''+data2.content+'</p><span class="qw" onclick="opentext(this)">显示全文</span>';
                            }else{
                                html += '<div class="lou" name="'+louName+'"><p><span><em>' + data2.nickname + '</em>：</span><span class="replyLou" onclick="reply(this,'+data2.sender_uid+','+data2.id+','+orig_comid+')">';
                                html +=  ''+data2.content+'</p>';
                            }
                            if (data2.upload_images != "") {
                                html += '<p class="reImg">';
                                var upImg = data2.upload_images.split(",");
                                for (var x = 0; x < upImg.length; x++) {
                                    var file_img = upImg[x].split(".")[0];
                                    var file_img_suffix = upImg[x].split(".")[1];
                                    html += '<span><img src="'+Img_url+'commentImg/'+data2.obj_id%500+'/' + file_img+'_small.'+file_img_suffix + '" onclick="bigImg(this)"></span>';
                                }
                                html += '</p>';
                            }
                            html += '<div class="masterNum">' + (j + 1) + '</div></div>';
                        }
                        html += '</div>';
                    }
                    if(data.content.length>100){
                        html +=  '<p class="hei">'+data.content+'</p><span class="qw" onclick="opentext(this)">显示全文</span>';
                    }else{
                        html +=  '<p>'+data.content+'</p>';
                    }
                    if(data.upload_images != ""){
                        html += '<p class="reImg">';
                        var upImg2 = data.upload_images.split(",");
                        for(var x=0; x < upImg2.length; x++){
                            var file_img = upImg2[x].split(".")[0];
                            var file_img_suffix = upImg2[x].split(".")[1];
                            html += '<span><img src="'+Img_url+'commentImg/'+data.obj_id%500+'/' + file_img+'_small.'+file_img_suffix + '" onclick="bigImg(this)"></span>';
                        }
                        html += '</p>';
                    }
                    html +=  '</div>';
                    html +=  '<span class="user_time">'+(new Date(parseInt(data.create_time)*1000)).Format("MM-dd hh:mm:ss")+'</span>';
                    html +=  '<span class="review" onclick="reply(this,'+data.sender_uid+','+data.id+','+orig_comid+')">'+0+'</span>';
                    html +=  '<span class="praise" onclick="agree(this,'+data.id+')">'+data.like_amount+'</span></div></li>';
                    $('.newsAll ul').prepend(html);
                    if(data.masterCommentNum>3){
                        $("div.lou[name='"+louName+"']").hide().last().before('<div class="show_morelou" onclick="moreLou(this)">展开隐藏次元</div>');
                        $("div.lou[name='"+louName+"']:first,div.lou[name='"+louName+"']:last").show();
                    }
                    width();
                    del_line();
            //前10条渐显
            fadeIn();
            autoHeight();
            $('.newsAll ul li').eq(1).find('.comment_main').css({'border-top':'1px solid #cbcbcb'});
    };

    //点赞
    var agree=function(obj,comment_id){
            var url = comicUrl+'/api/NewComment2/agree';
            var data = "&comment_id="+comment_id+"" +
                       "&type="+comment_type+"";
            var num = $(obj).html();
            var callback=function(json){
                if(json.result==1000){
                    $(obj).html(parseInt(num)+parseInt(1));
                    $(obj).addClass("cur").attr("onclick","");
                }
            };
            get_json(url,data,callback,"agree_s");
        };

    //设置图片宽高大小
    function autoHeight(){
        $.each($('p.reImg'),function(){
            var this_children =$(this).children().length;
            if(this_children==3){
                $(this).children('span').width("30%");
            }else if(this_children==2){
                $(this).children('span').width("45%");
            }else{
                $(this).children('span').width("60%");
            }
            var spanW=$(this).children('span').width();
            var spanH= $(this).children('span').height(spanW);
        });
        $.each($('.reImg img'),function(){
            var imgH=$(this).height();
            var imgW=$(this).width();
            if(imgW>imgH){
                $(this).height('100%');
            }else{
                $(this).width('100%');
            }
        });
    }

    //初始化样式
    //自适应宽度
    function width(){
        var win_W = $(window).width();
        var focus_W = win_W - 112;
        var comment_main_W=win_W - 80;
        $('.focus').width(focus_W);
        $('.comment_main').width(comment_main_W);//评论内容宽度
    }
    //去第一条评论下划线
    function del_line(){
        $('.newsHot ul li').first().find('.comment_main').css({'border-top':0});
        $('.newsAll ul li').first().find('.comment_main').css({'border-top':0});
    }
    //展开次元
    function opentext(obj){
        $(obj).hide().siblings('p.hei').removeClass('hei');
    };
    //展开更多评论
    function moreLou(obj){
        $(obj).hide().siblings('div.lou').show();
        autoHeight();
    }
    //获取更多评论
    function more_click(){
        $('#loading').addClass('loading_more').html('<img src="https://'+static_domain+'static.dmzj.com/module/images/loading.gif"/>').off('click');
        allComment();
    }

    //设置发表时间间隔
    // var setCommentTime = function(uid,limitTime){
    //  var uid_limit = uid+'_limitTimeForC';
    //     var expiresDate= new Date();
    //  expiresDate.setTime(expiresDate.getTime() + (limitTime * 1000)); //?替换成秒数如果为60秒则为 60 *1000
    //     $.cookie(uid_limit,"1000",{ expires: expiresDate ,path: '/',domain: 'dmzj.com' });
    // }



    // 评论内容
    // 点击获取焦点
        $('.focus').on('click',function(){
            reply(this,0,0,0);
            $('a#submit').html('发布');
            $('a#cancel').html('取消');
        });
        $('.review_pop textarea').on('focus',function(){
            $('.visiblity').hide();
        })
        $('.visiblity').on('click',function(){
            $(this).hide();
            $('.review_pop textarea').focus();
        });
        $('.review_pop textarea').on('input',function(){
            var text_length = $('.review_pop textarea').val().length;
            $('.review_pop .text_length span').html(text_length);
        })
        //评论弹框
        $('.add_img').on('click', function() {
            $('#fileupload').click();
        });
        $('#fileupload').on('change',function(){
            upload_pic.uploadImg(this);
        });
    //初始化动作
        $('.newsAll').append('<a class="n_more_btm" id="loading">点击查看更多</a>');
        getCookie();
        // if($('.fl span').html() == 0){
        //     var newsHot = $('.newsHot');
        //     newsHot.next('.partLine').remove();
        //     newsHot.remove();
        //     $('#loading').remove();
        //     $('.newsAll ul').append('还没有评论，快来抢占沙发吧！');
        // }else{
        //     hotComment();
        //     allComment();
        // }
        

}






