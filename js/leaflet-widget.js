(function (Backdrop, $) {

  'use strict';

  var geofieldWidget = geofieldWidget || {};

  Backdrop.behaviors.geofield_widget = {
    attach: function (context, settings) {

      $('.leaflet-widget').once('leaflet-widget').each( function (i, item) {

        let id = $(item).attr('id'),
          inputId = id + '-input',
          itemSettings = settings.leaflet_geofield_widget[id],
          cardinality = itemSettings.widget.cardinality;

        // Suppress default topleft zoomControl, put it topright later.
        itemSettings.map_options.zoomControl = false;

        const tileLayer = new L.TileLayer(itemSettings.layer[0], itemSettings.layer[1]);
        itemSettings.map_options.layers = [tileLayer];

        let map = new L.Map(id, itemSettings.map_options);
        new L.Control.Zoom({ position: 'topright' }).addTo(map);

        let editableItems = new L.FeatureGroup().addTo(map);

        // Expose editable group to global space.
        if (typeof Backdrop.leafletEditableItems == 'undefined') {
          Backdrop.leafletEditableItems = {};
        }
        Backdrop.leafletEditableItems[id] = {
          editable: editableItems,
          cardinality: cardinality
        }

        // Load existing features.
        let existingPoints = $('#' + inputId).val();
        let data = JSON.parse(existingPoints);
        let features = new L.GeoJSON(data, {
          onEachFeature: function (feature, layer) {
            // Add features one by one, so they are editable individually.
            let featureType = feature.geometry.type;
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
        let drawControlSetup = geofieldWidget.assembleToolbar(itemSettings.widget.featureTypes);
        drawControlSetup.edit.featureGroup = editableItems;
        map.addControl(new L.Control.Draw(drawControlSetup));

        if (cardinality > 0) {
          geofieldWidget.checkFeatureLimit(editableItems, cardinality, id);
        }

        // Capture Leaflet.draw events (constants) to update map and textarea.
        map.on(L.Draw.Event.CREATED, function (event) {
          let layer = event.layer;
          editableItems.addLayer(layer);

          geofieldWidget.writeToField(editableItems, inputId);

          if (cardinality > 0) {
            geofieldWidget.checkFeatureLimit(editableItems, cardinality, id);
          }
        });

        map.on(L.Draw.Event.EDITSTOP, function (event) {
          geofieldWidget.writeToField(editableItems, inputId);
        });

        map.on(L.Draw.Event.DELETESTOP, function (event) {
          geofieldWidget.writeToField(editableItems, inputId);

          if (cardinality > 0) {
            geofieldWidget.checkFeatureLimit(editableItems, cardinality, id);
          }
        });

        // Listen to "external" events.
        document.getElementById(id).addEventListener('mapFeatureChange', function (event) {
          geofieldWidget.writeToField(editableItems, inputId);

          if (cardinality > 0) {
            geofieldWidget.checkFeatureLimit(editableItems, cardinality, id);
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
      let coords = [];
      if (featureType === 'MultiPolygon') {
        for (let j = 0; j < feature.geometry.coordinates[i][0].length; j++) {
          let reversed = feature.geometry.coordinates[i][0][j].reverse();
          coords.push(reversed);
        }
      }
      else {
        for (let j = 0; j < feature.geometry.coordinates[i].length; j++) {
          let reversed = feature.geometry.coordinates[i][j].reverse();
          coords.push(reversed);
        }
      }
      let f;
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
    let obj = editLayer.toGeoJSON();
    let text = JSON.stringify(obj);
    $('#' + fieldId).val(text);
  };

  geofieldWidget.checkFeatureLimit = function (editLayer, cardinality, itemId) {
    let featureCount = editLayer.getLayers().length;
    if (featureCount >= cardinality) {
      // Hackish css solution. Leaflet.draw can not handle limits.
      $('#' + itemId + ' .leaflet-draw-toolbar-top').addClass('draw-disabled');
    }
    else {
      $('#' + itemId + ' .leaflet-draw-toolbar-top').removeClass('draw-disabled');
    }
  };

  geofieldWidget.assembleToolbar = function (availableTypes) {
    // We have to turn off circle and circlemarker, as we work with GeoJSON
    // and these types are not in the spec. Leaflet would convert them to
    // regular markers.
    // Rectangles turn into polygon, but that's no problem.
    let allTypes = ['marker', 'polyline', 'polygon', 'rectangle'];
    let toolbarSetup = {
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

    for (let currentType of allTypes) {
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
