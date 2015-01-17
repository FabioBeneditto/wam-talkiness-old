angular.module('speaker.controllers', ['ionic'])

        .controller('ControlCtrl', function ($scope) {

            var socket = io.connect('/');
            var socketReady;

            socket.on('connect', function () {
                socket.emit('remote_connected');
                socketReady = true;
            });

            $scope.socketEmit = function ($direction) {
                socket.emit('remote', {
                    command: $direction
                });
            };
        })

        .controller('QuestionsCtrl', function ($scope, $http) {

            $scope.questions = [];

            function getQuestions($finally) {
                $http.get('/questions/get').
                        success(function (data, status, headers, config) {
                            $scope.questions = data;
                        }).
                        error(function (data, status, headers, config) {
                            alert("Ocorreu um erro");
                        }).
                        finally($finally);
            }

            $scope.doRefresh = function () {
                getQuestions(function () {
                    $scope.$broadcast('scroll.refreshComplete');
                });
            };
            getQuestions();
        })

        .controller('QuestionsDetailCtrl', function ($scope, $stateParams, Questions) {
            $scope.question = Questions.get($stateParams.questionId);
        })

        .controller('CameraCtrl', function ($scope) {
            var camera = document.getElementById("localVideo");
            var canvas = document.getElementById("canvas");
            var context = canvas.getContext("2d");
            var constraints = {"mandatory": {}, "optional": []};

            var getUserMedia = navigator.mozGetUserMedia.bind(navigator);
            try {
                getUserMedia({'audio': false, 'video': constraints}, function (stream) {
                    console.log("User has granted access to local media.");
                    camera.mozSrcObject = stream;
                    camera.play();
                    camera.style.opacity = 1;
                    streamStatus = true;
                }, function () {
                    alert('não rolou');
                });
                console.log("Requested access to local media with mediaConstraints:\n  \"" + JSON.stringify(constraints) + "\"");
            } catch (e) {
                alert("getUserMedia() failed. Is this a WebRTC capable browser?");
                console.log("getUserMedia failed with exception: " + e.message);
            }
            $scope.takePickture = function () {
                context.drawImage(camera, 0, 0);
                var dataURL = canvas.toDataURL('image/webp');
                window.open(dataURL);
            };

        })

        .controller('ConfigsCtrl', function ($scope) {
            $scope.settings = {
                enableFriends: true
            };
        });
