$( document ).ready(function() {

	//set location
	var latitude = 51.5074;
	var longitude = 0.1278;
	var tomorrow = '2016-01-08T00:00:00' //NEED TO MAKE THIS WORK OUT THE DATE

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
		apiCall('now'); //which will call afterGotData if successful
	}

	function afterGotData(startHour) {
		//***** 0 = current hour ***** 1 per hours ***** 24 = next day current hour ***** 48 = 2 days time current hour ***//
		var locationName = apiCallData.timezone;
		var currentTempC = apiCallData.currently.temperature;
		var timeStamp = timeConverter(apiCallData.hourly.data[startHour].time);

		$('#time').html(timeStamp[0].timeHour + ':00');
		$('#date').html(timeStamp[0].dateDay + ' ' + timeStamp[0].dateMonth);
		$('#location').html(locationName);
		$('#currentTemp').html(currentTempC + ' &degC');

		// work out what temperature bracket we are in (from current temp)
		if (currentTempC <= 0) { inRange(0);	}
		else if (currentTempC <= 5) { inRange(1); }
		else if (currentTempC <= 10) { inRange(2); }
		else if (currentTempC <= 15) { inRange(3); }
		else if (currentTempC <= 20) { inRange(4); }
		else if (currentTempC <= 25) { inRange(5); }
		else if (currentTempC <= 30) { inRange(6); }
		else if (currentTempC > 30) { inRange(7); }

		// work out whether it's a wet or a dry day (from travel times)
		isItWetToday()


		// pick out an outfit
	}



	// ************* WORK OUT WHICH RANGE THE TEMP IS IN **************** //
	// ************* *************************************** **************** //
	function inRange(rangeNum) {
		if (rangeNum == 0) { $('#rating').text('Cold as ice!'); } 
		else if (rangeNum == 1) { $('#rating').text('Damn cold'); } 
		else if (rangeNum == 2) { $('#rating').text('Pretty nippy'); } 
		else if (rangeNum == 3) { $('#rating').text('Faily mild out'); } 
		else if (rangeNum == 4) { $('#rating').text('Just about right'); } 
		else if (rangeNum == 5) { $('#rating').text('Warm enough'); } 
		else if (rangeNum == 6) { $('#rating').text('Pretty sweaty'); } 
		else if (rangeNum == 7) { $('#rating').text('Melt your balls off!'); } 
	}



	// ************* CALLING THE API DARKSKY **************** //
	// ************* *********************** **************** //
	function apiCall(when) {

		var urlNow = 'https://api.forecast.io/forecast/e4e49949156eaa4a4addd8e71c9bed0b/' + latitude + ',' + longitude + '?units=si&exclude=minutely+daily+flags+alerts';
		var urlTomorrow = 'https://api.forecast.io/forecast/e4e49949156eaa4a4addd8e71c9bed0b/' + latitude + ',' + longitude + ',' + tomorrow + '?units=si&exclude=minutely+daily+flags+alerts';
		
		//choose which API call
		if (when == 'now') {
			urlToUse = urlNow
			startHour = 0;
		}
		else if (when == 'tomorrow') { 
			urlToUse = urlTomorrow 
			startHour = 7;
		}

		//call API
		$.ajax({
		  url: urlToUse,
		  dataType: 'jsonp',
		  success: function (data) {
		  		//store data in variable
		      apiCallData = data;
		      //continue next steps
		      afterGotData(startHour);
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



	// ************* A WET OR A DRY DAY? ************* **************** //
	// ************* ********************************* **************** //
	function isItWetToday() {
		//find out the start time of the current forecast data
		var peakHours = [7, 9, 17, 19];
		var peakHoursLeft = [];
		var peakAPILocations = [];
		var currentHour = timeConverter(apiCallData.hourly.data[startHour].time)[0].timeHour;
		var wetState;
		// subtract current hours from each peakHourLeft. If less than 0 then remove it from the array
		peakHours.forEach(function(item, index, object) {
		    if ((item - currentHour) >= 0) {
		    	//store as hours
		    	peakHoursLeft.push(item)
		    	//store as number in api call data array
		    	peakAPILocations.push(item - currentHour)

		    }
		});
		console.log(peakHoursLeft);
		console.log(peakAPILocations);

		//are there still peak hours?
		( peakAPILocations.length > 0 ) ? (
			//if it's too late to do the normal method, choose current weather status to rate wetness
			wetState = currentWeather(apiCallData)
			) : (
			//else, pick out the forecast for peak travel times
			console.log('false')
			)

		console.log('wetstate = ' + wetState);

		
		//rate wetness


		//return wet damp or dry
	}





	// ************* GET WET STATE OF CURRENT WEATHER * **************** //
	// ************* ********************************* **************** //
	function currentWeather(apiCallData) {
		console.log(apiCallData);
		//use precipIntensity to work out wetness
		if ( apiCallData.currently.precipIntensity <= 0.13 ) {
			console.log('1')
			return('dry');
		} else if ( apiCallData.currently.precipIntensity <= 0.2 ) {
			console.log('2')
			return('drizzle');
		} else if ( apiCallData.currently.precipIntensity > 0.2 ) {
			return('wet');
		}
	} // ***** END CURRENTWEATHER **** //





	// ************* CLICK TOMORROW CALLS TOMORROW DATA **************** //
	// ************* ********************************* **************** //
	$('#btnTomorrow').click(function() { apiCall('tomorrow'); })
	$('#btnNow').click(function() { apiCall('now'); })


}); //END ALL DOCUMENT