$( document ).ready(function() {

	//set location
	var latitude = 51.5074;
	var longitude = 0.1278;

	//set times to collect and peak commute times
	var timesOfDay = [{  
	    'timeslot': '0',
	    'timeHour': '5',
	    'peak': false
	},{  
	    'timeslot': '1',
	    'timeHour': '7',
	    'peak': true
	},{  
	    'timeslot': '2',
	    'time': '9',
	    'peak': true
	},{  
	    'timeslot': '3',
	    'time': '11',
	    'peak': false
	},{  
	    'timeslot': '4',
	    'time': '13',
	    'peak': false
	},{  
	    'timeslot': '5',
	    'time': '15',
	    'peak': false
	},{  
	    'timeslot': '6',
	    'time': '17',
	    'peak': true
	},{  
	    'timeslot': '7',
	    'time': '19',
	    'peak': true
	},{  
	    'timeslot': '8',
	    'time': '21',
	    'peak': false
	}];

	var apiCallData;

	// Get weather info from API
	if ( $('#weather-body').length ) {
		apiCall();
	  //which will call afterGotData if successful
	}

	function afterGotData() {
		//***** 0 = current hour ***** 1 per hours ***** 24 = next day current hour ***** 48 = 2 days time current hour ***//
		var locationName = apiCallData.timezone;
		var currentTempC = apiCallData.currently.temperature;
		var timeStamp = timeConverter(apiCallData.hourly.data[0].time);

		console.log(locationName);
		console.log(currentTempC + ' C');
		console.log('time is ' + timeStamp[0].timeHour + ':00');
		console.log('date is ' + timeStamp[0].dateDay + ' ' + timeStamp[0].dateMonth);

		$('#time').html(timeStamp[0].timeHour + ':00');
		$('#date').html(timeStamp[0].dateDay + ' ' + timeStamp[0].dateMonth);
		$('#location').html(locationName);
		$('#currentTemp').html(currentTempC + ' &degC');


		// console.log(apiCallData);
		// work out what temperature bracket we are in (from current temp)

		// work out whether it's a wet or a dry day (from travel times)

		// pick out 
	}




	


	function apiCall() {
		$.ajax({
		  url: 'https://api.forecast.io/forecast/e4e49949156eaa4a4addd8e71c9bed0b/' + latitude + ',' + longitude + '?units=si&exclude=minutely+daily+flags+alerts',
		  dataType: 'jsonp',
		  success: function (data) {
		  		//store data in variable
		      apiCallData = data;
		      //continue next steps
		      afterGotData();
		  },
		  error: function() {
		  	console.log('Oops, an error occured');
		  }
		  //move on after complete
		});

	//The following wouldn't use jquery, but wont work with Darksky
		// var xhr = new XMLHttpRequest();
		// xhr.open('GET', 'https://api.forecast.io/forecast/e4e49949156eaa4a4addd8e71c9bed0b/51.5074,0.1278');
		// xhr.send(null);


		// xhr.onreadystatechange = function () {
		//   var DONE = 4; // readyState 4 means the request is done.
		//   var OK = 200; // status 200 is a successful return.
		//   if (xhr.readyState === DONE) {
		//     if (xhr.status === OK) 
		//       console.log(xhr.responseText); // 'This is the returned text.'
		//     } else {
		//       console.log('Error: ' + xhr.status); // An error occurred during the request.
		//     }
		//   }

	} // ____END APICALL____

	function timeConverter(UNIX_timestamp){
	  var a = new Date(UNIX_timestamp * 1000);
	  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	  var year = a.getFullYear();
	  var month = months[a.getMonth()];
	  var date = a.getDate();
	  var hour = a.getHours();
	  var min = a.getMinutes();
	  var sec = a.getSeconds();
	  // var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
	  var time = [{
	  	'dateDay' : date,
	  	'dateMonth' : month,
	  	'timeHour' : hour
	  }]
	  return time;
	}


}); //END ALL DOCUMENT