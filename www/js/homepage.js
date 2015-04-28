//side panel
var panel = '<div data-role="panel" class="ui-panel-animate" id="mypanel" data-position="right" data-display="overlay" data-theme="b"><div data-role="header"><h1>Panel</h1></div><ul data-role="listview" data-inset="true"><li class="newsfeed"><a href="#" title="Home">Home</a></li><li class="profile"><a href="#route" title="Route Info">Route Info</a></li><li class="setting"><a href="#livestatus" title="Live Status">Live Status</a></li><li class="logout"><a href="#" title="Train Status">Train Status</a></li><li class="report"><a href="#mapmarker" title="Map View">Map View</a></li></ul></div>';

$(document).one('pagebeforecreate', function () {
    $.mobile.pageContainer.prepend(panel);
    $("#mypanel").panel().enhanceWithin();
});

//-------------------------------------------------Spinner Method-----------------------------------------
$(document).ajaxStart(function () {
    $("#wait").css("display", "block");

});
$(document).ajaxComplete(function () {
    $("#wait").css("display", "none");

});


//side panel ended
var stcode1 = "";
var stcode2 = "";
var trainNo = [];
var rundays = [];
var classes = [];
var spstn1 = "";
var spstn2 = "";
var runningdays = "";
var coachClass = "";
//Select train start//	
$(document).ready(function () {

    $("#sodes").hide();
    if (typeof (Storage) != "undefined") {

        stcode1 = sessionStorage.getItem("st1");
        stcode2 = sessionStorage.getItem("st2");
        ststart = sessionStorage.getItem("stName1");
        stend = sessionStorage.getItem("stName2");
        if (ststart != "" && stend != "") {
            $("#sodes").show();
            document.getElementById("from").innerHTML = ststart;
            document.getElementById("to").innerHTML = stend;
        }
    }
    var apiLink = 'http://api.erail.in/trains/?key=3d970b43-550b-4568-9227-492697f47093&stnfrom=';
    var linkModified = apiLink + stcode1 + "&stnto=" + stcode2;
    var trainDropDown = "<option value='1' disabled='disabled' selected='selected'>Select a Train...</option>";
    $.ajax({
        type: 'GET',
        url: linkModified,
        dataType: 'json',
        success: function (data) {

            for (var i = 0; i < data.result.length; i++) {

                trainNo[i] = data.result[i].trainno;
                rundays[i] = data.result[i].rundays;
                classes[i] = data.result[i].cls;
                //Code for Drop Down list
                trainDropDown += "<option value='" + data.result[i].trainno + "'>" + data.result[i].name + "-" + data.result[i].trainno + "</option>";
            }
            if (data.result.length < 1) {
                trainsListToDisplay = "No trains running on this route";
            }
            document.getElementById('select-train-dd').innerHTML = trainDropDown;
        },
        error: function (x, e) {
            alert('ERROR');
        }
    });
});
//Select train ended

// select specfic station of the city
function fetchSpecificStationList(selectedTrain) {
        var sptrains;
        var apilink = 'http://api.erail.in/route/?key=3d970b43-550b-4568-9227-492697f47093&trainno=';
        apilink += selectedTrain;
        sptrains = "<option value='1' disabled='disabled' selected='selected'>Select a Train...</option>";
        console.log(apilink);
        $.ajax({
            type: 'GET',
            url: apilink,
            dataType: 'json',
            success: function (data) {
                if (data.status == "OK") {

                    for (var i = 0; i < data.result.route[0].stn.length; i++) {
                        sptrains += "<option value='" + data.result.route[0].stn[i].code + "-" + data.result.route[0].stn[i].name + "'>" + data.result.route[0].stn[i].name + "</option>";
                    }
                    document.getElementById('spStation1').innerHTML = sptrains;
                    document.getElementById('spStation2').innerHTML = sptrains;
                } else {
                    document.getElementById('errormessages').innerHTML = data.status;
                }

            },
            error: function (x, e) {
                alert('ERROR');
            }
        });
    }
    // specific station list ends

var selelctedValue = null;

