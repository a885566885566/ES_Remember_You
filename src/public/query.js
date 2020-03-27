$(document).ready(function() {    
    $("#submit").click(()=>{
        var sid = getInputValue($("#sid").val())
        var uname = getInputValue($("#uname").val())
        if (sid !== false && uname !== false){
            $.get("/query", {
                "hid":sid + uname
            }).done((data)=>{
                console.log(data)
            })
        }
    })
});
