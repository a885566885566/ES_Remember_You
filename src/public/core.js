function getInputValue(value){
    if( value === undefined ||
        value == null ||
        value.length <= 0 ||
        value.indexOf('\"') >= 0 ||
        value.indexOf('\\') >= 0 ||
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


