const webp = require('imagemin-webp'),
const jpegoptim = requre('imagemin-jpegoptim');

module.exports = function(grunt){

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		// concatenate files before minifiying
		concat: {
			options: {
				seperator: ';'
			},
			dist: {
				src: ['src/app/**/*.js'],
				dest: 'gruntdist/<%= pkg.name %>.js'
			}
		},
		// minify/uglify js files
		uglify: {
			options: {
				// The banner is inserted at the top of the output
				banner: '/*! <%= grunt.template.today("dd-mm-yyyy") %> */\n'
			},
			dist: {
				files: {
					'gruntdist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
				}
			}
		},
		// Compile sass files
		sass:{
			dist: {
				files: {
					'src/styles.css': 'src/scss/styles.css',
					'src/app/app.component.css': 'src/app/app.components.scss'
				}
			}
		},
		// You can generate the specific grunt config for modernizr from their website
		modernizr: {
			dist: {
				"crawl": false,
				"customTests": [],
				"dest": "gruntdist/modernizr-output.js",
				"tests": [
					"webp"
				],
				"options": [
					"setClasses"
				],
				"uglify": true
			}
		},
		// Watch files then call corresponding grunt task
		watch: {
      files: [
        'src/**/*.scss',  // compile sass
        'uglify.dist.files',  // minify js
        'src/assets/media_src/raw/background/*.{png,jpg,gif}',  // responsive bg 
        'src/assets/media_src/responsive/**/*.{png,jpg,gif}',  // minify images
      ],
      tasks: [
        'sass',
        'uglify',
        'responsive_images:bg',
        'imagemin',
      ]
    },
    // Compress images
    imagemin: {
    	// For Webp format
      webp: {
        options: {
          use: [webp()] // plugin to use
        },
        files: [{
          expand:true,
          cwd: 'src/assets/media_src/responsive',
          src: ['**/*.{png,jpg,gif}'],
          dest: 'src/assets/media',
          ext: '.webp'
        }]
      },
      // For jpeg
      jpg: {
        options: {
          progressive: true,
          // custom plugin, if you want some lossy compression
          use: [jpegoptim({progressive:true, max:80})]
        },
        files: [{
          expand: true,
          cwd: 'src/assets/media_src/responsive',
          src: ['**/*.{png,jpg,gif}'],
          dest: 'src/assets/media',
          ext: '.jpg'
        }]
      },
      // For SVG; svgo plugin already included with imagemin
      svgMin: {
        options: {
          svgoPlugins: [{removeUselessStrokeAndFill: false}]
        },
        files: [{
          expand: true,
          cwd: 'src/assets/media_src/raw/portfolio',
          src: ['**/*.svg'],
          dest: 'src/assets/media_src/compressed/portfolio',
          ext: '.svg'
        }]
      }
    },
    // Generate responsive images
    responsive_images: {
      bg: {
        options: {
          engine: 'im',
          // apsect ratio: false enables cropping
          aspectRatio: false,
          sizes: [{
            width: 1920,
            height: 1280,
            // quality for jpeg only
            quality: 90
          },
          {
            width: 1250,
            height: 950,
            quality: 90
          },
          ]
        },
        files: [{
          expand: true,
          src: ['**/*.{gif,jpg,png}'],
          cwd: 'src/assets/media_src/raw/background',
          dest: 'src/assets/media_src/responsive/background'
        }]
      },
      profile: {
        options: {
          engine: 'im',
          aspectRatio: false,
          sizes: [{
            width: '300px',
            height: '300px',
            suffix: "_small_1x",
          },
          {
            width: '600px',
            height: '600px',
            suffix: "_small_2x",
          }]
        },
        files: [{
          expand: true,
          src: ['**/*.{gif,jpg,png,jpeg,JPG}'],
          cwd: 'src/assets/media_src/raw/about-me',
          dest: 'src/assets/media_src/responsive/about-me'
        }]
      }
    },
    clean: {
      imgBuild: {
        src: ['src/assets/media_src/responsive']
      },
      clearImg: {
        src: ['src/assets/media']
      }
    },

    // Image-magic grunt plugin for some conversions which above tools can't do
    "imagemagick-convert": {
      svg: {
      	// Can't get blob to work well here so it's not really automated
        args: ['src/assets/media_src/raw/portfolio/*.png', 'src/assets/media_src/raw/portfolio/sample1.svg'],
      }
    }

	}); // end grunt.initConfig({})

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	// So on and so fort

	// PS: ORDER INSIDE ARRAY MATTERS
	grunt.registerTask('svg' ['imagemagick-convert']);
	grunt.registerTask('images', ['responsive_images','imagemin', 'clean:imgBuild']);
	grunt.registerTask('default', ['sass', 'concat', 'uglify']);

};