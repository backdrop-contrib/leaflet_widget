(function (Backdrop, $) {

  'use strict';

  Backdrop.behaviors.geofieldWidgetGeocode = {
    attach: function (context, settings) {
      $('.leaflet-widget').once('geofield-widget-geocode').each( function (i, item) {
        // @todo run independent loop? use data object instead?
        let mySelector = '#' + item.id + '-geocode';

        $(mySelector + ' button').on('click', function (ev) {
          // @todo check cardinality and disable/hide stuff.
          let searchText = $('#' + item.id + '-geoinput').val();
          if (!searchText) {
            $(mySelector + ' .message').html('The field to get the value from is empty');// @todo translate
            return;
          }

          // Make sure we only hit this once per second.
          let $button = $(this);
          $button.attr('disabled', true);
          setTimeout( function () {
            $button.removeAttr('disabled');
          }, 1000);

          // Build URL, send request.
          let url = 'https://nominatim.openstreetmap.org/search';
          let params = {
            q: searchText.replace(/\n/g, ', '),
            format: 'json',
            limit: 5
          }
          let message = 'No result found';// @todo translate
          let jqxhr = $.get(url, params, function (data) {
            if (!data.length) {
              return;
            }
            message = 'Result:';
            let ulElem = document.createElement('ul');
            for (let i = 0; i < data.length; i++) {
              let liElem = document.createElement('li');
              let text = document.createTextNode(data[i].display_name + ' ');
              let insertButton = document.createElement('button');
              let buttonText = document.createTextNode('Insert marker');
              insertButton.appendChild(buttonText);
              let coords = {
                lat: data[i].lat,
                lon: data[i].lon
              }
              insertButton.setAttribute('data-coords', JSON.stringify(coords));// aria attrib
              liElem.appendChild(text);
              liElem.appendChild(insertButton);
              ulElem.appendChild(liElem);
            }
            message += ulElem.outerHTML;
          });
          jqxhr.always( function () {
            $(mySelector + ' .message').html(message);
            // this should go to "success" only.
            $(mySelector + ' .message button').on('click', function (event) {
              event.preventDefault();
              if (typeof Backdrop.leafletEditableItems[item.id] == 'undefined') {
                return;
              }
              let mapLayer = Backdrop.leafletEditableItems[item.id].editable;
              let cardinality = Backdrop.leafletEditableItems[item.id].cardinality;
              if (mapLayer.getLayers().length >= cardinality) {
                alert('nope already full');// hm... disable buttons in advance?
                return;
              }
              let coords = JSON.parse(event.target.dataset.coords);
              let latLng = L.latLng(coords.lat, coords.lon);
              mapLayer.addLayer(L.marker(latLng));
              let bounds = mapLayer.getBounds();
              mapLayer._map.fitBounds(bounds);// @todo trigger save to field. how??
            });
          });
        });
      });
    }
  }

})(Backdrop, jQuery);
