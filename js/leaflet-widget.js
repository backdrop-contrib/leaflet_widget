(function (Backdrop, $) {

  'use strict';

  var geofieldWidget = geofieldWidget || {};

  Backdrop.behaviors.geofield_widget = {
    attach: function (context, settings) {

      $('.leaflet-widget').once('leaflet-widget').each( function (i, item) {

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

        // Expose editable group to global space.
        if (typeof Backdrop.leafletEditableItems == 'undefined') {
          Backdrop.leafletEditableItems = {};
        }
        Backdrop.leafletEditableItems[id] = {
          editable: editableItems,
          cardinality: cardinality
        }

        // Load existing features.
        var existingPoints = $('#' + inputId).val();
        var data = JSON.parse(existingPoints);
        var features = new L.geoJSON(data, {
          onEachFeature: function (feature, layer) {
            // Add features one by one, so they are editable individually.
            var featureType = feature.geometry.type;
            if (featureType === 'MultiPolygon' || featureType === 'MultiLineString') {
              geofieldWidget.addFeaturesSplit(feature, editableItems, featureType);
            }
            else {
              geofieldWidget.addLayersUnnested(layer, editableItems);
            }
          }
        });

        // Center on existing items, overrides default center.
        if (itemSettings.widget.autoCenter == 1 && editableItems.getLayers().length > 0) {
          if (features.getBounds !== undefined && typeof features.getBounds === 'function') {
            map.fitBounds(features.getBounds());
          }
        }

        // Create and add the draw toolbar based on field widget settings.
        var drawControlSetup = geofieldWidget.assembleToolbar(itemSettings.widget.featureTypes);
        drawControlSetup.edit.featureGroup = editableItems;
        map.addControl(new L.Control.Draw(drawControlSetup));

        if (cardinality > 0) {
          geofieldWidget.checkFeatureLimit(editableItems, cardinality);
        }

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
        $(item).parents('form').on('submit', function() {
          geofieldWidget.writeToField(editableItems, inputId);
        });

      });
    },
    detach: function (context, settings, trigger) {
      if (trigger == 'serialize') {
        $('.leaflet-widget').each( function (i, item) {
          if (Backdrop.leafletEditableItems[item.id]) {
            let editable = Backdrop.leafletEditableItems[item.id]['editable'];
            let inputId = item.id + '-input';
            geofieldWidget.writeToField(editable, inputId);
          }
        });
      }
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

  geofieldWidget.addFeaturesSplit = function (feature, editableItems, featureType) {
    for (let i = 0; i < feature.geometry.coordinates.length; i++) {
      // Geojson spec dictates lon/lat, but Leaflet uses lat/lon.
      var coords = [];
      if (featureType === 'MultiPolygon') {
        for (let j = 0; j < feature.geometry.coordinates[i][0].length; j++) {
          var reversed = feature.geometry.coordinates[i][0][j].reverse();
          coords.push(reversed);
        }
      }
      else {
        for (let j = 0; j < feature.geometry.coordinates[i].length; j++) {
          var reversed = feature.geometry.coordinates[i][j].reverse();
          coords.push(reversed);
        }
      }
      var f;
      if (featureType === 'MultiPolygon') {
        f = new L.Polygon(coords);
      }
      else {
        f = new L.Polyline(coords);
      }
      f.addTo(editableItems);
    }

  }

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

  geofieldWidget.assembleToolbar = function (availableTypes) {
    // We have to turn off circle and circlemarker, as we work with GeoJSON
    // and these types are not in the spec. Leaflet would convert them to
    // regular markers.
    // Rectrangles turn into polygon, but that's no problem.
    var allTypes = ['marker', 'polyline', 'polygon', 'rectangle'];
    var toolbarSetup = {
      position: 'topleft',
      edit: {
        featureGroup: false,
        poly: {
          allowIntersection: false
        }
      },
      draw: {
        circle: false,
        circlemarker: false
      }
    };

    for (var i = 0; i < allTypes.length; i++) {
      var currentType = allTypes[i];
      if (availableTypes.hasOwnProperty(currentType) === false) {
        toolbarSetup.draw[currentType] = false;
      }
      else {
        if (currentType == 'polygon') {
          toolbarSetup.draw['polygon'] = {
            allowIntersection: false,
            showArea: true
          };
        }
        if (currentType == 'polyline') {
          toolbarSetup.draw['polyline'] = {
            allowIntersection: false
          };
        }
      }
    }

    return toolbarSetup;
  };

})(Backdrop, jQuery);
