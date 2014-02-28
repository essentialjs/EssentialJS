'use strict';

module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    banner: '/*!\n    <%= pkg.title || pkg.name %> - v<%= pkg.version %>' +
      '<%= pkg.homepage ? " ❀ " + pkg.homepage + "\\n    " : "* " %>' +
      'Copyright (c) 2011-<%= grunt.template.today("yyyy") %> <%= pkg.author_name %>\n' +
      '<%= pkg.license_text.join("\\n") %>*/\n',
      //' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',

    // --- FULL JS ---
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },

      less: {
        options: {
          banner: ''
        },

        src: [
          '_less/scrollbars.less'
        ],
        dest: 'essential.less'
      },

      essential: {
        src: [
          'js/resolver.js',
          'js/generator.js',
          'js/essentialns.js',
          'js/dom.js',
          'js/page.js',
          'js/xhr.js',
          'js/elements.js',
          'js/roles.js',
          'js/configured.js'
        ],
        dest: 'essential.js'
      },

      essential2: {
        src: [
          'js/modernizr-prefix.js',
          'js/modernizr-custom.js',
          'js/resolver.js',
          'js/generator.js',
          'js/essentialns.js',
          'js/dom.js',
          'js/page.js',
          'js/xhr.js',
          'js/elements.js',
          'js/roles.js',
          'js/configured.js'
        ],
        dest: 'modernizr+essential.js'
      },

      plus: {
        src: [
          'js/modernizr-prefix.js',
          'js/modernizr-custom.js',
          'js/resolver.js',
          'js/generator.js',
          'js/essentialns.js',
          'js/dom.js',
          'js/page.js',
          'js/xhr.js',
          'js/elements.js',
          'js/roles.js',
          'js/configured.js',
          'app/js/raphael.min.js',
          'app/js/spin.min.js'
        ],
        dest: 'modernizr+essential+plus.js'
      },

      essentialMin: {
        options: {
          banner: "",
          stripBanners: false
        },
        src: [
          'js/modernizr-prefix.js',
          'js/modernizr-custom.js',
          'essential.min.js'
        ],
        dest: 'modernizr+essential.min.js'
      }
    },


    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      essential: {
        src: [
          'js/resolver.js',
          'js/generator.js',
          'js/essentialns.js',
          'js/dom.js',
          'js/page.js',
          'js/xhr.js',
          'js/elements.js',
          'js/roles.js',
          'js/configured.js'
        ],
        dest: 'essential.min.js'
      },
      build: {
        src: 'src/<%= pkg.name %>.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    },

    jshint: {
      gruntfile: {
        options: {
          jshintrc: '.jshintrc'
        },
        src: 'Gruntfile.js'
      },
      src: {
        options: {
          jshintrc: 'js/.jshintrc'
        },
        src: ['js/configured.js','js/dom.js','js/elements.js','js/essentialjs.js','js/generator.js','js/legacy.js','js/page.js','js/resolver.js','js/roles.js']
      },
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/**/*.js']
      },
    },


    less: {
      dev: {
        options: {
          paths: [
            "./_components",
            "./_less"],
          yuicompress: true
        },
        files: {
          './app/css/mobile.min.css': './app/css/mobile.less',
          './app/css/enhanced.min.css': './app/css/enhanced.less'
        }
      },

      dist: {
        options: {
          paths: ["assets/less/bootstrap/less"],
          yuicompress: true
        },
        files: {
          'app/css/mobile.min.css': 'app/css/mobile.less',
          'app/css/enhanced.min.css': 'app/css/enhanced.less'
        }
      }
    },

    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },

      less: {
        files: ['_less/*.less','assets/less/**/*.less',"./app/css/*.less"],
        tasks: ['less:dev','concat:less']
      },
      sass: {
        files: ['assets/sass/partials/**/*.scss', 'assets/sass/modules/**/*.scss',"./css/*.scss"],
        tasks: 'sass:dev'
      },
      scripts: {
        files: ['js/*.js', 'assets/lib/**/*.js'],
        tasks: [
          // 'jshint',
          'concat:essential','concat:essential2','concat:plus'],
        options: {
          spawn: false
        }
      }
    },

    modernizr: {

        // [REQUIRED] Path to the build you're using for development.
        "devFile" : "js/modernizr-latest.js",

        // [REQUIRED] Path to save out the built file.
        "outputFile" : "js/modernizr-custom.js",

        // Based on default settings on http://modernizr.com/download/
        "extra" : {
            "shiv" : true,
            "printshiv" : false,
            "load" : true,
            "mq" : false,
            "cssclasses" : true
        },

        // Based on default settings on http://modernizr.com/download/
        "extensibility" : {
            "addtest" : false,
            "prefixed" : true,
            "teststyles" : false,
            "testprops" : false,
            "testallprops" : false,
            "hasevents" : true,
            "prefixes" : false,
            "domprefixes" : false
        },

        // By default, source is uglified before saving
        "uglify" : true,

        // Define any tests you want to implicitly include.
        "tests" : [
          // 'csstransform3d',
          'backgroundsize',
          'csscolumns',
          'hashchange',
          'draganddrop',
          'touch',
          'websockets',

          'file_api',
          // 'file_filesystem',
          // 'fullscreen_api',
          'ie8compat',
          'css-calc',
          'css-regions',
          'css-positionsticky'

        ],

        // By default, this task will crawl your project for references to Modernizr tests.
        // Set to false to disable.
        "parseFiles" : false,

        // When parseFiles = true, this task will crawl all *.js, *.css, *.scss files, except files that are in node_modules/.
        // You can override this by defining a "files" array below.
        // "files" : [],

        // When parseFiles = true, matchCommunityTests = true will attempt to
        // match user-contributed tests.
        "matchCommunityTests" : false,

        // Have custom Modernizr tests? Add paths to their location here.
        "customTests" : []
    },

    connect: {
      all: {
        options: {
          debug: true,
          keepalive: false,
          // livereload: true,  // use with watch
          protocol: 'http',
          hostname: 'localhost',
          port: 9000,
          open: true
        } 
      }
    },

    open: {
      all: {
        path: 'http://localhost:<%= connect.all.options.port%>'
      }
    },

    concurrent: {
      tasks: [
        // 'modernizr', requires network so disabled
        // 'jshint',
        'concat:less',
        'concat:essential','concat:essential2','concat:plus',
        'watch:less',/*'watch:sass',*/ 'watch:scripts'],//TODO host root as web
      options: {
        logConcurrentOutput: true
      }
    },

    exec: {
      bowerinstall: {
        cmd:"bower install"
      }
    }

  });

  // Load Plugins
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-modernizr');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-open');
  grunt.loadNpmTasks('grunt-contrib-connect');

  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-exec');

  // Default Task
  grunt.registerTask('default', ['connect','open','concurrent']);
  grunt.registerTask('install', ['exec:bowerinstall','modernizr','copy:mediaelement']);
  grunt.registerTask('build', ['modernizr','jshint','copy:mediaelement',
    'qunit','concat','uglify','concat:essentialMin']);
  grunt.registerTask('serve', ['jekyll:dev']);

};