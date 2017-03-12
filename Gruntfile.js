module.exports = function (grunt) {
    'use strict';
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-coveralls');
    grunt.initConfig({
        jasmine: {
            'tests': {
                'src': ['dist/src/**/*.js'],
                'summary': true,
                'phantomjs': { 'resourceTimeout': 25000 },
                'options': {
                    'specs': ['tests/*.js'],
                    'junit': { 'path': 'build/junit' },
                    'template': require('grunt-template-jasmine-istanbul'),
                    'templateOptions': {
                        'coverage': 'build/coverage/coverage.json',
                        'report': [
                            {
                                'type': 'lcov',
                                'options': { 'dir': 'build/coverage/lcov' }
                            },
                            {
                                'type': 'cobertura',
                                'options': { 'dir': 'build/coverage/cobertura' }
                            }
                        ],
                        'template': require('grunt-template-jasmine-requirejs'),
                        'templateOptions': {
                            'requireConfig': {
                                'shim': {},
                                'baseUrl': '.grunt/grunt-contrib-jasmine/dist/src/',
                                'paths': {                                   
                                    "q": "../../../../node_modules/q/q"
                                },
                                'packages': [
                                    {
                                        name: "si-appbuilder",
                                        main: "index",
                                        location: "."
                                    }
                                ]
                            }
                        }
                    }
                }
            }
        },
        coverall: {
            'options': { 'force': false },
            'upload': {
                'src': 'build/coverage/lcov/*.info',
                'options': {}
            }
        }
    });
    grunt.registerTask('tests', ['jasmine:tests']);
};