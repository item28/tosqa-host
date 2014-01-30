ng = angular.module 'myApp'

ng.config ($stateProvider, navbarProvider, primus) ->
  $stateProvider.state 'view5',
    url: '/view5'
    templateUrl: 'view5/view.html'
    controller: 'View5Ctrl'
  navbarProvider.add '/view5', 'view5', 15


#controller, calls primus.dead only
ng.controller 'View5Ctrl', ($scope, primus, tqNodeTypes, tqNodes) ->
  
  diagram = createDiagramEditor('diagram')
  diagram_nodes = []
  
  $scope.nodeData = [
    ["properties", "-"]
  ];    

  for id in Object.keys(tqNodes)
    node = tqNodes[id].node

    addItem(id, node, diagram, tqNodeTypes)



    #   #updates infotable with new node data
    # $scope.update = (nodeId) ->
    #   console.log "info updated for nodeId:" + nodeId
    #   $scope.nodeData = [
    #     ["properties", nodeId],
    #     ["temp", 50],
    #     ["STEP", 200],
    #     ["value", 63]
    #   ];        
   
      
  diagram.wireItUp()

  
  # diagram.onClick = (nodeId)->
  #   $scope.$apply ->
  #     $scope.update(nodeId)
  
  diagram.onAddWire = (from, to) ->
    console.log 'added', from.node.id, from.name, '>', to.node.id, to.name
    link = from.node.id + from.name + '>' + to.node.id + to.name
    value = {fromId:from.node.id, pad:from.name, toId:to.node.id, topad:to.name}
    data = {prefix:"view5", key:link, value:value}
    primus.write ['saveToStorage', data]

  diagram.onRemoveWire = (from, to) ->
    console.log 'removed', from.node.id, from.name, '>', to.node.id, to.name
    link = from.node.id + from.name + '>' + to.node.id + to.name
    data = {prefix:"view5", key:link}
    primus.write ['saveToStorage', data]


ng.directive 'highlightOnChange', ($animate) ->
  (scope, elem, attrs) ->
    scope.$watch attrs.highlightOnChange, ->
      $animate.addClass elem, 'highlight', ->
        attrs.$removeClass 'highlight'


# addItem = (diagram, table)->
  



addItem = (id, node, diagram, tqNodeTypes) ->
  console.log "addNode", node.title
  console.log node.type
  prop = tqNodeTypes[node.type]

  console.log prop

  diagram.addNode
      id: id
      name: node.title
      x: node.diagramX or prop.diagramX
      y: node.diagramY or prop.diagramY
      pads: prop.pads
       


