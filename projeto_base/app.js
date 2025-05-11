// app.js - Configuração do AngularJS

// Criação do módulo principal
var app = angular.module("univespApp", []);

// Criação do controlador para consumir a API
app.controller("ClienteController", function ($scope, $http) {
  $scope.clientes = [];
  $scope.erro = false;
  $scope.mensagemErro = "";

  // Busca os dados da API
  $http
    .get("http://127.0.0.1:5000/clientes-univesp", { withCredentials: false })
    .then(function (response) {
      if (response.data && Array.isArray(response.data)) {
        $scope.clientes = response.data;
      } else {
        console.error("Resposta inesperada da API:", response.data);
        $scope.mensagemErro =
          "Resposta inesperada da API. Verifique o formato dos dados.";
        $scope.erro = true;
      }
    })
    .catch(function (error) {
      console.error("Erro ao buscar clientes:", error);
      if (error.response) {
        $scope.mensagemErro =
          "Erro ao buscar clientes: " +
          (error.response.data || "Erro desconhecido") +
          " (Status: " +
          error.response.status +
          ")";
      } else if (error.status) {
        $scope.mensagemErro =
          "Erro ao buscar clientes: Status " +
          error.status +
          " - " +
          (error.statusText || "Erro desconhecido");
      } else {
        $scope.mensagemErro =
          "Erro ao buscar clientes: " + (error.message || "Erro desconhecido");
      }
      $scope.erro = true;
    });
});
