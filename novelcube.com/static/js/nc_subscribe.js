//=======================我的订阅
var mySubscribe={
    page:2,
    type:0,
    mySubscribe_ajax:function(){
        $("#loadding").hide();
        $(window).unbind('scroll', request_subScribe_func);
        UserCookie();
        var url = '/subscribe/json/'+mySubscribe.type +'-'+mySubscribe.page+'.html';
        T.restGet(url, {}, function(data){
            //console.log(data.length);
            //console.log(data);
            var html = "";
            for(i=0;i<data.length;i++){
                var update_timestamp = data[i].sub_uptime;
                var date1 = new Date(update_timestamp*1000);
                var url = '/info/'+data[i].id+'.html';
                html += '<div class="itemBox" id="sub_'+data[i].id+'">';
                html += '<div class="itemImg"><a onClick="update_read_status('+data[i].id+')" title="'+data[i].name+'">';
                html += '<img src="'+data[i].sub_img+'" width="100%"></a></div>';
                html += '<div class="itemTxt">';
                html += '<div class="title"><p class="subname">'+data[i].name+'</p>';
                if(data[i].sub_readed==0){
                    html +='<span class="new"></span>'
                }
                html += '</div>';
                html += '<p class="To_p">更新到：<span class="fred UpdateTo">'+data[i].sub_update+'</span></p>';
                html += '<p class="To_p">更新时间：<span class="fred">'+date1.format("yyyy-MM-dd")+'</span></p>';
                if(mySubscribe.type==1){
                    html += '<a class="PubBtn look" href="'+url+'">立即观看</a>';
                }else{
                    html += '<a class="PubBtn look" onClick="update_read_status('+data[i].id+')">立即观看</a>';
                }

                html += '<a class="PubBtn can" onClick="unSubscribe('+data[i].id+')">取消订阅</a>'
                html += '</div></div>'
            }
            if(mySubscribe.page > 2) {
                $("#subscribeBox").append(html);
            } else {
                $("#subscribeBox").html(html);
            }
            nc_global.character("subname",10);
            nc_global.character("UpdateTo",15);
            if(mySubscribe.page==1){
                if(data.length==0){
                    no_conten();
                    if(mySubscribe.type==1){
                        $(".no_conten_txt1").text("没有已读的订阅漫画");
                        $(".no_conten_txt2").text("")
                    }else if(mySubscribe.type==2){
                        $(".no_conten_txt1").text("没有未读的订阅漫画");
                        $(".no_conten_txt2").text("")
                    }
                }
            }else{
                if(data.length==0){
                    $("#loadding").show().text("已经没有了");
                    $(window).unbind('scroll', request_subScribe_func);
                    return false
                }else{
                    $(window).bind('scroll', request_subScribe_func);
                    $("#loadding").hide();
                }
            }
            $(window).bind('scroll', request_subScribe_func);
        }, function(data) {
            console.log(data.msg);
            $(window).bind('scroll', request_subScribe_func);
        })

    },
    btnAction:function(obj,type){
        mySubscribe.page=1;
        $("#loadding").hide();
        $("#loadding").text("正在加载中...");
        mySubscribe.type=type;
        $(obj).addClass("cur").siblings().removeClass("cur");
        mySubscribe.mySubscribe_ajax();
    }
};

$(function(){
    nc_global.character("subname",10);
    nc_global.character("UpdateTo",15);
    if($(".itemBox").length==0){
        no_conten();
    }
    if($("#itemBox").length<10){
        $("#loadding").hide();
    }
});

//无内容
function no_conten(){
    var html = "";
    html +='<div class="no_conten_img"></div>';
    html +='<div class="no_conten_txt1">您还没有订阅漫画哦</div>';
    html +='<div class="no_conten_txt2">订阅漫画后在有更新时佳佳娘会提醒您！</div>';
    $("#subscribeBox").append(html);
    $("#loadding").hide();


}

var request_subScribe_func = function(){
    var document_height = $(document).height();
    if($(window).scrollTop()+$(window).height()>=(document_height-nc_global.document_hei)) {
        mySubscribe.mySubscribe_ajax();
        mySubscribe.page++;
        $("#loadding").show();
    }
};

$(window).bind('scroll', request_subScribe_func);