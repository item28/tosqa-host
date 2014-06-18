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
    $scope.circuits = {};
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
    $scope.$watch("circuits", (function(newValue, oldValue) {
      var each, old, _i, _len, _results;
      old = Object.keys(oldValue);
      angular.forEach(newValue, function(value, key) {
        var index;
        if (old.indexOf(key === -1)) {
          console.log("object " + key + " is added", value);
          $scope.circuit.gadgets[key] = {
            x: value.x,
            y: value.y,
            title: value.title,
            type: value.type
          };
        }
        index = old.indexOf(key);
        if (index > -1) {
          return old.splice(index, 1);
        }
      });
      _results = [];
      for (_i = 0, _len = old.length; _i < _len; _i++) {
        each = old[_i];
        _results.push(console.log("this key is removed:", key));
      }
      return _results;
    }), true);
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
        var date, id, type;
        if ($scope.newtype != null) {
          date = String(Date.now());
          id = "g" + date;
          type = $scope.newtype;
          obj = {
            title: "" + type + "-" + id,
            type: $scope.newtype,
            x: x,
            y: y
          };
          return jeebus.put("/circuit/demo1/" + id, obj);
        }
      },
      delGadget: function(id) {
        return jeebus.put("/circuit/demo1/" + id);
      },
      addWire: function(from, to) {},
      delWire: function(from, to) {},
      selectGadget: function(id) {},
      moveGadget: function(id, x, y) {}
    };
    $scope.$on('circuit', function() {
      var args, event, type;
      event = arguments[0], type = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
      console.log.apply(console, ['C:', type].concat(__slice.call(args)));
      return handlers[type].apply(handlers, args);
    });
    setup = function() {
      return jeebus.attach('circuit').on('sync', function() {
        var args, temp, _i, _len, _results;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        temp = this.rows;
        console.log("init circuits");
        _results = [];
        for (_i = 0, _len = temp.length; _i < _len; _i++) {
          obj = temp[_i];
          _results.push($scope.circuits[obj.id] = obj);
        }
        return _results;
      }).on('data', function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return console.log(111, args);
      });
    };
    if ($scope.serverStatus === 'connected') {
      setup();
    }
    return $scope.$on('ws-open', setup);
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2lyY3VpdHMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxnQkFBQTtJQUFBLGtCQUFBOztBQUFBLEVBQUEsRUFBQSxHQUFLLE9BQU8sQ0FBQyxNQUFSLENBQWUsT0FBZixDQUFMLENBQUE7O0FBQUEsRUFFQSxFQUFFLENBQUMsTUFBSCxDQUFVLFNBQUMsY0FBRCxFQUFpQixjQUFqQixHQUFBO0FBQ1IsSUFBQSxjQUFjLENBQUMsS0FBZixDQUFxQixVQUFyQixFQUNFO0FBQUEsTUFBQSxHQUFBLEVBQUssV0FBTDtBQUFBLE1BQ0EsV0FBQSxFQUFhLHlCQURiO0FBQUEsTUFFQSxVQUFBLEVBQVksWUFGWjtLQURGLENBQUEsQ0FBQTtXQUlBLGNBQWMsQ0FBQyxHQUFmLENBQW1CLFdBQW5CLEVBQWdDLFVBQWhDLEVBQTRDLEVBQTVDLEVBTFE7RUFBQSxDQUFWLENBRkEsQ0FBQTs7QUFBQSxFQVNBLFlBQUEsR0FBZSxTQUFDLE1BQUQsRUFBUyxNQUFULEdBQUE7QUFFYixRQUFBLG1DQUFBO0FBQUEsSUFBQSxNQUFNLENBQUMsUUFBUCxHQUFpQixFQUFqQixDQUFBO0FBQUEsSUFFQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsTUFBQSxJQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxVQUFOO0FBQUEsUUFDQSxLQUFBLEVBQU8sYUFEUDtBQUFBLFFBRUEsSUFBQSxFQUFNLFFBRk47QUFBQSxRQUdBLE1BQUEsRUFBUSxJQUhSO0FBQUEsUUFJQSxPQUFBLEVBQVMsS0FKVDtPQURGO0FBQUEsTUFNQSxPQUFBLEVBQ0U7QUFBQSxRQUFBLEtBQUEsRUFBTyxXQUFQO0FBQUEsUUFDQSxJQUFBLEVBQU0sUUFETjtBQUFBLFFBRUEsTUFBQSxFQUFRLFFBRlI7T0FQRjtBQUFBLE1BVUEsT0FBQSxFQUNFO0FBQUEsUUFBQSxLQUFBLEVBQU8sWUFBUDtBQUFBLFFBQ0EsSUFBQSxFQUFN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QU0sQ0FBQyxHQUFQLENBQVcsU0FBWCxFQUFzQixLQUF0QixFQXhJYTtFQUFBLENBVGYsQ0FBQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsibmcgPSBhbmd1bGFyLm1vZHVsZSAnbXlBcHAnXG5cbm5nLmNvbmZpZyAoJHN0YXRlUHJvdmlkZXIsIG5hdmJhclByb3ZpZGVyKSAtPlxuICAkc3RhdGVQcm92aWRlci5zdGF0ZSAnY2lyY3VpdHMnLFxuICAgIHVybDogJy9jaXJjdWl0cydcbiAgICB0ZW1wbGF0ZVVybDogJy9jaXJjdWl0cy9jaXJjdWl0cy5odG1sJ1xuICAgIGNvbnRyb2xsZXI6IGNpcmN1aXRzQ3RybFxuICBuYXZiYXJQcm92aWRlci5hZGQgJy9jaXJjdWl0cycsICdDaXJjdWl0cycsIDMwXG5cbmNpcmN1aXRzQ3RybCA9ICgkc2NvcGUsIGplZWJ1cykgLT5cbiAgXG4gICRzY29wZS5jaXJjdWl0cyA9e31cbiAgXG4gICRzY29wZS5nYWRnZXRzID1cbiAgICBQaXBlOlxuICAgICAgbmFtZTogJ1BpcGVsaW5lJ1xuICAgICAgc2hhZGU6ICdsaWdodHllbGxvdydcbiAgICAgIGljb246ICdcXHVmMDYxJyAjIGZhLWFycm93LXJpZ2h0XG4gICAgICBpbnB1dHM6ICdJbidcbiAgICAgIG91dHB1dHM6ICdPdXQnXG4gICAgUHJpbnRlcjpcbiAgICAgIHNoYWRlOiAnbGlnaHRibHVlJ1xuICAgICAgaWNvbjogJ1xcdWYwMmYnICMgZmEtcHJpbnRcbiAgICAgIGlucHV0czogJ0luIEluMidcbiAgICBTdGVwR2VuOlxuICAgICAgc2hhZGU6ICdsaWdodGdyZWVuJ1xuICAgICAgaWNvbjogJ1xcdWYwMTMnICMgZmEtY29nXG4gICAgICBpbnB1dHM6ICdQYXJhbXMnXG4gICAgICBvdXRwdXRzOiAnT3V0J1xuICAgIFNTQjpcbiAgICAgIHNoYWRlOiAnbGlnaHRncmF5J1xuICAgICAgaWNvbjogJ1xcdWYwYjInICMgZmEtYXJyb3dzLWFsdFxuICAgICAgaW5wdXRzOiAnQ21kcydcbiAgICAgIFxuICAkc2NvcGUuY2lyY3VpdCA9XG4gICAgZ2FkZ2V0czpcbiAgICAgIGcxOiB7IHg6IDEyMCwgeTogMjIwLCB0aXRsZTogJ0dhZGdldCBPbmUnLCB0eXBlOiAnUGlwZScsICAgIH1cbiAgICAgIGcyOiB7IHg6IDMwMCwgeTogMjUwLCB0aXRsZTogJ0dhZGdldCBUd28nLCB0eXBlOiAnUHJpbnRlcicsIH1cbiAgICAgIGczOiB7IHg6IDMyMCwgeTogIDYwLCB0aXRsZTogJ1N0ZXBHZW4tWCcsICB0eXBlOiAnU3RlcEdlbicsIH1cbiAgICAgIGc0OiB7IHg6IDU0MCwgeTogIDcwLCB0aXRsZTogJ1NTQi1YJywgICAgICB0eXBlOiAnU1NCJywgICAgIH1cbiAgICAgIGc1OiB7IHg6IDM0MCwgeTogMTQwLCB0aXRsZTogJ1N0ZXBHZW4tWScsICB0eXBlOiAnU3RlcEdlbicsIH1cbiAgICAgIGc2OiB7IHg6IDUyMCwgeTogMTUwLCB0aXRsZTogJ1NTQi1ZJywgICAgICB0eXBlOiAnU1NCJywgICAgIH1cbiAgICB3aXJlczpcbiAgICAgICdnMS5PdXQvZzIuSW4nOiAwXG4gICAgICAnZzMuT3V0L2c0LkNtZHMnOiAwXG4gICAgICAnZzUuT3V0L2c2LkNtZHMnOiAwXG4gICAgZmVlZHM6XG4gICAgICAnZzIuSW4nOiBbICdzb21lIGRhdGEnLCB7IFRhZzogJ2JsYWgnLCBNc2c6ICd0YWdnZWQgZGF0YScgfSBdXG4gICAgICAnZzMuUGFyYW1zJzogWyAxMDAwLCA1MDAgXVxuICAgICAgJ2c1LlBhcmFtcyc6IFsgNTAwLCAxMDAwIF1cbiAgICBsYWJlbHM6XG4gICAgICBJbjogJ2cyLkluJ1xuICAgICAgXG4gIHVwZGF0ZVBpbkxpc3QgPSAoKSAtPlxuICAgICRzY29wZS5pbnB1dFBpbnMgPSBbXVxuICAgIGZvciBnaWQsIGcgb2YgJHNjb3BlLmNpcmN1aXQuZ2FkZ2V0c1xuICAgICAgaWYgaW5zID0gJHNjb3BlLmdhZGdldHNbZy50eXBlXS5pbnB1dHNcbiAgICAgICAgZm9yIHAgaW4gaW5zLnNwbGl0ICcgJ1xuICAgICAgICAgICRzY29wZS5pbnB1dFBpbnMucHVzaCBcIiN7Z2lkfS4je3B9XCJcbiAgICAkc2NvcGUuaW5wdXRQaW5zLnNvcnQoKVxuICBcbiAgXG4gICMgJHNjb3BlLiR3YXRjaENvbGxlY3Rpb24gXCJjaXJjdWl0c1wiLCAoKG5ld05hbWVzLCBvbGROYW1lcykgLT5cbiAgIyAgIGlmIG5ld05hbWVzP1xuICAjICAgICBjb25zb2xlLmxvZyBuZXdOYW1lcy5sZW5ndGggIFxuICAjICksIHRydWVcbiAgXG4gICRzY29wZS4kd2F0Y2ggXCJjaXJjdWl0c1wiLCAoKG5ld1ZhbHVlLCBvbGRWYWx1ZSkgLT5cbiAgICBvbGQgPSBPYmplY3Qua2V5cyBvbGRWYWx1ZVxuICAgIGFuZ3VsYXIuZm9yRWFjaCBuZXdWYWx1ZSwgKHZhbHVlLCBrZXkpIC0+XG4gICAgICBpZiBvbGQuaW5kZXhPZiBrZXkgaXMgLTEgIyBpZiBrZXkgZG9lcyBub3QgZXhpc3QgaW4gb2xkVmFsdWUsIGtleSBhZGRcbiAgICAgICAgY29uc29sZS5sb2cgXCJvYmplY3QgI3trZXl9IGlzIGFkZGVkXCIsIHZhbHVlXG4gICAgICAgICRzY29wZS5jaXJjdWl0LmdhZGdldHNba2V5XSA9IHsgeDogdmFsdWUueCwgeTogdmFsdWUueSwgdGl0bGU6IHZhbHVlLnRpdGxlLCB0eXBlOiB2YWx1ZS50eXBlLCAgICB9XG5cbiAgICAgIGluZGV4ID0gb2xkLmluZGV4T2Yoa2V5KSAjIHJlbW92ZSBpdGVtIGZyb20gb2xkXG4gICAgICBpZiBpbmRleCA+IC0xXG4gICAgICAgIG9sZC5zcGxpY2UgaW5kZXgsIDFcbiAgICBmb3IgZWFjaCBpbiBvbGQgICMgb2xkIG5vdyBjb250YWlucyBhbGwga2V5cyB0aGF0IGRvIG5vIG9uZ2VyIGV4aXN0IGluIG5ld1ZhbHVlXG4gICAgICBjb25zb2xlLmxvZyBcInRoaXMga2V5IGlzIHJlbW92ZWQ6XCIsIGtleSBcbiAgKSwgdHJ1ZVxuICBcbiAgJHNjb3BlLiR3YXRjaCAnYWRkUGluJywgKHBpbikgLT5cbiAgICBpZiBwaW5cbiAgICAgICRzY29wZS5jaXJjdWl0LmZlZWRzW3Bpbl0gPz0gW11cbiAgICAgIGNvbnNvbGUubG9nICdhZGRGZWVkJywgcGluLCAkc2NvcGUuY2lyY3VpdC5mZWVkc1twaW5dLmxlbmd0aFxuICAgICAgJHNjb3BlLmNpcmN1aXQuZmVlZHNbcGluXS5wdXNoICcnXG4gICAgICAkc2NvcGUuYWRkUGluID0gbnVsbFxuXG4gICRzY29wZS5kZWxGZWVkID0gKHBpbiwgaW5kZXgpIC0+XG4gICAgaXRlbXMgPSAkc2NvcGUuY2lyY3VpdC5mZWVkc1twaW5dXG4gICAgY29uc29sZS5sb2cgJ2RlbEZlZWQnLCBwaW4sIGluZGV4LCBpdGVtc1tpbmRleF1cbiAgICBpdGVtcy5zcGxpY2UgaW5kZXgsIDFcbiAgICBkZWxldGUgJHNjb3BlLmNpcmN1aXQuZmVlZHNbcGluXSAgaWYgaXRlbXMubGVuZ3RoIGlzIDBcbiAgXG4gICRzY29wZS4kd2F0Y2ggJ2N1cnJTZWwuaWQnLCAoeCkgLT5cbiAgICBjb25zb2xlLmxvZyAnZml4IGlkJywgeFxuICAgIHVwZGF0ZVBpbkxpc3QoKSAjIGZvciBuZXcgYW5kIGRlbGV0ZWQgZ2FkZ2V0c1xuICAkc2NvcGUuJHdhdGNoICdjdXJyU2VsLnRpdGxlJywgKHgpIC0+XG4gICAgY29uc29sZS5sb2cgJ2ZpeCB0aXRsZScsIHhcbiAgICBcbiAgb2JqID0gJ2RlbW8xJ1xuICBcbiAgaGFuZGxlcnMgPVxuICAgIGFkZEdhZGdldDogKHgsIHkpIC0+ICAgICAgXG4gICAgICBpZiAkc2NvcGUubmV3dHlwZT8gXG4gICAgICAgICMge1wiZmVlZFwiOntcIlBhcmFtc1wiOlsxMDAwLDUwMF19LFwidGl0bGVcIjpcIlN0ZXBHZW4tWFwiLFwidHlwZVwiOlwiU3RlcEdlblwiLFwid2lyZVwiOntcIk91dFwiOlwiZzQuQ21kc1wifSxcInhcIjozMjAsXCJ5XCI6NjB9XG4gICAgICAgIGRhdGUgPSBTdHJpbmcgRGF0ZS5ub3coKSBcbiAgICAgICAgaWQ9IFwiZ1wiICsgZGF0ZSAjZGF0ZS5zdWJzdHIoZGF0ZSAubGVuZ3RoIC0gOSkgIyA9PiBcIlRhYnMxXCJcbiAgICAgICAgdHlwZSA9ICRzY29wZS5uZXd0eXBlXG4gICAgICAgIG9iaiA9IHt0aXRsZTpcIiN7dHlwZX0tI3tpZH1cIiwgdHlwZTokc2NvcGUubmV3dHlwZSwgeDp4LCB5Onl9XG5cbiAgICAgICAgIyBqZWVidXMuc2VuZCB7IGNtZDogJ2NlZC1hZycsIG9ian1cbiAgICAgICAgamVlYnVzLnB1dCBcIi9jaXJjdWl0L2RlbW8xLyN7aWR9XCIsIG9iaiBcbiAgICBkZWxHYWRnZXQ6IChpZCkgLT4gICAgICAgIFxuICAgICAgIyBqZWVidXMuc2VuZCB7IGNtZDogJ2NlZC1kZycsIG9iaiwgaWR9XG4gICAgICAjIHB1dCBuaWwgdmFsdWUgdG8gZGVsZXRlIGlkXG4gICAgICBqZWVidXMucHV0IFwiL2NpcmN1aXQvZGVtbzEvI3tpZH1cIiAgXG4gICAgYWRkV2lyZTogKGZyb20sIHRvKSAtPiAgICAjamVlYnVzLnNlbmQgeyBjbWQ6ICdjZWQtYXcnLCBvYmosIGZyb20sIHRvIH1cbiAgICBkZWxXaXJlOiAoZnJvbSwgdG8pIC0+ICAgICNqZWVidXMuc2VuZCB7IGNtZDogJ2NlZC1kdycsIG9iaiwgZnJvbSwgdG8gfVxuICAgIHNlbGVjdEdhZGdldDogKGlkKSAtPiAgICAgI2plZWJ1cy5zZW5kIHsgY21kOiAnY2VkLXNnJywgb2JqLCBpZCAgICAgICB9XG4gICAgbW92ZUdhZGdldDogKGlkLCB4LCB5KSAtPiAjamVlYnVzLnNlbmQgeyBjbWQ6ICdjZWQtbWcnLCBvYmosIGlkLCB4LCB5IH1cblxuICAkc2NvcGUuJG9uICdjaXJjdWl0JywgKGV2ZW50LCB0eXBlLCBhcmdzLi4uKSAtPlxuICAgIGNvbnNvbGUubG9nICdDOicsIHR5cGUsIGFyZ3MuLi5cbiAgICBoYW5kbGVyc1t0eXBlXSBhcmdzLi4uXG4gICAgXG4gIHNldHVwID0gLT5cbiAgICBqZWVidXMuYXR0YWNoICdjaXJjdWl0J1xuICAgICAgLm9uICdzeW5jJywgKGFyZ3MuLi4pIC0+XG4gICAgICAgIHRlbXAgPSBAcm93c1xuICAgICAgICBjb25zb2xlLmxvZyBcImluaXQgY2lyY3VpdHNcIlxuICAgICAgICBmb3Igb2JqIGluIHRlbXBcbiAgICAgICAgICAkc2NvcGUuY2lyY3VpdHNbb2JqLmlkXSA9IG9iaiBcbiAgXG4gICAgICAub24gJ2RhdGEnLCAoYXJncy4uLikgLT4gXG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLmxvZyAxMTEsIGFyZ3NcbiAgICAgIFxuICAgICAgICAjMS4gVE9ETzogY2hlY2sgZm9yIHZhbHVlLCBlbHNlIHJlbW92ZVxuICAgICAgICAjMi4gYWRkIHRvIGNpcmN1aXRzXG4gICAgICAgICMgJHNjb3BlLmNpcmN1aXRzIHB1c2ggaywgdlxuICAgICAgICAjMy4gdGVsbCBlZGl0b3JcblxuXG4gIHNldHVwKCkgIGlmICRzY29wZS5zZXJ2ZXJTdGF0dXMgaXMgJ2Nvbm5lY3RlZCdcbiAgJHNjb3BlLiRvbiAnd3Mtb3BlbicsIHNldHVwXG4iXX0=
