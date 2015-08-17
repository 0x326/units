/* eslint-env browser, node */

'use strict';

// Imports
var conversions = require('./conversions');
var isNumeric = require('isNumeric/isNumeric');

var units = {};


//  Public interface
//------------------------------------------------------------------------------

units.convert = function(to, value, element, property) {
  var parts = units.parse(value, property);
  var values;
  var len;
  var i;

  if (Array.isArray(parts)) {
    values = [];

    if (!Array.isArray(to)) {
      to = [to];
    }

    for (i = 0, len = parts.length; i < len; i++) {
      if (typeof to[i] === 'undefined') {
        to[i] = units.getDefaultUnit(property);
      }

      values.push(units.convert(to[i], parts[i].value + parts[i].unit, element, property));
    }

    return values;
  }

  return {
    'value': to === parts.unit
      ? parts.value
      : units.processConversion(parts.unit, to, parts.value, element, property),
    'unit': to
  };
};

units.parse = function(value, property) {
  var stringValue = value.toString().trim();
  var parts;
  var matches;
  var values;
  var len;
  var i;

  if (/\s/g.test(value)) {
    values = stringValue.split(/\s/);
    parts = [];

    for (i = 0, len = values.length; i < len; i++) {
      parts.push(units.parse(values[i], property));
    }

    return parts;
  }

  parts = {
    'value': units.getDefaultValue(property),
    'unit': units.getDefaultUnit(property)
  };

  matches = stringValue.toString().match(/^(-?[\d+\.\-]+)([a-z]+|%)$/i);

  if (typeof units.properties[property] !== 'undefined' && units.properties[property].defaultUnit !== parts.unit) {
    parts.unit = units.properties[property].defaultUnit;
  }

  if (matches === null) {
    isNumeric(value)
      ? parts.value = value
      : parts.unit = value;
  } else {
    parts.value = matches[1];
    parts.unit = matches[2];
  }

  parts.value = parseFloat(parts.value);

  return parts;
};

units.getDefault = function(property) {
  return units.getDefaultValue(property) + units.getDefaultUnit(property);
};

units.getDefaultValue = function(property) {
  return typeof units.properties[property] !== 'undefined' && typeof units.properties[property].defaultValue !== 'undefined'
    ? units.properties[property].defaultValue
    : 0;
};

units.getDefaultUnit = function(property) {
  return typeof units.properties[property] !== 'undefined' && typeof units.properties[property].defaultUnit !== 'undefined'
    ? units.properties[property].defaultUnit
    : 'px';
};


//  Protected methods
//------------------------------------------------------------------------------

units.processConversion = function(fromUnits, toUnits, value, element, property) {
  var type = units.getConversionType(fromUnits);
  var method;

  if (typeof type[fromUnits][toUnits] === 'function') {
    method = type[fromUnits][toUnits];
  } else {
    method = type[type._default][toUnits];
    value = type[fromUnits][type._default](value, element, property); // Use px conversion as an interstitial step
  }

  return method(value, element, property);
};

units.getConversionType = function(fromUnits) {
  var property;
  var type = null;

  for (property in units.conversions) {
    if (!units.conversions.hasOwnProperty(property)) continue;

    if (typeof units.conversions[property][fromUnits] !== 'undefined') {
      type = units.conversions[property];
      break;
    }
  }

  return type;
};


//  Expose conversion functions
//------------------------------------------------------------------------------

units.conversions = conversions;


//  Properties with non default unit/value
//------------------------------------------------------------------------------

units.properties = {
  'opacity': {
    'defaultUnit': '',
    'defaultValue': 1
  },
  'rotateX': {
    'defaultUnit': 'deg'
  },
  'rotateY': {
    'defaultUnit': 'deg'
  },
  'rotateZ': {
    'defaultUnit': 'deg'
  },
  'skewX': {
    'defaultUnit': 'deg'
  },
  'skewY': {
    'defaultUnit': 'deg'
  },
  'scaleX': {
    'defaultUnit': '',
    'defaultValue': 1
  },
  'scaleY': {
    'defaultUnit': '',
    'defaultValue': 1
  },
  'scaleZ': {
    'defaultUnit': '',
    'defaultValue': 1
  },
  'line-height': {
    'defaultUnit': '',
    'defaultValue': 1
  }
};

// Exports
module.exports = units;