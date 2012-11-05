(function ($) {

    Drupal.leaflet_widget = Drupal.leaflet_widget || {};

    Drupal.behaviors.geofield_widget = {
        attach: attach
    };

    function attach(context, settings) {
        $('.leaflet-widget').once().each(function(i, item) {
            var id = $(item).attr('id'),
                options = settings.leaflet_widget_widget[id];

            L.Util.extend(options.map, {
                layers: [L.tileLayer(options.map.base_url)],
            });

            var map = L.map(id, options.map);
            map.widget.enable();

            // Serialize data and set input value on submit.
            $(item).parents('form').bind('submit', $.proxy(map.widget.write, map.widget));

            Drupal.leaflet_widget[id] = map;
        });
    }

}(jQuery));
