/**
 * Created by Dhruvraj on 4/27/2016.
 */
angular.module('sphere_influence').controller('SphereInfluence',['$scope',
    '$routeParams', '$location','SphereInfluence','getUser','alertify','$http',
    function($scope, $routeParams, $location, SphereInfluence,getUser,alertify,$http){
        console.log("getUser"+JSON.stringify(getUser.user));
        $scope.all_paths = false;
        $scope.query_empty = '';
        $scope.showMessage = false;
        $scope.intermediate_nodes = false;
        $scope.sphere_influence_query = function(){
            console.log('Inside subject_area_connection_query');
            var fields = {
                'source' : $scope.source,
                'all_paths' : $scope.all_paths,
                'intermediate_nodes' : $scope.intermediate_nodes,
                'limit':$scope.limit
            };

            console.log("fields are "+JSON.stringify(fields));

            SphereInfluence.getSphereInfluence.query(fields, function(response){
                console.log('Success in getSphereInfluence '+JSON.stringify(response));
                $scope.sphere_influence_json = response[0]["graph"];
                $http.get('../alchemy_config.json')
                    .then(function(res){
                        var config = res.data;
                        config.dataSource = response[0]["graph"];
                        if(response[0]["graph"]["nodes"].length!=0){
                            alertify.logPosition("bottom right");
                            alertify.log("Graph is limited to 100 relations");
                        }else{
                            alertify.logPosition("bottom right");
                            alertify.error("This query did not return any results. Please try other parameters");
                        }
                        config.graphHeight = function(){
                            return 450;
                        }
                        config.linkDistancefn = function(edge){
                            if(edge.caption == "CITES")
                                return 800;
                            else
                                return 150;
                        }
                        config.captionSelector = "#captions";
                        var myEl = angular.element("svg");
                        myEl.remove();
                        //alchemy.begin({"dataSource": response[0]["graph"]})
                        alchemy = new Alchemy(config);
                    })

            },function(error){
                console.log('Error in getSphereInfluence '+JSON.stringify(error));
            });

        };

        /*$scope.$watch('all_paths', function() {
            alert("changed"+$scope.all_paths);
        }, true);*/


    }
]);
