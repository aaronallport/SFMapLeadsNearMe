({
    mapLoaded: function(component, event, helper) {        
        var leadsAction = component.get("c.getLeads");
        var leads = {};
        var map = window.L.map("map", {zoomControl: true, center: [51.505, -0.00], zoom: 16});
        var userPosition;
        var userLatLng;
        var leadPopups = [];
        
        // https://github.com/pointhi/leaflet-color-markers
        var redIcon = new L.Icon({
            iconUrl: "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
            shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
        
        // Draw the map
        window.L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
        	{
            	attribution: "Tiles © Esri"
            }).addTo(map);
        
        // Center the map
       	map.locate({watch: true, setView: true, maxZoom: 16});
        
        // Draw the user
        userLatLng = map.getCenter();
        userPosition = L.marker([userLatLng.lat, userLatLng.lng], {icon: redIcon}).addTo(map);
        
        // Draw the markers, including links to the lead records
        // - Whenever a popup is opened, call the function
        
       	leadsAction.setCallback(
        	this,
            function(response) {
                var state = response.getState();

                if (component.isValid() && state === "SUCCESS") {                    
                    leads = response.getReturnValue();
                    component.set("v.leads", leads);

                    // Get all Leads, plot as Markers
                    for (var i = 0; i < leads.length; i++) {
                        if (leads[i].Latitude !== null && leads[i].Longitude !== null) {
                            leadPopups[i] = L.marker([leads[i].Latitude, leads[i].Longitude])
                            	.bindPopup("<a href=\"/one/one.app#/sObject/" + 
                                	leads[i].Id + "/view\">" + leads[i].Name + 
                                    "</a><br /><br />Distance from your location: " + 
                                    helper.calculateHaversineDistance(leads[i].Latitude, leads[i].Longitude, userLatLng.lat, userLatLng.lng) + 
                                    " miles"
                                )
                            	.addTo(map);                               
                        }
                    }
                }
                
                // Update the user position whenever the map center updates
                map.on("locationfound", function(e) {
                    userPosition.setLatLng(e.latlng);
                    userLatLng = map.getCenter();
                    
                    if (leadPopups !== null && leadPopups !== undefined) {
                        for (var i = 0; i < leadPopups.length; i++) {
                        	leadPopups[i].setPopupContent("<a href=\"/one/one.app#/sObject/" + 
                        		leads[i].Id + "/view\">" + leads[i].Name + 
                            	"</a><br /><br />Distance from your location: " + 
                            	helper.calculateHaversineDistance(leads[i].Latitude, leads[i].Longitude, userLatLng.lat, userLatLng.lng) + 
                            	" miles");                        
                    	}
                    }
                });
            }
        );

        $A.enqueueAction(leadsAction);
	}
})
