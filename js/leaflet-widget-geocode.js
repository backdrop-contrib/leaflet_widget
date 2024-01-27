(function (Backdrop, $) {

  'use strict';

  Backdrop.behaviors.geofieldWidgetGeocode = {
    attach: function (context, settings) {
      $('.leaflet-widget').once('geofield-widget-geocode').each( function (i, item) {
        // @todo run independent loop? use data object instead?
        let mySelector = '#' + item.id + '-geocode';

        $(mySelector + ' .form-text').on('keypress', function (event) {
          if (event.which == 13) {
            $(mySelector + ' .geocode-button').trigger('click');
          }
        });
        $(mySelector + ' .geocode-button').on('click', function (ev) {
          ev.preventDefault();
          let searchText = $('#' + item.id + '-geoinput').val().trim();
          if (!searchText) {
            $(mySelector + ' .message').html('Add some keywords to search for');// @todo translate
            return;
          }
          // Start wait animation.
          $(mySelector + ' .message').addClass('waiting');

          // Make sure we only hit this once per second.
          let $button = $(this);
          $button.attr('disabled', true);
          setTimeout( function () {
            $button.removeAttr('disabled');
          }, 1000);

          // Build URL params and send request.
          let params = {
            q: searchText,
            format: 'json',
            limit: 5
          }
          $.get('https://nominatim.openstreetmap.org/search', params)
            .done( function (data) {
              if (!data.length) {
                $(mySelector + ' .message').html('Your search yielded no results');// @todo translate
                return;
              }
              $(mySelector + ' .message').html(Backdrop.behaviors.geofieldWidgetGeocode.buildResultList(data));

              // Attach event listener to marker buttons.
              $(mySelector + ' .button-marker').on('click', function (event) {
                event.preventDefault();
                if (typeof Backdrop.leafletEditableItems[item.id] == 'undefined') {
                  return;
                }
                Backdrop.behaviors.geofieldWidgetGeocode.insertMarker(event.target, item.id);
              })
            })
            .fail( function () {
              $(mySelector + ' .message').html('Request failed');
            })
            .always( function () {
              // Remove wait animation.
              $(mySelector + ' .message').removeClass('waiting');
            });
        });// close on-click
      });// close once-each
    },
    buildResultList: function (data) {
      let label = Backdrop.t('Insert marker');
      let ulElem = document.createElement('ul');
      for (let i = 0; i < data.length; i++) {
        let liElem = document.createElement('li');
        liElem.setAttribute('class', 'clearfix');
        let text = document.createTextNode(data[i].display_name + ' ');
        let insertButton = document.createElement('button');
        insertButton.setAttribute('class', 'button-marker');
        insertButton.setAttribute('title', label);
        let buttonText = document.createTextNode(label);
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
      return ulElem.outerHTML;
    },
    insertMarker: function (eventTarget, mapContainerId) {
      let mapLayer = Backdrop.leafletEditableItems[mapContainerId].editable;
      let cardinality = Backdrop.leafletEditableItems[mapContainerId].cardinality;
      if (mapLayer.getLayers().length >= cardinality) {
        alert('nope already full');// @todo hm...
        return;
      }
      // Prevent adding the same marker multiple times.
      eventTarget.setAttribute('disabled', 'disabled');
      let coords = JSON.parse(eventTarget.dataset.coords);
      let latLng = L.latLng(coords.lat, coords.lon);
      mapLayer.addLayer(L.marker(latLng));
      // We ignore autoCenter setting here to prevent UX issues.
      let bounds = mapLayer.getBounds();
      mapLayer._map.fitBounds(bounds);
      const customEv = new Event('mapFeatureChange');
      document.getElementById(mapContainerId).dispatchEvent(customEv);
    }
  }

})(Backdrop, jQuery);
