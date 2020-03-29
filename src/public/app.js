var productObj = {}

$(document).ready(function(){
    var purchaseCounter = 0
    $.getJSON("./initial", (data)=>{
        productObj = data
        $("#btn_add_purchase").trigger('click')
    })

    function genProductSpecBlock(productType){
        var block = $(`<div id="spec"></div>`)
        var specs = productObj[productType].spec
        specs.forEach((spec)=>{
            var wrap = $(`<div class="div_question"></div>`)
            wrap.append( $(`<label for=${spec.name}>${spec.name}</label>`) )
            var sel = $(`<select id=${spec.name}></select>`)
            spec.detail.forEach((deta)=>{
                sel.append( $(`<option value=${deta}>${deta}</option>`) )
            })
            wrap.append(sel)
            block.append(wrap)
        })
        return block
    }
    /* 
     * Create new purchase block when add button clicked.
     * Add close botton's click listener in the end
     */
    $("#btn_add_purchase").click(()=>{
        var spec_block = genProductSpecBlock("productA")
        var newBlock = $(`
            <div class="purchase_item slim_border" id="purchase_no${purchaseCounter}">
            <div class="purchase_info">
            <p class="info_header">商品設定</p>
            <div class="div_question">
            <label for="type">商品種類</label>
            <select id="type">
            <option value="productA">${productObj.productA.name}</option>
            <option value="productB">${productObj.productB.name}</option>
            <option value="productC">${productObj.productC.name}</option>
            </select>
            </div>

            <div class="div_question" id="spec_container">
            </div>

            </div>
            <div class="dest_info">
            <p class="info_header">收件人設定</p>

            <div class="div_question">
            <label for="department">系級</label>
            <input id="department" required/>
            </div>

            <div class="div_question">
            <label for="dest_name">姓名</label>
            <input id="dest_name" required/>
            </div>

            <div class="div_question">
            <label for="contact">臉書主頁</label>
            <input id="contact" required/>
            </div>

            <!--div class="div_question">
            <label for="extra">其他聯絡方式</label>
            <input id="extra" required/>
            </div-->

            </div>
            <button class="circle abs_top" id="btn_close${purchaseCounter}" formnovalidate>X</button>
            </div>`)
        $(newBlock).find("#spec_container").append(spec_block)
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
            $(newBlock).find("#spec_container").empty()
            $(newBlock).find("#spec_container").append(genProductSpecBlock(
                $(newBlock).find("#type").val()
            ))
            calculatePrice()
        })
        purchaseCounter++
    })

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
            totalPrice += productObj[product_type].price
        })

        /* discount rule */
        if( totalPrice > 250 ) totalPrice -= 20
        else if(totalPrice > 150 ) totalPrice -= 10

        $("#price_tag").text(totalPrice)
        return totalPrice
    }

    function resetOrderList(){
        $("#purchase_list").empty()
        calculatePrice()
    }

    function checkBasicInfo(){
        var bname =   getInputValue( $("#basic_info #bname").val() )
        var sid =     getInputValue( $("#basic_info #sid").val() )
        var fb_link = getInputValue( $("#basic_info #fb_link").val() )
        var pnum =    getInputValue( $("#basic_info #pnum").val() )

        if(bname===false || sid===false || fb_link===false || pnum===false){
            alert("Bad input in basic information")
            return false
        }
        else{
            var basicInfo = {
                "Name":bname,
                "Sid":sid,
                "FB":fb_link,
                "Phone":pnum
            }
            return basicInfo
        }
    }

    /* Order submit */
    $("#btn_submit").click(()=>{
        /* Basic Info */
        var summary = checkBasicInfo()
        if (summary == false ) return false

        //var hid = summary.Sid
        var hid = md5(summary.Sid + summary.Name)

        var price = calculatePrice()

        /* Create order list */
        if($("#purchase_list").children().length == 0){
            alert("No ordering!")
            return false
        }
        var orderList = []
        var children = $("#purchase_list").children()

        var inputCheck = true
        /* Get details of each product */
        $.each(children, (idx, child)=>{
            var destName = getInputValue($(child).find("#dest_name").val())
            var dept = getInputValue($(child).find("#department").val())
            var cont = getInputValue($(child).find("#contact").val())
            //var etc = getInputValue($(child).find("#extra").val())
            //if (destName==false || cont==false || etc==false) 
            if (destName==false || cont==false || dept==false) 
                inputCheck = false

            var specArr = []
            $(child).find("#spec").find("select").each((idx, elem)=>{
                specArr.push($(elem).val())
            })
            var order = {
                "ProductType": $(child).find("#type").val(),
                "ProductSpec": specArr,
                "DestName": destName,
                "Department": dept,
                "Contact": cont
                //"Extra": etc
            }

            orderList.push(order)
        })

        if (inputCheck == false){
            alert("Please check your input again!")
            return false
        }
        else{
            summary["OrderInfo"] = [{
                "Products":orderList,
                "Paid":false,
                "PaidTime":"",
                "BuyTime":"",
                "Cashier":"",
                "Price":price
            }]

            var url = `/order?id=${hid}&str=`+JSON.stringify(summary)
            $.getJSON(url, (data)=>{
                console.log(data)
                if(data.OrderInfo[0]["Price"] != price)
                    alert("Warning! Price calculation error")
                alert("訂購成功!")
                resetOrderList()
            })
        }
    })
})

function productIntro(){
    var block = $(`
        <></>
        `)
    $("#Acontain_info")
}
