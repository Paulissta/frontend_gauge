(function () {
	$ALL_BRANDS_ID_VALUE = -1;
	var app = angular.module("app", ["chart.js", "ui.bootstrap"]);

	app.controller('jsonServerBox', function($scope, $http) {	
		$scope.updateChart = function() {
			// Update user interactions based on brand filtering or not
			setUserInteractions($scope.users, $scope.interactions, $scope.selectedBrand);

			// Sets $scope attributes for chart purposes
			$scope.labels = getObjectNames($users);
			$scope.data = [getUserInteractions($users)];
		};
		
		// Loads all information from json file to the scope
		getAllData($scope, $http);
	});
	
	//Retrieves all data from json files
	function getAllData($scope, $http) {
		getUsers($scope, $http);
	}
	
	// Recovers all users from json file
	function getUsers($scope, $http)
	{
		$http.get('data/users.json').then(function (users) {
			$users = [];
		
			for ($i = 0; $i < users.data.length; $i++)
			{				
				$users[$users.length] = {
							"id" : users.data[$i].id, // User's identifier
							"name" : users.data[$i].name.title + ' ' + users.data[$i].name.first + ' ' + users.data[$i].name.last, // User's title and name
							"interactions" : 0 // Interactions of an user with a brand
						};
			}
			
			$scope.users = $users;

			getBrands($scope, $http); // Not the best approach to avoid the asynchronous request on AngularJS. I can do better with more time!
		});
	}
	
	// Recovers all brands from json file
	function getBrands($scope, $http)
	{
		$http.get('data/brands.json').then(function (brands) {
			$brands = [
						{
							"id" : $ALL_BRANDS_ID_VALUE,
							"name" : "All brands"
						}
					];
			for ($i = 0; $i < brands.data.length; $i++)
			{
				$brands[$brands.length] = {
							"id" : brands.data[$i].id, // Brand's identifier
							"name" : brands.data[$i].name // Brand's name
						};
			}
			
			$scope.brands = $brands;
			$scope.selectedBrand = $brands[0];

			getInteractions($scope, $http); // Not the best approach to avoid the asynchronous request on AngularJS. I can do better with more time!
		});
	}
	
	// Recovers all interactions from json file
	function getInteractions($scope, $http)
	{
		$http.get('data/interactions.json').then(function (interactions) {
			$scope.interactions = interactions;
		
			$scope.updateChart();
		});
	}
	
	// Sets interaction attribute of user
	function setUserInteractions(users, interactions, brand)
	{
		// Reset all interaction of an user
		for ($i = 0; $i < users.length; $i++)
		{
			users[$i].interactions = 0;
		}
			
		for ($i = 0; $i < interactions.data.length; $i++)
		{
			for ($j = 0; $j < users.length; $j++)
			{
				if (users[$j].id == interactions.data[$i].user
					&& (brand.id == $ALL_BRANDS_ID_VALUE || brand.id == interactions.data[$i].brand)) // Verifies if the interactions belongs to the user and to the selected brand
				{
					users[$j].interactions++;
					break;
				}
			}
		}

		// Sorts the list of users based on new amount of interactions
		sortUsersByInteractionsAndName($users);
	}
	
	// Retrieves a list with all names of a provided object list
	function getObjectNames(objects)
	{
		$names = [];
		for ($i = 0; $i < objects.length; $i++)
		{
			$names[$i] = objects[$i].name;
		}
		
		return $names;
	}
	
	// Retrieves a list with all interaction values of a provided user list
	function getUserInteractions(users)
	{
		$userInteractions = [];
		for ($i = 0; $i < users.length; $i++)
		{
			$userInteractions[$i] = users[$i].interactions;
		}
		
		return $userInteractions;
	}
	
	// Sorts the user list based on its interaction amount and name
	function sortUsersByInteractionsAndName(users)
	{
		users.sort(
					function(a, b)
					{
						$interactionsDiff = b.interactions - a.interactions;

						if ($interactionsDiff != 0)
						{
							return $interactionsDiff;
						}

						return a.name > b.name;
					}
		);
	}
})();