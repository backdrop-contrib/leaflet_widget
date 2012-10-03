(function ($) {

    Drupal.behaviors.geofield_widget = {
        attach: attach
    };

    function attach(context, settings) {
        $('.geofield-leaflet-widget').once().each(function(i, item) {
            var i = 0, data = [],
                id = $(item).attr('id'),
                geojson = settings.geofield_leaflet_widget_data[id];

            widget = new Widget(id, item, geojson);
        });
    }

    var Widget = L.Class.extend({

        initialize: function (id, item, data, options) {
            this.id = id;
            this.vectors = [];

            this.map = L.map(item),
            this.map.addLayer(L.tileLayer('http://{s}.tiles.cantrusthosting.com/bing--hybrid/{z}/{x}/{y}.png'));
            this.read(data);

            // Bind write()'s scope context.
            this.write = $.proxy(this.write, this);

            // Write on submit.
            $(item).parents('form').bind('submit', this.write);

            var options = {
                    color: '#F0F',
                    opacity: 0.9,
                    fillColor: '#F0F',
                    fillOpacity: 0.2
                },
                drawControl = new L.Control.Draw({
                    position: 'topright',
                    polyline: { shapeOptions: options },
                    polygon: { shapeOptions: options },
                    circle: false,
                    rectangle: false
                }),
                drawnItems = L.layerGroup();

            this.map.on('draw:poly-created', function (e) {
                this.addVector(e.poly);
                this.map.addLayer(e.poly);
            }, this);
            this.map.on('draw:marker-created', function (e) {
                this.addVector(e.marker);
                this.map.addLayer(e.marker);
            }, this);

            this.map.setView([49.26, -123.11], 10);
            this.map.addControl(drawControl);
        },

        read: function (data) {
            var on_each_feature = function (featureData, layer) {
                    this.addVector(layer);
                },
                layer = L.geoJson(data, {
                    onEachFeature: $.proxy(on_each_feature, this)
                });

            this.map.addLayer(layer);
        },

        write: function () {
            var dest = '#' + this.id + '-input',
                features = [],
                i, len;

            for (i = 0, len = this.vectors.length; i < len; i++) {
                features.push(this.vectorToFeature(this.vectors[i]));
            }

            $(dest).val(JSON.stringify(this.featureCollection(features)));
        },

        vectorToFeature: function (vector) {
            var geometry = {};

            if (vector instanceof L.MultiPolygon) {
                geometry.type = "MultiPolygon";
                geometry.coordinates = [];
                vector.eachLayer(function (layer) {
                    geometry.coordinates.push([this._latLngsToCoords(layer.getLatLngs())]);
                });
            }
            else if (vector instanceof L.Polygon) {
                geometry.type = "Polygon";
                geometry.coordinates = [this._latLngsToCoords(vector.getLatLngs())];
            }
            else if (vector instanceof L.MultiPolyline) {
                geometry.type = "MultiLineString";
                geometry.coordinates = [];
                vector.eachLayer(function (layer) {
                    geometry.coordinates.push(this._latLngsToCoords(layer.getLatLngs()));
                });
            }
            else if (vector instanceof L.Polyline) {
                geometry.type = "LineString";
                geometry.coordinates = this._latLngsToCoords(vector.getLatLngs());
            }
            else if (vector instanceof L.Marker) {
                geometry.type = "Point";
                geometry.coordinates = this._latLngToCoord(vector.getLatLng());
            }

            return this.feature(geometry);
        },

        featureCollection: function (features) {
            return {
                type: 'FeatureCollection',
                features: features || []
            };
        },

        feature: function (geometry, properties) {
            return {
                "type": "Feature",
                "geometry": geometry,
                "properties": properties || {}
            };
        },

        _latLngsToCoords: function (latlngs) {
            var coords = [],
                coord,
                i, len;

            for (i = 0, len = latlngs.length; i < len; i++) {
                coord = this._latLngToCoord(latlngs[i]);
                coords.push(coord);
            }

            return coords;
        },

        _latLngToCoord: function (latlng) {
            return [latlng.lat, latlng.lng];
        },

        addVector: function (feature) {
            this.vectors.push(feature);
        }
    });
}(jQuery));
