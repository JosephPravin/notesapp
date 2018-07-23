var app = angular.module('myNotesList', ['ngSanitize']);

app.controller('myCtrl', function ($scope, $http, $location, $window, $timeout) {

    $scope.notes = [];

    $scope.init = function () {
        try {
            $http.get("http://localhost:3000/api/notes/").then(function (response) {
                $scope.notes = response.data;
                console.log($scope.notes);
            });
        } catch (err) {
            console.log(err);
        }
    }
   
    // POST REQUEST
    $scope.addNote = function () {
        if ($scope.newNoteTitle == "" || $scope.newNoteTitle == undefined || $scope.newNoteValue == "" || $scope.newNoteValue == undefined) {
            return;
        }
        else {
            $scope.myNewNote = {
                "title": $scope.newNoteTitle,
                "value": $scope.newNoteValue,
                "extra": $scope.newNoteExtra,
                "priority": $scope.priority
            };
            //$scope.newNoteTitle = $scope.newNoteValue = $scope.newNoteExtra = "";
            console.log($scope.myNewNote);
            try {
                $http.post("http://localhost:3000/api/notes/", $scope.myNewNote).then(function (err, response) {
                    if (!err) {
                        console.log(response);
                        $scope.notes.push(response);
                    }
                    else {
                        console.log(err);
                    }
                });
            } catch (err) {
                console.log(err);
            }
            setTimeout(() => {
                $scope.init()
            }, 10000);
        }
        
    }

    $scope.magnifyNote = function (x) {
        $scope.magnifiedNote = $scope.notes[x];
        angular.element('#myModal').modal('toggle');
    }

   // PUT REQUEST
    $scope.editNote = function (x) {
        $scope.modifyNote = $scope.notes[x];
        console.log($scope.modifyNote);
        angular.element('#editModal').modal('toggle');
    }

    //DELETE REQUEST
    $scope.removeNote = function (x) {
        if (confirm("Do you want to delete the notes?")) {
            try {
                x = parseInt(x) + 1
                $http.delete("http://localhost:3000/api/notes/" + x).then(function (err, response) {
                    if (!err) {
                        console.log(response);                      
                    }
                    else {
                        console.log(err);
                    }
                });
            } catch (err) {
                console.log(err);
            }
            $timeout($scope.init(), 2000);
        } else {
            return;
        }
    }

    $scope.accordianFunc = function ($event) {
        console.log("Inside click event handler");
        angular.element(event.target).toggleClass('active');
        angular.element(event.target.nextElementSibling).toggleClass('expand');
    }

});