(function() {
  var circuitsCtrl, ng,
    __slice = [].slice;

  ng = angular.module('myApp');

  ng.config(function($stateProvider, navbarProvider) {
    $stateProvider.state('circuits', {
      url: '/circuits',
      templateUrl: '/circuits/circuits.html',
      controller: circuitsCtrl
    });
    return navbarProvider.add('/circuits', 'Circuits', 30);
  });

  circuitsCtrl = function($scope, jeebus) {
    var handlers, obj, setup, updatePinList;
    $scope.gadgets = {
      Pipe: {
        name: 'Pipeline',
        shade: 'lightyellow',
        icon: '\uf061',
        inputs: 'In',
        outputs: 'Out'
      },
      Printer: {
        shade: 'lightblue',
        icon: '\uf02f',
        inputs: 'In In2'
      },
      StepGen: {
        shade: 'lightgreen',
        icon: '\uf013',
        inputs: 'Params',
        outputs: 'Out'
      },
      SSB: {
        shade: 'lightgray',
        icon: '\uf0b2',
        inputs: 'Cmds'
      }
    };
    $scope.circuit = {
      gadgets: {
        g1: {
          x: 120,
          y: 220,
          title: 'Gadget One',
          type: 'Pipe'
        },
        g2: {
          x: 300,
          y: 250,
          title: 'Gadget Two',
          type: 'Printer'
        },
        g3: {
          x: 320,
          y: 60,
          title: 'StepGen-X',
          type: 'StepGen'
        },
        g4: {
          x: 540,
          y: 70,
          title: 'SSB-X',
          type: 'SSB'
        },
        g5: {
          x: 340,
          y: 140,
          title: 'StepGen-Y',
          type: 'StepGen'
        },
        g6: {
          x: 520,
          y: 150,
          title: 'SSB-Y',
          type: 'SSB'
        }
      },
      wires: {
        'g1.Out/g2.In': 0,
        'g3.Out/g4.Cmds': 0,
        'g5.Out/g6.Cmds': 0
      },
      feeds: {
        'g2.In': [
          'some data', {
            Tag: 'blah',
            Msg: 'tagged data'
          }
        ],
        'g3.Params': [1000, 500],
        'g5.Params': [500, 1000]
      },
      labels: {
        In: 'g2.In'
      }
    };
    updatePinList = function() {
      var g, gid, ins, p, _i, _len, _ref, _ref1;
      $scope.inputPins = [];
      _ref = $scope.circuit.gadgets;
      for (gid in _ref) {
        g = _ref[gid];
        if (ins = $scope.gadgets[g.type].inputs) {
          _ref1 = ins.split(' ');
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            p = _ref1[_i];
            $scope.inputPins.push("" + gid + "." + p);
          }
        }
      }
      return $scope.inputPins.sort();
    };
    $scope.$watch('addPin', function(pin) {
      var _base;
      if (pin) {
        if ((_base = $scope.circuit.feeds)[pin] == null) {
          _base[pin] = [];
        }
        console.log('addFeed', pin, $scope.circuit.feeds[pin].length);
        $scope.circuit.feeds[pin].push('');
        return $scope.addPin = null;
      }
    });
    $scope.delFeed = function(pin, index) {
      var items;
      items = $scope.circuit.feeds[pin];
      console.log('delFeed', pin, index, items[index]);
      items.splice(index, 1);
      if (items.length === 0) {
        return delete $scope.circuit.feeds[pin];
      }
    };
    $scope.$watch('currSel.id', function(x) {
      console.log('fix id', x);
      return updatePinList();
    });
    $scope.$watch('currSel.title', function(x) {
      return console.log('fix title', x);
    });
    obj = 'demo1';
    handlers = {
      addGadget: function(x, y) {
        return jeebus.send({
          cmd: 'ced-ag',
          obj: obj,
          x: x,
          y: y
        });
      },
      delGadget: function(id) {
        return jeebus.send({
          cmd: 'ced-dg',
          obj: obj,
          id: id
        });
      },
      addWire: function(from, to) {
        return jeebus.send({
          cmd: 'ced-aw',
          obj: obj,
          from: from,
          to: to
        });
      },
      delWire: function(from, to) {
        return jeebus.send({
          cmd: 'ced-dw',
          obj: obj,
          from: from,
          to: to
        });
      },
      selectGadget: function(id) {
        return jeebus.send({
          cmd: 'ced-sg',
          obj: obj,
          id: id
        });
      },
      moveGadget: function(id, x, y) {
        return jeebus.send({
          cmd: 'ced-mg',
          obj: obj,
          id: id,
          x: x,
          y: y
        });
      }
    };
    $scope.$on('circuit', function() {
      var args, event, type;
      event = arguments[0], type = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
      console.log.apply(console, ['C:', type].concat(__slice.call(args)));
      return handlers[type].apply(handlers, args);
    });
    setup = function() {
      return jeebus.attach('circuit').on('sync', function() {
        $scope.circuits = this.rows;
        return angular.forEach(this.rows, function(value) {
          return console.log(value);
        });
      }).on('data', function(k, v) {
        return console.log(k, v);
      });
    };
    if ($scope.serverStatus === 'connected') {
      setup();
    }
    return $scope.$on('ws-open', setup);
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2lyY3VpdHMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxnQkFBQTtJQUFBLGtCQUFBOztBQUFBLEVBQUEsRUFBQSxHQUFLLE9BQU8sQ0FBQyxNQUFSLENBQWUsT0FBZixDQUFMLENBQUE7O0FBQUEsRUFFQSxFQUFFLENBQUMsTUFBSCxDQUFVLFNBQUMsY0FBRCxFQUFpQixjQUFqQixHQUFBO0FBQ1IsSUFBQSxjQUFjLENBQUMsS0FBZixDQUFxQixVQUFyQixFQUNFO0FBQUEsTUFBQSxHQUFBLEVBQUssV0FBTDtBQUFBLE1BQ0EsV0FBQSxFQUFhLHlCQURiO0FBQUEsTUFFQSxVQUFBLEVBQVksWUFGWjtLQURGLENBQUEsQ0FBQTtXQUlBLGNBQWMsQ0FBQyxHQUFmLENBQW1CLFdBQW5CLEVBQWdDLFVBQWhDLEVBQTRDLEVBQTVDLEVBTFE7RUFBQSxDQUFWLENBRkEsQ0FBQTs7QUFBQSxFQVNBLFlBQUEsR0FBZSxTQUFDLE1BQUQsRUFBUyxNQUFULEdBQUE7QUFFYixRQUFBLG1DQUFBO0FBQUEsSUFBQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsTUFBQSxJQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxVQUFOO0FBQUEsUUFDQSxLQUFBLEVBQU8sYUFEUDtBQUFBLFFBRUEsSUFBQSxFQUFNLFFBRk47QUFBQSxRQUdBLE1BQUEsRUFBUSxJQUhSO0FBQUEsUUFJQSxPQUFBLEVBQVMsS0FKVDtPQURGO0FBQUEsTUFNQSxPQUFBLEVBQ0U7QUFBQSxRQUFBLEtBQUEsRUFBTyxXQUFQO0FBQUEsUUFDQSxJQUFBLEVBQU0sUUFETjtBQUFBLFFBRUEsTUFBQSxFQUFRLFFBRlI7T0FQRjtBQUFBLE1BVUEsT0FBQSxFQUNFO0FBQUEsUUFBQSxLQUFBLEVBQU8sWUFBUDtBQUFBLFFBQ0EsSUFBQSxFQUFNLFFBRE47QUFBQSxRQUVBLE1BQUEsRUFBUSxRQUZSO0FBQUEsUUFHQSxP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QUFELEVBQUcsQ0FBSCxHQUFBO2VBRVYsT0FBTyxDQUFDLEdBQVIsQ0FBWSxDQUFaLEVBQWUsQ0FBZixFQUZVO01BQUEsQ0FMZCxFQURNO0lBQUEsQ0FqRlIsQ0FBQTtBQStGQSxJQUFBLElBQVksTUFBTSxDQUFDLFlBQVAsS0FBdUIsV0FBbkM7QUFBQSxNQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUE7S0EvRkE7V0FnR0EsTUFBTSxDQUFDLEdBQVAsQ0FBVyxTQUFYLEVBQXNCLEtBQXRCLEVBbEdhO0VBQUEsQ0FUZixDQUFBO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJuZyA9IGFuZ3VsYXIubW9kdWxlICdteUFwcCdcblxubmcuY29uZmlnICgkc3RhdGVQcm92aWRlciwgbmF2YmFyUHJvdmlkZXIpIC0+XG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlICdjaXJjdWl0cycsXG4gICAgdXJsOiAnL2NpcmN1aXRzJ1xuICAgIHRlbXBsYXRlVXJsOiAnL2NpcmN1aXRzL2NpcmN1aXRzLmh0bWwnXG4gICAgY29udHJvbGxlcjogY2lyY3VpdHNDdHJsXG4gIG5hdmJhclByb3ZpZGVyLmFkZCAnL2NpcmN1aXRzJywgJ0NpcmN1aXRzJywgMzBcblxuY2lyY3VpdHNDdHJsID0gKCRzY29wZSwgamVlYnVzKSAtPlxuICAgIFxuICAkc2NvcGUuZ2FkZ2V0cyA9XG4gICAgUGlwZTpcbiAgICAgIG5hbWU6ICdQaXBlbGluZSdcbiAgICAgIHNoYWRlOiAnbGlnaHR5ZWxsb3cnXG4gICAgICBpY29uOiAnXFx1ZjA2MScgIyBmYS1hcnJvdy1yaWdodFxuICAgICAgaW5wdXRzOiAnSW4nXG4gICAgICBvdXRwdXRzOiAnT3V0J1xuICAgIFByaW50ZXI6XG4gICAgICBzaGFkZTogJ2xpZ2h0Ymx1ZSdcbiAgICAgIGljb246ICdcXHVmMDJmJyAjIGZhLXByaW50XG4gICAgICBpbnB1dHM6ICdJbiBJbjInXG4gICAgU3RlcEdlbjpcbiAgICAgIHNoYWRlOiAnbGlnaHRncmVlbidcbiAgICAgIGljb246ICdcXHVmMDEzJyAjIGZhLWNvZ1xuICAgICAgaW5wdXRzOiAnUGFyYW1zJ1xuICAgICAgb3V0cHV0czogJ091dCdcbiAgICBTU0I6XG4gICAgICBzaGFkZTogJ2xpZ2h0Z3JheSdcbiAgICAgIGljb246ICdcXHVmMGIyJyAjIGZhLWFycm93cy1hbHRcbiAgICAgIGlucHV0czogJ0NtZHMnXG4gICAgICBcbiAgJHNjb3BlLmNpcmN1aXQgPVxuICAgIGdhZGdldHM6XG4gICAgICBnMTogeyB4OiAxMjAsIHk6IDIyMCwgdGl0bGU6ICdHYWRnZXQgT25lJywgdHlwZTogJ1BpcGUnLCAgICB9XG4gICAgICBnMjogeyB4OiAzMDAsIHk6IDI1MCwgdGl0bGU6ICdHYWRnZXQgVHdvJywgdHlwZTogJ1ByaW50ZXInLCB9XG4gICAgICBnMzogeyB4OiAzMjAsIHk6ICA2MCwgdGl0bGU6ICdTdGVwR2VuLVgnLCAgdHlwZTogJ1N0ZXBHZW4nLCB9XG4gICAgICBnNDogeyB4OiA1NDAsIHk6ICA3MCwgdGl0bGU6ICdTU0ItWCcsICAgICAgdHlwZTogJ1NTQicsICAgICB9XG4gICAgICBnNTogeyB4OiAzNDAsIHk6IDE0MCwgdGl0bGU6ICdTdGVwR2VuLVknLCAgdHlwZTogJ1N0ZXBHZW4nLCB9XG4gICAgICBnNjogeyB4OiA1MjAsIHk6IDE1MCwgdGl0bGU6ICdTU0ItWScsICAgICAgdHlwZTogJ1NTQicsICAgICB9XG4gICAgd2lyZXM6XG4gICAgICAnZzEuT3V0L2cyLkluJzogMFxuICAgICAgJ2czLk91dC9nNC5DbWRzJzogMFxuICAgICAgJ2c1Lk91dC9nNi5DbWRzJzogMFxuICAgIGZlZWRzOlxuICAgICAgJ2cyLkluJzogWyAnc29tZSBkYXRhJywgeyBUYWc6ICdibGFoJywgTXNnOiAndGFnZ2VkIGRhdGEnIH0gXVxuICAgICAgJ2czLlBhcmFtcyc6IFsgMTAwMCwgNTAwIF1cbiAgICAgICdnNS5QYXJhbXMnOiBbIDUwMCwgMTAwMCBdXG4gICAgbGFiZWxzOlxuICAgICAgSW46ICdnMi5JbidcbiAgICAgIFxuICB1cGRhdGVQaW5MaXN0ID0gKCkgLT5cbiAgICAkc2NvcGUuaW5wdXRQaW5zID0gW11cbiAgICBmb3IgZ2lkLCBnIG9mICRzY29wZS5jaXJjdWl0LmdhZGdldHNcbiAgICAgIGlmIGlucyA9ICRzY29wZS5nYWRnZXRzW2cudHlwZV0uaW5wdXRzXG4gICAgICAgIGZvciBwIGluIGlucy5zcGxpdCAnICdcbiAgICAgICAgICAkc2NvcGUuaW5wdXRQaW5zLnB1c2ggXCIje2dpZH0uI3twfVwiXG4gICAgJHNjb3BlLmlucHV0UGlucy5zb3J0KClcbiAgXG4gICRzY29wZS4kd2F0Y2ggJ2FkZFBpbicsIChwaW4pIC0+XG4gICAgaWYgcGluXG4gICAgICAkc2NvcGUuY2lyY3VpdC5mZWVkc1twaW5dID89IFtdXG4gICAgICBjb25zb2xlLmxvZyAnYWRkRmVlZCcsIHBpbiwgJHNjb3BlLmNpcmN1aXQuZmVlZHNbcGluXS5sZW5ndGhcbiAgICAgICRzY29wZS5jaXJjdWl0LmZlZWRzW3Bpbl0ucHVzaCAnJ1xuICAgICAgJHNjb3BlLmFkZFBpbiA9IG51bGxcblxuICAkc2NvcGUuZGVsRmVlZCA9IChwaW4sIGluZGV4KSAtPlxuICAgIGl0ZW1zID0gJHNjb3BlLmNpcmN1aXQuZmVlZHNbcGluXVxuICAgIGNvbnNvbGUubG9nICdkZWxGZWVkJywgcGluLCBpbmRleCwgaXRlbXNbaW5kZXhdXG4gICAgaXRlbXMuc3BsaWNlIGluZGV4LCAxXG4gICAgZGVsZXRlICRzY29wZS5jaXJjdWl0LmZlZWRzW3Bpbl0gIGlmIGl0ZW1zLmxlbmd0aCBpcyAwXG4gIFxuICAkc2NvcGUuJHdhdGNoICdjdXJyU2VsLmlkJywgKHgpIC0+XG4gICAgY29uc29sZS5sb2cgJ2ZpeCBpZCcsIHhcbiAgICB1cGRhdGVQaW5MaXN0KCkgIyBmb3IgbmV3IGFuZCBkZWxldGVkIGdhZGdldHNcbiAgJHNjb3BlLiR3YXRjaCAnY3VyclNlbC50aXRsZScsICh4KSAtPlxuICAgIGNvbnNvbGUubG9nICdmaXggdGl0bGUnLCB4XG4gICAgXG4gIG9iaiA9ICdkZW1vMSdcbiAgXG4gIGhhbmRsZXJzID1cbiAgICBhZGRHYWRnZXQ6ICh4LCB5KSAtPiAgICAgIGplZWJ1cy5zZW5kIHsgY21kOiAnY2VkLWFnJywgb2JqLCB4LCB5ICAgICB9XG4gICAgZGVsR2FkZ2V0OiAoaWQpIC0+ICAgICAgICBqZWVidXMuc2VuZCB7IGNtZDogJ2NlZC1kZycsIG9iaiwgaWQgICAgICAgfVxuICAgIGFkZFdpcmU6IChmcm9tLCB0bykgLT4gICAgamVlYnVzLnNlbmQgeyBjbWQ6ICdjZWQtYXcnLCBvYmosIGZyb20sIHRvIH1cbiAgICBkZWxXaXJlOiAoZnJvbSwgdG8pIC0+ICAgIGplZWJ1cy5zZW5kIHsgY21kOiAnY2VkLWR3Jywgb2JqLCBmcm9tLCB0byB9XG4gICAgc2VsZWN0R2FkZ2V0OiAoaWQpIC0+ICAgICBqZWVidXMuc2VuZCB7IGNtZDogJ2NlZC1zZycsIG9iaiwgaWQgICAgICAgfVxuICAgIG1vdmVHYWRnZXQ6IChpZCwgeCwgeSkgLT4gamVlYnVzLnNlbmQgeyBjbWQ6ICdjZWQtbWcnLCBvYmosIGlkLCB4LCB5IH1cblxuICAkc2NvcGUuJG9uICdjaXJjdWl0JywgKGV2ZW50LCB0eXBlLCBhcmdzLi4uKSAtPlxuICAgIGNvbnNvbGUubG9nICdDOicsIHR5cGUsIGFyZ3MuLi5cbiAgICBoYW5kbGVyc1t0eXBlXSBhcmdzLi4uXG4gICAgXG4gIHNldHVwID0gLT5cbiAgICBqZWVidXMuYXR0YWNoICdjaXJjdWl0J1xuICAgICAgLm9uICdzeW5jJywgLT5cbiAgICAgICAgJHNjb3BlLmNpcmN1aXRzID0gQHJvd3NcbiAgICAgICAgYW5ndWxhci5mb3JFYWNoIEByb3dzLCAodmFsdWUpIC0+XG4gICAgICAgICAgY29uc29sZS5sb2cgdmFsdWVcbiAgICAgIC5vbiAnZGF0YScsIChrLHYpIC0+XG4gICAgICAgICMxLiBUT0RPOiBjaGVjayBmb3IgdmFsdWUsIGVsc2UgcmVtb3ZlXG4gICAgICAgIGNvbnNvbGUubG9nIGssIHZcbiAgICAgICAgIzIuIGFkZCB0byBjaXJjdWl0c1xuICAgICAgICAjICRzY29wZS5jaXJjdWl0cyBwdXNoIGssIHZcbiAgICAgICAgIzMuIHRlbGwgZWRpdG9yXG5cblxuICBzZXR1cCgpICBpZiAkc2NvcGUuc2VydmVyU3RhdHVzIGlzICdjb25uZWN0ZWQnXG4gICRzY29wZS4kb24gJ3dzLW9wZW4nLCBzZXR1cFxuIl19
