function getAllUrlParams(url) {

  // get query string from url (optional) or window
  var queryString = url ? url.split('?')[1] : window.location.search.slice(1);

  // we'll store the parameters here
  var obj = {};

  // if query string exists
  if (queryString) {

    // stuff after # is not part of query string, so get rid of it
    queryString = queryString.split('#')[0];

    // split our query string into its component parts
    var arr = queryString.split('&');

    for (var i=0; i<arr.length; i++) {
      // separate the keys and the values
      var a = arr[i].split('=');

      // in case params look like: list[]=thing1&list[]=thing2
      var paramNum = undefined;
      var paramName = a[0].replace(/\[\d*\]/, function(v) {
        paramNum = v.slice(1,-1);
        return '';
      });

      // set parameter value (use 'true' if empty)
      var paramValue = typeof(a[1])==='undefined' ? true : a[1];

      // if parameter name already exists
      if (obj[paramName]) {
        // convert value to array (if still string)
        if (typeof obj[paramName] === 'string') {
          obj[paramName] = [obj[paramName]];
        }
        // if no array index number specified...
        if (typeof paramNum === 'undefined') {
          // put the value on the end of the array
          obj[paramName].push(paramValue);
        }
        // if array index number specified...
        else {
          // put the value at that index number
          obj[paramName][paramNum] = paramValue;
        }
      }
      // if param name doesn't exist yet, set it
      else {
        obj[paramName] = paramValue;
      }
    }
  }

  return obj;
}



function retrieve_neuron_by_id(key_type,key,session) {
  /*
   * Hook into Information panel to retieve individual neuron information from NA
   */
    msg = {}
    msg['username'] = username;
    msg['servers'] = {}
    msg['data_callback_uri'] = 'ffbo.ui.receive_partial'

    var na_servers = document.getElementById("na_servers");

    try {
        msg['servers']['na'] = na_servers.options[na_servers.selectedIndex].value;
    } catch (err) {
        console.log("na server not valid")
        return;
    }
    msg['task'] = {}
    msg['task']['key_type'] = key_type;
    msg['task']['key'] = key;

    session.call('ffbo.processor.request_by_id', [msg], {}, {
        receive_progress: true
    }).then(
        function(res) {
	    if(typeof res == 'object'){
		if ('error' in res) {
                    Notify(res['error']['message'],null,null,'danger')
                    $("body").trigger('demoproceed', ['error']);
		    return;
		} else if('success' in res) {
		    if('info' in res['success'])
			Notify(res['success']['info']);
		    if('data' in res['success']){
		        console.log(res['success']['data']) 
			data = {'ffbo_json': res['success']['data'],
				'type': 'morphology_json'};
			processFFBOjson(data)
		    }
		}
	    }
	    //console.log(res)
            $("#search-wrapper").unblock();
	    $("body").trigger('demoproceed', ['success']);
        },
        function(err) {
	    console.log(err)
	    Notify(err,null,null,'danger');
            $("body").trigger('demoproceed', ['error']);
            $("#search-wrapper").unblock();
        },
        function(progress) {
            data = {'ffbo_json': progress,'type': 'morphology_json'};
	    processFFBOjson(data);
        }
    );
}


