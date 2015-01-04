angular.module('ecaps', ['ionic', 'ecaps.controllers', 'ecaps.services'])

        .run(function ($ionicPlatform) {
            $ionicPlatform.ready(function () {
                if (window.cordova && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                }
                if (window.StatusBar) {
                    StatusBar.styleDefault();
                }
            });
        })

        .config(function ($stateProvider, $urlRouterProvider) {

            $stateProvider

                    .state('tab', {
                        url: "/tab",
                        abstract: true,
                        templateUrl: "templates/tabs.html"
                    })

                    .state('tab.control', {
                        url: '/control',
                        views: {
                            'tab-control': {
                                templateUrl: 'templates/tab-control.html',
                                controller: 'ControlCtrl'
                            }
                        }
                    });

            $urlRouterProvider.otherwise('/tab/control');

        });
