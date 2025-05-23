/**
 * @file
 * Localization for Leaflet.draw labels and tooltips.
 */
(function (Backdrop, L) {
  'use strict';

  // @see _leaflet_widget_trigger_translations()
  L.drawLocal.draw.toolbar = {
    actions: {
      title: Backdrop.t('Cancel drawing'),
      text: Backdrop.t('Cancel')
    },
    finish: {
      title: Backdrop.t('Finish drawing'),
      text: Backdrop.t('Finish')
    },
    undo: {
      title: Backdrop.t('Delete last point drawn'),
      text: Backdrop.t('Delete last point')
    },
    buttons: {
      polyline: Backdrop.t('Draw a polyline'),
      polygon: Backdrop.t('Draw a polygon'),
      rectangle: Backdrop.t('Draw a rectangle'),
      marker: Backdrop.t('Draw a marker')
    }
  };
  L.drawLocal.draw.handlers.marker = {
    tooltip: {
      start: Backdrop.t('Click map to place marker.')
    }
  };
  L.drawLocal.draw.handlers.polygon = {
    tooltip: {
      start: Backdrop.t('Click to start drawing shape.'),
      cont: Backdrop.t('Click to continue drawing shape.'),
      end: Backdrop.t('Click first point to close this shape.')
    }
  };
  L.drawLocal.draw.handlers.polyline = {
    error: Backdrop.t('Error: shape edges cannot cross!'),
    tooltip: {
      start: Backdrop.t('Click to start drawing line.'),
      cont: Backdrop.t('Click to continue drawing line.'),
      end: Backdrop.t('Click last point to finish line.')
    }
  };
  L.drawLocal.draw.handlers.rectangle = {
    tooltip: {
      start: Backdrop.t('Click and drag to draw rectangle.')
    }
  };
  L.drawLocal.edit.toolbar = {
    actions: {
      save: {
        title: Backdrop.t('Save changes'),
        text: Backdrop.t('Save')
      },
      cancel: {
        title: Backdrop.t('Cancel editing, discards all changes'),
        text: Backdrop.t('Cancel')
      },
      clearAll: {
        title: Backdrop.t('Clear all layers'),
        text: Backdrop.t('Clear all')
      }
    },
    buttons: {
      edit: Backdrop.t('Edit layers'),
      editDisabled: Backdrop.t('No layers to edit'),
      remove: Backdrop.t('Delete layers'),
      removeDisabled: Backdrop.t('No layers to delete')
    }
  };
  L.drawLocal.edit.handlers = {
    edit: {
      tooltip: {
        text: Backdrop.t('Drag handles or markers to edit features.'),
        subtext: Backdrop.t('Click cancel to undo changes.')
      }
    },
    remove: {
      tooltip: {
        text: Backdrop.t('Click on a feature to remove.')
      }
    }
  };

})(Backdrop, L);
