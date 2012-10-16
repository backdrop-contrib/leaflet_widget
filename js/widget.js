(function ($) {

    Drupal.behaviors.geofield_widget = {
        attach: attach
    };

    function attach(context, settings) {
        $('.geofield-leaflet-widget').once().each(function(i, item) {
            var id = $(item).attr('id'),
                options = settings.geofield_leaflet_widget[id].settings;

            var map = L.map(id, {
                    center: options.map.center,
                    zoom: options.map.zoom,
                    layers: [L.tileLayer(options.map.base_url)],
                    widget: { attach: options.dest },
                    select: true
                });
            map.widget.enable();

            // Serialize data and set input value on submit.
            $(item).parents('form').bind('submit', $.proxy(map.widget.write, map.widget));
        });
    }

}(jQuery));
