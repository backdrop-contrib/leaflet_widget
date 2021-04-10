(function ($) {

  Backdrop.leaflet_widget = Backdrop.leaflet_widget || {};

  Backdrop.behaviors.geofield_widget = {
    attach: function (context, settings) {
      // Ensure we've set the default icon path to the leaflet library.
      L.Icon.Default.imagePath = Backdrop.settings.leaflet_widget.defaultIconPath;

      $('.leaflet-widget').once().each(function (i, item) {
        var id = $(item).attr('id'),
          options = Backdrop.settings.leaflet_widget_widget[id];

        L.Util.extend(options.map, {
          layers: [L.tileLayer(options.map.base_url)]
        });

        var map = new L.Map(id, options.map);
        map.widget.enable();

        // Serialize data and set input value on submit.
        $(item).parents('form')
          .bind('submit',
            $.proxy(map.widget.write, map.widget)
          );
        // Support for inline entity form. Event mousedown / click is to late.
        $(item).parents('.ief-form').find('.ief-entity-submit').bind(
          'mousedown.leaflet_widget',
          $.proxy(map.widget.write, map.widget)
        );
        // Try our best to provide generic support for forms without a submit
        // event e.g. inline entity forms.
        map.on('draw:marker-created draw:poly-created layerremove', function() {
          // Delay execution since we might rely on event handlers fired after
          // this one.
          // Unfortunately there aren't better events yet.
          // @TODO Add more events to Leaflet.widget.js
          if (Backdrop.settings.leaflet_widget_widget[id].eventDelay) {
            window.clearTimeout(Backdrop.settings.leaflet_widget_widget[id].eventDelay);
            Backdrop.settings.leaflet_widget_widget[id].eventDelay = false;
          }
          Backdrop.settings.leaflet_widget_widget[id].eventDelay = window.setTimeout($.proxy(map.widget.write, map.widget), 500);
        });

        Backdrop.leaflet_widget[id] = map;

        // Geocoder handling.
        $('.field-widget-leaflet-widget-widget a.geocoder-submit', context).bind('click.leaflet_widget_geocoder', function (event) {
          event.preventDefault();
          Backdrop.behaviors.geofield_widget.geocoder(id);
          return false;
        });
        $('.field-widget-leaflet-widget-widget :input.geocoder', context).bind('keydown.leaflet_widget_geocoder', function (event) {
          // React to Tab, Enter, Esc.
          if ($.inArray(event.keyCode, [9, 13, 27]) > -1) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            Backdrop.behaviors.geofield_widget.geocoder(id);
          }
        });
      });
    },

    geocoder: function (id) {
      var elem = $(':input.geocoder', $('#' + id ).parent());
      var handler = Backdrop.settings.leaflet_widget_widget[id].geocoder.handler;
      var map = Backdrop.leaflet_widget[id];
      var url = location.protocol + '//' + location.host + Backdrop.settings.basePath + 'geocoder/service/' + handler+ '?output=json&data=' + Backdrop.encodePath(elem.val());

      var throbber = $('<div class="ajax-progress ajax-progress-throbber"><div class="throbber">&nbsp;</div></div>');
      elem.after(throbber);

      $.ajax({
        url: url,
        type: 'GET',
        dataType: 'json',
        success: function (data, textStatus, jqXHR) {
          if (textStatus == 'success') {
            var latlng = [data.coordinates[1], data.coordinates[0]];
            var add = !map.widget._full;
            if (!add) {
              if((add = confirm(Backdrop.t('The maximum cardinality is reached.\nDo you want to replace last item by the new one?')))) {
                map.removeLayer(map.widget.vectors.getLayers()[0]);
                add = !map.widget._full;
              }
            }
            if (add) {
              map.fire(
                'draw:marker-created',
                { marker: new L.Marker(latlng, { icon: map.drawControl.handlers.marker.options.icon }) }
              );
              map.fitBounds(map.widget.vectors.getBounds());
            }
          }
          else {
            alert(Backdrop.t('No valid geo reference found.'));
          }
        },
        complete: function() {
          // Remove the progress element.
          if (throbber) {
            $(throbber).remove();
          }
        }
      });
    }
  }

}(jQuery));
