
/*
 * DATA LOADING
*/

var accidentsData = null;

$.getJSON('/accidents', function (data) {
    accidentsData = object2array(data);
    console.log(accidentsData)
    createPolar(accidentsData);
})

/*
 * COMPONENT INITIALISATION
*/

$(document).ready(function() {

})