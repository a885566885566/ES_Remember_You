$(document).ready(function() {    
    var productObj = {}

    $.getJSON("./initial", (data)=>{
        productObj = data
    })

    function genProductsBlock(products){
        var product_block = $(`<div></div>`)
        products.forEach((product)=>{
            /*
             * {
             *      "ProductType": string,
             *      "ProductSpec": string,
             *      "DestName":    string,
             *      "Department":  string,
             *      "Contact":     string,
             *      "Extra":       string
             */
            var prodName = productObj[product["ProductType"]].name
            var prodSpec =""
            console.log(product["ProductSpec"])
            product["ProductSpec"].forEach((spec, idx)=>{
                prodSpec += productObj[product["ProductType"]].spec[idx].name + ": " + spec + "              "
            })

            var block = $(`<div class="content_small"></div>`)
                .append($(`<div class="div_center"></div>`)
                    .append($(`<label class="fine">禮物種類</label>`))
                    .append($(`<p class="star_info"></p>`).text(prodName)))
                .append($(`<div class="content_tiny div_center"></div>`)
                    .append($(`<label class="fine">禮物規格</label>`))
                    .append($(`<p></p>`).text(prodSpec)))
     
            var receiver_block = $(`<div class="content_small narrow left_border_2vw border_blue right_float"></div>`)
                .append($(`<div><label>收件人</label></div>`)
                    .append($(`<p class="abs_right"></p>`).text(product["DestName"])))
                .append($(`<div><label>系級</label></div>`)
                    .append($(`<p class="abs_right"></p>`).text(product["Department"])))
                .append($(`<div><label>fb連結</label></div>`)
                    .append($(`<p class="abs_right"></p>`).text(product["Contact"])))

            block.append(receiver_block)
            product_block.append(block)
        })
        return product_block
    }

    function genOrdersBlock(personalOrderings, hid, valid){
        var uname = personalOrderings["Name"]
        var sid = personalOrderings["Sid"]
        var phone = personalOrderings["Phone"]
        var orderInfo = personalOrderings["OrderInfo"]
        /*
         * "OrderInfo": {
         *      "Products": [Array],
         *      "Paid": true | false,
         *      "PaidTime": string,
         *      "BuyTime": string,
         *      "Cashier": string (uname),
         *      "Price": number
         * }
         */
        var summary_block = $(`<div class=""></div>`)
        orderInfo.forEach((order)=>{
            var orderInfo_block = $(`<div class="left_border_2vw border_brown"></div>`)
            var buyDate = new Date(order["BuyTime"]).toLocaleDateString()
            var buyTime = new Date(order["BuyTime"]).toLocaleTimeString()

            var order_block = $(`<div></div>`).append()
            var order_block = $(`<div class="div_center narrow content_small"></div>`)
                .append( $(`<div><label>下單時間</label></div>`)
                    .append($(`<p class="abs_right"></p>`).text(buyDate))
                    .append($(`<p class="abs_right"></p>`).text(buyTime)))
                .append( $(`<div><label>應付金額</label></div>`)
                    .append($(`<p class="abs_right"></p>`).text(order["Price"])))
               
            if( order["Paid"] == true ){
                var paid_time = new Date(order["PaidTime"]).toLocaleString()
                var paid_block = $(`
                    <div class="highlight">
                    <div><label>付款狀態</label>
                    <p class="state_great">已付款</p></div>
                    <div><label>付款時間</label>
                    <p>${paid_time}</p></div>
                    <div><label>收款人</label>
                    <p>${order["Cashier"]}</p></div>
                    </div>
                    `)
            }
            else{
                var paid_block = $(`
                    <div class="highlight">
                    <div><label>付款狀態</label>
                    <p class="state_warning">尚未付款</p></div>
                    </div>
                    `)
                if(valid){
                    var btnid = order["BuyTime"]
                    var btn = $(`<button>確認繳費</button>`).val(btnid)
                    btn.attr('id', btnid)
                    order_block.append(btn)
                }
                $(btn).click((e)=>{
                    const paid_id = $(e.target).attr("value")
                    $.get(`/paid_request?id=${paid_id}&hid=${hid}`, (data)=>{
                        console.log(data)
                        $(e.target).hide()
                        $("#submit").trigger('click')
                    })
                })
            }
            var product_block = genProductsBlock(order["Products"])
            orderInfo_block.append(order_block)
            orderInfo_block.append(paid_block)
            orderInfo_block.append(order_block)
            orderInfo_block.append(product_block)
            summary_block.append(orderInfo_block)
        })
        return summary_block
    }

    $("#submit").click(()=>{
        var sid = getInputValue($("#sid").val())
        var uname = getInputValue($("#uname").val())
        if (sid !== false && uname !== false){
            const hid = md5(sid + uname)
            $.get("/query", {
                "hid":hid
            }).done((result)=>{
                console.log(result)
                if(result.status !== "failed"){
                    var valid = false
                    if(result.status === "login") valid = true
                    var summary_block = genOrdersBlock(result.query, hid, valid)
                    console.log(summary_block)
                    $("#query_result").empty()
                    $("#query_result").append(summary_block)
                }
                else{
                    alert("Sorry... You don't have ordering history")
                }
            })
        }
    })

});
