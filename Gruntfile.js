module.exports = function(grunt) {
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        uglify: {

            options: {
                banner:
                    '/**\n' +
                    '* <%= pkg.name %>\n' +
                    '* v<%= pkg.version %> (<%= grunt.template.today("yyyy-mm-dd") %>)\n' +
                    '* @author: <%= pkg.author %>\n' +
                    '* @email: <%= pkg.email %>\n' +
                    '* @twitter: <%= pkg.twitter %>\n' +
                    '* @web: <%= pkg.web %>\n' +
                    '*/\n\n' +

                    '/*!\n'+
                    'MIT LICENSE\n\n'+
                    'Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
                    '\n' +
                    'Permission is hereby granted, free of charge, to any person obtaining a copy\n' +
                    'of this software and associated documentation files (the "Software"), to deal\n' +
                    'in the Software without restriction, including without limitation the rights\n' +
                    'to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\n' +
                    'copies of the Software, and to permit persons to whom the Software is\n' +
                    'furnished to do so, subject to the following conditions:\n' +
                    '\n' +
                    'The above copyright notice and this permission notice shall be included in\n' +
                    'all copies or substantial portions of the Software.\n' +
                    '\n' +
                    'THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n' +
                    'IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n' +
                    'FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n' +
                    'AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n' +
                    'LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n' +
                    'OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN\n' +
                    'THE SOFTWARE.\n'+
                    '!*/\n'
            },

            core: {
                src: 'src/zmultiselect.js',
                dest: 'dist/zmultiselect.min.js'
            },
            i18n: {
                files: [{
                    expand: true,
                    src: 'src/i18n/*.js',
                    dest: 'dist/i18n/',
                    rename: function (dst, src) {
                        var file = src.split("/");
                        file = file.slice(-1).pop();
                        return dst + file.replace('.js', '.min.js');;
                    }
                }]





            }



        },



        less:{
            production: {
                options: {
                    //cleancss: true
                },
                files: {
                    "dist/zmultiselect.css": "src/zmultiselect.less",
                }
            }
        },

        cssmin: {
            options: {
                keepSpecialComments: 1,
                mergeIntoShorthands: false,
                roundingPrecision: -1
            },

            core: {
                files: {

                    'dist/zmultiselect.min.css': [
                        'dist/zmultiselect.css',
                    ]




                }
            }
        },



        ftp_push: {
            update: {
                options: {
                    host: "ftp.fasys.it",
                    dest: "/public_html/andreamariani/lab/zurb-foundation6-multiselect/",
                    port: 21,
                    username: grunt.option('ftp-user'),
                    password: grunt.option('ftp-pass')
                },
                files: [
                    {
                        expand: true,
                        cwd: '.',
                        src: [
                            "dist/**",
                            "docs-example/**",
                            "src/**",
                            "LICENSE",
                            "README.md",
                        ]
                    }
                ]
            }
        }



    });

    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    grunt.loadNpmTasks('grunt-ftp-push');



    grunt.registerTask('default', ['less', 'cssmin', 'uglify', 'ftp_push']);
};