function onSelectValueInDropdown() {
    //Value selected from dropdown
    selelctedValue = $('#select-train-dd :selected').val();
    runningdays = rundays[trainNo.indexOf(selelctedValue)];
    coachClass = classes[trainNo.indexOf(selelctedValue)];
    fetchSpecificStationList(selelctedValue);
    sessionStorage.setItem('trainSelected', selelctedValue);
    sessionStorage.setItem('runningdays', runningdays);
    sessionStorage.setItem('coachClass', coachClass);
    //localStorage.setItem("trainSelected", selelctedValue);
    return selelctedValue;
}

//Get train route	
function getStops() {

        var trainno = onSelectValueInDropdown();
        var apilink = 'http://api.erail.in/route/?key=3d970b43-550b-4568-9227-492697f47093&trainno=';
        apilink += trainno;
        var displayTable = "<table border='1'>"
        displayTable += "<tr><th>Stop Name</th><th>Arrival Time</th><th>Departure Time</th></tr>";

        $.ajax({
            type: 'GET',
            url: apilink,
            dataType: 'json',
            success: function (data) {

                document.getElementById('trainname').innerHTML = data.result.name;
                document.getElementById('trainno').innerHTML = data.result.trainno;

                for (var i = 0; i < data.result.route[0].stn.length; i++) {
                    displayTable += "<tr>";
                    displayTable += "<td>" + data.result.route[0].stn[i].name + "</td>";
                    displayTable += "<td>" + data.result.route[0].stn[i].arr + "</td>";
                    displayTable += "<td>" + data.result.route[0].stn[i].dep + "</td>";
                    displayTable += "</tr>";
                }
                displayTable += "</table>";
                document.getElementById('displaystoplist').innerHTML = displayTable;
            },
            error: function (x, e) {
                alert('ERROR');
            }
        });
    }
    // Get todays date
    //Get current date-http://stackoverflow.com/questions/1531093/how-to-get-current-date-in-javascript
function getTodayDate() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();

    if (dd < 10) {
        dd = '0' + dd
    }

    if (mm < 10) {
        mm = '0' + mm
    }

    today = mm + '/' + dd + '/' + yyyy;

    return today;
}

//LiveStatus function
function splitCode(stcode) {
    var a = stcode.split("-");
    return a[0];
}

function getLiveStatus() {
    var trainno = onSelectValueInDropdown();
    var stncode1 = splitCode(spstn1);
    var apilink = 'http://api.erail.in/live/?key=3d970b43-550b-4568-9227-492697f47093&trainno=';
    apilink += trainno;
    apilink += "&stnfrom=" + stncode1;
    apilink += "&date=" + getTodayDate();
    console.log(apilink);
    $.ajax({
        type: 'GET',
        url: apilink,
        dataType: 'json',
        success: function (data) {
            if (data.status == "OK") {
                alert(data.result.name + "-" + data.result.trainno);
                document.getElementById('trainnm').innerHTML = data.result.name;
                document.getElementById('trainid').innerHTML = data.result.trainno;
                document.getElementById('delayrun').innerHTML = data.result.delayrun;
                document.getElementById('statusat').innerHTML = data.result.statusat;
                document.getElementById('statusmsg').innerHTML = data.result.statusmsg;
                document.getElementById('platform').innerHTML = data.result.platform;
            } else {
                document.getElementById('status').innerHTML = data.status;
            }

        },
        error: function (x, e) {
            alert('ERROR');
        }
    });


}

function setVariables() {
    $("#wait").css("display", "block");
    var outputData = "";

    var a = coachClass.split(' ');
    for (var i = 0; i < a.length; i++) {
        outputData += "<option value='" + a[i] + "'>" + a[i] + "</option>";
    }
    document.getElementById('daysrunning').innerHTML = runningdays;
    document.getElementById('trainclass').innerHTML = outputData;
    $("#wait").css("display", "none");
}

function goBack() {
    window.location.replace('SelectStations.html');
}

function redirectToMap() {
    window.location.replace("Map.html");
}

function seatAvailibility() {

    window.location.replace("SeatAvailibility.html");
}

function onStationSelect() {
    spstn1 = $('#spStation1 :selected').val();
    spstn2 = $('#spStation2 :selected').val();
    sessionStorage.setItem('startStation', spstn1);
    sessionStorage.setItem('endStation', spstn2);
    // localStorage.setItem("startStation",  $('#spStation1 :selected').val());
    //  localStorage.setItem("endStation", $('#spStation2 :selected').val());
}