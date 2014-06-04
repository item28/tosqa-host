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
    var handlers, setup, updatePinList;
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
      }
    };
    $scope.circuit = {
      gadgets: {
        g1: {
          x: 120,
          y: 100,
          title: 'Gadget One',
          type: 'Printer'
        },
        g2: {
          x: 120,
          y: 200,
          title: 'Gadget Two',
          type: 'Pipe'
        }
      },
      wires: {
        'g2.Out/g1.In': 0
      },
      feeds: {
        'g1.In': [
          'some data', {
            Tag: 'blah',
            Msg: 'tagged data'
          }
        ]
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
    handlers = {
      addGadget: function(x, y) {
        jeebus.put("/item", "value");
        return console.log("item is stored");
      },
      delGadget: function(id, wires) {},
      addWire: function(from, to) {},
      delWire: function(from, to) {
        return console.log("this");
      },
      selectGadget: function(id) {},
      moveGadget: function(id, x, y) {}
    };
    $scope.$on('circuit', function() {
      var args, event, type;
      event = arguments[0], type = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
      console.log.apply(console, ['C:', type].concat(__slice.call(args)));
      return handlers[type].apply(handlers, args);
    });
    return setup = function() {
      return jeebus.attach('circuit').on('sync', function() {
        return $scope.circuits = this.rows;
      }).on('data', function(k, v) {
        return console.log(k);
      });
    };
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2lyY3VpdHMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxnQkFBQTtJQUFBLGtCQUFBOztBQUFBLEVBQUEsRUFBQSxHQUFLLE9BQU8sQ0FBQyxNQUFSLENBQWUsT0FBZixDQUFMLENBQUE7O0FBQUEsRUFFQSxFQUFFLENBQUMsTUFBSCxDQUFVLFNBQUMsY0FBRCxFQUFpQixjQUFqQixHQUFBO0FBQ1IsSUFBQSxjQUFjLENBQUMsS0FBZixDQUFxQixVQUFyQixFQUNFO0FBQUEsTUFBQSxHQUFBLEVBQUssV0FBTDtBQUFBLE1BQ0EsV0FBQSxFQUFhLHlCQURiO0FBQUEsTUFFQSxVQUFBLEVBQVksWUFGWjtLQURGLENBQUEsQ0FBQTtXQUlBLGNBQWMsQ0FBQyxHQUFmLENBQW1CLFdBQW5CLEVBQWdDLFVBQWhDLEVBQTRDLEVBQTVDLEVBTFE7RUFBQSxDQUFWLENBRkEsQ0FBQTs7QUFBQSxFQVNBLFlBQUEsR0FBZSxTQUFDLE1BQUQsRUFBUyxNQUFULEdBQUE7QUFFYixRQUFBLDhCQUFBO0FBQUEsSUFBQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsTUFBQSxJQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxVQUFOO0FBQUEsUUFDQSxLQUFBLEVBQU8sYUFEUDtBQUFBLFFBRUEsSUFBQSxFQUFNLFFBRk47QUFBQSxRQUdBLE1BQUEsRUFBUSxJQUhSO0FBQUEsUUFJQSxPQUFBLEVBQVMsS0FKVDtPQURGO0FBQUEsTUFNQSxPQUFBLEVBQ0U7QUFBQSxRQUFBLEtBQUEsRUFBTyxXQUFQO0FBQUEsUUFDQSxJQUFBLEVBQU0sUUFETjtBQUFBLFFBRUEsTUFBQSxFQUFRLFFBRlI7T0FQRjtLQURGLENBQUE7QUFBQSxJQVlBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxNQUFBLE9BQUEsRUFDRTtBQUFBLFFBQUEsRUFBQSxFQUFJO0FBQUEsVUFBRSxDQUFBLEVBQUcsR0FBTDtB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RSxDQUFDLEVBREgsQ0FDTSxNQUROLEVBQ2MsU0FBQSxHQUFBO2VBQ1YsTUFBTSxDQUFDLFFBQVAsR0FBa0IsSUFBQyxDQUFBLEtBRFQ7TUFBQSxDQURkLENBR0UsQ0FBQyxFQUhILENBR00sTUFITixFQUdjLFNBQUMsQ0FBRCxFQUFHLENBQUgsR0FBQTtlQUVWLE9BQU8sQ0FBQyxHQUFSLENBQVksQ0FBWixFQUZVO01BQUEsQ0FIZCxFQURNO0lBQUEsRUFuRUs7RUFBQSxDQVRmLENBQUE7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbIm5nID0gYW5ndWxhci5tb2R1bGUgJ215QXBwJ1xuXG5uZy5jb25maWcgKCRzdGF0ZVByb3ZpZGVyLCBuYXZiYXJQcm92aWRlcikgLT5cbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUgJ2NpcmN1aXRzJyxcbiAgICB1cmw6ICcvY2lyY3VpdHMnXG4gICAgdGVtcGxhdGVVcmw6ICcvY2lyY3VpdHMvY2lyY3VpdHMuaHRtbCdcbiAgICBjb250cm9sbGVyOiBjaXJjdWl0c0N0cmxcbiAgbmF2YmFyUHJvdmlkZXIuYWRkICcvY2lyY3VpdHMnLCAnQ2lyY3VpdHMnLCAzMFxuXG5jaXJjdWl0c0N0cmwgPSAoJHNjb3BlLCBqZWVidXMpIC0+XG4gICAgXG4gICRzY29wZS5nYWRnZXRzID1cbiAgICBQaXBlOlxuICAgICAgbmFtZTogJ1BpcGVsaW5lJ1xuICAgICAgc2hhZGU6ICdsaWdodHllbGxvdydcbiAgICAgIGljb246ICdcXHVmMDYxJyAjIGZhLWFycm93LXJpZ2h0XG4gICAgICBpbnB1dHM6ICdJbidcbiAgICAgIG91dHB1dHM6ICdPdXQnXG4gICAgUHJpbnRlcjpcbiAgICAgIHNoYWRlOiAnbGlnaHRibHVlJ1xuICAgICAgaWNvbjogJ1xcdWYwMmYnICMgZmEtcHJpbnRcbiAgICAgIGlucHV0czogJ0luIEluMidcbiAgICAgIFxuICAkc2NvcGUuY2lyY3VpdCA9XG4gICAgZ2FkZ2V0czpcbiAgICAgIGcxOiB7IHg6IDEyMCwgeTogMTAwLCB0aXRsZTogJ0dhZGdldCBPbmUnLCB0eXBlOiAnUHJpbnRlcicgfVxuICAgICAgZzI6IHsgeDogMTIwLCB5OiAyMDAsIHRpdGxlOiAnR2FkZ2V0IFR3bycsIHR5cGU6ICdQaXBlJyB9XG4gICAgd2lyZXM6XG4gICAgICAnZzIuT3V0L2cxLkluJzogMFxuICAgIGZlZWRzOlxuICAgICAgJ2cxLkluJzogWyAnc29tZSBkYXRhJywgeyBUYWc6ICdibGFoJywgTXNnOiAndGFnZ2VkIGRhdGEnIH0gXVxuICAgIGxhYmVsczpcbiAgICAgIEluOiAnZzIuSW4nXG4gICAgICBcbiAgdXBkYXRlUGluTGlzdCA9ICgpIC0+XG4gICAgJHNjb3BlLmlucHV0UGlucyA9IFtdXG4gICAgZm9yIGdpZCwgZyBvZiAkc2NvcGUuY2lyY3VpdC5nYWRnZXRzXG4gICAgICBpZiBpbnMgPSAkc2NvcGUuZ2FkZ2V0c1tnLnR5cGVdLmlucHV0c1xuICAgICAgICBmb3IgcCBpbiBpbnMuc3BsaXQgJyAnXG4gICAgICAgICAgJHNjb3BlLmlucHV0UGlucy5wdXNoIFwiI3tnaWR9LiN7cH1cIlxuICAgICRzY29wZS5pbnB1dFBpbnMuc29ydCgpXG4gIFxuICAkc2NvcGUuJHdhdGNoICdhZGRQaW4nLCAocGluKSAtPlxuICAgIGlmIHBpblxuICAgICAgJHNjb3BlLmNpcmN1aXQuZmVlZHNbcGluXSA/PSBbXVxuICAgICAgY29uc29sZS5sb2cgJ2FkZEZlZWQnLCBwaW4sICRzY29wZS5jaXJjdWl0LmZlZWRzW3Bpbl0ubGVuZ3RoXG4gICAgICAkc2NvcGUuY2lyY3VpdC5mZWVkc1twaW5dLnB1c2ggJydcbiAgICAgICRzY29wZS5hZGRQaW4gPSBudWxsXG4gICAgXG4gICRzY29wZS5kZWxGZWVkID0gKHBpbiwgaW5kZXgpIC0+XG4gICAgaXRlbXMgPSAkc2NvcGUuY2lyY3VpdC5mZWVkc1twaW5dXG4gICAgY29uc29sZS5sb2cgJ2RlbEZlZWQnLCBwaW4sIGluZGV4LCBpdGVtc1tpbmRleF1cbiAgICBpdGVtcy5zcGxpY2UgaW5kZXgsIDFcbiAgICBkZWxldGUgJHNjb3BlLmNpcmN1aXQuZmVlZHNbcGluXSAgaWYgaXRlbXMubGVuZ3RoIGlzIDBcbiAgXG4gICRzY29wZS4kd2F0Y2ggJ2N1cnJTZWwuaWQnLCAoeCkgLT5cbiAgICBjb25zb2xlLmxvZyAnZml4IGlkJywgeFxuICAgIHVwZGF0ZVBpbkxpc3QoKSAjIGZvciBuZXcgYW5kIGRlbGV0ZWQgZ2FkZ2V0c1xuICAkc2NvcGUuJHdhdGNoICdjdXJyU2VsLnRpdGxlJywgKHgpIC0+XG4gICAgY29uc29sZS5sb2cgJ2ZpeCB0aXRsZScsIHhcbiAgXG4gIGhhbmRsZXJzID1cbiAgICBhZGRHYWRnZXQ6ICh4LCB5KSAtPiAjIGFzayBmb3IgdHlwZSAtPiBwbGFjZSBpbiBkYlxuICAgICAgamVlYnVzLnB1dCBcIi9pdGVtXCIsIFwidmFsdWVcIlxuICAgICAgY29uc29sZS5sb2cgXCJpdGVtIGlzIHN0b3JlZFwiXG4gICAgZGVsR2FkZ2V0OiAoaWQsIHdpcmVzKSAtPiAjIHJlbW92ZSBnYWRnZXQgYW5kIHdpcmVzIGZyb20gZGJcbiAgICBhZGRXaXJlOiAoZnJvbSwgdG8pIC0+ICMgXG4gICAgZGVsV2lyZTogKGZyb20sIHRvKSAtPlxuICAgICAgY29uc29sZS5sb2cgXCJ0aGlzXCJcbiAgICBzZWxlY3RHYWRnZXQ6IChpZCkgLT5cbiAgICBtb3ZlR2FkZ2V0OiAoaWQsIHgsIHkpIC0+XG4gICAgICBcbiAgJHNjb3BlLiRvbiAnY2lyY3VpdCcsIChldmVudCwgdHlwZSwgYXJncy4uLikgLT5cbiAgICBjb25zb2xlLmxvZyAnQzonLCB0eXBlLCBhcmdzLi4uXG4gICAgaGFuZGxlcnNbdHlwZV0gYXJncy4uLlxuICAgIFxuICBzZXR1cCA9IC0+XG4gICAgamVlYnVzLmF0dGFjaCAnY2lyY3VpdCdcbiAgICAgIC5vbiAnc3luYycsIC0+XG4gICAgICAgICRzY29wZS5jaXJjdWl0cyA9IEByb3dzXG4gICAgICAub24gJ2RhdGEnLCAoayx2KSAtPlxuICAgICAgICAjMS4gVE9ETzogY2hlY2sgZm9yIHZhbHVlLCBlbHNlIHJlbW92ZVxuICAgICAgICBjb25zb2xlLmxvZyBrXG4gICAgICAgICMyLiBhZGQgdG8gY2lyY3VpdHNcbiAgICAgICAgIyAkc2NvcGUuY2lyY3VpdHMgcHVzaCBrLCB2XG4gICAgICAgICMzLiB0ZWxsIGVkaXRvclxuICAgICAgICBcbiAgIyBzZXR1cCA9IC0+XG4gICMgICBqZWVidXMuYXR0YWNoICdjaXJjdWl0J1xuICAjICAgICAub24gJ3N5bmMnLCAtPlxuICAjICAgICAgICRzY29wZS5jaXJjdWl0cyA9IEByb3dzXG4gICMgICAgIFxuICAjIHNldHVwKCkgIGlmICRzY29wZS5zZXJ2ZXJTdGF0dXMgaXMgJ2Nvbm5lY3RlZCdcbiAgIyAkc2NvcGUuJG9uICd3cy1vcGVuJywgc2V0dXBcbiJdfQ==
