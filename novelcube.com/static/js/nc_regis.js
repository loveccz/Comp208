// JavaScript Document

// var i_url = "https://i.dmzj.com/";
var i_url = "https://i.idmzj.com/";
// var i_url = "http://xuwei.i.dmzj.com/";
//第三方登录
var host_url = window.location.href;
var qq_url = " https://graph.qq.com/oauth2.0/authorize?client_id=101144087&redirect_uri=" + i_url + "login/qq&response_type=code&state=http://" + domain_name + "m.dmzj.com/";
var weibo_url = "https://api.weibo.com/oauth2/authorize?client_id=1097110952&redirect_uri=" + i_url + "login/weibo&response_type=code&state=http://" + domain_name + "m.dmzj.com/";
var wx_url = "https://open.weixin.qq.com/connect/qrconnect?appid=wxd8738af358b4b084&redirect_uri=http%3A%2F%2Fi.dmzj.com%2Flogin%2Fwechat&response_type=code&scope=snsapi_login&state=http://" + domain_name + "m.dmzj.com/";
var forget_url = i_url + "lostPassword-1";
var verify_code = i_url + "code/getCode";

var m_register = {
    _repass: false,
    _pass: false,
    _email: false,
    _name: false,
    _code: false,
    setTel: false,
    gainCode: true,
    num: 0,
    errotip: function (t, txt) {
        $(t).next("p").show().removeClass("inputTip").addClass("erroTxt").text(txt);
    },
    inputtip: function (t, txt) {
        $(t).next("p").show().removeClass("erroTxt").addClass("inputTip").text(txt);
    },
    isEmail: function (str) {
        var reg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
        //var reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
        return reg.test(str);
    },
    isPhone: function (str) {
        var reg = /^1[345789]\d{9}$/;
        return reg.test(str);
    },
    inputStyle: function (input, size) {
        var inputW = $('.' + input);
        inputW.width(($(window).innerWidth()) - size);
    },
    username: function (s) {
        var url = i_url + "api/login/checkNickname";
        var nameVal = $(s).val();
        var regArray = ["'", '"', '&', '?', '<', '>', '~', '!', '@', '#', '$', '%', '^', '*', '(', ')', '+', '=', '|', '\\', '/', '{', '}', '[', ']', ':', ';', ',', '.', ' '];
        for (var i = 0; i < regArray.length; i++) {
            if (nameVal.indexOf(regArray[i]) != -1) {
                m_register.errotip(s, "用户名不能有特殊字符");
                m_register._name = false;
                return false;
            }
        }
        if (nameVal == "") {
            m_register.errotip(s, "请输入用户名");
        } else if (nameVal.length < 2 || nameVal.length > 20) {
            m_register.errotip(s, "用户名为2-20个字符");
            m_register._name = false;
        } else if (!isNaN(nameVal)) {
            m_register.errotip(s, "用户名不能全为数字");
            m_register._name = false;
        } else {
            T.ajaxJsonp(url, { "nickname": nameVal }, function (data) {
                if (data.code == 1000) {
                    m_register.inputtip(s, "用户名合法");
                } else if (data.code == 801) {
                    m_register.errotip(s, "用户名重复");
                }
            }, function (data) {
                alert(data.msg);
            });
            m_register._name = true;
        }
    },
    mail: function (s) {
        if (!m_register.setTel) {
            m_register.setTel = true;
            var url = i_url + "api/checktel";
            var mailVal = $(s).val();
            if ($.trim(mailVal) == "") {
                m_register.errotip(s, "请输入手机号码");
                m_register._email = false;
                m_register.setTel = false;
            } else if (!m_register.isPhone(mailVal)) {
                m_register.errotip(s, "手机号码不合法")
                m_register._email = false;
                m_register.setTel = false;
            } else {
                T.ajaxJsonp(url, { "tel": mailVal }, function (data) {
                    if (data.code == 1000) {
                        m_register.inputtip(s, "手机号码可用");
                        m_register._email = true;
                    } else {
                        m_register.errotip(s, "手机号已经存在");
                    }
                }, function (data) {
                    alert(data.code);
                });
                setTimeout(function () {
                    m_register.setTel = false;
                }, 1000)
            }
        }
    },
    codeGian: function () {
        m_register.mail("#regmail");
        if(m_register._email){
            $("#robot_code").show()
        }

    },
    robotCode: function () {
        if (m_register.gainCode) {
            m_register.mail("#regmail");
            var url = i_url + 'sms/send';
            var tel = $.trim($("#regmail").val());
            var code = $("#robot_val").val()
            $("#robot_code").hide()
            setTimeout(function () {
                if (m_register._email) {
                    m_register.gainCode = false;
                    $("#regcodeGian").val("正在发送...");
                    T.ajaxJsonp(url, { "tel": tel, "code": code }, function (data) {
                        if (data.code == 0) {
                            $("#regcode").next("p").hide();
                            var countdown = 60;
                            var pwdyes_gainVc_timer = setInterval(function () {
                                countdown--;
                                if (countdown == 0) {
                                    $("#regcodeGian").val("获取验证码").css({ 'background': '#3591d5' });
                                    countdown = 60;
                                    clearInterval(pwdyes_gainVc_timer);
                                    m_register.gainCode = true;
                                } else {
                                    $("#regcodeGian").val("(" + countdown + "s)").css({ 'background': '#b3b3b3' });
                                    m_register.gainCode = false;
                                }
                            }, 1000);
                        } else {
                            m_register.errotip("#regcode", "发送失败");
                            m_register.gainCode = true;
                            $("#regcodeGian").val("获取验证码");
                        }
                    }, function (data) {
                        alert(data.code);
                        m_register.gainCode = true;
                        $("#regcodeGian").val("获取验证码");
                    });
                }
            }, 500)
        }
    },
    robotClose: function () {
        $("#robot_code").hide()
    },
    isNum: function (str) {
        var reg = /^\d+$/;
        return reg.test(str);
    },
    code: function (s) {
        var code = $.trim($(s).val());
        if (code == "") {
            m_register.errotip(s, "请输入验证码");
            m_register._code = false;
        } else if (!m_register.isNum(code)) {
            m_register.errotip(s, "验证码错误");
            m_register._code = false;
        } else {
            $("#regcode").next("p").hide();
            m_register._code = true;
        }
    },
    pass: function (s) {
        var passVal = $(s).val();
        if ($.trim(passVal) == "") {
            m_register.errotip(s, "请输入密码");
        } else if (passVal.length < 6 || passVal.length > 20) {
            m_register.errotip(s, "密码6-20位");
            m_register._pass = false;
        } else if (/^\d{6,19}$/.test(passVal)) {
            m_register.errotip(s, "密码不能为纯数字");
            m_register._pass = false;
        } else {
            m_register.inputtip(s, "密码符合要求");
            m_register._pass = true;
            m_register._repassVal = passVal;
        }
    },
    repass: function (s) {
        var repassVal = $(s).val();
        var passVal = $("#regpass").val();
        if ($.trim(repassVal) == "") {
            m_register.errotip(s, "请输入确认密码");
            m_register._repass = false;
        } else if (repassVal != passVal) {
            m_register.errotip(s, "两次密码输入不一致");
            m_register._repass = false;
        } else if (repassVal == passVal) {
            m_register.inputtip(s, "密码输入一致");
            m_register._repass = true;
        }
    },
    regclick: function () {
        var url = i_url + "/api/register";
        var nameVal = $("#regname").val();
        var passVal = $("#regpass").val();
        var mailVal = $("#regmail").val();
        var codeVal = $("#regcode").val();
        if (!$("#readcheck").prop("checked")) {
            alert("请阅读使用服务协议");
            return false;
        }
        var token = $("input[name=_token]").val();
        if (m_register._repass && m_register._name && m_register._email && m_register.repass && m_register._code) {
            T.ajaxJsonp(url, { "nickname": nameVal, "tel": mailVal, "password": passVal, "code": codeVal, "token": token }, function (data) {
                if (data.code == 1000) {
                    window.location.href = "/register/success.html";
                } else if (data.code == 4) {
                    m_register.errotip("#regcode", "验证码错误");
                }
            });
        } else {
            m_register.username("#regname");
            m_register.mail("#regmail");
            m_register.pass("#regpass");
            m_register.code("#regcode");
            m_register.repass("#regpass1");
        }
    }
};
var m_login = {
    type: 0,
    check: function (obj) {
        m_register.num++;
        if (m_register.num % 2 == 0) {
            $(obj).removeClass("cur");
            m_login.type = 0;
        }
        else {
            $(obj).addClass("cur");
            m_login.type = 1;

        }
    },
    loginAction: function () {
        var token = $("input[name=_token]").val();
        var nickname = $("input[name=username]").val();
        var password = $("#passWord").val();
        if (nickname == "") {
            m_register.errotip("#userName", "请输入用户名/手机/邮箱");
            $("#passWord").next("p").hide();
            return false
        } else if (password == "") {
            m_register.errotip("#passWord", "请输入密码");
            $("#userName").next("p").hide();
            return false;
        }
        T.ajaxJsonp(i_url + "/api/login", { "nickname": nickname, "password": password, "type": m_login.type, "token": token }, function (data) {
            if (data.code == 1000) {
                $("#user_erro").hide();
                $("#pass_erro").hide();
                if ($.cookie("ismy") != null) {
                    window.location.href = "my.html?t="+ new Date().getTime()+Math.random();
                } else {
                    window.history.go(-1);
                    location.href = document.referrer;
                }
            } else {
                if (data.code == 801) {/*用户名错误*/
                    //console.log(data.msg)
                    $("#user_erro").addClass("erroTxt").show().html("用户名错误");
                    $("#passWord").next("p").hide();
                } if (data.code == 803) {/*密码错误*/
                    //console.log(data.msg)
                    $("#pass_erro").addClass("erroTxt").show().html("密码错误");
                    $("#userName").next("p").hide();
                }
            }
        });
    }
};

