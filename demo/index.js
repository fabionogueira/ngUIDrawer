angular
    .module('App', ['ngUI'])
    .controller('AppCtrl', ['$scope', '$module', function($scope, $module){
        var drawer1, drawer2;

        $module($scope, function(){
            drawer1 = $scope.$UI('drawer1');
            drawer2 = $scope.$UI('drawer2');
        });

        $scope.show = function(v){
            v===1 ? drawer1.show() : drawer2.show();
        };

    }]);
