/**
 * @license
 * mail.js
 * Copyright 2014 Mark Bradley, Ted Halmrast
 * Available under MIT license <http://mailjs.org/license>
 */
;(function(window) {

  /*
   * Most of these builtin templates are from various email boilerplate projects on the web ...
   *
   * heavily from:  http://htmlemailboilerplate.com/
   * 
   * also from:     http://www.emailology.org/#1
   */

  var whitespaceChar = /\s/,
      attrNameChar   = /[^\t\n\f \/>"'=]/;

  var builtinBinds = {
    title: '',
    headStyle: ''
  };

  var builtinTemplates = {
    doctype: {
      src: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">'
    },

    wrapper: {
      html:
        '[html]\n' +
         '[head/]\n' +
         '<body>\n',

      text: '',

      htmlClose:
         '</body>\n' +
        '</html>',

      textClose: '',
    },

    html: {
      html: 
        '<html xmlns="http://www.w3.org/1999/xhtml">',

      htmlClose:
        '</html>'
    },

    head: {
      html:
        '<head>\n' +
         '<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />\n' +
         '<meta name="viewport" content="width=device-width, initial-scale=1.0"/>\n' +
         '<title>$title</title>\n' +
         '<style>\n' +
          '$headStyle\n' +
         '</style>\n',

      htmlClose:
        '</head>'
    },

    borderRadius: {
      html: '-moz-border-radius:$borderRadius;-webkit-border-radius:$borderRadius;border-radius:$borderRadius'
    },

    headStyles: {
      html: 

'#outlook a {padding:0;}\n' + // Force Outlook to provide a "view in browser" menu link.

// Prevent Webkit and Windows Mobile platforms from changing default font sizes, while not breaking desktop design.
'body{width:100% !important; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; margin:0; padding:0;}\n' +

// Force Hotmail to display emails at full width
'.ExternalClass {width:100%;}\n' +

// Force Hotmail to display normal line spacing.  More on that: http://www.emailonacid.com/forum/viewthread/43/ */
'.ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div {line-height: 100%;}\n' +
'#backgroundTable {margin:0; padding:0; width:100% !important; line-height: 100% !important;}\n' +

/* Some sensible defaults for images 
 * 1. "-ms-interpolation-mode: bicubic" works to help ie properly resize images in IE. (if you are resizing them using the width and height attributes)
 * 2. "border:none" removes border when linking images.
 * 3. Updated the common Gmail/Hotmail image display fix: Gmail and Hotmail unwantedly adds in an extra space below images when using non IE browsers.
 *    You may not always want all of your images to be block elements. Apply the "image_fix" class to any image you need to fix.
 *
 * Bring inline: Yes.
 */
'img {outline:none; text-decoration:none; -ms-interpolation-mode: bicubic;}\n' +
'a img {border:none;}\n' +
'.image_fix {display:block;}\n' +
 
/* Yahoo paragraph fix: removes the proper spacing or the paragraph (p) tag. To correct we set the top/bottom margin to 1em in the head of the document.
 * Simple fix with little effect on other styling. NOTE: It is also common to use two breaks instead of the paragraph tag but I think this way is cleaner
 * and more semantic. NOTE: This example recommends 1em. More info on setting web defaults: http://www.w3.org/TR/CSS21/sample.html or
 * http://meiert.com/en/blog/20070922/user-agent-style-sheets/
 *
 * Bring inline: Yes.
 */
'p {margin: 1em 0;}\n' +
 
/* Hotmail header color reset: Hotmail replaces your header color styles with a green color on H2, H3, H4, H5, and H6 tags. In this example, the color is
 * reset to black for a non-linked header, blue for a linked header, red for an active header (limited support), and purple for a visited header (limited
 * support).  Replace with your choice of color. The !important is really what is overriding Hotmail's styling. Hotmail also sets the H1 and H2 tags to
 * the same size.
 *
 * Bring inline: Yes.
 */
'h1, h2, h3, h4, h5, h6 {color: black !important;}\n' +
 
'h1 a, h2 a, h3 a, h4 a, h5 a, h6 a {color: blue !important;}\n' +
 
'h1 a:active, h2 a:active,  h3 a:active, h4 a:active, h5 a:active, h6 a:active {\n' +
'color: red !important;\n' + // Preferably not the same color as the normal header link color.  There is limited support for psuedo classes in email clients, this was added just for good measure.
'}\n' +
 
'h1 a:visited, h2 a:visited,  h3 a:visited, h4 a:visited, h5 a:visited, h6 a:visited {\n' +
'color: purple !important;\n' + // Preferably not the same color as the normal header link color. There is limited support for psuedo classes in email clients, this was added just for good measure.
'}\n' +
 
/* Outlook 07, 10 Padding issue: These "newer" versions of Outlook add some padding around table cells potentially throwing off your perfectly pixeled
 * table.  The issue can cause added space and also throw off borders completely.  Use this fix in your header or inline to safely fix your table woes.
 *
 * More info: http://www.ianhoar.com/2008/04/29/outlook-2007-borders-and-1px-padding-on-table-cells/
 * http://www.campaignmonitor.com/blog/post/3392/1px-borders-padding-on-table-cells-in-outlook-07/
 * 
 * H/T @edmelly
 *
 * Bring inline: No.
 */
'table td {border-collapse: collapse;}\n' +
 
/* Styling your links has become much simpler with the new Yahoo.  In fact, it falls in line with the main credo of styling in email, bring your
 * styles inline.  Your link colors will be uniform across clients when brought inline.
 *
 * Bring inline: Yes.
 */
'a {color: orange;}\n' +
 
/* Or to go the gold star route...
a:link { color: orange; }
a:visited { color: blue; }
a:hover { color: green; }
*/
 
/*** MOBILE TARGETING
 *
 * Use @media queries with care.  You should not bring these styles inline -- so it's recommended to apply them AFTER you bring the other styling
 * inline.
 *
 * Note: test carefully with Yahoo.
 * Note 2: Don't bring anything below this line inline.
 *
 * NOTE: To properly use @media queries and play nice with yahoo mail, use attribute selectors in place of class, id declarations.
 * table[class=classname]
 * Read more: http://www.campaignmonitor.com/blog/post/3457/media-query-issues-in-yahoo-mail-mobile-email/
 */
'@media only screen and (max-device-width: 480px) {\n' +
 
/* A nice and clean way to target phone numbers you want clickable and avoid a mobile phone from linking other numbers that look like, but are
 * not phone numbers.  Use these two blocks of code to "unstyle" any numbers that may be linked.  The second block gives you a class to apply
 * with a span tag to the numbers you would like linked and styled.
 *
 * Inspired by Campaign Monitor's article on using phone numbers in email: http://www.campaignmonitor.com/blog/post/3571/using-phone-numbers-in-html-email/.
 *
 * Step 1 (Step 2: line 224)
 */
  'a[href^="tel"], a[href^="sms"] {\n' +
    'text-decoration: none;\n' +
    'color: black;\n' + // or whatever your want
    'pointer-events: none;\n' +
    'cursor: default;\n' +
  '}\n' +
 
  '.mobile_link a[href^="tel"], .mobile_link a[href^="sms"] {\n' +
    'text-decoration: default;\n' +
    'color: orange !important;\n' + // or whatever your want
    'pointer-events: auto;\n' +
    'cursor: default;\n' +
  '}\n' +
'}\n' +
 
/* More Specific Targeting */
 
'@media only screen and (min-device-width: 768px) and (max-device-width: 1024px) {\n' +
  // ipad (tablets, smaller screens, etc)
 
  /* Step 1a: Repeating for the iPad */
  'a[href^="tel"], a[href^="sms"] {\n' +
    'text-decoration: none;\n' +
    'color: blue;\n' + // or whatever your want
    'pointer-events: none;\n' +
    'cursor: default;\n' +
  '}\n' +
 
  '.mobile_link a[href^="tel"], .mobile_link a[href^="sms"] {\n' +
    'text-decoration: default;\n' +
    'color: orange !important;\n' +
    'pointer-events: auto;\n' +
    'cursor: default;\n' +
  '}\n' +
'}\n' +
 
//@media only screen and (-webkit-min-device-pixel-ratio: 2) {
  // Put your iPhone 4g styles in here
//}
 
/* Following Android targeting from:
 * http://developer.android.com/guide/webapps/targeting.html
 * http://pugetworks.com/2011/04/css-media-queries-for-targeting-different-mobile-devices/ ;
 */
//@media only screen and (-webkit-device-pixel-ratio:.75){
  // Put CSS for low density (ldpi) Android layouts in here
//}
 
//@media only screen and (-webkit-device-pixel-ratio:1){
  // Put CSS for medium density (mdpi) Android layouts in here
//}
 
//@media only screen and (-webkit-device-pixel-ratio:1.5){
  // Put CSS for high density (hdpi) Android layouts in here
//}

  '$styleBlock' +

'</style>\n'
    },

    p: {

    }
  };

  var mailjs = {

    opts: {},

    config: function( opts ) {
      mailjs.opts = opts;
    },

    resolveTemplate: function( name, templates ) {
      return (
        ( templates && templates[ name ] ) ||
        ( this.opts.templates && this.opts.templates[ name ] ) ||
        builtinTemplates[ name ]
      );
    },

    // returns a bind ... null means no bind, '' means a bind was found and it was intentionally blank
    resolveBind: function( name, el, binds, template ) {
      var rslt =
        ( el && el.attrs[ name ] ) ||
        binds[ name ] ||
        ( template && template.defaults && template.defaults[ name ] ) ||
        ( this.opts.binds && this.opts.binds[ name ] ) ||
        builtinBinds[ name ];

      if ( rslt )
        return rslt;
      else
        return (
          // "string != null" means "string !== null && string !== undefined", intentional
          ( el && el.attrs[ name ] != null ) ||
          binds[ name ] != null ||
          ( template && template.defaults && template.defaults[ name ] != null ) ||
          ( this.opts.binds && this.opts.binds[ name ] != null ) ||
          builtinBinds[ name ] != null
        ) ? '' : null;
    },

    parseAttrs: function( s ) {
      var attrs = {};

      s.replace(
        /([^\s=,]+)\s*=\s*(?:'([^']+)'|"([^"]+)"|(\S+))/g,
        function( m, m1, m2, m3, m4 /*, offset, str */ ) {
          attrs[ m1 ] = m2 || m3 || m4;
        }
      );

      return attrs;
    },

    parseElement: function( s ) {
      var matches = s.match(
        // note:  this not only grabs the tag but also verifies that the entire element can be parsed, including the attributes
        /^\[(\/?)([^\s\]/]+)+(?:\s*(?:[^\s=,]+)\s*=\s*(?:'(?:[^']+)'|"(?:[^"]+)"|(?:[^'"\[\]\s]+)))*(\/?)\]/
      );

      if ( !matches )
        throw new Error( 'Unable to parse element at: ' + s );

      var el         = matches[ 0 ],
          closed     = matches[ 1 ],
          tagDef     = matches[ 2 ],
          selfClosed = matches[ 3 ];

      if ( closed && selfClosed )
        throw new Error( 'An element cannot be both closed and self-closed.' );

      var tag, tagVal;
      if ( tagDef.indexOf( '=' ) != -1 ) {
        var tmatches = tagDef.match( /([^\s=,]+)\s*=\s*(?:'([^']+)'|"([^"]+)"|(\S+))/ );

        if ( !tmatches )
          throw new Error( 'Unable to parse tag-value at: ' + tagDef );

        tag = tmatches[ 1 ];
        tagVal = tmatches[ 2 ] || tmatches[ 3 ] || tmatches[ 4 ];
      } else {
        tag = tagDef;
      }

      var obj = {
        el:    el,
        tag:   tag,
        attrs: mailjs.parseAttrs( el.substring( tagDef.length, el.length - 1 ) )
      };

      if ( tagVal != null )
        obj.attrs[ tag ] = tagVal;

      if ( closed ) {
        obj.close = true;

        if ( Object.keys( obj.attrs ).length )
          throw new Error( 'Closed elements should not contain attributes.' );

      } else if ( selfClosed ) {
        obj.selfClose = true;
      }

      return obj;
    },

    render: function( opts ) {
      var binds     = opts.binds || {},
          templates = opts.templates || {},
          html      = opts.html,

          el        = opts.el,
          template  = opts.template,

          src,
          dest      = '',

          close     = opts.close || ( el && el.close );

      if ( template ) {
        if ( html )
          src = close ? template.htmlClose : template.html;
        else
          src = close ? template.textClose : template.text;

        if ( src == null )
          src = close ? template.srcClose : template.src;

        if ( close && src == null )
          throw new Error( 'Closing elements not supported for template: ' + ( el ? el.el : '' ) );
      } else {
        src = opts.src;
      }

      src = src || '';

      if ( !opts.inside )
        src = '[wrapper]' + src + '[/wrapper]';

      for ( var si=0, slen=src.length; si < slen; ) {
        ch = src[ si ];

        switch ( ch ) {
        case '\\':
          si++;

          if ( si<slen )
            dest += src[ si++ ];

          break;

        case '[':
          var cEl = mailjs.parseElement( src.substring( si ) );

          var cTemplate = mailjs.resolveTemplate( cEl.tag, templates );

          if ( cTemplate ) {

            dest += mailjs.render({
              template:  cTemplate,
              el:        cEl,
              binds:     binds,
              html:      html,
              templates: templates,
              inside:    true
            });

            si += cEl.el.length;
          } else {
            dest += '[';
            si++;
          }

          break;

        case '$':
          si++;

          var matches = src.substring( si ).match( /^([a-zA-Z0-9_]+)|^\{([a-zA-Z0-9_]+)\}/ );

          if ( !matches || matches.length < 3 )
            throw new Error( "Missing variable name after $." );

          var name = matches[ 1 ] || matches[ 2 ];
          si += matches[ 0 ].length;

          var bind = this.resolveBind( name, el, binds, template );
          if ( bind == null )
            throw new Error( 'No bind definition for: ' + name );

          bind = mailjs.render({
            src:       bind,
            binds:     binds,
            html:      html,
            templates: templates,
            inside:    true
          });

          dest += bind;
          break;

        default:
          dest += src[ si++ ];
        }
      }

      if ( el && !opts.close && el.selfClose ) {
        var savedInside = opts.inside;
        opts.close = true;
        opts.inside = true;
        dest += mailjs.render( opts );
        delete opts.close;
        opts.inside = savedInside;
      }

      return dest;
    }
  };

  if ( typeof define == 'function' && typeof define.amd == 'object' && define.amd ) {
    define(function() {
      return mailjs;
    });
  } else if ( typeof exports === 'object' ) {
    module.exports = mailjs;
  } else {
    window.mailjs = mailjs;
  }
}(this));
