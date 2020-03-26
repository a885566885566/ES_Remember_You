$(document).ready(function(){
    purchaseCounter = 0

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

        /* Add click event listener after each new btn was created */
        $(`#btn_close${purchaseCounter}`).click((e)=>{
            $(e.target).hide()
            $(e.target).parent().addClass("about_delete")
            setTimeout(()=>{
                $(e.target).parent().remove()
            }, 1000)
        })
        purchaseCounter++
    })
})

