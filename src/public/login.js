$(document).ready(function() {    
    $("#submit").click(()=>{
        var uname = getInputValue($("#uname").val())
        var pswd = md5(getInputValue($("#password").val()))
        if (pswd !== false && uname !== false){
            $.get("/login", {
                "uname":uname,
                "pswd": pswd
            }).done((data)=>{
                console.log(data)
            })
        }
    })
});
