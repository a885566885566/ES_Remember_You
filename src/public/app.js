var productPrice = {}

$(document).ready(function(){
    var purchaseCounter = 0
    $.getJSON("./initial", (data)=>{
        productPrice = data
    })

    /* 
     * Create new purchase block when add button clicked.
     * Add close botton's click listener in the end
     */
    $("#btn_add_purchase").click(()=>{
        var newBlock = $(`
            <div class="purchase_item slim_border" id="purchase_no${purchaseCounter}">
            <div class="purchase_info">
            <p class="info_header">商品設定</p>
            <div class="div_question">
            <label for="type">商品種類</label>
            <select id="type">
            <option value="productA">Product A</option>
            <option value="productB">Product B</option>
            <option value="productC">Product C</option>
            </select>
            </div>
            <div class="div_question">
            <label for="spec">商品規格</label>
            <select id="spec">
            <option value="specA">Spec A</option>
            <option value="specB">Spec B</option>
            </select>
            </div>
            </div>
            <div class="dest_info">
            <p class="info_header">收件人設定</p>
            <div class="div_question">
            <label for="dest_name">姓名</label>
            <input id="dest_name"></input>
            </div>
            </div>
            <button class="circle" id="btn_close${purchaseCounter}">X</button>
            </div>`)
        $("#purchase_list").append(newBlock)
        calculatePrice()

        /* Add click event listener after each new btn was created. */
        $(`#btn_close${purchaseCounter}`).click((e)=>{
            $(e.target).hide()
            $(e.target).parent().addClass("about_delete")
            setTimeout(()=>{
                $(e.target).parent().remove()
                calculatePrice()
            }, 1000)
        })

        /* Add price change event listener. */
        $(newBlock).find("#type").change(()=>{
            calculatePrice()
        })
        purchaseCounter++
    })

    function getInputValue(value){
        if(value.indexOf('<') >= 0 ||
            value.indexOf('>') >= 0 ||
            value.indexOf('(') >= 0 ||
            value.indexOf(')') >= 0 ||
            value.indexOf('.') >= 0 ||
            value.indexOf(',') >= 0){
            alert("Warning ! Input format error!")
            return false
        }
        return value
    }

    /*
     * Calculate total price accordign to discount rule, and return
     * actual price.
     */
    function calculatePrice(){
        var totalPrice = 0
        var children = $("#purchase_list").children()
        $.each(children, (idx, child)=>{
            var id = $(child).attr("id")
            var product_type = $(child).find("#type").val()
            totalPrice += productPrice[product_type]
        })

        /* discount rule */
        if( totalPrice > 250 ) totalPrice -= 20
        else if(totalPrice > 150 ) totalPrice -= 10

        $("#price_tag").text(totalPrice)
        return totalPrice
    }

    /* Order submit */
    $("#btn_submit").click(()=>{
        var price = calculatePrice()

        /* Create order list */
                var orderList = []
        var children = $("#purchase_list").children()

        var inputCheck = true;
        $.each(children, (idx, child)=>{
            var destName = getInputValue($(child).find("#dest_name").val())
            if (destName === false) inputCheck = false

            var order = {
                "ProductType": $(child).find("#type").val(),
                "ProductSpec": $(child).find("#spec").val(),
                "DestName": destName
            }

            orderList.push(order)
        })
        var summary = {
            "testid":{
                "Name":"Test",
                "Sid":"E12345678",
                "Phone":"0912345678",
                "Products":orderList,
                "Paid":false,
                "PaidTime":"",
                "BuyTIme":"",
                "Cashier":"",
                "Price":price
            }
        }

        if(inputCheck === false){
            alert("Please check your input again!")
        }
        else{
            var url = "/order?str="+JSON.stringify(summary)
            $.getJSON(url, (data)=>{
                console.log(data)
                if(data["Price"] != price)
                    alert("Warning! Price calculation error")
            })
        }
        console.log(summary)
    })
})

