(function ($) {

  'use strict';

  var geofieldWidget = geofieldWidget || {};

  Backdrop.behaviors.geofield_widget = {
    attach: function (context, settings) {

      $('.leaflet-widget').once().each(function (i, item) {

        var id = $(item).attr('id'),
          inputId = id + '-input',
          itemSettings = settings.leaflet_geofield_widget[id],
          cardinality = itemSettings.widget.cardinality;

        // Suppress default topleft zoomControl, put it topright later.
        itemSettings.map_options.zoomControl = false;
        L.Util.extend(itemSettings.map_options, {
          layers: [L.tileLayer(itemSettings.layer[0], itemSettings.layer[1])]
        });
        var map = new L.Map(id, itemSettings.map_options);

        L.control.zoom({
          position: 'topright'
        }).addTo(map);

        var editableItems = L.featureGroup().addTo(map);

        // Load existing features.
        var existingPoints = $('#' + inputId).val();
        var data = JSON.parse(existingPoints);
        var features = new L.geoJson(data, {
          onEachFeature: function (feature, layer) {
            // Add features one by one, so they are editable.
            geofieldWidget.addLayersUnnested(layer, editableItems);
          }
        });

        // Center on existing items, overrides default center.
        if (itemSettings.widget.autoCenter == 1 && editableItems.getLayers().length > 0) {
          if (features.getBounds !== undefined && typeof features.getBounds === 'function') {
            map.fitBounds(features.getBounds());
          }
        }

        features.addTo(map);
        // We have to turn off circle and circlemarker, as we work with GeoJSON
        // and these types are not in the spec. Leaflet would convert them to
        // regular markers.
        // Rectrangles turn into polygon, but that's no problem.
        map.addControl(new L.Control.Draw({
          position: 'topleft',
          edit: {
            featureGroup: editableItems,
            poly: {
              allowIntersection: false
            }
          },
          draw: {
            polygon: {
              allowIntersection: false,
              showArea: true
            },
            circle: false,
            circlemarker: false
          }
        }));
        geofieldWidget.checkFeatureLimit(editableItems, cardinality);

        // Capture Leaflet.draw events (constants) to update map and textarea.
        map.on(L.Draw.Event.CREATED, function (event) {
          var layer = event.layer;
          editableItems.addLayer(layer);

          geofieldWidget.writeToField(editableItems, inputId);

          if (cardinality > 0) {
            geofieldWidget.checkFeatureLimit(editableItems, cardinality);
          }
        });

        map.on(L.Draw.Event.EDITSTOP, function (event) {
          geofieldWidget.writeToField(editableItems, inputId);
        });

        map.on(L.Draw.Event.DELETESTOP, function (event) {
          geofieldWidget.writeToField(editableItems, inputId);

          if (cardinality > 0) {
            geofieldWidget.checkFeatureLimit(editableItems, cardinality);
          }
        });

        // Serialize data and set input value on submit.
        $(item).parents('form').bind('submit', function() {
          geofieldWidget.writeToField(editableItems, inputId);
        });

      });
    }
  };

  /**
   * Helper function(s).
   */
  geofieldWidget.addLayersUnnested = function (sourceLayer, targetGroup) {
    if (sourceLayer instanceof L.LayerGroup) {
      sourceLayer.eachLayer(function (layer) {
        geofieldWidget.addLayersUnnested(layer, targetGroup);
      });
    }
    else {
      targetGroup.addLayer(sourceLayer);
    }
  };

  geofieldWidget.writeToField = function (editLayer, fieldId) {
    var obj = editLayer.toGeoJSON();
    var text = JSON.stringify(obj);
    $('#' + fieldId).val(text);
  };

  geofieldWidget.checkFeatureLimit = function (editLayer, cardinality) {
    var featureCount = editLayer.getLayers().length;
    if (featureCount >= cardinality) {
      // Hackish css solution. Leaflet.draw can not handle limits.
      $('.leaflet-draw-toolbar-top').addClass('draw-disabled');
    }
    else {
      $('.leaflet-draw-toolbar-top').removeClass('draw-disabled');
    }
  };

})(jQuery);
