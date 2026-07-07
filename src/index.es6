import {PlayBuffer, RenderBuffer} from './util/player.es6'
import TextToPhonemes from './reciter/reciter.es6';
import {SamProcess, SamBuffer} from './sam/sam.es6';
import Speaker from 'audio-speaker';

const convert = TextToPhonemes;
const buf8 = SamProcess;
const buf32 = SamBuffer;

/**
 * @param {object}  [options]
 * @param {Boolean} [options.phonetic] Default false.
 * @param {Boolean} [options.singmode] Default false.
 * @param {Boolean} [options.debug]    Default false.
 * @param {Number}  [options.pitch]    Default 64.
 * @param {Number}  [options.speed]    Default 72.
 * @param {Number}  [options.mouth]    Default 128.
 * @param {Number}  [options.throat]   Default 128.
 * @param {String}  [options.dictfile] Default undefined.
 *
 * @constructor
 */
function SamJs (options) {
  const opts = options || {};
  const _this = this;
  let speaker = null;

  const ensurePhonetic = (text, phonetic) => {
    if (!(phonetic || opts.phonetic)) {
      return convert(text, opts.dictfile, opts.debug);
    }
    return text.toUpperCase();
  }

  /**
   * Render the passed text as 8bit wave buffer array.
   *
   * @param {string}  text       The text to render or phoneme string.
   * @param {boolean} [phonetic] Flag if the input text is already phonetic data.
   *
   * @return {Uint8Array|Boolean}
   */
  this.buf8 = (text, phonetic) => {
    return buf8(ensurePhonetic(text, phonetic), opts);
  }

  /**
   * Render the passed text as 32bit wave buffer array.
   *
   * @param {string}  text       The text to render or phoneme string.
   * @param {boolean} [phonetic] Flag if the input text is already phonetic data.
   *
   * @return {Float32Array|Boolean}
   */
  this.buf32 = (text, phonetic) => {
    return buf32(ensurePhonetic(text, phonetic), opts);
  }

  /**
   * Render the passed text as wave buffer and play it over the speakers.
   *
   * @param {string}  text       The text to render or phoneme string.
   * @param {boolean} [phonetic] Flag if the input text is already phonetic data.
   *
   * @return {Promise}
   */
  this.speak = (text, phonetic) => {
	if (typeof AudioContext !== 'undefined')
		return PlayBuffer(this.buf32(text, phonetic));
  	if (!speaker)
		speaker = Speaker({sampleRate: 22050, channels: 1, bitDepth: 8});

	const buf = this.buf8(text, phonetic);
	return new Promise(res => speaker(buf, res));
  }

  /**
   * Render the passed text as wave buffer and download it via URL API.
   *
   * @param {string}  text       The text to render or phoneme string.
   * @param {boolean} [phonetic] Flag if the input text is already phonetic data.
   *
   * @return void
   */
  this.download = function(filename, text, phonetic) {
	if (arguments.length == 1) {
		text = filename;
		filename = null;
	}
	else if (arguments.length == 2 && typeof text !== 'string') {
		phonetic = text;
		text = filename;
		filename = null;
	}

    RenderBuffer(filename, _this.buf8(text, phonetic));
  }
}

SamJs.buf8 = buf8;
SamJs.buf32 = buf32;
SamJs.convert = convert;
SamJs.shutdown = () => speaker && speaker(null);

if (typeof exports === 'object' && typeof module !== 'undefined')
	module.exports = SamJs;
