(function (Backdrop, $) {

  'use strict';

  Backdrop.behaviors.geofieldWidgetGeocode = {
    attach: function (context, settings) {
      const geocodeWidget = this;
      $('.leaflet-widget-geocode').once('geofield-widget-geocode').each( function (i, item) {
        let mySelector = '#' + item.id;
        let mapId = item.dataset.mapId;

        $(mySelector + ' .form-text').on('keypress', function (event) {
          if (event.which == 13) {
            $(mySelector + ' .geocode-button').trigger('click');
          }
        });
        $(mySelector + ' .geocode-button').on('click', function (ev) {
          ev.preventDefault();
          let searchText = $('#' + mapId + '-geoinput').val().trim();
          if (!searchText) {
            $(mySelector + ' .message').html(Backdrop.t('Add some keywords to search for'));
            return;
          }
          // Start wait animation.
          $(mySelector + ' .message').addClass('waiting');

          // Make sure we only hit this once per second.
          let $button = $(this);
          $button.attr('disabled', 'disabled');
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
                $(mySelector + ' .message').html(Backdrop.t('Your search yielded no results'));
                return;
              }
              $(mySelector + ' .message').html(geocodeWidget.buildResultList(data));

              // Attach event listener to marker buttons.
              $(mySelector + ' .button-marker').on('click', function (event) {
                event.preventDefault();
                if (typeof Backdrop.leafletEditableItems[mapId] == 'undefined') {
                  return;
                }
                geocodeWidget.insertMarker(event.target, mapId);
              })
            })
            .fail( function () {
              $(mySelector + ' .message').html(Backdrop.t('Request failed'));
            })
            .always( function () {
              // Remove wait animation.
              $(mySelector + ' .message').removeClass('waiting');
            });
        });
      });
    },
    /**
     * Create markup for the result list.
     *
     * @param array data
     *   Array of one or more search results from GET request.
     */
    buildResultList: function (data) {
      let ulElem = document.createElement('ul');
      for (let i = 0; i < data.length; i++) {
        let liElem = document.createElement('li');
        liElem.innerText = data[i].display_name + ' ';
        liElem.setAttribute('class', 'clearfix');

        let insertButton = document.createElement('button');
        let label = Backdrop.t('Insert marker');
        insertButton.innerText = label;
        insertButton.setAttribute('title', label);
        insertButton.setAttribute('class', 'button-marker');
        let coords = {
          lat: data[i].lat,
          lon: data[i].lon
        }
        insertButton.setAttribute('data-coords', JSON.stringify(coords));
        liElem.appendChild(insertButton);
        ulElem.appendChild(liElem);
      }
      return ulElem.outerHTML;
    },
    /**
     * Insert a marker into the map or notify if field cardinality reached.
     */
    insertMarker: function (eventTarget, mapContainerId) {
      let mapLayer = Backdrop.leafletEditableItems[mapContainerId].editable;
      let cardinality = Backdrop.leafletEditableItems[mapContainerId].cardinality;
      if (mapLayer.getLayers().length >= cardinality) {
        alert(Backdrop.t('The item limit of the map has been reached'));
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
