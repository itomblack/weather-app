$( document ).ready(function() {

	//set location
	//LONDON
	// var latitude = 51.5074;
	// var longitude = 0.1278;
	//VANCOUVER
	var latitude = 49.2564744;
	var longitude = -123.141678;

	var currentDate = new Date();
	var tomorrowsDate  = new Date();
	//set tomorrowdate to tomorrows date
	tomorrowsDate.setDate(currentDate.getDate() + 1);

	//Turn tomorrows date into format for api call
	var tomorrow =  tomorrowsDate.getFullYear() + '-' + ("0" + (tomorrowsDate.getMonth() + 1)).slice(-2) + '-' + ("0" + tomorrowsDate.getDate()).slice(-2) + 'T00:00:00'

	// DELETE THIS ADJUSTMENT FOR TOMORROW DATE
	// tomorrow = '2017-01-31T00:00:00';

	//set times to collect and peak commute times
	var peakHours = [7, 8, 9, 17, 18, 19];

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
		var wetLevel = isItWetToday()

		if (wetLevel == 'dry') {
			$('#rating').append(' but at least it\'s ' + wetLevel + '.');
		} else if (wetLevel == 'drizzle') {
			$('#rating').append(' with some ' + wetLevel + '.');
		} else if (wetLevel == 'wet') {
			$('#rating').append(' and sadly it\'s ' + wetLevel + '.');
		} else if (wetLevel == 'snow') {
			$('#rating').append('. Watch out for the ' + wetLevel + '!');
		}
		

		// pick out an outfit
	}



	// ************* WORK OUT WHICH RANGE THE TEMP IS IN **************** //
	// ************* *************************************** **************** //
	function inRange(rangeNum) {
		if (rangeNum == 0) { $('#rating').text('Cold as ice'); } 
		else if (rangeNum == 1) { $('#rating').text('Damn cold');	} 
		else if (rangeNum == 2) { $('#rating').text('Quite nippy'); } 
		else if (rangeNum == 3) { $('#rating').text('Fairly mild out'); } 
		else if (rangeNum == 4) { $('#rating').text('Just about right'); } 
		else if (rangeNum == 5) { $('#rating').text('Warm enough'); } 
		else if (rangeNum == 6) { $('#rating').text('Pretty sweaty'); } 
		else if (rangeNum == 7) { $('#rating').text('Melt your balls off'); } 
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
		  	console.log('Agh, the API call messed up :(');
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
		var peakHoursLeft = [];
		var peakAPILocations = [];
		var currentHour = timeConverter(apiCallData.hourly.data[startHour].time)[0].timeHour;
		var wetState;
		var hourlyWetness = "";
		// subtract current hours from each peakHourLeft. If less than 0 then remove it from the array
		peakHours.forEach(function(item, index, object) {
		    if ((item - currentHour) >= 0) {
		    	//store as hours
		    	peakHoursLeft.push(item)
		    	//store as number in api call data array
		    	peakAPILocations.push(item - currentHour)

		    }
		});
		// console.log('peak hours times left: ' + peakHoursLeft);
		// console.log('peak API locations: ' + peakAPILocations);

		//are there still peak hours?
		( peakAPILocations.length == 0 ) ? (
				//if it's too late to do the normal method, choose current weather status to rate wetness
				wetState = currentWeather(apiCallData)
				) : (
				//else, pick out the forecast for peak travel times
				getPeakWeather()
				)

		function getPeakWeather () {
			// get weather for each hour	
			peakAPILocations.forEach(function(item, index, object) {
				//just make a string off all the weather types (removing spaces)
				hourlyWetness = hourlyWetness + apiCallData.hourly.data[item].summary.replace(/\s+/g, '') + ',';
			})

			//remove last comma
			hourlyWetness = hourlyWetness.toLowerCase().slice(0, -1);
			// console.log(hourlyWetness);
			
			//rate wetness
			wetState = rateWetness(hourlyWetness);
		}

		
		//return wet drizzle or dry
		return(wetState);
	}



	// ************* GET WET STATE OF HOURLY SUMMARIES ***************** //
	// ************* ********************************* **************** //
	function rateWetness(hourlyWetness) {
			//if contains rain, return wet
			//if contains no rain but drizzle return drizzle
			//if neither rain nor drizzle, return dry
			//if it has snow return snowy
			if ( occurrences(hourlyWetness, "rain") >= 1 ) {
				return('wet');
			} else if ( occurrences(hourlyWetness, "drizzle") >= 1 ) {
				return('drizzle');
			} else if ( occurrences(hourlyWetness, "rain") == 0 && occurrences(hourlyWetness, "snow") == 0 ) {
				return('dry');
			} else if ( occurrences(hourlyWetness, "snow") >= 1 ) {
				return('snow');
			}
	}


	// ************** GET WET STATE OF CURRENT WEATHER ***************** //
	// ************* ********************************* **************** //
	function currentWeather(apiCallData) {
		console.log(apiCallData);
		//use precipIntensity to work out wetness - doesnt work for snow at the mo though
		if ( apiCallData.currently.precipIntensity <= 0.13 ) {
			return('dry');
		} else if ( apiCallData.currently.precipIntensity <= 0.22 ) {
			return('drizzle');
		} else if ( apiCallData.currently.precipIntensity > 0.22 ) {
			return('wet');
		}

	} // ***** END CURRENTWEATHER **** //



	/** Function that count occurrences of a substring in a string;
	 * @param {String} string               The string
	 * @param {String} subString            The sub string to search for
	 * @param {Boolean} [allowOverlapping]  Optional. (Default:false)
	 *
	 * @author Vitim.us https://gist.github.com/victornpb/7736865
	 * @see Unit Test https://jsfiddle.net/Victornpb/5axuh96u/
	 * @see http://stackoverflow.com/questions/4009756/how-to-count-string-occurrence-in-string/7924240#7924240
	 */
	function occurrences(string, subString, allowOverlapping) {

	    string += "";
	    subString += "";
	    if (subString.length <= 0) return (string.length + 1);

	    var n = 0,
	        pos = 0,
	        step = allowOverlapping ? 1 : subString.length;

	    while (true) {
	        pos = string.indexOf(subString, pos);
	        if (pos >= 0) {
	            ++n;
	            pos += step;
	        } else break;
	    }
	    return n;
	}



	// ************* CLICK TOMORROW CALLS TOMORROW DATA **************** //
	// ************* ********************************* **************** //
	$('#btnTomorrow').click(function() { apiCall('tomorrow'); })
	$('#btnNow').click(function() { apiCall('now'); })


}); //END ALL DOCUMENT