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


