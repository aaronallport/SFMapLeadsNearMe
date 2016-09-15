({
    mapLoaded: function(component, event, helper) {
        var leadsAction = component.get("c.getLeads");
        var leads = {};
        var map = window.L.map("map", {zoomControl: true});

        // https://github.com/pointhi/leaflet-color-markers
        var redIcon = new L.Icon({
            iconUrl: "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
            shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });

        window.L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
        	{
            	attribution: "Tiles © Esri"
            }).addTo(map);

        map.locate({watch: true, setView: true, maxZoom: 16});

       	leadsAction.setCallback(
        	this,
            function(response) {
                var state = response.getState();

                var haversineDistance;

                if (component.isValid() && state === "SUCCESS") {
                    leads = response.getReturnValue();
                    component.set("v.leads", leads);

                    var userLatLng = map.getCenter();

                    // Get all Leads, plot as Markers
                    for (var i = 0; i < leads.length; i++) {
                        if (leads[i].Latitude !== null && leads[i].Longitude !== null) {
                            L.marker([leads[i].Latitude, leads[i].Longitude]).addTo(map)
                            	.bindPopup("<a href=\"/one/one.app#/sObject/" + leads[i].Id + "/view\">" + leads[i].Name + "</a><br /><br />Distance from your location: " + helper.calculateHaversineDistance(leads[i].Latitude, leads[i].Longitude, userLatLng.lat, userLatLng.lng) + " miles");
                        }
                    }

                    var userPosition = L.marker([userLatLng.lat, userLatLng.lng], {icon: redIcon}).addTo(map);

                    map.on('locationfound', function(e) {
                        userPosition.setLatLng(e.latlng);
                    });
                }
            }
        );

        $A.enqueueAction(leadsAction);
	}
})
