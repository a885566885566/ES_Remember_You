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
            var block = $(`
                <div>
                <div class="info"><label>禮物種類</label><p>${prodName}</p></div>
                <div class="info"><label>禮物規格</label><p>${prodSpec}</p></div>
                <div class="info"><label>收件人</label><p>${product["DestName"]}</p></div>
                <div class="info"><label>系級</label><p>${product["Department"]}</p></div>
                <div class="info"><label>臉書主業</label><p>${product["Contact"]}</p></div>
                <div class="info"><label>其他聯絡方式</label><p>${product["Extra"]}</p></div>
                </div>
                `)
            product_block.append(block)
        })
        return product_block
    }
    function genOrdersBlock(personalOrderings){
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
        var summary_block = $(`<div></div>`)
        orderInfo.forEach((order)=>{
            var orderInfo_block = $(`<div></div>`)
            var order_block = $(`
                <div>
                    <div class="info"><label>下單時間</label><p>${order["PaidTime"]}</p></div>
                    <div class="info"><label>應付金額</label><p>${order["Price"]}</p></div>
                </div>
            `)

            if( order["Paid"] === true ){
                var paid_block = $(`
                <div>
                    <div class="info"><label>付款狀態</label><p>已付款</p></div>
                    <div class="info"><label>付款時間</label><p>${order["PaidTime"]}</p></div>
                    <div class="info"><label>收款人</label><p>${order["Cashier"]}</p></div>
                </div>
                `)
            }
            else{
                var paid_block = $(`
                <div>
                    <div class="info"><label>付款狀態</label><p>尚未付款</p></div>
                </div>
                `)
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
            $.get("/query", {
                "hid":sid + uname
            }).done((result)=>{
                console.log(result)
                if(result.status !== "failed"){
                    var summary_block = genOrdersBlock(result.query)
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
