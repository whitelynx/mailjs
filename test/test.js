
var mailjs = require( '../mail' ),
    chai   = require( 'chai' ),
    expect = chai.expect;


describe( 'attribute parser', function() {

  it( 'should parse all three quote styles', function() {
    expect(
      mailjs.parseAttrs( " foo='faz' bar=\"baz\"  car=caz" )
    ).to.eql(
      { foo: 'faz', bar: 'baz', car: 'caz' }
    );
  });

  it( 'should parse empty strings', function() {
    expect(
      mailjs.parseAttrs( ' ' )
    ).to.eql(
      {}
    );
  });
});

describe( 'element parser', function() {

  it( 'should parse simple tags', function() {
    expect(
      mailjs.parseElement( '[a]' )
    ).to.eql(
      { el: '[a]', tag: 'a', attrs: {} }
    );
  });

  it( 'should parse all three quote styles', function() {
    expect(
      mailjs.parseElement( "[a foo='faz' bar=\"baz\"  car=caz]" )
    ).to.eql(
      { el: "[a foo='faz' bar=\"baz\"  car=caz]", tag: 'a', attrs: { foo: 'faz', bar: 'baz', car: 'caz' } }
    );
  });

  it( 'should deal with quoted brackets', function() {
    expect(
      mailjs.parseElement( "[div tag='[div style=\"color:#000;\"]']" )
    ).to.eql(
      { el: "[div tag='[div style=\"color:#000;\"]']", tag: 'div', attrs: { tag: '[div style="color:#000;"]' } }
    );
  });

  it( 'should throw on empty elements', function() {
    expect( function() {
      mailjs.parseElement( '' )
    }).to.throw();

    expect( function() {
      mailjs.parseElement( '[]' )
    }).to.throw();
  });

  it( 'should throw on invalid elements', function() {
    expect( function() {
      return mailjs.parseElement( '[a style]' )
    }).to.throw();
  });

  it( 'should throw on incomplete elements', function() {
    expect( function() {
      return mailjs.parseElement( '[' )
    }).to.throw();

    expect( function() {
      return mailjs.parseElement( '[a style' )
    }).to.throw();
  });

  it( 'should support self-closing elements', function() {
    expect(
      mailjs.parseElement( '[a style="display:block;"/]' )
    ).to.eql(
      { el: '[a style="display:block;"/]', tag: 'a', attrs: { style: 'display:block;' }, selfClose: true }
    );
  });

  it( 'should support closing elements', function() {
    expect(
      mailjs.parseElement( '[/a]' )
    ).to.eql(
      { el: '[/a]', tag: 'a', attrs: {}, close: true }
    );
  });

  it( 'should throw on elements that are closed and self-closed', function() {
    expect( function() {
      return mailjs.parseElement( '[/a/]' )
    }).to.throw( /closed and self-closed/ );
  });

  it( 'should throw on closed elements that have attributes', function() {
    expect( function() {
      return mailjs.parseElement( '[/a style="color:#000;"]' )
    }).to.throw( /Closed elements should not contain attributes/ );
  });

  it( 'should parse tag-value elements', function() {
    expect(
      mailjs.parseElement( '[email="support@apple.com"]' )
    ).to.eql(
      { el: '[email="support@apple.com"]', tag: 'email', attrs: { email: 'support@apple.com' } }
    );

    expect(
      mailjs.parseElement( '[pixels=300px]' )
    ).to.eql(
      { el: '[pixels=300px]', tag: 'pixels', attrs: { pixels: '300px' } }
    );
  });

  it( 'should parse empty attributes', function() {
    expect(
      mailjs.parseElement( '[button borderRadius=""]' )
    ).to.eql(
      { el: '[button borderRadius=""]', tag: 'button', attrs: { borderRadius: '' } }
    )
  });

  it( 'should parse only the first element', function() {
    expect(
      mailjs.parseElement( '[wrapper][pixels=300px]' )
    ).to.eql(
      { el: '[wrapper]', tag: 'wrapper', attrs: {} }
    )
  });
});

