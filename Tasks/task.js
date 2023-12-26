// find only number from array from any position 

let myarr = [',','&','%','$128+','+','*',')','<('];

let myarr2 = myarr.filter((item) => {
    return !isNaN(item);
}

console.log(myarr2)