(function () {
  var dels = ['AENC', 'APIC', 'COMM', 'COMR', 'ENCR', 'EQUA', 'ETCO', 'GEOB', 'GRID',
    'IPLS', 'LINK', 'MCDI', 'MLLT', 'OWNE', 'PRIV', 'PCNT', 'POPM', 'POSS',
    'RBUF', 'RVAD', 'RVRB', 'SYLT', 'SYTC', 'TALB', 'TBPM', 'TCOM', 'TCON',
    'TCOP', 'TDAT', 'TDLY', 'TENC', 'TEXT', 'TFLT', 'TIME', 'TIT1', 'TIT2',
    'TIT3', 'TKEY', 'TLAN', 'TLEN', 'TMED', 'TOAL', 'TOFN', 'TOLY', 'TOPE',
    'TORY', 'TOWN', 'TPE1', 'TPE2', 'TPE3', 'TPE4', 'TPOS', 'TPUB', 'TRCK',
    'TRDA', 'TRSN', 'TRSO', 'TSIZ', 'TSRC', 'TSSE', 'TYER', 'TXXX', 'UFID',
    'USER', 'USLT', 'WCOM', 'WCOP', 'WOAF', 'WOAR', 'WOAS', 'WORS', 'WPAY',
    'WPUB', 'WXXX', 'CNT', 'BUF', 'COM', 'CRA', 'CRM', 'ETC', 'EQU', 'GEO',
    'IPL', 'LNK', 'MCI', 'MLL', 'PIC', 'POP', 'REV', 'RVA', 'SLT', 'STC', 'TAL',
    'TBP', 'TCM', 'TCO', 'TCR', 'TDA', 'TDY', 'TEN', 'TFT', 'TIM', 'TKE', 'TLA',
    'TLE', 'TMT', 'TOA', 'TOF', 'TOL', 'TOR', 'TOT', 'TP1', 'TP2', 'TP3', 'TP4',
    'TPA', 'TPB', 'TRC', 'TRD', 'TRK', 'TSI', 'TSS', 'TT1', 'TT2', 'TT3', 'TXT',
    'TXX', 'TYE', 'UFI', 'ULT', 'WAF', 'WAR', 'WAS', 'WCM', 'WCP', 'WPB', 'WXX']
  var readTagAt = function (offset, buffer) {
    var ui8a = new Uint8Array(buffer.slice(offset, offset + 10))
    var tag4 = String.fromCharCode.apply(null, ui8a.slice(0, 4))
    var tag3 = tag4.slice(0, -1)
    var sizeA, size
    if (dels.indexOf(tag4) > -1) {
      sizeA = ui8a.slice(4, 8)
      size = new Uint32Array(sizeA.reverse().buffer)[0]
      return {
        tag: tag4, size: size, position: offset + 10
      }
    } else if (dels.indexOf(tag3) > -1) {
      sizeA = ui8a.slice(3, 6)
      size = sizeA[0] * 0x10000 + sizeA[1] * 0x100 + sizeA[2]
      return { tag: tag3, size:size, position: offset + 6 }
    }
    return { nothing: 1 }
  }
  var processTag = {
    picture: function (file, buffer, tag) {
      var pos = tag.position
      var size = tag.size
      var buf = buffer.slice(pos, pos + 512)
      var arr = new Uint8Array(buf)
      var off = 1
      for (; arr[off] !== 0; off++);
      var mime = String.fromCharCode.apply(null, arr.slice(1, off))
      off++ // $00
      for (; arr[off] !== 0; off++);
      for (; arr[off] === 0; off++);
      return {
        blob: new Blob([buffer.slice(pos + off, pos + size)], {type:mime}),
        mime:mime
      }
    },
    txt: function (buffer, beg, siz) {
      if (siz < 1) return { text: null }
      var ui8a = new Uint8Array(buffer.slice(beg, beg + siz))
      var encoding = ui8a[0]
      var encToStr = function (enc) {
        if (enc === 0) return 'ISO-8859-1'
        else if (enc === 1) return 'UTF-16'
        else if (enc === 2) return 'UTF-16BE'
        else if (enc === 3) return 'UTF-8'
        return ''
      }
      ui8a = ui8a.slice(1)
      return {
        text: new TextDecoder(encToStr(encoding)).decode(ui8a).replace('\0', '')
      }
    },
    album: function (file, buffer, tag) {
      return this.txt(buffer, tag.position, tag.size)
    },
    artist: function (file, buffer, tag) {
      return this.txt(buffer, tag.position, tag.size)
    },
    title: function (file, buffer, tag) {
      return this.txt(buffer, tag.position, tag.size)
    },
    year: function (file, buffer, tag) {
      return this.txt(buffer, tag.position, tag.size)
    },
    track: function (file, buffer, tag) {
      return this.txt(buffer, tag.position, tag.size)
    },
    genre: function (file, buffer, tag) {
      var txt = this.txt(buffer, tag.position, tag.size).text
      var match = txt.match(/\(([0-9]+)\)/)
      var intToGenre = ['Blues', 'Classic Rock', 'Country', 'Dance', 'Disco', 'Funk', 'Grunge', 'Hip-Hop', 'Jazz', 'Metal', 'New Age', 'Oldies', 'Other', 'Pop', 'R&B', 'Rap', 'Reggae', 'Rock', 'Techno', 'Industrial', 'Alternative', 'Ska', 'Death Metal', 'Pranks', 'Soundtrack', 'Euro-Techno', 'Ambient', 'Trip-Hop', 'Vocal', 'Jazz+Funk', 'Fusion', 'Trance', 'Classical', 'Instrumental', 'Acid', 'House', 'Game', 'Sound Clip', 'Gospel', 'Noise', 'AlternRock', 'Bass', 'Soul', 'Punk', 'Space', 'Meditative', 'Instrumental Pop', 'Instrumental Rock', 'Ethnic', 'Gothic', 'Darkwave', 'Techno-Industrial', 'Electronic', 'Pop-Folk', 'Eurodance', 'Dream', 'Southern Rock', 'Comedy', 'Cult', 'Gangsta', 'Top 40', 'Christian Rap', 'Pop/Funk', 'Jungle', 'Native American', 'Cabaret', 'New Wave', 'Psychedelic', 'Rave', 'Showtunes', 'Trailer', 'Lo-Fi', 'Tribal', 'Acid Punk', 'Acid Jazz', 'Polka', 'Retro', 'Musical', 'Rock & Roll', 'Hard Rock']
      if (match) {
        return { text: intToGenre[match[1] - 0] }
      }
      return { text: txt }
    }
  }
  var getMeta = function (file, callback, fail) {
    if (fail == null) fail = console.error
    var fr = new FileReader()
    fr.onload = function (e) {
      if (String.fromCharCode.apply(null, new Uint8Array(e.target.result.slice(0, 3))) !== 'ID3') return fail('NOT ID3')
      var cl = function (off, a) {
        if (a == null) a = []
        var tag = readTagAt(off, e.target.result)
        if (!tag.nothing) {
          a.push(tag)
          return cl(tag.position + tag.size, a)
        } return callback(a, e.target.result)
      }
      cl(10)
    }
    fr.readAsArrayBuffer(file)
  }
  var getId3 = function (file, opts, callback) {
    if (opts === null || opts === undefined) opts = {}
    var options = {
      album: !!opts.album,
      artist: !!opts.artist,
      picture: !!opts.picture,
      title: !!opts.title,
      year: !!opts.year,
      track: !!opts.track,
      genre: !!opts.genre
    }
    var aliases = {
      album: ['TALB', 'TAL'],
      picture: ['PIC', 'APIC'],
      artist: ['TP1', 'TPE1'],
      title: ['TIT2', 'TT2'],
      year: ['TYER', 'TYE', 'TDRC'],
      track: ['TRCK', 'TRK'],
      genre: ['TCON', 'TCO']
    }
    getMeta(file, function (res, buf){
      var dict = {}
      for (var opt in options) {
        if (options[opt]) {
          for (var t in res) {
            if (aliases[opt].indexOf(res[t].tag) > -1) {
              dict[opt] = (processTag[opt](file, buf, res[t]))
            }
          }
        }
      }
      callback(dict)
    })
  }
  var FID3 = function (file, options) {
    this.file = file
    this.options = options
    return this
  }
  FID3.prototype = {
    readSync: function () { console.info('FID3.readSync not implemented yet') },
    read: function (callback) {
      getId3(this.file, this.options, callback)
    }
  }
  try {
    global.FID3 = FID3
  } catch (e) {
    window.FID3 = FID3
  }
})()
