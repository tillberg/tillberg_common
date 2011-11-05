// ANSI color code outputs for strings
// Adapted from https://github.com/loopj/commonjs-ansi-color

var ANSI_CODES = {
  "off": 0,
  "bold": 1,
  "italic": 3,
  "underline": 4,
  "blink": 5,
  "inverse": 7,
  "hidden": 8,
  "black": 30,
  "red": 31,
  "green": 32,
  "yellow": 33,
  "blue": 34,
  "magenta": 35,
  "cyan": 36,
  "white": 37,
  "black_bg": 40,
  "red_bg": 41,
  "green_bg": 42,
  "yellow_bg": 43,
  "blue_bg": 44,
  "magenta_bg": 45,
  "cyan_bg": 46,
  "white_bg": 47
};

exports.set = function(str, color, intense) {
  if(!color) return str;
  var ansi_str = "";
  ansi_str += "\033[" + ((intense ? 60 : 0) + (ANSI_CODES[color] || color)) + "m";
  ansi_str += str + "\033[" + ANSI_CODES["off"] + "m";
  return ansi_str;
};