$(document).ready(function() {    
    var request = "login"
    function updateFrame(data, redir){
        if(data.status == "Success"){
            $("#try_login").hide()
            $("#already_login").show()
            $("#already_login p").text(`Login as: ${data.uname}`)
            $("#submit").text("Logout")
            request = "logout"
            console.log("Updated Successed")
            if(redir === true)
            $(location).attr("href", "./query.html")
        }
        else{
            $("#uname").val("")
            $("#password").val("")
            $("#try_login").show()
            $("#already_login").hide()
            $("#submit").text("Login")
            request = "login"
            console.log("Updated Failed")
        }
        console.log(data)
    }

    $.get("/login", {
        "mode":"test"
    }).done((data)=>{
        updateFrame(data)
    })

    $("#submit").click((e)=>{
        var msg = {
            "mode":request
        }
        if( request == "login"){
            var uname = getInputValue($("#uname").val())
            var pswd = md5(getInputValue($("#password").val()))
            if (pswd !== false && uname !== false){
                msg.uname = uname
                msg.pswd = pswd
            }
        }
        $.get("/login", msg).done((data)=>{
            if(data.status == "Failed")
                alert("Wrong password")
            console.log(data)
            updateFrame(data, true)
        })
    })
});
