function getInputValue(value){
    if( value === undefined ||
        value == null ||
        value.length <= 0 ||
        value.indexOf('\"') >= 0 ||
        value.indexOf('\'') >= 0 ||
        value.indexOf('<') >= 0 ||
        value.indexOf('>') >= 0 ||
        value.indexOf('(') >= 0 ||
        value.indexOf(')') >= 0 ||
        value.indexOf(' ') >= 0 ||
        value.indexOf(',') >= 0){
        return false
    }
    return value
}

function calculatePrice(products, productObj){
    var totalPrice = 0
    products.forEach((product)=>{
        var product_type = product["ProductType"]
        totalPrice += productObj[product_type].price
        if(product.ProductSpec.indexOf("不加購") < 0)
            totalPrice += productObj.productD.price
    })

    /* discount rule */
    if( totalPrice >= 550 ) totalPrice -= 50
    else if( totalPrice >= 440 ) totalPrice -= 40
    else if( totalPrice >= 330 ) totalPrice -= 30
    else if( totalPrice >= 220 ) totalPrice -= 20
    else if(totalPrice >= 150 ) totalPrice -= 10

    return totalPrice
}

module.exports.getInputValue = getInputValue 
module.exports.calculatePrice =  calculatePrice 
