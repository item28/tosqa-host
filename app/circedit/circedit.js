(function() {
  var ng,
    __slice = [].slice;

  ng = angular.module('myApp');

  ng.directive('jbCircuitEditor', function() {
    return {
      restrict: 'E',
      scope: {
        defs: '=',
        data: '='
      },
      link: function(scope, elem, attr) {
        var diag, dragInfo, dragWire, emit, findPin, gadgetDrag, gadgets, glist, pinDrag, prepareData, redraw, svg, wireUnderCursor, wires, wlist;
        svg = d3.select(elem[0]).append('svg').attr({
          height: '60%'
        });
        diag = d3.svg.diagonal().projection(function(d) {
          return [d.y, d.x];
        });
        glist = wlist = gadgets = wires = null;
        emit = function() {
          var args;
          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          return scope.$apply(function() {
            var _ref;
            return scope.$emit.apply(scope, [(_ref = attr.event) != null ? _ref : 'circuit'].concat(__slice.call(args)));
          });
        };
        gadgetDrag = d3.behavior.drag().origin(Object).on('dragstart', function(d) {
          d3.event.sourceEvent.stopPropagation();
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
            return w.source.id === d.id || w.target.id === d.id;
          }).each(function(d) {
            d.source = findPin(d.from);
            return d.target = findPin(d.to);
          }).attr({
            d: diag
          });
        }).on('dragend', function(d) {
          var g;
          g = scope.data.gadgets[d.id];
          if (!(g.x === d.x && g.y === d.y)) {
            return emit('moveGadget', d.id, d.x, d.y);
          }
        });
        dragInfo = {};
        dragWire = svg.append('path').datum(dragInfo).attr({
          id: 'drag'
        });
        wireUnderCursor = null;
        pinDrag = d3.behavior.drag().origin(Object).on('dragstart', function(d) {
          d3.event.sourceEvent.stopPropagation();
          dragInfo.from = d.pin;
          delete dragInfo.to;
          return dragInfo.source = findPin(d.pin);
        }).on('drag', function(d) {
          var mx, my, orig, _ref;
          _ref = d3.mouse(this), mx = _ref[0], my = _ref[1];
          orig = dragInfo.source;
          dragInfo.target = {
            x: orig.x + my - d.y,
            y: orig.y + mx - d.x
          };
          return dragWire.attr({
            "class": 'drawing',
            fill: 'none',
            d: diag
          });
        }).on('dragend', function(d) {
          dragWire.classed('drawing', false);
          if (dragInfo.to && dragInfo.to !== dragInfo.from) {
            return emit('addWire', dragInfo.from, dragInfo.to);
          }
        });
        redraw = function() {
          var g, p, pins;
          prepareData();
          gadgets = svg.selectAll('.gadget').data(glist, function(d) {
            return d.id;
          });
          wires = svg.selectAll('.wire').data(wlist, function(d) {
            return d.id;
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
          }).on('mousedown', function(d) {
            return emit('selectGadget', d.id);
          }).style({
            fill: function(d) {
              return d.def.shade;
            }
          });
          g.append('text').text(function(d) {
            return d.title || d.def.name;
          }).attr({
            "class": 'title',
            y: function(d) {
              return 12 - d.hh;
            }
          });
          g.append('text').text(function(d) {
            return "" + d.type + " - " + d.id;
          }).attr({
            "class": 'type',
            y: function(d) {
              return -4 + d.hh;
            }
          });
          g.append('text').text(function(d) {
            return d.def.icon;
          }).attr({
            "class": 'iconfont',
            x: 0,
            y: 0
          });
          g.append('text').text(function(d) {
            return '\uf014';
          }).attr({
            "class": 'iconfont',
            x: (function(d) {
              return d.hw - 8;
            }),
            y: (function(d) {
              return 8 - d.hh;
            })
          }).style({
            'font-size': '12px'
          }).on('mousedown', function(d) {
            d3.event.stopPropagation();
            return emit('delGadget', d.id);
          });
          gadgets.exit().remove();
          pins = gadgets.selectAll('.pin').data(function(d) {
            return d.pins;
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
          });
          p.append('circle').call(pinDrag).attr({
            "class": 'hit',
            cx: (function(d) {
              return d.x + .5;
            }),
            cy: (function(d) {
              return d.y + .5;
            }),
            r: 7
          }).on('mouseup', function(d) {
            return dragInfo.to = d.pin;
          });
          p.append('text').text(function(d) {
            return d.name;
          }).attr({
            "class": function(d) {
              return d.dir;
            },
            x: function(d) {
              if (d.dir === 'in') {
                return d.x + 10;
              } else {
                return d.x - 10;
              }
            },
            y: function(d) {
              return d.y + 5;
            }
          });
          pins.exit().remove();
          wires.enter().insert('path', 'g').attr({
            "class": 'wire',
            fill: 'none',
            d: diag
          }).on('mouseenter', function(d) {
            return wireUnderCursor = d;
          }).on('mouseleave', function(d) {
            return wireUnderCursor = null;
          });
          wires.exit().remove();
          return gadgets.attr({
            transform: function(d) {
              return "translate(" + d.x + "," + d.y + ")";
            }
          });
        };
        svg.on('mousedown', function() {
          var x, y, _ref;
          if (wireUnderCursor) {
            return emit('delWire', wireUnderCursor.from, wireUnderCursor.to);
          } else {
            _ref = d3.mouse(this), x = _ref[0], y = _ref[1];
            return emit('addGadget', x | 0, y | 0);
          }
        });
        findPin = function(pin) {
          var g, gid, p, pname, _i, _j, _len, _len1, _ref, _ref1;
          _ref = pin.split('.'), gid = _ref[0], pname = _ref[1];
          for (_i = 0, _len = glist.length; _i < _len; _i++) {
            g = glist[_i];
            if (gid === g.id) {
              _ref1 = g.pins;
              for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                p = _ref1[_j];
                if (pname === p.name) {
                  return {
                    y: g.x + p.x + .5,
                    x: g.y + p.y + .5,
                    id: gid
                  };
                }
              }
            }
          }
        };
        prepareData = function() {
          var cap, def, from, g, height, hh, hw, id, ins, outs, pins, placePins, source, target, title, to, type, width, x, y, ystep;
          ystep = 20;
          width = 140;
          glist = (function() {
            var _ref, _results;
            _ref = scope.data.gadgets;
            _results = [];
            for (id in _ref) {
              g = _ref[id];
              x = g.x, y = g.y, title = g.title, type = g.type;
              def = scope.defs[type];
              pins = [];
              placePins = function(pnames, dir, xi) {
                var name, nlist, yi, _i, _len;
                nlist = pnames ? pnames.split(' ') : [];
                yi = -ystep * (nlist.length - 1) >> 1;
                for (_i = 0, _len = nlist.length; _i < _len; _i++) {
                  name = nlist[_i];
                  pins.push({
                    x: xi,
                    y: yi,
                    name: name,
                    dir: dir,
                    pin: "" + id + "." + name
                  });
                  yi += ystep;
                }
                return nlist.length;
              };
              hw = width / 2;
              ins = placePins(def.inputs, 'in', -hw);
              outs = placePins(def.outputs, 'out', hw);
              height = 40 + ystep * (ins > outs ? ins : outs);
              hh = height / 2;
              _results.push({
                id: id,
                x: x,
                y: y,
                title: title,
                type: type,
                def: def,
                pins: pins,
                hw: hw,
                hh: hh,
                height: height
              });
            }
            return _results;
          })();
          return wlist = (function() {
            var _ref, _ref1, _results;
            _ref = scope.data.wires;
            _results = [];
            for (id in _ref) {
              cap = _ref[id];
              _ref1 = id.split('/'), from = _ref1[0], to = _ref1[1];
              source = findPin(from);
              target = findPin(to);
              _results.push({
                id: id,
                from: from,
                to: to,
                source: source,
                target: target,
                cap: cap
              });
            }
            return _results;
          })();
        };
        scope.$watch("data", (function() {
          return redraw();
        }), true);
        return redraw();
      }
    };
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2lyY2VkaXQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxFQUFBO0lBQUEsa0JBQUE7O0FBQUEsRUFBQSxFQUFBLEdBQUssT0FBTyxDQUFDLE1BQVIsQ0FBZSxPQUFmLENBQUwsQ0FBQTs7QUFBQSxFQUVBLEVBQUUsQ0FBQyxTQUFILENBQWEsaUJBQWIsRUFBZ0MsU0FBQSxHQUFBO1dBQzlCO0FBQUEsTUFBQSxRQUFBLEVBQVUsR0FBVjtBQUFBLE1BRUEsS0FBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sR0FBTjtBQUFBLFFBQ0EsSUFBQSxFQUFNLEdBRE47T0FIRjtBQUFBLE1BTUEsSUFBQSxFQUFNLFNBQUMsS0FBRCxFQUFRLElBQVIsRUFBYyxJQUFkLEdBQUE7QUFDSixZQUFBLHFJQUFBO0FBQUEsUUFBQSxHQUFBLEdBQU0sRUFBRSxDQUFDLE1BQUgsQ0FBVSxJQUFLLENBQUEsQ0FBQSxDQUFmLENBQWtCLENBQUMsTUFBbkIsQ0FBMEIsS0FBMUIsQ0FDSixDQUFDLElBREcsQ0FDRTtBQUFBLFVBQUEsTUFBQSxFQUFRLEtBQVI7U0FERixDQUFOLENBQUE7QUFBQSxRQUVBLElBQUEsR0FBTyxFQUFFLENBQUMsR0FBRyxDQUFDLFFBQVAsQ0FBQSxDQUNMLENBQUMsVUFESSxDQUNPLFNBQUMsQ0FBRCxHQUFBO2lCQUFPLENBQUMsQ0FBQyxDQUFDLENBQUgsRUFBTSxDQUFDLENBQUMsQ0FBUixFQUFQO1FBQUEsQ0FEUCxDQUZQLENBQUE7QUFBQSxRQUtBLEtBQUEsR0FBUSxLQUFBLEdBQVEsT0FBQSxHQUFVLEtBQUEsR0FBUSxJQUxsQyxDQUFBO0FBQUEsUUFPQSxJQUFBLEdBQU8sU0FBQSxHQUFBO0FBRUwsY0FBQSxJQUFBO0FBQUEsVUFGTSw4REFFTixDQUFBO2lCQUFBLEtBQUssQ0FBQyxNQUFOLENBQWEsU0FBQSxHQUFBO0FBQUcsZ0JBQUEsSUFBQTttQkFBQSxL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LENBQUEsRUFEb0I7UUFBQSxDQUFELENBQXJCLEVBRUcsSUFGSCxDQXpKQSxDQUFBO2VBNkpBLE1BQUEsQ0FBQSxFQTlKSTtNQUFBLENBTk47TUFEOEI7RUFBQSxDQUFoQyxDQUZBLENBQUE7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbIm5nID0gYW5ndWxhci5tb2R1bGUgJ215QXBwJ1xuXG5uZy5kaXJlY3RpdmUgJ2piQ2lyY3VpdEVkaXRvcicsIC0+XG4gIHJlc3RyaWN0OiAnRSdcbiAgXG4gIHNjb3BlOlxuICAgIGRlZnM6ICc9J1xuICAgIGRhdGE6ICc9J1xuICAgIFxuICBsaW5rOiAoc2NvcGUsIGVsZW0sIGF0dHIpIC0+ICBcbiAgICBzdmcgPSBkMy5zZWxlY3QoZWxlbVswXSkuYXBwZW5kICdzdmcnXG4gICAgICAuYXR0ciBoZWlnaHQ6ICc2MCUnXG4gICAgZGlhZyA9IGQzLnN2Zy5kaWFnb25hbCgpXG4gICAgICAucHJvamVjdGlvbiAoZCkgLT4gW2QueSwgZC54XSAjIHVuZG8gdGhlIHgveSByZXZlcnNhbCBmcm9tIGZpbmRQaW5cbiAgICBcbiAgICBnbGlzdCA9IHdsaXN0ID0gZ2FkZ2V0cyA9IHdpcmVzID0gbnVsbFxuICAgIFxuICAgIGVtaXQgPSAoYXJncy4uLikgLT5cbiAgICAgICMgZm9yY2UgYSBkaWdlc3QsIHNpbmNlIGQzIGV2ZW50cyBoYXBwZW4gb3V0c2lkZSBvZiBuZydzIGV2ZW50IGNvbnRleHRcbiAgICAgIHNjb3BlLiRhcHBseSAtPiBzY29wZS4kZW1pdCBhdHRyLmV2ZW50ID8gJ2NpcmN1aXQnLCBhcmdzLi4uXG4gICAgICBcbiAgICBnYWRnZXREcmFnID0gZDMuYmVoYXZpb3IuZHJhZygpXG4gICAgICAub3JpZ2luIE9iamVjdFxuICAgICAgLm9uICdkcmFnc3RhcnQnLCAoZCkgLT5cbiAgICAgICAgZDMuZXZlbnQuc291cmNlRXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgQHBhcmVudE5vZGUuYXBwZW5kQ2hpbGQgQCAjIG1vdmUgdG8gZnJvbnRcbiAgICAgIC5vbiAnZHJhZycsIChkKSAtPlxuICAgICAgICBkLnggPSBkMy5ldmVudC54IHwgMCAjIHN0YXkgb24gaW50IGNvb3JkaW5hdGVzXG4gICAgICAgIGQueSA9IGQzLmV2ZW50LnkgfCAwICMgc3RheSBvbiBpbnQgY29vcmRpbmF0ZXNcbiAgICAgICAgZDMuc2VsZWN0KEApLmF0dHIgdHJhbnNmb3JtOiAoZCkgLT4gXCJ0cmFuc2xhdGUoI3tkLnh9LCN7ZC55fSlcIlxuICAgICAgICAjIHJlY2FsY3VsYXRlIGVuZHBvaW50cyBhbmQgbW92ZSBhbGwgd2lyZXMgYXR0YWNoZWQgdG8gdGhpcyBnYWRnZXRcbiAgICAgICAgd2lyZXMuZmlsdGVyICh3KSAtPiB3LnNvdXJjZS5pZCBpcyBkLmlkIG9yIHcudGFyZ2V0LmlkIGlzIGQuaWRcbiAgICAgICAgICAuZWFjaCAoZCkgLT5cbiAgICAgICAgICAgIGQuc291cmNlID0gZmluZFBpbiBkLmZyb21cbiAgICAgICAgICAgIGQudGFyZ2V0ID0gZmluZFBpbiBkLnRvXG4gICAgICAgICAgLmF0dHIgZDogZGlhZ1xuICAgICAgLm9uICdkcmFnZW5kJywgKGQpIC0+XG4gICAgICAgIGcgPSBzY29wZS5kYXRhLmdhZGdldHNbZC5pZF1cbiAgICAgICAgdW5sZXNzIGcueCBpcyBkLnggYW5kIGcueSBpcyBkLnlcbiAgICAgICAgICBlbWl0ICdtb3ZlR2FkZ2V0JywgZC5pZCwgZC54LCBkLnlcblxuICAgIGRyYWdJbmZvID0ge31cbiAgICBkcmFnV2lyZSA9IHN2Zy5hcHBlbmQoJ3BhdGgnKS5kYXR1bShkcmFnSW5mbykuYXR0ciBpZDogJ2RyYWcnXG4gICAgd2lyZVVuZGVyQ3Vyc29yID0gbnVsbFxuXG4gICAgcGluRHJhZyA9IGQzLmJlaGF2aW9yLmRyYWcoKVxuICAgICAgLm9yaWdpbiBPYmplY3RcbiAgICAgIC5vbiAnZHJhZ3N0YXJ0JywgKGQpIC0+XG4gICAgICAgIGQzLmV2ZW50LnNvdXJjZUV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgIGRyYWdJbmZvLmZyb20gPSBkLnBpblxuICAgICAgICBkZWxldGUgZHJhZ0luZm8udG9cbiAgICAgICAgZHJhZ0luZm8uc291cmNlID0gZmluZFBpbiBkLnBpblxuICAgICAgLm9uICdkcmFnJywgKGQpIC0+XG4gICAgICAgIFtteCxteV0gPSBkMy5tb3VzZShAKVxuICAgICAgICBvcmlnID0gZHJhZ0luZm8uc291cmNlXG4gICAgICAgIGRyYWdJbmZvLnRhcmdldCA9IHg6IG9yaWcueCtteS1kLnksIHk6IG9yaWcueStteC1kLnggIyBmbGlwcGVkXG4gICAgICAgIGRyYWdXaXJlLmF0dHIgY2xhc3M6ICdkcmF3aW5nJywgZmlsbDogJ25vbmUnLCBkOiBkaWFnXG4gICAgICAub24gJ2RyYWdlbmQnLCAoZCkgLT5cbiAgICAgICAgZHJhZ1dpcmUuY2xhc3NlZCAnZHJhd2luZycsIGZhbHNlXG4gICAgICAgIGlmIGRyYWdJbmZvLnRvIGFuZCBkcmFnSW5mby50byBpc250IGRyYWdJbmZvLmZyb21cbiAgICAgICAgICBlbWl0ICdhZGRXaXJlJywgZHJhZ0luZm8uZnJvbSwgZHJhZ0luZm8udG9cblxuICAgIHJlZHJhdyA9IC0+XG4gICAgICBwcmVwYXJlRGF0YSgpXG5cbiAgICAgIGdhZGdldHMgPSBzdmcuc2VsZWN0QWxsKCcuZ2FkZ2V0JykuZGF0YSBnbGlzdCwgKGQpIC0+IGQuaWRcbiAgICAgIHdpcmVzID0gc3ZnLnNlbGVjdEFsbCgnLndpcmUnKS5kYXRhIHdsaXN0LCAoZCkgLT4gZC5pZFxuXG4gICAgICBnID0gZ2FkZ2V0cy5lbnRlcigpLmFwcGVuZCgnZycpLmNhbGwoZ2FkZ2V0RHJhZylcbiAgICAgICAgLmF0dHIgY2xhc3M6ICdnYWRnZXQnXG4gICAgICBnLmFwcGVuZCgncmVjdCcpXG4gICAgICAgIC5lYWNoIChkKSAtPlxuICAgICAgICAgIGQzLnNlbGVjdChAKS5hdHRyXG4gICAgICAgICAgICBjbGFzczogJ291dGxpbmUnXG4gICAgICAgICAgICAjIDFweCBsaW5lcyByZW5kZXIgc2hhcnBseSB3aGVuIG9uIGEgMC41cHggb2Zmc2V0XG4gICAgICAgICAgICB4OiAwLjUgLSBkLmh3LCB5OiAwLjUgLSBkLmhoXG4gICAgICAgICAgICB3aWR0aDogMiAqIGQuaHcsIGhlaWdodDogMiAqIGQuaGhcbiAgICAgICAgLm9uICdtb3VzZWRvd24nLCAoZCkgLT4gZW1pdCAnc2VsZWN0R2FkZ2V0JywgZC5pZFxuICAgICAgICAuc3R5bGUgZmlsbDogKGQpIC0+IGQuZGVmLnNoYWRlXG4gICAgICBnLmFwcGVuZCgndGV4dCcpLnRleHQgKGQpIC0+IGQudGl0bGUgb3IgZC5kZWYubmFtZVxuICAgICAgICAuYXR0ciBjbGFzczogJ3RpdGxlJywgeTogKGQpIC0+IDEyIC0gZC5oaFxuICAgICAgZy5hcHBlbmQoJ3RleHQnKS50ZXh0IChkKSAtPiBcIiN7ZC50eXBlfSAtICN7ZC5pZH1cIlxuICAgICAgICAuYXR0ciBjbGFzczogJ3R5cGUnLCB5OiAoZCkgLT4gLTQgKyBkLmhoXG4gICAgICBnLmFwcGVuZCgndGV4dCcpLnRleHQgKGQpIC0+IGQuZGVmLmljb25cbiAgICAgICAgLmF0dHIgY2xhc3M6ICdpY29uZm9udCcsIHg6IDAsIHk6IDBcbiAgICAgIGcuYXBwZW5kKCd0ZXh0JykudGV4dCAoZCkgLT4gJ1xcdWYwMTQnICMgZmEtdHJhc2gtb1xuICAgICAgICAuYXR0ciBjbGFzczogJ2ljb25mb250JywgeDogKChkKSAtPiBkLmh3LTgpLCB5OiAoKGQpIC0+IDgtZC5oaClcbiAgICAgICAgLnN0eWxlICdmb250LXNpemUnOiAnMTJweCdcbiAgICAgICAgLm9uICdtb3VzZWRvd24nLCAoZCkgLT5cbiAgICAgICAgICBkMy5ldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgIGVtaXQgJ2RlbEdhZGdldCcsIGQuaWRcbiAgICAgIGdhZGdldHMuZXhpdCgpLnJlbW92ZSgpXG5cbiAgICAgIHBpbnMgPSBnYWRnZXRzLnNlbGVjdEFsbCgnLnBpbicpLmRhdGEgKGQpIC0+IGQucGluc1xuICAgICAgcCA9IHBpbnMuZW50ZXIoKVxuICAgICAgcC5hcHBlbmQoJ2NpcmNsZScpXG4gICAgICAgIC5hdHRyIGNsYXNzOiAncGluJywgY3g6ICgoZCkgLT4gZC54Ky41KSwgY3k6ICgoZCkgLT4gZC55Ky41KSwgcjogM1xuICAgICAgcC5hcHBlbmQoJ2NpcmNsZScpLmNhbGwocGluRHJhZylcbiAgICAgICAgLmF0dHIgY2xhc3M6ICdoaXQnLCBjeDogKChkKSAtPiBkLngrLjUpLCBjeTogKChkKSAtPiBkLnkrLjUpLCByOiA3XG4gICAgICAgIC5vbiAnbW91c2V1cCcsIChkKSAtPiBkcmFnSW5mby50byA9IGQucGluXG4gICAgICBwLmFwcGVuZCgndGV4dCcpLnRleHQgKGQpIC0+IGQubmFtZVxuICAgICAgICAuYXR0clxuICAgICAgICAgIGNsYXNzOiAoZCkgLT4gZC5kaXJcbiAgICAgICAgICB4OiAoZCkgLT4gaWYgZC5kaXIgaXMgJ2luJyB0aGVuIGQueCArIDEwIGVsc2UgZC54IC0gMTBcbiAgICAgICAgICB5OiAoZCkgLT4gZC55ICsgNVxuICAgICAgcGlucy5leGl0KCkucmVtb3ZlKClcblxuICAgICAgd2lyZXMuZW50ZXIoKS5pbnNlcnQoJ3BhdGgnLCAnZycpICMgdXNlcyBpbnNlcnQgdG8gbW92ZSB0byBiYWNrIHJpZ2h0IGF3YXlcbiAgICAgICAgLmF0dHIgY2xhc3M6ICd3aXJlJywgZmlsbDogJ25vbmUnLCBkOiBkaWFnXG4gICAgICAgICMgY2FuJ3QgdXNlIG1vdXNlY2xpY2ssIHNlZVxuICAgICAgICAjIGh0dHBzOi8vZ3JvdXBzLmdvb2dsZS5jb20vZC9tc2cvZDMtanMvZ0h6T2o5MVgyTkEvNjVCRWYyRHVSVjRKXG4gICAgICAgIC5vbiAnbW91c2VlbnRlcicsIChkKSAtPiB3aXJlVW5kZXJDdXJzb3IgPSBkXG4gICAgICAgIC5vbiAnbW91c2VsZWF2ZScsIChkKSAtPiB3aXJlVW5kZXJDdXJzb3IgPSBudWxsXG4gICAgICB3aXJlcy5leGl0KCkucmVtb3ZlKClcblxuICAgICAgZ2FkZ2V0cy5hdHRyIHRyYW5zZm9ybTogKGQpIC0+IFwidHJhbnNsYXRlKCN7ZC54fSwje2QueX0pXCJcbiAgICBcbiAgICBzdmcub24gJ21vdXNlZG93bicsIC0+XG4gICAgICAjIHJldHVybiAgaWYgZDMuZXZlbnQuZGVmYXVsdFByZXZlbnRlZFxuICAgICAgaWYgd2lyZVVuZGVyQ3Vyc29yXG4gICAgICAgIGVtaXQgJ2RlbFdpcmUnLCB3aXJlVW5kZXJDdXJzb3IuZnJvbSwgd2lyZVVuZGVyQ3Vyc29yLnRvXG4gICAgICAgICMgd2lyZVVuZGVyQ3Vyc29yID0gbnVsbFxuICAgICAgZWxzZVxuICAgICAgICBbeCx5XSA9IGQzLm1vdXNlKEApXG4gICAgICAgIGVtaXQgJ2FkZEdhZGdldCcsIHh8MCwgeXwwICMgY29udmVydCB0byBpbnRzXG5cbiAgICBmaW5kUGluID0gKHBpbikgLT5cbiAgICAgIFtnaWQscG5hbWVdID0gcGluLnNwbGl0ICcuJ1xuICAgICAgZm9yIGcgaW4gZ2xpc3Qgd2hlbiBnaWQgaXMgZy5pZFxuICAgICAgICBmb3IgcCBpbiBnLnBpbnMgd2hlbiBwbmFtZSBpcyBwLm5hbWVcbiAgICAgICAgICAjIHJldmVyc2VzIHggYW5kIHkgYW5kIHVzZXMgcHJvamVjdGlvbiB0byBnZXQgaG9yaXpvbnRhbCBzcGxpbmVzXG4gICAgICAgICAgcmV0dXJuIHk6IGcueCArIHAueCArIC41LCB4OiBnLnkgKyBwLnkgKyAuNSwgaWQ6IGdpZFxuXG4gICAgcHJlcGFyZURhdGEgPSAtPlxuICAgICAgeXN0ZXAgPSAyMCAgIyB2ZXJ0aWNhbCBzZXBhcmF0aW9uIGJldHdlZW4gcGluc1xuICAgICAgd2lkdGggPSAxNDAgIyBmaXhlZCB3aWR0aCBmb3Igbm93XG5cbiAgICAgICMgc2V0IHVwIGEgbGlzdCBvZiBnYWRnZXRzIHdpdGggc2l6ZXMgYW5kIHJlbGF0aXZlIHBpbiBjb29yZGluYXRlc1xuICAgICAgZ2xpc3QgPSBmb3IgaWQsIGcgb2Ygc2NvcGUuZGF0YS5nYWRnZXRzXG4gICAgICAgIHt4LHksdGl0bGUsdHlwZX0gPSBnXG4gICAgICAgIGRlZiA9IHNjb3BlLmRlZnNbdHlwZV1cbiAgICAgICAgcGlucyA9IFtdXG4gICAgICAgIHBsYWNlUGlucyA9IChwbmFtZXMsIGRpciwgeGkpIC0+XG4gICAgICAgICAgbmxpc3QgPSBpZiBwbmFtZXMgdGhlbiBwbmFtZXMuc3BsaXQgJyAnIGVsc2UgW11cbiAgICAgICAgICB5aSA9IC15c3RlcCAqIChubGlzdC5sZW5ndGggLSAxKSA+PiAxXG4gICAgICAgICAgZm9yIG5hbWUgaW4gbmxpc3RcbiAgICAgICAgICAgIHBpbnMucHVzaCB7IHg6IHhpLCB5OiB5aSwgbmFtZSwgZGlyLCBwaW46IFwiI3tpZH0uI3tuYW1lfVwiIH1cbiAgICAgICAgICAgIHlpICs9IHlzdGVwXG4gICAgICAgICAgbmxpc3QubGVuZ3RoXG4gICAgICAgIGh3ID0gd2lkdGggLyAyXG4gICAgICAgIGlucyA9IHBsYWNlUGlucyBkZWYuaW5wdXRzLCAnaW4nLCAtaHdcbiAgICAgICAgb3V0cyA9IHBsYWNlUGlucyBkZWYub3V0cHV0cywgJ291dCcsIGh3XG4gICAgICAgIGhlaWdodCA9IDQwICsgeXN0ZXAgKiAoaWYgaW5zID4gb3V0cyB0aGVuIGlucyBlbHNlIG91dHMpXG4gICAgICAgIGhoID0gaGVpZ2h0IC8gMlxuICAgICAgICB7IGlkLCB4LCB5LCB0aXRsZSwgdHlwZSwgZGVmLCBwaW5zLCBodywgaGgsIGhlaWdodCB9XG5cbiAgICAgICMgY29udmVydCBvYmplY3QgdG8gbGlzdCBhbmQgbG9va3VwIHRoZSB3aXJlIGVuZHBvaW50cyBpbiB0aGUgZ2FkZ2V0c1xuICAgICAgd2xpc3QgPSBmb3IgaWQsIGNhcCBvZiBzY29wZS5kYXRhLndpcmVzXG4gICAgICAgIFtmcm9tLHRvXSA9IGlkLnNwbGl0ICcvJ1xuICAgICAgICBzb3VyY2UgPSBmaW5kUGluIGZyb21cbiAgICAgICAgdGFyZ2V0ID0gZmluZFBpbiB0b1xuICAgICAgICB7IGlkLCBmcm9tLCB0bywgc291cmNlLCB0YXJnZXQsIGNhcCB9XG4gICAgXG4gICAgc2NvcGUuJHdhdGNoIFwiZGF0YVwiLCAoLT5cbiAgICAgIHJlZHJhdygpXG4gICAgKSwgdHJ1ZVxuICAgIFxuICAgIHJlZHJhdygpXG4iXX0=
