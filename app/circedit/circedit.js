(function() {
  var findPin, ng, prepareData,
    __slice = [].slice;

  ng = angular.module('myApp');

  ng.directive('jbCircuitEditor', function() {
    return {
      restrict: 'E',
      scope: {
        defs: '=',
        data: '=',
        type: '=',
        select: '='
      },
      link: function(scope, elem, attr) {
        var diag, dragInfo, dragWire, emit, gadgetDrag, gadgets, k, lastg, pinDrag, redraw, svg, updateSelect, wireUnderCursor, wires;
        for (k in scope.defs) {
          scope.type = k;
          break;
        }
        svg = d3.select(elem[0]).append('svg').attr({
          height: '60%'
        });
        diag = d3.svg.diagonal().projection(function(d) {
          return [d.y, d.x];
        });
        lastg = gadgets = wires = null;
        emit = function() {
          var args;
          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          return scope.$apply(function() {
            var _ref;
            return scope.$emit.apply(scope, [(_ref = attr.event) != null ? _ref : 'circuit'].concat(__slice.call(args)));
          });
        };
        updateSelect = function(d) {
          return scope.$apply(function() {
            return scope.select = d;
          });
        };
        gadgetDrag = d3.behavior.drag().origin(Object).on('dragstart', function(d) {
          d3.event.sourceEvent.stopPropagation();
          return this.parentNode.appendChild(this);
        }).on('drag', function(d) {
          d.moved = true;
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
            d.source = findPin(d.from, scope.data.gadgets);
            return d.target = findPin(d.to, scope.data.gadgets);
          }).attr({
            d: diag
          });
        }).on('dragend', function(d) {
          if (d.moved) {
            delete d.moved;
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
          return dragInfo.source = findPin(d.pin, scope.data.gadgets);
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
          var nw;
          dragWire.classed('drawing', false);
          if (dragInfo.to) {
            nw = {
              from: dragInfo.from,
              to: dragInfo.to
            };
            if (nw.from !== nw.to) {
              emit('addWire', nw.from, nw.to);
              scope.data.wires.push(nw);
            }
            return redraw();
          }
        });
        redraw = function(cb) {
          var g, p, pins;
          lastg = prepareData(scope.defs, scope.data);
          gadgets = svg.selectAll('.gadget').data(scope.data.gadgets, function(d) {
            return d.id;
          });
          wires = svg.selectAll('.wire').data(scope.data.wires, function(d) {
            return "" + d.from + "/" + d.to;
          });
          g = gadgets.enter().append('g').call(gadgetDrag).attr({
            "class": 'gadget'
          });
          g.append('rect').each(function(d) {
            d.def = scope.defs[d.type];
            d.hw = d.def.width / 2;
            d.hh = d.def.height / 2;
            return d3.select(this).attr({
              "class": 'outline',
              x: 0.5 - d.hw,
              y: 0.5 - d.hh,
              width: 2 * d.hw,
              height: 2 * d.hh
            });
          }).on('mousedown', function(d) {
            return updateSelect(d);
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
            var i, n, sdw, w, _ref;
            d3.event.stopPropagation();
            sdw = scope.data.wires;
            n = sdw.length;
            while (n) {
              w = sdw[--n];
              if (w.from.split('.')[0] === d.id || w.to.split('.')[0] === d.id) {
                emit('delAttached', w.from, w.to);
                sdw.splice(n, 1);
              }
            }
            emit('delGadget', d.id);
            _ref = scope.data.gadgets;
            for (i in _ref) {
              g = _ref[i];
              if (!(g === d)) {
                continue;
              }
              scope.data.gadgets.splice(i, 1);
              updateSelect(null);
              break;
            }
            return redraw();
          });
          gadgets.exit().remove();
          pins = gadgets.selectAll('.pin').data(function(d) {
            var p;
            return d.conn = (function() {
              var _i, _len, _ref, _results;
              _ref = d.def.pins;
              _results = [];
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                p = _ref[_i];
                _results.push({
                  x: p.x,
                  y: p.y,
                  name: p.name,
                  dir: p.dir,
                  pin: "" + d.id + "." + p.name
                });
              }
              return _results;
            })();
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
          gadgets.attr({
            transform: function(d) {
              return "translate(" + d.x + "," + d.y + ")";
            }
          });
          return typeof cb === "function" ? cb() : void 0;
        };
        redraw();
        return svg.on('mousedown', function() {
          var g, i, w, wuc, x, y, _ref, _ref1;
          wuc = wireUnderCursor;
          if (wuc) {
            emit('delWire', wuc.from, wuc.to);
            _ref = scope.data.wires;
            for (i in _ref) {
              w = _ref[i];
              if (!(w === wuc)) {
                continue;
              }
              scope.data.wires.splice(i, 1);
              break;
            }
            wireUnderCursor = null;
          } else {
            _ref1 = d3.mouse(this), x = _ref1[0], y = _ref1[1];
            g = {
              id: "g" + (++lastg),
              x: x | 0,
              y: y | 0,
              type: scope.type
            };
            emit('addGadget', g.id, g.x, g.y, g.type);
            scope.data.gadgets.push(g);
          }
          return redraw(function() {
            return updateSelect(g);
          });
        });
      }
    };
  });

  findPin = function(name, gdata) {
    var g, gid, p, pname, _i, _j, _len, _len1, _ref, _ref1;
    _ref = name.split('.'), gid = _ref[0], pname = _ref[1];
    for (_i = 0, _len = gdata.length; _i < _len; _i++) {
      g = gdata[_i];
      if (gid === g.id) {
        _ref1 = g.def.pins;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          p = _ref1[_j];
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

  prepareData = function(gdefs, gdata) {
    var d, ins, n, outs, p, seq, step, yIn, yOut, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3;
    for (n in gdefs) {
      d = gdefs[n];
      d.name || (d.name = n);
      ins = 0;
      _ref = d.pins;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        p = _ref[_i];
        p.x = d.width / 2;
        if (p.dir === 'in') {
          p.x = -p.x;
          ++ins;
        }
      }
      outs = d.pins.length - ins;
      step = 20;
      yIn = -(ins - 1) * step / 2;
      yOut = -(outs - 1) * step / 2;
      _ref1 = d.pins;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        p = _ref1[_j];
        if (p.dir === 'in') {
          p.y = yIn;
          yIn += step;
        } else {
          p.y = yOut;
          yOut += step;
        }
      }
      d.height = 40 + step * (ins > outs ? ins : outs);
    }
    seq = 0;
    _ref2 = gdata.gadgets;
    for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
      d = _ref2[_k];
      if (/^g\d+$/.test(d.id)) {
        n = d.id.slice(1) | 0;
        if (n > seq) {
          seq = n;
        }
      }
      d.def = gdefs[d.type];
      d.hw = d.def.width / 2;
      d.hh = d.def.height / 2;
    }
    _ref3 = gdata.wires;
    for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
      d = _ref3[_l];
      d.source = findPin(d.from, gdata.gadgets);
      d.target = findPin(d.to, gdata.gadgets);
    }
    return seq;
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2lyY2VkaXQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSx3QkFBQTtJQUFBLGtCQUFBOztBQUFBLEVBQUEsRUFBQSxHQUFLLE9BQU8sQ0FBQyxNQUFSLENBQWUsT0FBZixDQUFMLENBQUE7O0FBQUEsRUFFQSxFQUFFLENBQUMsU0FBSCxDQUFhLGlCQUFiLEVBQWdDLFNBQUEsR0FBQTtXQUM5QjtBQUFBLE1BQUEsUUFBQSxFQUFVLEdBQVY7QUFBQSxNQUVBLEtBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLEdBQU47QUFBQSxRQUNBLElBQUEsRUFBTSxHQUROO0FBQUEsUUFFQSxJQUFBLEVBQU0sR0FGTjtBQUFBLFFBR0EsTUFBQSxFQUFRLEdBSFI7T0FIRjtBQUFBLE1BUUEsSUFBQSxFQUFNLFNBQUMsS0FBRCxFQUFRLElBQVIsRUFBYyxJQUFkLEdBQUE7QUFDSixZQUFBLHlIQUFBO0FBQUEsYUFBQSxlQUFBLEdBQUE7QUFDRSxVQUFBLEtBQUssQ0FBQyxJQUFOLEdBQWEsQ0FBYixDQUFBO0FBQ0EsZ0JBRkY7QUFBQSxTQUFBO0FBQUEsUUFJQSxHQUFBLEdBQU0sRUFBRSxDQUFDLE1BQUgsQ0FBVSxJQUFLLENBQUEsQ0FBQSxDQUFmLENBQWtCLENBQUMsTUFBbkIsQ0FBMEIsS0FBMUIsQ0FDSixDQUFDLElBREcsQ0FDRTtBQUFBLFVBQUEsTUFBQSxFQUFRLEtBQVI7U0FERixDQUpOLENBQUE7QUFBQSxRQU1BLElBQUEsR0FBTyxFQUFFLENBQUMsR0FBRyxDQUFDLFFBQVAsQ0FBQSxDQUNMLENBQUMsVUFESSxDQUNPLFNBQUMsQ0FBRCxHQUFBO2lCQUFPLENBQUMsQ0FBQyxDQUFDLENBQUgsRUFBTSxDQUFDLENBQUMsQ0FBUixFQUFQO1FBQUEsQ0FEUCxDQU5QLENBQUE7QUFBQSxRQVNBLEtBQUEsR0FBUSxPQUFBLEdBQVUsS0FBQSxHQUFRLElBVDFCLENBQUE7QUFB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LENBQVcsQ0FBWCxDQUFBLEdBQWdCLENBQXBCLENBQUE7QUFDQSxRQUFBLElBQVksQ0FBQSxHQUFJLEdBQWhCO0FBQUEsVUFBQSxHQUFBLEdBQU0sQ0FBTixDQUFBO1NBRkY7T0FBQTtBQUFBLE1BR0EsQ0FBQyxDQUFDLEdBQUYsR0FBUSxLQUFNLENBQUEsQ0FBQyxDQUFDLElBQUYsQ0FIZCxDQUFBO0FBQUEsTUFJQSxDQUFDLENBQUMsRUFBRixHQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBTixHQUFjLENBSnJCLENBQUE7QUFBQSxNQUtBLENBQUMsQ0FBQyxFQUFGLEdBQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFOLEdBQWUsQ0FMdEIsQ0FERjtBQUFBLEtBdEJBO0FBOEJBO0FBQUEsU0FBQSw4Q0FBQTtvQkFBQTtBQUNFLE1BQUEsQ0FBQyxDQUFDLE1BQUYsR0FBVyxPQUFBLENBQVEsQ0FBQyxDQUFDLElBQVYsRUFBZ0IsS0FBSyxDQUFDLE9BQXRCLENBQVgsQ0FBQTtBQUFBLE1BQ0EsQ0FBQyxDQUFDLE1BQUYsR0FBVyxPQUFBLENBQVEsQ0FBQyxDQUFDLEVBQVYsRUFBYyxLQUFLLENBQUMsT0FBcEIsQ0FEWCxDQURGO0FBQUEsS0E5QkE7QUFrQ0EsV0FBTyxHQUFQLENBcENZO0VBQUEsQ0EvS2QsQ0FBQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsibmcgPSBhbmd1bGFyLm1vZHVsZSAnbXlBcHAnXG5cbm5nLmRpcmVjdGl2ZSAnamJDaXJjdWl0RWRpdG9yJywgLT5cbiAgcmVzdHJpY3Q6ICdFJ1xuICBcbiAgc2NvcGU6XG4gICAgZGVmczogJz0nXG4gICAgZGF0YTogJz0nXG4gICAgdHlwZTogJz0nXG4gICAgc2VsZWN0OiAnPSdcbiAgICBcbiAgbGluazogKHNjb3BlLCBlbGVtLCBhdHRyKSAtPlxuICAgIGZvciBrIG9mIHNjb3BlLmRlZnNcbiAgICAgIHNjb3BlLnR5cGUgPSBrICMgc2V0IGluaXRpYWwgdHlwZSB0byBhIHZhbGlkIGtleSBmcm9tIHRoZSBkZWZpbml0aW9uc1xuICAgICAgYnJlYWtcbiAgICBcbiAgICBzdmcgPSBkMy5zZWxlY3QoZWxlbVswXSkuYXBwZW5kICdzdmcnXG4gICAgICAuYXR0ciBoZWlnaHQ6ICc2MCUnXG4gICAgZGlhZyA9IGQzLnN2Zy5kaWFnb25hbCgpXG4gICAgICAucHJvamVjdGlvbiAoZCkgLT4gW2QueSwgZC54XSAjIHVuZG8gdGhlIHgveSByZXZlcnNhbCBmcm9tIGZpbmRQaW5cbiAgICBcbiAgICBsYXN0ZyA9IGdhZGdldHMgPSB3aXJlcyA9IG51bGxcbiAgICBcbiAgICBlbWl0ID0gKGFyZ3MuLi4pIC0+XG4gICAgICAjIGZvcmNlIGEgZGlnZXN0LCBzaW5jZSBkMyBldmVudHMgaGFwcGVuIG91dHNpZGUgb2YgbmcncyBldmVudCBjb250ZXh0XG4gICAgICBzY29wZS4kYXBwbHkgLT4gc2NvcGUuJGVtaXQgYXR0ci5ldmVudCA/ICdjaXJjdWl0JywgYXJncy4uLlxuICAgICAgXG4gICAgdXBkYXRlU2VsZWN0ID0gKGQpIC0+XG4gICAgICBzY29wZS4kYXBwbHkgLT4gc2NvcGUuc2VsZWN0ID0gZFxuICAgIFxuICAgIGdhZGdldERyYWcgPSBkMy5iZWhhdmlvci5kcmFnKClcbiAgICAgIC5vcmlnaW4gT2JqZWN0XG4gICAgICAub24gJ2RyYWdzdGFydCcsIChkKSAtPlxuICAgICAgICBkMy5ldmVudC5zb3VyY2VFdmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICBAcGFyZW50Tm9kZS5hcHBlbmRDaGlsZCBAICMgbW92ZSB0byBmcm9udFxuICAgICAgLm9uICdkcmFnJywgKGQpIC0+XG4gICAgICAgIGQubW92ZWQgPSB0cnVlXG4gICAgICAgIGQueCA9IGQzLmV2ZW50LnggfCAwICMgc3RheSBvbiBpbnQgY29vcmRpbmF0ZXNcbiAgICAgICAgZC55ID0gZDMuZXZlbnQueSB8IDAgIyBzdGF5IG9uIGludCBjb29yZGluYXRlc1xuICAgICAgICBkMy5zZWxlY3QoQCkuYXR0ciB0cmFuc2Zvcm06IChkKSAtPiBcInRyYW5zbGF0ZSgje2QueH0sI3tkLnl9KVwiXG4gICAgICAgICMgcmVjYWxjdWxhdGUgZW5kcG9pbnRzIGFuZCByZWRyYXcgYWxsIHdpcmVzIGF0dGFjaGVkIHRvIHRoaXMgZ2FkZ2V0XG4gICAgICAgIHdpcmVzLmZpbHRlciAodykgLT4gdy5zb3VyY2UuZyBpcyBkIG9yIHcudGFyZ2V0LmcgaXMgZFxuICAgICAgICAgIC5lYWNoIChkKSAtPlxuICAgICAgICAgICAgZC5zb3VyY2UgPSBmaW5kUGluIGQuZnJvbSwgc2NvcGUuZGF0YS5nYWRnZXRzXG4gICAgICAgICAgICBkLnRhcmdldCA9IGZpbmRQaW4gZC50bywgc2NvcGUuZGF0YS5nYWRnZXRzXG4gICAgICAgICAgLmF0dHIgZDogZGlhZ1xuICAgICAgLm9uICdkcmFnZW5kJywgKGQpIC0+XG4gICAgICAgIGlmIGQubW92ZWRcbiAgICAgICAgICBkZWxldGUgZC5tb3ZlZFxuICAgICAgICAgIGVtaXQgJ21vdmVHYWRnZXQnLCBkLmlkLCBkLngsIGQueVxuXG4gICAgZHJhZ0luZm8gPSB7fVxuICAgIGRyYWdXaXJlID0gc3ZnLmFwcGVuZCgncGF0aCcpLmRhdHVtKGRyYWdJbmZvKS5hdHRyIGlkOiAnZHJhZydcbiAgICB3aXJlVW5kZXJDdXJzb3IgPSBudWxsXG5cbiAgICBwaW5EcmFnID0gZDMuYmVoYXZpb3IuZHJhZygpXG4gICAgICAub3JpZ2luIE9iamVjdFxuICAgICAgLm9uICdkcmFnc3RhcnQnLCAoZCkgLT5cbiAgICAgICAgZDMuZXZlbnQuc291cmNlRXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgZHJhZ0luZm8uZnJvbSA9IGQucGluXG4gICAgICAgIGRlbGV0ZSBkcmFnSW5mby50b1xuICAgICAgICBkcmFnSW5mby5zb3VyY2UgPSBmaW5kUGluIGQucGluLCBzY29wZS5kYXRhLmdhZGdldHNcbiAgICAgIC5vbiAnZHJhZycsIChkKSAtPlxuICAgICAgICBbbXgsbXldID0gZDMubW91c2UoQClcbiAgICAgICAgb3JpZyA9IGRyYWdJbmZvLnNvdXJjZVxuICAgICAgICBkcmFnSW5mby50YXJnZXQgPSB4OiBvcmlnLngrbXktZC55LCB5OiBvcmlnLnkrbXgtZC54ICMgZmxpcHBlZFxuICAgICAgICBkcmFnV2lyZS5hdHRyIGNsYXNzOiAnZHJhd2luZycsIGZpbGw6ICdub25lJywgZDogZGlhZ1xuICAgICAgLm9uICdkcmFnZW5kJywgKGQpIC0+XG4gICAgICAgIGRyYWdXaXJlLmNsYXNzZWQgJ2RyYXdpbmcnLCBmYWxzZVxuICAgICAgICBpZiBkcmFnSW5mby50b1xuICAgICAgICAgIG53ID0gZnJvbTogZHJhZ0luZm8uZnJvbSwgdG86IGRyYWdJbmZvLnRvXG4gICAgICAgICAgdW5sZXNzIG53LmZyb20gaXMgbncudG9cbiAgICAgICAgICAgIGVtaXQgJ2FkZFdpcmUnLCBudy5mcm9tLCBudy50b1xuICAgICAgICAgICAgc2NvcGUuZGF0YS53aXJlcy5wdXNoIG53XG4gICAgICAgICAgcmVkcmF3KClcblxuICAgIHJlZHJhdyA9IChjYikgLT5cbiAgICAgIGxhc3RnID0gcHJlcGFyZURhdGEgc2NvcGUuZGVmcywgc2NvcGUuZGF0YVxuICAgICAgZ2FkZ2V0cyA9IHN2Zy5zZWxlY3RBbGwoJy5nYWRnZXQnKS5kYXRhIHNjb3BlLmRhdGEuZ2FkZ2V0cywgKGQpIC0+IGQuaWRcbiAgICAgIHdpcmVzID0gc3ZnLnNlbGVjdEFsbCgnLndpcmUnKS5kYXRhIHNjb3BlLmRhdGEud2lyZXMsIChkKSAtPlxuICAgICAgICAgICAgICAgIFwiI3tkLmZyb219LyN7ZC50b31cIiAjIGVzc2VudGlhbCBmb3IgYWRkaW5nIG9yIHJlbW92aW5nIHdpcmVzXG5cbiAgICAgIGcgPSBnYWRnZXRzLmVudGVyKCkuYXBwZW5kKCdnJykuY2FsbChnYWRnZXREcmFnKVxuICAgICAgICAuYXR0ciBjbGFzczogJ2dhZGdldCdcbiAgICAgIGcuYXBwZW5kKCdyZWN0JylcbiAgICAgICAgLmVhY2ggKGQpIC0+XG4gICAgICAgICAgZC5kZWYgPSBzY29wZS5kZWZzW2QudHlwZV1cbiAgICAgICAgICBkLmh3ID0gZC5kZWYud2lkdGggLyAyXG4gICAgICAgICAgZC5oaCA9IGQuZGVmLmhlaWdodCAvIDJcbiAgICAgICAgICBkMy5zZWxlY3QoQCkuYXR0clxuICAgICAgICAgICAgY2xhc3M6ICdvdXRsaW5lJ1xuICAgICAgICAgICAgIyAxcHggbGluZXMgcmVuZGVyIHNoYXJwbHkgd2hlbiBvbiBhIDAuNXB4IG9mZnNldFxuICAgICAgICAgICAgeDogMC41IC0gZC5odywgeTogMC41IC0gZC5oaFxuICAgICAgICAgICAgd2lkdGg6IDIgKiBkLmh3LCBoZWlnaHQ6IDIgKiBkLmhoXG4gICAgICAgIC5vbiAnbW91c2Vkb3duJywgKGQpIC0+IHVwZGF0ZVNlbGVjdCBkXG4gICAgICAgIC5zdHlsZSBmaWxsOiAoZCkgLT4gZC5kZWYuc2hhZGVcbiAgICAgIGcuYXBwZW5kKCd0ZXh0JykudGV4dCAoZCkgLT4gZC50aXRsZSBvciBkLmRlZi5uYW1lXG4gICAgICAgIC5hdHRyIGNsYXNzOiAndGl0bGUnLCB5OiAoZCkgLT4gMTIgLSBkLmhoXG4gICAgICBnLmFwcGVuZCgndGV4dCcpLnRleHQgKGQpIC0+IFwiI3tkLnR5cGV9IC0gI3tkLmlkfVwiXG4gICAgICAgIC5hdHRyIGNsYXNzOiAndHlwZScsIHk6IChkKSAtPiAtNCArIGQuaGhcbiAgICAgIGcuYXBwZW5kKCd0ZXh0JykudGV4dCAoZCkgLT4gZC5kZWYuaWNvblxuICAgICAgICAuYXR0ciBjbGFzczogJ2ljb25mb250JywgeDogMCwgeTogMFxuICAgICAgZy5hcHBlbmQoJ3RleHQnKS50ZXh0IChkKSAtPiAnXFx1ZjAxNCcgIyBmYS10cmFzaC1vXG4gICAgICAgIC5hdHRyIGNsYXNzOiAnaWNvbmZvbnQnLCB4OiAoKGQpIC0+IGQuaHctOCksIHk6ICgoZCkgLT4gOC1kLmhoKVxuICAgICAgICAuc3R5bGUgJ2ZvbnQtc2l6ZSc6ICcxMnB4J1xuICAgICAgICAub24gJ21vdXNlZG93bicsIChkKSAtPlxuICAgICAgICAgIGQzLmV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgICAgIyBkZWxldGUgYWxsIGF0dGFjaGVkIHdpcmVzXG4gICAgICAgICAgc2R3ID0gc2NvcGUuZGF0YS53aXJlc1xuICAgICAgICAgIG4gPSBzZHcubGVuZ3RoXG4gICAgICAgICAgd2hpbGUgblxuICAgICAgICAgICAgdyA9IHNkd1stLW5dXG4gICAgICAgICAgICBpZiB3LmZyb20uc3BsaXQoJy4nKVswXSBpcyBkLmlkIG9yIHcudG8uc3BsaXQoJy4nKVswXSBpcyBkLmlkXG4gICAgICAgICAgICAgIGVtaXQgJ2RlbEF0dGFjaGVkJywgdy5mcm9tLCB3LnRvXG4gICAgICAgICAgICAgIHNkdy5zcGxpY2UgbiwgMVxuICAgICAgICAgIGVtaXQgJ2RlbEdhZGdldCcsIGQuaWRcbiAgICAgICAgICBmb3IgaSwgZyBvZiBzY29wZS5kYXRhLmdhZGdldHMgd2hlbiBnIGlzIGRcbiAgICAgICAgICAgIHNjb3BlLmRhdGEuZ2FkZ2V0cy5zcGxpY2UgaSwgMVxuICAgICAgICAgICAgdXBkYXRlU2VsZWN0IG51bGxcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgcmVkcmF3KClcbiAgICAgIGdhZGdldHMuZXhpdCgpLnJlbW92ZSgpXG4gICAgICAgIFxuICAgICAgcGlucyA9IGdhZGdldHMuc2VsZWN0QWxsKCcucGluJykuZGF0YSAoZCkgLT5cbiAgICAgICAgZC5jb25uID0gZm9yIHAgaW4gZC5kZWYucGluc1xuICAgICAgICAgIHg6IHAueCwgeTogcC55LCBuYW1lOiBwLm5hbWUsIGRpcjogcC5kaXIsIHBpbjogXCIje2QuaWR9LiN7cC5uYW1lfVwiXG4gICAgICBwID0gcGlucy5lbnRlcigpXG4gICAgICBwLmFwcGVuZCgnY2lyY2xlJylcbiAgICAgICAgLmF0dHIgY2xhc3M6ICdwaW4nLCBjeDogKChkKSAtPiBkLngrLjUpLCBjeTogKChkKSAtPiBkLnkrLjUpLCByOiAzXG4gICAgICBwLmFwcGVuZCgnY2lyY2xlJykuY2FsbChwaW5EcmFnKVxuICAgICAgICAuYXR0ciBjbGFzczogJ2hpdCcsIGN4OiAoKGQpIC0+IGQueCsuNSksIGN5OiAoKGQpIC0+IGQueSsuNSksIHI6IDdcbiAgICAgICAgLm9uICdtb3VzZXVwJywgKGQpIC0+IGRyYWdJbmZvLnRvID0gZC5waW5cbiAgICAgIHAuYXBwZW5kKCd0ZXh0JykudGV4dCAoZCkgLT4gZC5uYW1lXG4gICAgICAgIC5hdHRyXG4gICAgICAgICAgY2xhc3M6IChkKSAtPiBkLmRpclxuICAgICAgICAgIHg6IChkKSAtPiBpZiBkLmRpciBpcyAnaW4nIHRoZW4gZC54ICsgMTAgZWxzZSBkLnggLSAxMFxuICAgICAgICAgIHk6IChkKSAtPiBkLnkgKyA1XG4gICAgICBwaW5zLmV4aXQoKS5yZW1vdmUoKVxuXG4gICAgICB3aXJlcy5lbnRlcigpLmluc2VydCgncGF0aCcsICdnJykgIyB1c2VzIGluc2VydCB0byBtb3ZlIHRvIGJhY2sgcmlnaHQgYXdheVxuICAgICAgICAuYXR0ciBjbGFzczogJ3dpcmUnLCBmaWxsOiAnbm9uZScsIGQ6IGRpYWdcbiAgICAgICAgIyBjYW4ndCB1c2UgbW91c2VjbGljaywgc2VlXG4gICAgICAgICMgaHR0cHM6Ly9ncm91cHMuZ29vZ2xlLmNvbS9kL21zZy9kMy1qcy9nSHpPajkxWDJOQS82NUJFZjJEdVJWNEpcbiAgICAgICAgLm9uICdtb3VzZWVudGVyJywgKGQpIC0+IHdpcmVVbmRlckN1cnNvciA9IGRcbiAgICAgICAgLm9uICdtb3VzZWxlYXZlJywgKGQpIC0+IHdpcmVVbmRlckN1cnNvciA9IG51bGxcbiAgICAgIHdpcmVzLmV4aXQoKS5yZW1vdmUoKVxuXG4gICAgICBnYWRnZXRzLmF0dHIgdHJhbnNmb3JtOiAoZCkgLT4gXCJ0cmFuc2xhdGUoI3tkLnh9LCN7ZC55fSlcIlxuICAgICAgY2I/KClcbiAgICBcbiAgICByZWRyYXcoKVxuICAgIFxuICAgIHN2Zy5vbiAnbW91c2Vkb3duJywgLT5cbiAgICAgICMgcmV0dXJuICBpZiBkMy5ldmVudC5kZWZhdWx0UHJldmVudGVkXG4gICAgICB3dWMgPSB3aXJlVW5kZXJDdXJzb3JcbiAgICAgIGlmIHd1Y1xuICAgICAgICBlbWl0ICdkZWxXaXJlJywgd3VjLmZyb20sIHd1Yy50b1xuICAgICAgICBmb3IgaSwgdyBvZiBzY29wZS5kYXRhLndpcmVzIHdoZW4gdyBpcyB3dWNcbiAgICAgICAgICBzY29wZS5kYXRhLndpcmVzLnNwbGljZSBpLCAxXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgd2lyZVVuZGVyQ3Vyc29yID0gbnVsbFxuICAgICAgZWxzZVxuICAgICAgICBbeCx5XSA9IGQzLm1vdXNlIEBcbiAgICAgICAgZyA9IGlkOiBcImcjeysrbGFzdGd9XCIsIHg6IHh8MCwgeTogeXwwLCB0eXBlOiBzY29wZS50eXBlXG4gICAgICAgIGVtaXQgJ2FkZEdhZGdldCcsIGcuaWQsIGcueCwgZy55LCBnLnR5cGVcbiAgICAgICAgc2NvcGUuZGF0YS5nYWRnZXRzLnB1c2ggZ1xuICAgICAgcmVkcmF3IC0+IHVwZGF0ZVNlbGVjdCBnICMgdXBkYXRlIHNjb3BlIGFmdGVyIGcgaGFzIGJlZW4gZmlsbGVkIGluXG5cbmZpbmRQaW4gPSAobmFtZSwgZ2RhdGEpIC0+XG4gIFtnaWQscG5hbWVdID0gbmFtZS5zcGxpdCAnLidcbiAgZm9yIGcgaW4gZ2RhdGEgd2hlbiBnaWQgaXMgZy5pZFxuICAgIGZvciBwIGluIGcuZGVmLnBpbnMgd2hlbiBwbmFtZSBpcyBwLm5hbWVcbiAgICAgICMgcmV2ZXJzZXMgeCBhbmQgeSBhbmQgdXNlcyBwcm9qZWN0aW9uIHRvIGdldCBob3Jpem9udGFsIHNwbGluZXNcbiAgICAgIHJldHVybiB5OiBnLnggKyBwLnggKyAuNSwgeDogZy55ICsgcC55ICsgLjUsIGc6IGcsIHA6IHBcblxucHJlcGFyZURhdGEgPSAoZ2RlZnMsIGdkYXRhKSAtPlxuICAjIHByZS1jYWxjdWxhdGUgc2l6ZXMgYW5kIHJlbGF0aXZlIHBpbiBjb29yZGluYXRlc1xuICBmb3IgbiwgZCBvZiBnZGVmc1xuICAgIGQubmFtZSBvcj0gblxuICAgIGlucyA9IDBcbiAgICBmb3IgcCBpbiBkLnBpbnNcbiAgICAgIHAueCA9IGQud2lkdGggLyAyXG4gICAgICBpZiBwLmRpciBpcyAnaW4nXG4gICAgICAgIHAueCA9IC1wLnhcbiAgICAgICAgKytpbnNcbiAgICBvdXRzID0gZC5waW5zLmxlbmd0aCAtIGluc1xuICAgIHN0ZXAgPSAyMFxuICAgIHlJbiA9IC0gKGlucyAtIDEpICogc3RlcCAvIDJcbiAgICB5T3V0ID0gLSAob3V0cyAtIDEpICogc3RlcCAvIDJcbiAgICBmb3IgcCBpbiBkLnBpbnNcbiAgICAgIGlmIHAuZGlyIGlzICdpbidcbiAgICAgICAgcC55ID0geUluXG4gICAgICAgIHlJbiArPSBzdGVwXG4gICAgICBlbHNlXG4gICAgICAgIHAueSA9IHlPdXRcbiAgICAgICAgeU91dCArPSBzdGVwXG4gICAgZC5oZWlnaHQgPSA0MCArIHN0ZXAgKiAoaWYgaW5zID4gb3V0cyB0aGVuIGlucyBlbHNlIG91dHMpXG5cbiAgc2VxID0gMCAjIGZpbmQgdGhlIGxhcmdlc3QgXCJnPG4+XCIgaWQgdG8gaGVscCBnZW5lcmF0ZSB0aGUgbmV4dCBvbmVcbiAgZm9yIGQgaW4gZ2RhdGEuZ2FkZ2V0c1xuICAgIGlmIC9eZ1xcZCskLy50ZXN0KGQuaWQpXG4gICAgICBuID0gZC5pZC5zbGljZSgxKSB8IDAgIyBkcm9wIHRoZSBsZWFkaW5nIFwiZ1wiIGFuZCBjb252ZXJ0IHRvIGludFxuICAgICAgc2VxID0gbiAgaWYgbiA+IHNlcVxuICAgIGQuZGVmID0gZ2RlZnNbZC50eXBlXVxuICAgIGQuaHcgPSBkLmRlZi53aWR0aCAvIDJcbiAgICBkLmhoID0gZC5kZWYuaGVpZ2h0IC8gMlxuXG4gIGZvciBkIGluIGdkYXRhLndpcmVzXG4gICAgZC5zb3VyY2UgPSBmaW5kUGluIGQuZnJvbSwgZ2RhdGEuZ2FkZ2V0c1xuICAgIGQudGFyZ2V0ID0gZmluZFBpbiBkLnRvLCBnZGF0YS5nYWRnZXRzXG4gICAgXG4gIHJldHVybiBzZXFcbiJdfQ==
