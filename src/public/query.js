
var orderData = {}

$(document).ready(function() {    
    var productObj = {}
    $.getJSON("./initial", (data)=>{
        productObj = data
        if(data.status !== "Success"){
            $(location).attr("href", "./login.html")
        }

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

            var specBlock = $(`<table class="simple wid_half"></table>`)
            product["ProductSpec"].forEach((spec, idx)=>{
                specBlock.append($(`<tr></tr>`)
                        .append( $(`<td class="text_right right_line"></td>`).text(productObj[product["ProductType"]].spec[idx].name) )
                        .append($(`<td></td>`).text(spec)))
                    .append
            })
            const maskName = product["DestName"].substring(0, 1) + " O " + product["DestName"].substring(2, product["DestName"].length)
            specBlock.append( $(`<tr><td class="text_right right_line">送給誰呢</td></tr>`)
                        .append( $(`<td></td>`).text(maskName)))
                     .append( $(`<tr><td class="text_right right_line">流水編號</td></tr>`)
                        .append( $(`<td></td>`).text(("000"+product.CardId).slice(-4))))

            var block = $(`<div class="left_border_2vw border_blue content_small"></div>`)
                .append($(`<div class="div_center"></div>`)
                    .append($(`<label class="fine">禮物種類</label>`))
                    .append($(`<p class="star_info"></p>`).text(prodName)))
                .append($(`<div class="content_tiny div_center"></div>`)
                    .append(specBlock))
                .append($(`<div class="bottom_line"></div>`))

            var receiver_block = $(`<div class="content_small narrow left_border_2vw border_blue right_float"></div>`)
                .append($(`<div><label>收件人</label></div>`)
                    .append($(`<p class="abs_right"></p>`).text(product["DestName"])))
                .append($(`<div><label>系級</label></div>`)
                    .append($(`<p class="abs_right"></p>`).text(product["Department"])))
                .append($(`<div><label>fb連結</label></div>`)
                    .append($(`<p class="abs_right"></p>`).text(product["Contact"])))

            //block.append(receiver_block)
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

            var order_block = $(`<table class="wid_half content_tiny simple"></table>`)
                .append( $(`<tr><td class="text_right">下單時間</td></tr>`)
                    .append($(`<td></td>`).text(buyDate + buyTime)))
                .append( $(`<tr><td class="text_right">應付金額</td></tr>`)
                    .append($(`<td></td>`).attr("id", "price_"+order["BuyTime"]).text(order["Price"])))

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
                    var validBlock = $(`<tr></tr>`)
                    validBlock.append( $(`<td></td>`))
                        
                    var btn = $(`<button>確認繳費</button>`).val(btnid).attr('id', btnid)
                    validBlock.append($(`<td></td>`)
                        .append( $(`<div class="div_center"></div>`)
                            .append($(`<input type="checkbox"></input>`).attr("id","ch_"+btnid).attr("value", btnid))
                            .append($(`<label for="useDiscount">使用折價券</label>`)))
                        .append(btn))
                    order_block.append(validBlock)
                }
                $(btn).click((e)=>{
                    const paid_id = $(e.target).attr("value")
                    const special = "#ch_"+paid_id
                    $.get(`/paid_request?id=${paid_id}&hid=${hid}&special=${paid_id}`, (data)=>{
                        console.log(data)
                        $(e.target).hide()
                        $("#submit").trigger('click')
                    })
                })
                $(validBlock).click((e)=>{
                    const price_tag = '#price_'+$(e.target).val()
                    var price = null
                    orderData.OrderInfo.forEach((order)=>{
                        if(order.BuyTime == $(e.target).val())
                            price = order.Price
                    })
                    if($(e.target).prop("checked")==true)
                        $(price_tag).text(price-10)
                    else
                        $(price_tag).text(price)
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

    function getSpecSummaryBlock(obj){
        var block = $(`<div class="div_center narrow content_small"></div>`)
        const prodId = Object.keys(obj)
        prodId.forEach((prod)=>{
            var prodBlock = $(`<div class="left_border_2vw border_brown"></div>`)
                .append($(`<p class="star_info"></p>`).text(obj[prod].Name))
            obj[prod].Spec.forEach((spec)=>{
                var specBlock = $(`<div class="left_border_2vw border_blue"></div>`)
                    .append($(`<p></p>`).text(spec.name))
                var detail = $(`<div class="left_border_2vw border_blue"></div>`)
                var spec_key = Object.keys(spec.detail)
                spec_key.forEach((key)=>{
                    detail.append($(`<div class="content_tiny"></div>`)
                        .append($(`<p class="col_right"></p>`).text(key))
                        .append($(`<p class="col_left"></p>`).text(spec.detail[key])))
                    .append($(`<div class="bottom_line"></div>`))
                })
                specBlock.append(detail)
                prodBlock.append(specBlock)
            })
            block.append(prodBlock)
        })
        return block
    }

    function getBuyerSummaryBlock(obj){
        var block = $(`<div class="div_center content_tiny"></div>`)
        var table = $(`<table></table>`)
        obj.forEach((buyer)=>{
            var line = $(`<tr></tr>`)
                .append($(`<td></td>`).text(buyer.Name))
                .append($(`<td></td>`).text(buyer.Sid + "\n" + buyer.Phone))
                .append($(`<td></td>`).text(buyer.Email + "\n" + buyer.FB))
            table.append(line)
        })
        block.append(table)
        return block
    }
    $("#query_mode").change(()=>{
        if( $("#query_mode").val() == "personal" )
            $("#personal_info").show()
        else
            $("#personal_info").hide()
    })
    function getLuckyguyBlock(obj){
        var block = $(`<div class="div_center content_tiny"></div>`)
        var table = $(`<table></table>`)
        var key = Object.keys(obj)
        key.forEach((k)=>{
            obj[k].forEach((prod)=>{
                prod.ProductType
            })
        })
    }
    $("#submit").click(()=>{
        const mode = $("#query_mode").val()
        var hid = "none"

        if(mode == "personal"){
            var sid = getInputValue($("#sid").val())
            var uname = getInputValue($("#uname").val())
            if (sid !== false && uname !== false)
                hid = md5(sid + uname)
        }
        $.get(`/query?hid=${hid}&mode=${mode}`).done((result)=>{
            console.log(result)
            if(result.status === "Permission deny"){
                alert("請先登入!")
                $(location).attr("href", "./login.html")
            }
            else if(result.status !== "failed"){
                var valid = false
                if(result.status === "login") valid = true
                if(mode == "personal"){
                    var summary_block = genOrdersBlock(result.query, hid, valid)
                    orderData = result.query
                    console.log(summary_block)
                }
                else if(mode == "spec")
                    var summary_block = getSpecSummaryBlock(result.query)
                else if(mode == "buyer")
                    var summary_block = getBuyerSummaryBlock(result.query)
                console.log(result.query)

                $("#query_result").empty()
                $("#query_result").append(summary_block)
            }
            else{
                alert("帳號密碼輸入錯誤 或 尚未購買任何商品")
            }
        })
    })
});

