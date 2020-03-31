var productObj = {}

$(document).ready(function(){
    var auto_show = {}
    function genProductMultiSpecBlock(productType, spec_id){
        var spec_block = $(`<form class="content_tiny" id="${productType}_spec_container">
            <img class="div_center" id="${productType}_spec_img" src="img/${productType}/spec${spec_id}_0.jpeg">
            </form>`)
        productObj[productType].spec[spec_id].detail.forEach((spec,idx)=>{
            var id=`btn_${productType}_${idx}`
            var btn = $(`
                <div>
                <input type="radio" value="${idx}" name="${productType}_spec1" id="${id}">
                <label for="${id}">${spec}</label>
                </div>`)
            spec_block.append(btn)
        })
        auto_show[productType] = {}
        auto_show[productType]["maxLen"] = productObj[productType].spec[spec_id].detail.length
        auto_show[productType]["nowIdx"] = 0
        auto_show[productType]["interval_obj"] = setInterval(()=>{
            $(`#btn_${productType}_${auto_show[productType]["nowIdx"]}`).prop('checked', true)
            $(`#${productType}_spec_img`).attr("src", `img/${productType}/spec${spec_id}_${auto_show[productType]["nowIdx"]}.jpeg`)
            auto_show[productType]["nowIdx"] += 1
            auto_show[productType]["nowIdx"] %= auto_show[productType]["maxLen"]
            //console.log(`btn_${productType}_${auto_show[productType]["nowIdx"]}`)
        }, 1000)

        /*
        $(`input[type=radio][name=${productType}_spec${spec_id}]`).change(()=>{
            var idx=$(`input[name=${productType}_spec${spec_id}]:checked`).val()
            console.log("get")
            $("#${productType}_spec_img").attr("src", `img/${productType}/spec1_${spec_id}.jpeg`)
            clearInterval(auto_show[productType]["interval_obj"])
        })
        $(`#btn_${productType}_0`).prop("checked", true)*/

        return spec_block
    }
    function genProductIntroBlock(){
        var spec_block_A = genProductMultiSpecBlock("productA", 1)
        var spec_block_D = genProductMultiSpecBlock("productD", 0)
        $("#prod_cont_A #spec_container").append(spec_block_A)
        $("#prod_cont_D #spec_container").append(spec_block_D)

        $("#prod_cont_A h3").text(productObj.productA.name)
        $("#prod_cont_B h3").text(productObj.productB.name)
        $("#prod_cont_C h3").text(productObj.productC.name)
        $("#prod_cont_D h3").text(productObj.productD.name)
        
        $("#prod_cont_A #spec_cont").text(productObj.productA.description)
        $("#prod_cont_A #price").text("   售價$"+productObj.productA.price)
        $("#prod_cont_B #spec_cont").text(productObj.productB.description)
        $("#prod_cont_B #price").text("   售價$"+productObj.productB.price)
        $("#prod_cont_C #spec_cont").text(productObj.productC.description)
        $("#prod_cont_C #price").text("   售價$"+productObj.productC.price)
        $("#prod_cont_D #spec_cont").html(productObj.productD.description)
        $("#prod_cont_D #price").text("   加購價$"+productObj.productD.price)
    }

    var purchaseCounter = 0
    $.getJSON("./initial", (data)=>{
        productObj = data
        $("#btn_add_purchase").trigger('click')
        genProductIntroBlock()
        
        $('input[type=radio][name=productA_spec1]').change(()=>{
            var idx=$("input[name='productA_spec1']:checked").val()
            $("#productA_spec_img").attr("src", `img/productA/spec1_${idx}.jpeg`)
            clearInterval(auto_show["productA"]["interval_obj"])
        })
        $("#btn_productA_0").prop("checked", true)
        
        $('input[type=radio][name=productD_spec1]').change(()=>{
            var idx=$("input[name='productD_spec1']:checked").val()
            $("#productD_spec_img").attr("src", `img/productD/spec0_${idx}.jpeg`)
            clearInterval(auto_show["productD"]["interval_obj"])
        })
        $("#btn_productD_0").prop("checked", true)
    })

    function genProductSpecBlock(productType){
        var block = $(`<div class="right_float" id="spec"></div>`)
        var specs = productObj[productType].spec
        specs.forEach((spec)=>{
            var wrap = $(`<div></div>`)
            wrap.append( $(`<label for=${spec.name}>${spec.name}</label>`) )
            var sel = $(`<select class="abs_right" id=${spec.name}></select>`)
            spec.detail.forEach((deta)=>{
                sel.append( $(`<option value=${deta}>${deta}</option>`) )
            })
            wrap.append(sel)
            block.append(wrap)
        })
        $(block).find("#加購貼紙").change(()=>{
            calculatePrice()
            console.log("recalculate")
        })
        return block
    }
    /* 
     * Create new purchase block when add button clicked.
     * Add close botton's click listener in the end
     */
    $("#btn_add_purchase").click(()=>{
        var spec_block_A = genProductSpecBlock("productA")
        //var spec_block_D = genProductSpecBlock("productA")
        var newBlock = $(`
            <div class="purchase_item slim_border border_round content_small" id="purchase_no${purchaseCounter}">
            <div class="purchase_info">
            <p class="right_float star_info">商品設定</p>
            <div>
            <label for="type">商品種類</label>
            <select class="abs_right" id="type">
            <option value="productA">${productObj.productA.name}</option>
            <option value="productB">${productObj.productB.name}</option>
            <option value="productC">${productObj.productC.name}</option>
            </select>
            </div>

            <div class="div_question" id="spec_container">
            </div>

            </div>
            <div class="right_float">
            <p class="info_header star_info">收件人設定</p>

            <div>
            <label for="department">系級</label>
            <input class="abs_right" type="text" id="department" required/>
            </div>

            <div>
            <label for="dest_name">姓名</label>
            <input class="abs_right" type="text" id="dest_name" required/>
            </div>

            <div>
            <label for="contact">fb連結</label>
            <input class="abs_right" type="url" id="contact" required/>
            </div>

            <!--div class="div_question">
            <label for="extra">其他聯絡方式</label>
            <input type="text" id="extra" required/>
            </div-->

            </div>
            <button class="circle abs_top" id="btn_close${purchaseCounter}" formnovalidate>X</button>
            </div>`)
        $(newBlock).find("#spec_container").append(spec_block_A)
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
/*
        $(newBlock).find("#加購貼紙").change(()=>{
            calculatePrice()
            console.log("recalculate")
        })*/
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
            var sticker = $(child).find("#加購貼紙").val()
            if(sticker != "不加購"){
                totalPrice += productObj.productD.price
                console.log("val=" + sticker)
            }
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
        var email =   getInputValue( $("#basic_info #email").val() )

        if(bname===false || sid===false || fb_link===false || pnum===false){
            alert("輸入格式錯誤! 所有空格皆為必填，請勿輸入特殊符號，輸入不可包含空格。")
            return false
        }
        else{
            var basicInfo = {
                "Name":bname,
                "Sid":sid,
                "FB":fb_link,
                "Phone":pnum,
                "Email":email
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
            alert("請至少一個購買一個商品!")
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
            alert("輸入格式錯誤! 所有空格皆為必填，請勿輸入特殊符號，輸入不可包含空格。")
            return false
        }
        else{
            summary["OrderInfo"] = [{
                "Products":orderList,
                "Price":price
            }]

            var url = `/order?id=${hid}&str=`+JSON.stringify(summary)
            $.getJSON(url, (data)=>{
                console.log(data)
                if(data.OrderInfo[0]["Price"] != price)
                    alert("金額計算錯誤，請私訊粉專!")
                else
                    alert("訂購成功! 請記得在預購擺攤4/20～4/25 18:30～21:30 期間前往勝後木桌完成付款，訂單才算成立喔！")
                resetOrderList()
            })
        }
    })
})


