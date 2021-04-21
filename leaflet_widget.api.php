<?php
/**
 * @file
 * API documentation of leaflet widget module for Geofield.
 */

/**
 * Allows developers to declare base layers to be used by the widget.
 */
function hook_leaflet_widget_base_layers() {
  $layertypes = array(
    // The name should be unique.
    'google_satellite' => array(
      // Required to properly display in field widget settings form.
      'label' => t('Google Satellite'),
      // Required to create the layer.
      'url_template' => 'https://khms{s}.googleapis.com/kh?x={x}&y={y}&z={z}&v=899',
      // Attribution is always necessary, for the other options:
      // @see https://leafletjs.com/reference-1.7.1.html#tilelayer
      'layer_options' => array(
        'attribution' => 'Map data &copy; <a target="attr" href="http://googlemaps.com">Google</a>',
        'subdomains' => array(0, 1, 2, 3),
        'maxZoom' => 21,
        'className' => 'layertype-google',
      ),
    ),
  );
  return $layertypes;
}