var is_channelApp = 1;

function GetRequestS() {
    var url = location.search; //获取url中"?"符后的字串
    if (url.indexOf("?") != -1) {
        var str = url.substr(1);
        if (url.indexOf("isH5=2") < 0) {
            is_channelApp = 1
        } else {
            is_channelApp = 2
        }
    }
}

GetRequestS();

//找回密码
var forgot_password = {
    /*isphone:function(str){
        var reg =/^1[3|4|5|7|8]\d{9}$/;
        return reg.test(str);
    },*/
    step_1: function (s) {
        var url = "/lostPassword/checkEmail";
        var mailVal = $(s).val();
        if ($.trim(mailVal) == "") {
            m_register.errotip(s, "请输入邮箱");
        } else if (!m_register.isEmail(mailVal)) {
            m_register.errotip(s, "邮箱格式不对")
        } else {
            T.restPost(url, { "email": mailVal }, function (data) {
                if (data.code == 1000) {
                    m_register.inputtip(s, "填写正确");
                    m_register._email = true;
                } else {
                    m_register.errotip(s, "邮箱不存在");
                    m_register._email = false;
                }
            }, function (data) {
                alert(data.msg);
            });
        }
    },
    sendEmail: function () {
        var email = $("input[name=lostMail]").val();
        var url = "/lostPassword/stepOne?isH5=1";
        T.restPost(url, { "email": email }, function (data) {
            if (data.code == 1000) {
                /*alert("成功");*/
                window.location.href = '/lostPassword-2?isH5=' + is_channelApp + '&email=' + encodeURI(email) + "&nickname=" + encodeURI(data.data.nickname) + "&uid=" + data.data.uid;
            }
        }, function (data) {
            alert(data.msg);
        });
    },
    sendClick: function () {
        var uid = $("input[name=use_id]").val();
        var nickname = $("input[name=nickname]").val();
        var email = $("input[name=email]").val();
        var url = "/lostPassword/againSend?isH5=1";
        T.restPost(url, { "uid": uid, 'nickname': nickname, 'email': email }, function (data) {
            if (data.code == 1000) {
                alert("发送成功");
            } else {
                alert(data.msg);
                if (data.code == 806) {
                    window.location.href = '/lostPassword-1?isH5=' + is_channelApp;
                }
            }
        });

    },
    upadtade_pswd: function () {
        var uid = $("input[name=use_id1]").val();
        var token = $("input[name=token]").val();
        var password1 = $("input[name=password_1]").val();
        var password2 = $("input[name=password_2]").val();
        var url = "/lostPassword/stepThree?isH5=1";
        if (m_register._repass && m_register._pass) {
            T.restPost(url, { "uid": uid, 'token': token, 'password1': password1, 'password2': password2 }, function (data) {
                if (data.code == 1000) {
                    alert("修改成功");
                    window.location.href = '/lostPassword-4?isH5=' + is_channelApp;
                }
            }, function (data) {
                alert(data.msg);
            });
        }
    }
};


$(function () {
    $("#codeImg").attr("src", "https://" + domain_name + "i.dmzj.com/code/getCode");
    $("body").css("background", "#fff");
    $("#qqBtn").attr("href", qq_url);
    $("#sinaBtn").attr("href", weibo_url);
    // $("#wxBtn").attr("href",wx_url);
    $(".verify_code").click(function () {
        $(this).attr("src", i_url + '/code/getCode?' + Math.random());
    });
    m_register.inputStyle("userInput", 74);
    m_register.inputStyle("passInput", 74);
    m_register.inputStyle("RegInput", 37);
    m_register.inputStyle("CodInput", 138);
    m_register.inputStyle("globalInput", 37);
});

window.onresize = function () {
    m_register.inputStyle("userInput", 74);
    m_register.inputStyle("passInput", 74);
    m_register.inputStyle("RegInput", 37);
    m_register.inputStyle("CodInput", 138);
};


/*
$(window).on("orientationchange",function(){
    if(window.orientation == 0 || window.orientation == 180){
        alert($(document).innerWidth())
    }else{
        alert($(document).innerWidth())
    }
})*/