describe( 'generation', function() {
  before( function() {
    mailjs.config({
      binds: {
        fontFamily: 'font-family:Helvetica, Arial, sans-serif'
      },
      templates: {
        btn: {
          html: '<a style="${style}color:#ffffff;width:$width;" href="$href">$label</a>',
          text: '$label: $href',
          binds: {
            style: '',
            width: '300px'
          }
        },
        wrapper: {
          src: '',
          srcClose: ''
        }
      }
    });
  });

  after( function() {
    mailjs.config({});
  });

  it( 'should render simple text', function() {
    expect(
      mailjs.render({
        src: 'This is a simple email.'
      })
    ).to.eql(
      'This is a simple email.'
    );
  });

  it( 'should support escapes', function() {
    expect(
      mailjs.render({
        src: '\\[Hello, \\$firstName./\\]'
      })
    ).to.eql(
      '[Hello, $firstName./]'
    );
  });

  it( 'should process simple binds', function() {
    expect(
      mailjs.render({
        src: 'Hello, $firstName.',
        binds: {
          firstName: 'Jane'
        }
      })
    ).to.eql(
      'Hello, Jane.'
    );
  });

  it( 'should process simple binds using ES6-style template syntax - ${}', function() {
    expect(
      mailjs.render({
        src: 'Hello, ${firstName}${ space }$lastName.',
        binds: {
          firstName: 'Jane',
          lastName:  'Anderson',
          space:     ' '
        }
      })
    ).to.eql(
      'Hello, Jane Anderson.'
    );
  });

  it( 'should process templates', function() {
    expect(
      mailjs.render({
        src: '[msg name="Jane"] and [msg].',
        binds: {
          name: 'Joe'
        },
        templates: {
          msg: {
            src: 'a message for $name'
          }
        }
      })
    ).to.eql(
      'a message for Jane and a message for Joe.'
    );
  });

  it( 'should process tag-value templates', function() {
    expect(
      mailjs.render({
        src: 'Email us at [email="support@apple.com"].',
        templates: {
          email: {
            html: '<a href="mailto:$email">$email</a>',
            text: '$email'
          }
        },
        html: true
      })
    ).to.eql(
      'Email us at <a href="mailto:support@apple.com">support@apple.com</a>.'
    );
  });

  it( 'should process text & html templates', function() {
    expect(
      mailjs.render({
        src: '[btn href="https://apple.com" label="Visit Apple"].'
      })
    ).to.equal(
      'Visit Apple: https://apple.com.'
    );

    expect(
      mailjs.render({
        src:  '[btn href="https://apple.com" label="Visit Apple"].',
        html: true
      })
    ).to.equal(
      '<a style="color:#ffffff;width:300px;" href="https://apple.com">Visit Apple</a>.'
    );
  });

  it( 'should throw when using unsupported close tags', function() {
    expect( function() {
      mailjs.render({
        // here, btn does not support a closing tag
        src: '[btn href="https://apple.com" label="Visit Apple"]sample text[/btn].'
      })
    }).to.throw( /Closing elements not supported/ );
  });

  it( 'should process config()ured binds', function() {
    expect(
      mailjs.render({
        src: '[btn style="$fontFamily;" href="https://apple.com" label="Visit Apple"].',
        html: true
      })
    ).to.equal(
      '<a style="font-family:Helvetica, Arial, sans-serif;color:#ffffff;width:300px;" href="https://apple.com">Visit Apple</a>.'
    );
  });

  it( 'should allow bindings to contain template references', function() {
    expect(
      mailjs.render({
        src: 'This is $myBtn.',
        html: true,
        binds: {
          myBtn: '[btn href="https://apple.com" label="Visit Apple"]'
        }
      })
    ).to.equal(
      'This is <a style="color:#ffffff;width:300px;" href="https://apple.com">Visit Apple</a>.'
    );
  });

  it( 'should allow bindings to contain references to other bindings', function() {
    expect(
      mailjs.render({
        src: 'It is true that $statement.',
        binds: {
          statement:  '$name is a $profession',
          profession: 'programmer',
          name:       '$firstName $lastName',
          firstName:  'Jill',
          lastName:   'Anderson'
        }
      })
    ).to.equal(
      'It is true that Jill Anderson is a programmer.'
    );
  });

  it( 'should render closed elements correctly', function() {
    expect(
      mailjs.render({
        src: 'This is [boxed]contained[/boxed].',
        templates: {
          boxed: {
            src: '\\[',
            srcClose: '\\]'
          }
        }
      })
    ).to.equal(
      'This is [contained].'
    );
  });

  it( 'should render self-closed elements correctly', function() {
    expect(
      mailjs.render({
        src: 'This is [boxed/].',
        templates: {
          boxed: {
            src: '\\[',
            srcClose: '\\]'
          }
        }
      })
    ).to.equal(
      'This is [].'
    );
  });

  it( 'should render process function templates', function() {
    expect(
      mailjs.render({
        src: 'This is [dynamic].',
        templates: {
          dynamic: {
            src: function() {
              return 'generated';
            }
          }
        }
      })
    ).to.equal(
      'This is generated.'
    );
  });

  it( 'should properly process scope.binding() calls', function() {
    expect(
      mailjs.render({
        src: 'This is [dynamic].',
        templates: {
          dynamic: {
            src: function( scope ) {
              return 'generated using ' + scope.binding( 'name' );
            }
          }
        },
        binds: {
          name: 'Test'
        }
      })
    ).to.equal(
      'This is generated using Test.'
    );
  });

  it( 'should render process function bindings', function() {
    expect(
      mailjs.render({
        src: 'This is $dynamic.',
        binds: {
          dynamic: function() {
            return '$name';
          },
          name: 'Test'
        }
      })
    ).to.equal(
      'This is Test.'
    );
  });

  it( 'should work with Scope.if()', function() {
    expect(
      mailjs.render({
        src: function( scope ) {
          return '<a' + scope.if( 'style', ' style="$style"' ) + '>.';
        },
        binds: {
          style: 'color:#000;'
        }
      })
    ).to.equal(
      '<a style="color:#000;">.'
    );
  });

  it( 'should handle redefining nested binds', function() {
    expect(
      mailjs.render({
        src: function( scope ) {
          return '[b width="300px;"]'
        },
        templates: {
          a: {
            src: '$width'
          },
          b: {
            src: '[a width=$width]'
          }
        }
      })
    ).to.equal(
      '300px;'
    );
  });

  it( 'should handle default attributes', function() {
    expect(
      mailjs.render({
        src: function( scope ) {
          return '[b]'
        },
        templates: {
          a: {
            src: '$width',
          },
          b: {
            src: '[a width=$width]',
            binds: {
              width: '40px'
            }
          }
        }
      })
    ).to.equal(
      '40px'
    );
  });

  it( 'should support Scope.pixels()', function() {
    expect(
      mailjs.render({
        src: '[pixels=300px]'
      })
    ).to.equal(
      '300'
    );
  });
});

describe( 'generation with boilerplate', function() {
  before( function() {
    mailjs.config({
    });
  });

  after( function() {
    mailjs.config({});
  });

  it( 'should render still render simple text', function() {
    expect(
      mailjs.render({
        src: 'This is a simple email.'
      })
    ).to.eql(
      'This is a simple email.'
    );
  });
});

