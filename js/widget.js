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
            $(item).parents('form').bind('submit', widget.write);
        });
    }

    function Widget(id, item, data, options) {
        this.id = id;
        this.features = [];

        // Bind write()'s scope context.
        this.write = $.proxy(this.write, this);

        var on_each_feature = $.proxy(function (featureData, layer) {
            this.addFeature(layer);
        }, this);

        var options = {
                color: '#F0F',
                opacity: 0.9,
                fillColor: '#F0F',
                fillOpacity: 0.2
            },
            map = L.map(item),
            drawControl = new L.Control.Draw({
                position: 'topright',
                polyline: { shapeOptions: options },
                polygon: { shapeOptions: options },
                circle: { shapeOptions: options },
                rectangle: {shapeOptions: options }
            }),
            drawnItems = L.layerGroup();

        L.tileLayer('http://{s}.tiles.cantrusthosting.com/bing--hybrid/{z}/{x}/{y}.png').addTo(map);
        L.geoJson(data, { onEachFeature: on_each_feature }).addTo(map);

        map.on('draw:poly-created draw:rectangle-created draw:circle-created', function (e) {
            console.log(e);
        }, drawnItems);

        map.setView([49.26, -123.11], 10);
        map.addControl(drawControl);
    }

    Widget.prototype.write = function (e) {
        var dest = '#' + this.id + '-input';
        $(dest).val(JSON.stringify({
            type: 'FeatureCollection',
            features: this.data
        }));
        return false;
    };

    Widget.prototype.addFeature = function(feature) {
        this.features.push(feature);
    };
}(jQuery));
