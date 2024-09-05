/**
 * @file
 * A widget to gecode the site's default_country setting to coordinates.
 */
(function ($) {

  'use strict';

  Backdrop.behaviors.geofieldWidgetDefaultCenter = {
    attach: function (context, settings) {
      let $formItemLat = $('#edit-instance-widget-settings-map-center-lat');
      let $formItemLng = $('#edit-instance-widget-settings-map-center-lng');

      $('#leaflet-geocode-center-button').on('click', function (event) {
        event.preventDefault();
        // Make sure we only hit this once per second.
        let $button = $(this);
        $button.attr('disabled', 'disabled');
        setTimeout( function () {
          $button.removeAttr('disabled');
        }, 1000);

        let params = {
          q: settings.leaflet_widget.countryCode,
          format: 'json',
          limit: 1
        };
        $.get('https://nominatim.openstreetmap.org/search', params)
          .done( function (data) {
            // Sanity check: code 200, but wrong response data type.
            if (!Array.isArray(data) || !data.length) {
              return;
            }
            $formItemLat.val(data[0].lat);
            $formItemLng.val(data[0].lon);
          })
          .fail( function () {
            let failureMessage = '<span class="leaflet-widget-geocode-failure-message">' + Backdrop.t('Request failed') + '</span>';
            $('#edit-instance-widget-settings-map-center .fieldset-wrapper').append(failureMessage);
            setTimeout( function () {
              $('.leaflet-widget-geocode-failure-message').remove();
            }, 2000);
          });
      });
    }
  };

})(jQuery);
