(function() {
  var d, gadgetDefs, ins, n, ng, outs, p, step, yIn, yOut, _i, _j, _len, _len1, _ref, _ref1;

  ng = angular.module('myApp');

  gadgetDefs = {
    Pipe: {
      name: 'Ceci est une pipe',
      width: 160,
      pins: [
        {
          name: 'In',
          dir: 'i'
        }, {
          name: 'Out',
          dir: 'o'
        }
      ]
    },
    Printer: {
      width: 120,
      shade: 'lightblue',
      pins: [
        {
          name: 'In',
          dir: 'i'
        }, {
          name: 'In2',
          dir: 'i'
        }
      ]
    }
  };

  for (n in gadgetDefs) {
    d = gadgetDefs[n];
    d.name || (d.name = n);
    ins = 0;
    _ref = d.pins;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      p = _ref[_i];
      p.x = d.width / 2;
      if (p.dir === 'i') {
        p.x = -p.x;
        ++ins;
      }
    }
    outs = d.pins.length - ins;
    step = 16;
    yIn = -(ins - 1) * step / 2;
    yOut = -(outs - 1) * step / 2;
    _ref1 = d.pins;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      p = _ref1[_j];
      if (p.dir === 'i') {
        p.y = yIn;
        yIn += step;
      } else {
        p.y = yOut;
        yOut += step;
      }
    }
    d.height = 30 + step * (ins > outs ? ins : outs);
  }

  ng.directive('circuitEditor', function() {
    return {
      restrict: 'E',
      scope: {
        data: '='
      },
      link: function(scope, elem, attr) {
        var diag, findPin, g, gadgetDrag, gadgets, pins, svg, wires, _k, _l, _len2, _len3, _ref2, _ref3;
        svg = d3.select(elem[0]).append('svg').attr({
          height: "75%"
        });
        findPin = function(name) {
          var g, gid, pname, _k, _l, _len2, _len3, _ref2, _ref3, _ref4;
          _ref2 = name.split('.'), gid = _ref2[0], pname = _ref2[1];
          _ref3 = scope.data.gadgets;
          for (_k = 0, _len2 = _ref3.length; _k < _len2; _k++) {
            g = _ref3[_k];
            if (gid === g.id) {
              _ref4 = g.def.pins;
              for (_l = 0, _len3 = _ref4.length; _l < _len3; _l++) {
                p = _ref4[_l];
                if (pname === p.name) {
                  return {
                    y: g.x + p.x + .5,
                    x: g.y + p.y + .5,
                    g: g,
                    p: p
                  };
                }
              }
            }
          }
        };
        _ref2 = scope.data.gadgets;
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          d = _ref2[_k];
          d.def = gadgetDefs[d.type];
          d.hw = d.def.width / 2;
          d.hh = d.def.height / 2;
        }
        _ref3 = scope.data.wires;
        for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
          d = _ref3[_l];
          d.source = findPin(d.from);
          d.target = findPin(d.to);
        }
        gadgets = svg.selectAll('.gadget').data(scope.data.gadgets);
        wires = svg.selectAll('.wire').data(scope.data.wires);
        diag = d3.svg.diagonal().projection(function(d) {
          return [d.y, d.x];
        });
        gadgetDrag = d3.behavior.drag().origin(Object).on('dragstart', function(d) {
          return this.parentNode.appendChild(this);
        }).on('drag', function(d) {
          d.x = d3.event.x | 0;
          d.y = d3.event.y | 0;
          d3.select(this).attr({
            transform: function(d) {
              return "translate(" + d.x + "," + d.y + ")";
            }
          });
          return wires.filter(function(w) {
            return w.source.g === d || w.target.g === d;
          }).each(function(d) {
            d.source = findPin(d.from);
            return d.target = findPin(d.to);
          }).attr({
            d: diag
          });
        }).on('dragend', function(d) {
          return console.log('save gadget', d);
        });
        g = gadgets.enter().append('g').call(gadgetDrag).attr({
          "class": 'gadget'
        });
        g.append('rect').each(function(d) {
          return d3.select(this).attr({
            "class": 'outline',
            x: 0.5 - d.hw,
            y: 0.5 - d.hh,
            width: 2 * d.hw,
            height: 2 * d.hh
          });
        }).style({
          fill: function(d) {
            return d.def.shade;
          }
        });
        g.append('text').text(function(d) {
          return d.title;
        }).attr({
          "class": 'title',
          y: function(d) {
            return 12 - d.hh;
          }
        });
        g.append('text').text(function(d) {
          return d.def.name;
        }).attr({
          "class": 'type',
          y: function(d) {
            return -4 + d.hh;
          }
        });
        pins = gadgets.selectAll('rect .pin').data(function(d) {
          return d.def.pins;
        });
        p = pins.enter();
        p.append('circle').attr({
          "class": 'pin',
          cx: (function(d) {
            return d.x + .5;
          }),
          cy: (function(d) {
            return d.y + .5;
          }),
          r: 3
        }).on('mousedown', function(d) {
          return console.log('c1', d);
        });
        p.append('text').text(function(d) {
          return d.name;
        }).attr({
          "class": function(d) {
            if (d.dir === 'i') {
              return 'in';
            } else {
              return 'out';
            }
          },
          x: function(d) {
            if (d.dir === 'i') {
              return d.x + 7;
            } else {
              return d.x - 7;
            }
          },
          y: function(d) {
            return d.y + 5;
          }
        });
        wires.enter().insert('path', 'g').attr({
          "class": 'wire',
          d: diag
        });
        return gadgets.attr({
          transform: function(d) {
            return "translate(" + d.x + "," + d.y + ")";
          }
        });
      }
    };
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2lyY2VkaXQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxxRkFBQTs7QUFBQSxFQUFBLEVBQUEsR0FBSyxPQUFPLENBQUMsTUFBUixDQUFlLE9BQWYsQ0FBTCxDQUFBOztBQUFBLEVBRUEsVUFBQSxHQUNFO0FBQUEsSUFBQSxJQUFBLEVBQ0U7QUFBQSxNQUFBLElBQUEsRUFBTSxtQkFBTjtBQUFBLE1BQ0EsS0FBQSxFQUFPLEdBRFA7QUFBQSxNQUVBLElBQUEsRUFBTTtRQUNKO0FBQUEsVUFBRSxJQUFBLEVBQU0sSUFBUjtBQUFBLFVBQWMsR0FBQSxFQUFLLEdBQW5CO1NBREksRUFFSjtBQUFBLFVBQUUsSUFBQSxFQUFNLEtBQVI7QUFBQSxVQUFlLEdBQUEsRUFBSyxHQUFwQjtTQUZJO09BRk47S0FERjtBQUFBLElBT0EsT0FBQSxFQUNFO0FBQUEsTUFBQSxLQUFBLEVBQU8sR0FBUDtBQUFBLE1BQ0EsS0FBQSxFQUFPLFdBRFA7QUFBQSxNQUVBLElBQUEsRUFBTTtRQUNKO0FBQUEsVUFBRSxJQUFBLEVBQU0sSUFBUjtBQUFBLFVBQWMsR0FBQSxFQUFLLEdBQW5CO1NBREksRUFFSjtBQUFBLFVBQUUsSUFBQSxFQUFNLEtBQVI7QUFBQSxVQUFlLEdBQUEsRUFBSyxHQUFwQjtTQUZJO09BRk47S0FSRjtHQUhGLENBQUE7O0FBbUJBLE9BQUEsZUFBQTtzQkFBQTtBQUNFLElBQUEsQ0FBQyxDQUFDLFNBQUYsQ0FBQyxDQUFDLE9BQVMsRUFBWCxDQUFBO0FBQUEsSUFDQSxHQUFBLEdBQU0sQ0FETixDQUFBO0FBRUE7QUFBQSxTQUFBLDJDQUFBO21CQUFBO0FBQ0UsTUFBQSxDQUFDLENBQUMsQ0FBRixHQUFNLENBQUMsQ0FBQyxLQUFGLEdBQVUsQ0FBaEIsQ0FBQTtBQUNBLE1BQUEsSUFBRyxDQUFDLENBQUMsR0FBRixLQUFTLEdBQVo7QUFDRSxRQUFBLENBQUMsQ0FBQyxDQUFG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WjtxQkFBcUIsQ0FBQyxDQUFDLENBQUYsR0FBTSxFQUEzQjthQUFBLE1BQUE7cUJBQWtDLENBQUMsQ0FBQyxDQUFGLEdBQU0sRUFBeEM7YUFBUDtVQUFBLENBREg7QUFBQSxVQUVBLENBQUEsRUFBRyxTQUFDLENBQUQsR0FBQTttQkFBTyxDQUFDLENBQUMsQ0FBRixHQUFNLEVBQWI7VUFBQSxDQUZIO1NBRkosQ0FwRUEsQ0FBQTtBQUFBLFFBMEVBLEtBQUssQ0FBQyxLQUFOLENBQUEsQ0FBYSxDQUFDLE1BQWQsQ0FBcUIsTUFBckIsRUFBNkIsR0FBN0IsQ0FDRSxDQUFDLElBREgsQ0FDUTtBQUFBLFVBQUEsT0FBQSxFQUFPLE1BQVA7QUFBQSxVQUFlLENBQUEsRUFBRyxJQUFsQjtTQURSLENBMUVBLENBQUE7ZUE2RUEsT0FBTyxDQUFDLElBQVIsQ0FBYTtBQUFBLFVBQUEsU0FBQSxFQUFXLFNBQUMsQ0FBRCxHQUFBO21CQUFRLFlBQUEsR0FBVyxDQUFDLENBQUMsQ0FBYixHQUFnQixHQUFoQixHQUFrQixDQUFDLENBQUMsQ0FBcEIsR0FBdUIsSUFBL0I7VUFBQSxDQUFYO1NBQWIsRUE5RUk7TUFBQSxDQUxOO01BRDRCO0VBQUEsQ0FBOUIsQ0F4Q0EsQ0FBQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsibmcgPSBhbmd1bGFyLm1vZHVsZSAnbXlBcHAnXG5cbmdhZGdldERlZnMgPVxuICBQaXBlOlxuICAgIG5hbWU6ICdDZWNpIGVzdCB1bmUgcGlwZSdcbiAgICB3aWR0aDogMTYwXG4gICAgcGluczogW1xuICAgICAgeyBuYW1lOiAnSW4nLCBkaXI6ICdpJyB9XG4gICAgICB7IG5hbWU6ICdPdXQnLCBkaXI6ICdvJyB9XG4gICAgXVxuICBQcmludGVyOlxuICAgIHdpZHRoOiAxMjBcbiAgICBzaGFkZTogJ2xpZ2h0Ymx1ZSdcbiAgICBwaW5zOiBbXG4gICAgICB7IG5hbWU6ICdJbicsIGRpcjogJ2knIH1cbiAgICAgIHsgbmFtZTogJ0luMicsIGRpcjogJ2knIH1cbiAgICBdXG5cbiMgcHJlLWNhbGN1bGF0ZSBzaXplcyBhbmQgcmVsYXRpdmUgcGluIGNvb3JkaW5hdGVzXG5mb3IgbiwgZCBvZiBnYWRnZXREZWZzXG4gIGQubmFtZSBvcj0gblxuICBpbnMgPSAwXG4gIGZvciBwIGluIGQucGluc1xuICAgIHAueCA9IGQud2lkdGggLyAyXG4gICAgaWYgcC5kaXIgaXMgJ2knXG4gICAgICBwLnggPSAtcC54XG4gICAgICArK2luc1xuICBvdXRzID0gZC5waW5zLmxlbmd0aCAtIGluc1xuICBzdGVwID0gMTZcbiAgeUluID0gLSAoaW5zIC0gMSkgKiBzdGVwIC8gMlxuICB5T3V0ID0gLSAob3V0cyAtIDEpICogc3RlcCAvIDJcbiAgZm9yIHAgaW4gZC5waW5zXG4gICAgaWYgcC5kaXIgaXMgJ2knXG4gICAgICBwLnkgPSB5SW5cbiAgICAgIHlJbiArPSBzdGVwXG4gICAgZWxzZVxuICAgICAgcC55ID0geU91dFxuICAgICAgeU91dCArPSBzdGVwXG4gIGQuaGVpZ2h0ID0gMzAgKyBzdGVwICogKGlmIGlucyA+IG91dHMgdGhlbiBpbnMgZWxzZSBvdXRzKVxuXG5uZy5kaXJlY3RpdmUgJ2NpcmN1aXRFZGl0b3InLCAtPlxuICByZXN0cmljdDogJ0UnXG4gIFxuICBzY29wZTpcbiAgICBkYXRhOiAnPSdcbiAgICBcbiAgbGluazogKHNjb3BlLCBlbGVtLCBhdHRyKSAtPlxuICAgIHN2ZyA9IGQzLnNlbGVjdChlbGVtWzBdKS5hcHBlbmQgJ3N2ZydcbiAgICAgIC5hdHRyIGhlaWdodDogXCI3NSVcIlxuXG4gICAgZmluZFBpbiA9IChuYW1lKSAtPlxuICAgICAgW2dpZCxwbmFtZV0gPSBuYW1lLnNwbGl0ICcuJ1xuICAgICAgZm9yIGcgaW4gc2NvcGUuZGF0YS5nYWRnZXRzXG4gICAgICAgIGlmIGdpZCBpcyBnLmlkXG4gICAgICAgICAgZm9yIHAgaW4gZy5kZWYucGluc1xuICAgICAgICAgICAgaWYgcG5hbWUgaXMgcC5uYW1lXG4gICAgICAgICAgICAgICMgcmV2ZXJzZXMgeCBhbmQgeSBhbmQgdXNlcyBwcm9qZWN0aW9uIHRvIGdldCBob3Jpem9udGFsIHNwbGluZXNcbiAgICAgICAgICAgICAgcmV0dXJuIHk6IGcueCArIHAueCArIC41LCB4OiBnLnkgKyBwLnkgKyAuNSwgZzogZywgcDogcFxuXG4gICAgZm9yIGQgaW4gc2NvcGUuZGF0YS5nYWRnZXRzXG4gICAgICBkLmRlZiA9IGdhZGdldERlZnNbZC50eXBlXVxuICAgICAgZC5odyA9IGQuZGVmLndpZHRoIC8gMlxuICAgICAgZC5oaCA9IGQuZGVmLmhlaWdodCAvIDJcblxuICAgIGZvciBkIGluIHNjb3BlLmRhdGEud2lyZXNcbiAgICAgIGQuc291cmNlID0gZmluZFBpbiBkLmZyb21cbiAgICAgIGQudGFyZ2V0ID0gZmluZFBpbiBkLnRvXG5cbiAgICBnYWRnZXRzID0gc3ZnLnNlbGVjdEFsbCgnLmdhZGdldCcpLmRhdGEoc2NvcGUuZGF0YS5nYWRnZXRzKVxuICAgIHdpcmVzID0gc3ZnLnNlbGVjdEFsbCgnLndpcmUnKS5kYXRhKHNjb3BlLmRhdGEud2lyZXMpXG5cbiAgICBkaWFnID0gZDMuc3ZnLmRpYWdvbmFsKClcbiAgICAgIC5wcm9qZWN0aW9uIChkKSAtPiBbZC55LCBkLnhdICMgdW5kbyB0aGUgeC95IHJldmVyc2FsIGZyb20gZmluZFBpblxuICAgIFxuICAgIGdhZGdldERyYWcgPSBkMy5iZWhhdmlvci5kcmFnKClcbiAgICAgIC5vcmlnaW4gT2JqZWN0XG4gICAgICAub24gJ2RyYWdzdGFydCcsIChkKSAtPlxuICAgICAgICBAcGFyZW50Tm9kZS5hcHBlbmRDaGlsZCBAICMgbW92ZSB0byBmcm9udFxuICAgICAgLm9uICdkcmFnJywgKGQpIC0+XG4gICAgICAgIGQueCA9IGQzLmV2ZW50LnggfCAwICMgc3RheSBvbiBpbnQgY29vcmRpbmF0ZXNcbiAgICAgICAgZC55ID0gZDMuZXZlbnQueSB8IDAgIyBzdGF5IG9uIGludCBjb29yZGluYXRlc1xuICAgICAgICBkMy5zZWxlY3QoQCkuYXR0clxuICAgICAgICAgIHRyYW5zZm9ybTogKGQpIC0+IFwidHJhbnNsYXRlKCN7ZC54fSwje2QueX0pXCJcbiAgICAgICAgIyByZWNhbGN1bGF0ZSBlbmRwb2ludHMgYW5kIHJlZHJhdyBhbGwgd2lyZXMgYXR0YWNoZWQgdG8gdGhpcyBnYWRnZXRcbiAgICAgICAgd2lyZXMuZmlsdGVyICh3KSAtPiB3LnNvdXJjZS5nIGlzIGQgb3Igdy50YXJnZXQuZyBpcyBkXG4gICAgICAgICAgLmVhY2ggKGQpIC0+XG4gICAgICAgICAgICBkLnNvdXJjZSA9IGZpbmRQaW4gZC5mcm9tXG4gICAgICAgICAgICBkLnRhcmdldCA9IGZpbmRQaW4gZC50b1xuICAgICAgICAgIC5hdHRyIGQ6IGRpYWdcbiAgICAgIC5vbiAnZHJhZ2VuZCcsIChkKSAtPlxuICAgICAgICBjb25zb2xlLmxvZyAnc2F2ZSBnYWRnZXQnLCBkICMgVE9ETzogc2F2ZSB0byBzZXJ2ZXJcblxuICAgIGcgPSBnYWRnZXRzLmVudGVyKCkuYXBwZW5kKCdnJykuY2FsbChnYWRnZXREcmFnKVxuICAgICAgLmF0dHIgY2xhc3M6ICdnYWRnZXQnXG4gICAgZy5hcHBlbmQoJ3JlY3QnKVxuICAgICAgLmVhY2ggKGQpIC0+XG4gICAgICAgIGQzLnNlbGVjdChAKS5hdHRyXG4gICAgICAgICAgY2xhc3M6ICdvdXRsaW5lJ1xuICAgICAgICAgICMgMXB4IGxpbmVzIHJlbmRlciBzaGFycGx5IHdoZW4gb24gYSAwLjVweCBvZmZzZXRcbiAgICAgICAgICB4OiAwLjUgLSBkLmh3XG4gICAgICAgICAgeTogMC41IC0gZC5oaFxuICAgICAgICAgIHdpZHRoOiAyICogZC5od1xuICAgICAgICAgIGhlaWdodDogMiAqIGQuaGhcbiAgICAgIC5zdHlsZSBmaWxsOiAoZCkgLT4gZC5kZWYuc2hhZGVcbiAgICBnLmFwcGVuZCgndGV4dCcpLnRleHQgKGQpIC0+IGQudGl0bGVcbiAgICAgIC5hdHRyIGNsYXNzOiAndGl0bGUnLCB5OiAoZCkgLT4gMTIgLSBkLmhoXG4gICAgZy5hcHBlbmQoJ3RleHQnKS50ZXh0IChkKSAtPiBkLmRlZi5uYW1lXG4gICAgICAuYXR0ciBjbGFzczogJ3R5cGUnLCB5OiAoZCkgLT4gLTQgKyBkLmhoXG4gICAgICAgIFxuICAgIHBpbnMgPSBnYWRnZXRzLnNlbGVjdEFsbCgncmVjdCAucGluJykuZGF0YSAoZCkgLT4gZC5kZWYucGluc1xuICAgIHAgPSBwaW5zLmVudGVyKClcbiAgICBwLmFwcGVuZCgnY2lyY2xlJylcbiAgICAgIC5hdHRyIGNsYXNzOiAncGluJywgY3g6ICgoZCkgLT4gZC54Ky41KSwgY3k6ICgoZCkgLT4gZC55Ky41KSwgcjogM1xuICAgICAgLm9uICdtb3VzZWRvd24nLCAoZCkgLT5cbiAgICAgICAgY29uc29sZS5sb2cgJ2MxJywgZFxuICAgIHAuYXBwZW5kKCd0ZXh0JykudGV4dCAoZCkgLT4gZC5uYW1lXG4gICAgICAuYXR0clxuICAgICAgICBjbGFzczogKGQpIC0+IGlmIGQuZGlyIGlzICdpJyB0aGVuICdpbicgZWxzZSAnb3V0J1xuICAgICAgICB4OiAoZCkgLT4gaWYgZC5kaXIgaXMgJ2knIHRoZW4gZC54ICsgNyBlbHNlIGQueCAtIDdcbiAgICAgICAgeTogKGQpIC0+IGQueSArIDVcblxuICAgIHdpcmVzLmVudGVyKCkuaW5zZXJ0KCdwYXRoJywgJ2cnKSAjIHVzZXMgaW5zZXJ0IHRvIG1vdmUgdG8gYmFjayByaWdodCBhd2F5XG4gICAgICAuYXR0ciBjbGFzczogJ3dpcmUnLCBkOiBkaWFnXG5cbiAgICBnYWRnZXRzLmF0dHIgdHJhbnNmb3JtOiAoZCkgLT4gXCJ0cmFuc2xhdGUoI3tkLnh9LCN7ZC55fSlcIlxuIl19
