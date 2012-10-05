(function ($) {

    Drupal.behaviors.geofield_widget = {
        attach: attach
    };

    function attach(context, settings) {
        $('.geofield-leaflet-widget').once().each(function(i, item) {
            var id = $(item).attr('id'),
                options = settings.geofield_leaflet_widget[id].settings,
                geojson = settings.geofield_leaflet_widget[id].geojson,
                widget = new LeafletDrawWidget(item, geojson, options.map),
                submit_handler = widget.getSubmitHandler($('#' + options.dest));

            // Serialize data and set input value on submit.
            $(item).parents('form').bind('submit', submit_handler);
        });
    }

    /**
     * Maintains the individual state of a input map widget.
     */
    var LeafletDrawWidget = L.Class.extend({

        options: {
            defaultVectorStyle: {
                color: '#0033ff',
            },
            selectedVectorStyle: {
                color: '#F00',
            }
        },

        /**
         * Initialize map & widget.
         */
        initialize: function (item, data, options) {
            // Init map.
            this.map = L.map(item, { select: true });

            // Add controls.
            var shape_options = {
                    color: '#F0F',
                    opacity: 0.9,
                    fillColor: '#F0F',
                    fillOpacity: 0.2
                },
                draw_control = new L.Control.Draw({
                    position: 'topright',
                    polyline: { shapeOptions: shape_options },
                    polygon: { shapeOptions: shape_options },
                    circle: false,
                    rectangle: false
                });
            this.map.addControl(draw_control);

            // Adding layers.
            this.map.addLayer(L.tileLayer(options.baseUrl));
            this.vectors = L.layerGroup().addTo(this.map);
            this.selected = L.featureGroup();
            this.unserialize(data);//.addTo(this.map);

            // Map event handlers.

            // Vector creation:
            this.map.on('draw:poly-created draw:marker-created', this._onCreated, this);

            this.map.on({
                selected: function (e) {
                    var layer = e.layer;
                    if (layer instanceof L.Path) {
                        layer.setStyle(this.options.selectedVectorStyle);
                    }
                },
                deselected: function (e) {
                    var layer = e.layer;
                    if (layer instanceof L.Path) {
                        layer.setStyle(this.options.defaultVectorStyle);
                    }
                },
                layerremove: function (e) {
                    var layer = e.layer;
                    this.vectors.removeLayer(layer);
                }
            }, this);

            this.map.setView([49.26, -123.11], 10);
        },

        /**
         * Add vector layers.
         */
        _addVector: function (feature) {
            this.vectors.addLayer(feature);
        },

        /**
         * Handle features drawn by user.
         */
        _onCreated: function (e) {
            var key = /(?!:)[a-z]+(?=-)/.exec(e.type)[0];
            vector = e[key] || false;

            if (vector) {
                this._addVector(vector);
            }
        },

        /**
         * Read GeoJSON features into widget vector layers.
         */
        unserialize: function (data) {
            var on_each = function (feature, layer) { this._addVector(layer) },
                options = {
                    onEachFeature: $.proxy(on_each, this)
                };
            return L.geoJson(data, options);
        },

        /**
         * Write widget vector layers to GeoJSON.
         */
        serialize: function () {
            var geometry,
                features = [];

            this.vectors.eachLayer(function (layer) {
                geometry = this.vectorToGeometry(layer);
                features.push(this.feature(geometry));
            }, this);

            return JSON.stringify(this.featureCollection(features));
        },

        getSubmitHandler: function ($dest) {
            return $.proxy(function submit_handler() {
                $dest.val(this.serialize());
            }, this);
        },

        /**
         * TODO: Break this up into individual 'toGeomtery' methods on each 
         *       vector layer.
         */
        vectorToGeometry: function (vector) {
            var geometry = {};

            if (vector instanceof L.MultiPolygon) {
                geometry.type = "MultiPolygon";
                geometry.coordinates = [];
                vector.eachLayer(function (layer) {
                    geometry.coordinates.push(this.vectorToGeometry(layer).coordinates);
                }, this);
            }
            else if (vector instanceof L.MultiPolyline) {
                geometry.type = "MultiLineString";
                geometry.coordinates = [];
                vector.eachLayer(function (layer) {
                    geometry.coordinates.push(this.vectorToGeometry(layer).coordinates);
                }, this);
            }
            else if (vector instanceof L.FeatureGroup) {
                geometry.type = "MultiPoint";
                geometry.coordinates = [];
                vector.eachLayer(function (layer) {
                    var obj = this.vectorToGeometry(layer);
                    // We're assuming a FeatureGroup only contains Points
                    // (currently no support for 'GeometryCollections').
                    if (obj.type !== "Point") return;
                    geometry.coordinates.push(obj.coordinates);
                }, this);
            }
            else if (vector instanceof L.Polygon) {
                geometry.type = "Polygon";
                geometry.coordinates = [this._latLngsToCoords(vector.getLatLngs())];
            }
            else if (vector instanceof L.Polyline) {
                geometry.type = "LineString";
                geometry.coordinates = this._latLngsToCoords(vector.getLatLngs());
            }
            else if (vector instanceof L.Marker) {
                geometry.type = "Point";
                geometry.coordinates = this._latLngToCoord(vector.getLatLng());
            }

            return geometry;
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
                coord;

            for (var i = 0, len = latlngs.length; i < len; i++) {
                coord = this._latLngToCoord(latlngs[i]);
                coords.push(coord);
            }

            return coords;
        },

        _latLngToCoord: function (latlng) {
            return [latlng.lng, latlng.lat];
        }
    });
}(jQuery));
