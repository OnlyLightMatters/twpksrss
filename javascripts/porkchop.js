// Generated by CoffeeScript 1.3.3
(function() {
  var PLOT_HEIGHT, PLOT_WIDTH, PLOT_X_OFFSET, TIC_LENGTH, canvasContext, clamp, deltaVs, departureOrbit, destinationOrbit, distanceString, durationString, earliestArrival, earliestDeparture, hourMinSec, i, kerbalDateString, numberWithCommas, palette, plotImageData, prepareCanvas, worker, xScale, yScale, _i, _j, _k, _l;

  PLOT_WIDTH = 300;

  PLOT_HEIGHT = 300;

  PLOT_X_OFFSET = 70;

  TIC_LENGTH = 5;

  clamp = function(n, min, max) {
    return Math.max(min, Math.min(n, max));
  };

  numberWithCommas = function(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  hourMinSec = function(t) {
    var hour, min, sec;
    hour = (t / 3600) | 0;
    t %= 3600;
    min = (t / 60) | 0;
    if (min < 10) {
      min = "0" + min;
    }
    sec = (t % 60).toFixed();
    if (sec < 10) {
      sec = "0" + sec;
    }
    return "" + hour + ":" + min + ":" + sec;
  };

  kerbalDateString = function(t) {
    var day, year;
    year = ((t / (365 * 24 * 3600)) | 0) + 1;
    t %= 365 * 24 * 3600;
    day = ((t / (24 * 3600)) | 0) + 1;
    t %= 24 * 3600;
    return "Year " + year + ", day " + day + " at " + (hourMinSec(t));
  };

  durationString = function(t) {
    var result;
    result = "";
    if (t >= 365 * 24 * 3600) {
      result += (t / (365 * 24 * 3600) | 0) + " years ";
      t %= 365 * 24 * 3600;
      if (t < 24 * 3600) {
        result += "0d";
      }
    }
    if (t >= 24 * 3600) {
      result += (t / (24 * 3600) | 0) + " days ";
    }
    t %= 24 * 3600;
    return result + hourMinSec(t);
  };

  distanceString = function(d) {
    if (d > 1e12) {
      return numberWithCommas((d / 1e9).toFixed()) + " Gm";
    } else if (d >= 1e9) {
      return numberWithCommas((d / 1e6).toFixed()) + " Mm";
    } else if (d >= 1e6) {
      return numberWithCommas((d / 1e3).toFixed()) + " km";
    } else {
      return numberWithCommas(d.toFixed()) + " m";
    }
  };

  canvasContext = null;

  plotImageData = null;

  departureOrbit = null;

  destinationOrbit = null;

  earliestDeparture = null;

  earliestArrival = null;

  xScale = null;

  yScale = null;

  deltaVs = null;

  palette = [];

  for (i = _i = 128; _i <= 255; i = ++_i) {
    palette.push([128, i, 255]);
  }

  for (i = _j = 255; _j >= 128; i = --_j) {
    palette.push([128, 255, i]);
  }

  for (i = _k = 128; _k <= 255; i = ++_k) {
    palette.push([i, 255, 128]);
  }

  for (i = _l = 255; _l >= 128; i = --_l) {
    palette.push([255, i, 128]);
  }

  worker = new Worker("javascripts/porkchopworker.js");

  worker.onmessage = function(event) {
    var color, colorIndex, ctx, deltaV, j, maxDeltaV, minDeltaV, relativeDeltaV, x, y, _m, _n, _o;
    if ('progress' in event.data) {
      return $('#porkchopProgress .bar').show().width((event.data.progress * 100 | 0) + "%");
    } else if ('deltaVs' in event.data) {
      $('#porkchopProgress .bar').hide().width("0%");
      deltaVs = new Float64Array(event.data.deltaVs);
      minDeltaV = event.data.minDeltaV;
      maxDeltaV = 4 * minDeltaV;
      i = 0;
      j = 0;
      for (y = _m = 0; 0 <= PLOT_HEIGHT ? _m < PLOT_HEIGHT : _m > PLOT_HEIGHT; y = 0 <= PLOT_HEIGHT ? ++_m : --_m) {
        for (x = _n = 0; 0 <= PLOT_WIDTH ? _n < PLOT_WIDTH : _n > PLOT_WIDTH; x = 0 <= PLOT_WIDTH ? ++_n : --_n) {
          deltaV = deltaVs[i++];
          relativeDeltaV = isNaN(deltaV) ? 1.0 : (clamp(deltaV, minDeltaV, maxDeltaV) - minDeltaV) / (maxDeltaV - minDeltaV);
          colorIndex = Math.min(relativeDeltaV * palette.length | 0, palette.length - 1);
          color = palette[colorIndex];
          plotImageData.data[j++] = color[0];
          plotImageData.data[j++] = color[1];
          plotImageData.data[j++] = color[2];
          plotImageData.data[j++] = 255;
        }
      }
      ctx = canvasContext;
      ctx.save();
      ctx.putImageData(plotImageData, PLOT_X_OFFSET, 0);
      ctx.font = '10pt "Helvetic Neue",Helvetica,Arial,sans serif';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'black';
      ctx.textBaseline = 'alphabetic';
      for (i = _o = 0; 0 <= 1.0 ? _o < 1.0 : _o > 1.0; i = _o += 0.25) {
        ctx.fillText(((minDeltaV + i * (maxDeltaV - minDeltaV)) | 0) + " m/s", PLOT_X_OFFSET + PLOT_WIDTH + 85, (1.0 - i) * PLOT_HEIGHT);
        ctx.textBaseline = 'middle';
      }
      ctx.textBaseline = 'top';
      ctx.fillText((maxDeltaV | 0) + " m/s", PLOT_X_OFFSET + PLOT_WIDTH + 85, 0);
      ctx.restore();
      return $('#porkchopSubmit').prop('disabled', false);
    }
  };

  prepareCanvas = function() {
    var ctx, j, paletteKey, x, y, _m, _n, _o, _p;
    ctx = canvasContext;
    ctx.save();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.moveTo(PLOT_X_OFFSET - 1, 0);
    ctx.lineTo(PLOT_X_OFFSET - 1, PLOT_HEIGHT + 1);
    ctx.lineTo(PLOT_X_OFFSET + PLOT_WIDTH, PLOT_HEIGHT + 1);
    ctx.stroke();
    ctx.beginPath();
    for (i = _m = 0; 0 <= 1.0 ? _m <= 1.0 : _m >= 1.0; i = _m += 0.25) {
      y = PLOT_HEIGHT * i + 1;
      ctx.moveTo(PLOT_X_OFFSET - 1, y);
      ctx.lineTo(PLOT_X_OFFSET - 1 - TIC_LENGTH, y);
      x = PLOT_X_OFFSET - 1 + PLOT_WIDTH * i;
      ctx.moveTo(x, PLOT_HEIGHT + 1);
      ctx.lineTo(x, PLOT_HEIGHT + 1 + TIC_LENGTH);
    }
    ctx.stroke();
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for (i = _n = 0; 0 <= 1.0 ? _n <= 1.0 : _n >= 1.0; i = _n += 0.05) {
      if (i % 0.25 === 0) {
        continue;
      }
      y = PLOT_HEIGHT * i + 1;
      ctx.moveTo(PLOT_X_OFFSET - 1, y);
      ctx.lineTo(PLOT_X_OFFSET - 1 - TIC_LENGTH, y);
      x = PLOT_X_OFFSET - 1 + PLOT_WIDTH * i;
      ctx.moveTo(x, PLOT_HEIGHT + 1);
      ctx.lineTo(x, PLOT_HEIGHT + 1 + TIC_LENGTH);
    }
    ctx.stroke();
    ctx.font = 'italic 12pt "Helvetic Neue",Helvetica,Arial,sans serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'black';
    ctx.fillText("Departure Date (days from epoch)", PLOT_X_OFFSET + PLOT_WIDTH / 2, PLOT_HEIGHT + 40);
    ctx.save();
    ctx.rotate(-Math.PI / 2);
    ctx.textBaseline = 'top';
    ctx.fillText("Arrival Date (days from epoch)", -PLOT_HEIGHT / 2, 0);
    ctx.restore();
    paletteKey = ctx.createImageData(20, PLOT_HEIGHT);
    i = 0;
    for (y = _o = 0; 0 <= PLOT_HEIGHT ? _o < PLOT_HEIGHT : _o > PLOT_HEIGHT; y = 0 <= PLOT_HEIGHT ? ++_o : --_o) {
      j = ((PLOT_HEIGHT - y - 1) * palette.length / PLOT_HEIGHT) | 0;
      for (x = _p = 0; _p < 20; x = ++_p) {
        paletteKey.data[i++] = palette[j][0];
        paletteKey.data[i++] = palette[j][1];
        paletteKey.data[i++] = palette[j][2];
        paletteKey.data[i++] = 255;
      }
    }
    ctx.putImageData(paletteKey, PLOT_X_OFFSET + PLOT_WIDTH + 60, 0);
    ctx.fillText(String.fromCharCode(0x2206) + "v", PLOT_X_OFFSET + PLOT_WIDTH + 45, PLOT_HEIGHT / 2);
    return ctx.restore();
  };

  $(document).ready(function() {
    canvasContext = $('#porkchopCanvas')[0].getContext('2d');
    plotImageData = canvasContext.createImageData(PLOT_WIDTH, PLOT_HEIGHT);
    prepareCanvas();
    $('#porkchopCanvas').mousemove(function(event) {
      var ctx, deltaV, tip, x, y;
      if (deltaVs != null) {
        x = event.offsetX - PLOT_X_OFFSET;
        y = event.offsetY;
        ctx = canvasContext;
        ctx.putImageData(plotImageData, PLOT_X_OFFSET, 0);
        if (x >= 0 && x < PLOT_WIDTH && y < PLOT_HEIGHT) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(PLOT_X_OFFSET + x, 0);
          ctx.lineTo(PLOT_X_OFFSET + x, PLOT_HEIGHT);
          ctx.moveTo(PLOT_X_OFFSET, y);
          ctx.lineTo(PLOT_X_OFFSET + PLOT_WIDTH, y);
          ctx.lineWidth = 1;
          ctx.strokeStyle = 'rgba(255,255,255,0.75)';
          ctx.stroke();
          deltaV = deltaVs[(y * PLOT_WIDTH + x) | 0];
          if (!isNaN(deltaV)) {
            tip = " " + String.fromCharCode(0x2206) + "v = " + deltaV.toFixed() + " m/s ";
            ctx.font = '10pt "Helvetic Neue",Helvetica,Arial,sans serif';
            ctx.fillStyle = 'black';
            ctx.textAlign = x < PLOT_WIDTH - 100 ? 'left' : 'right';
            ctx.textBaseline = y > 15 ? 'bottom' : 'top';
            ctx.fillText(tip, event.offsetX, event.offsetY);
          }
          return ctx.restore();
        }
      }
    });
    $('#porkchopCanvas').mouseleave(function(event) {
      if (deltaVs != null) {
        return canvasContext.putImageData(plotImageData, PLOT_X_OFFSET, 0);
      }
    });
    $('#porkchopCanvas').click(function(event) {
      var cosTransferAngle, departurePosition, departureVelocity, destinationPosition, destinationVelocity, dt, ejectionDeltaV, ejectionVelocity, insertionDeltaV, insertionVelocity, longEjectionDeltaV, longInsertionDeltaV, longWayTransferVelocities, nu, referenceBody, shortEjectionDeltaV, shortInsertionDeltaV, shortWayTransferVelocities, t0, t1, totalDeltaV, transferAngle, transferOrbit, x, y;
      if (deltaVs != null) {
        x = event.offsetX - PLOT_X_OFFSET;
        y = event.offsetY;
        if (x >= 0 && x < PLOT_WIDTH && y < PLOT_HEIGHT) {
          referenceBody = departureOrbit.referenceBody;
          t0 = earliestDeparture + x * xScale / PLOT_WIDTH;
          t1 = earliestArrival + ((PLOT_HEIGHT - 1) - y) * yScale / PLOT_HEIGHT;
          dt = t1 - t0;
          nu = departureOrbit.trueAnomalyAt(t0);
          departurePosition = departureOrbit.positionAtTrueAnomaly(nu);
          departureVelocity = departureOrbit.velocityAtTrueAnomaly(nu);
          nu = destinationOrbit.trueAnomalyAt(t1);
          destinationPosition = destinationOrbit.positionAtTrueAnomaly(nu);
          destinationVelocity = destinationOrbit.velocityAtTrueAnomaly(nu);
          cosTransferAngle = numeric.dot(departurePosition, destinationPosition) / (numeric.norm2(departurePosition) * numeric.norm2(destinationPosition));
          shortWayTransferVelocities = Orbit.transferVelocities(referenceBody, departurePosition, destinationPosition, dt, false);
          longWayTransferVelocities = Orbit.transferVelocities(referenceBody, departurePosition, destinationPosition, dt, true);
          shortEjectionDeltaV = numeric.norm2(numeric.subVV(shortWayTransferVelocities[0], departureVelocity));
          shortInsertionDeltaV = numeric.norm2(numeric.subVV(destinationVelocity, shortWayTransferVelocities[1]));
          longEjectionDeltaV = numeric.norm2(numeric.subVV(longWayTransferVelocities[0], departureVelocity));
          longInsertionDeltaV = numeric.norm2(numeric.subVV(destinationVelocity, longWayTransferVelocities[1]));
          if (shortEjectionDeltaV + shortInsertionDeltaV <= longEjectionDeltaV + longInsertionDeltaV) {
            transferAngle = Math.acos(cosTransferAngle);
            ejectionVelocity = shortWayTransferVelocities[0];
            insertionVelocity = shortWayTransferVelocities[1];
            ejectionDeltaV = shortEjectionDeltaV;
            insertionDeltaV = shortInsertionDeltaV;
            totalDeltaV = ejectionDeltaV + insertionDeltaV;
          } else {
            transferAngle = 2 * Math.PI - Math.acos(cosTransferAngle);
            ejectionVelocity = longWayTransferVelocities[0];
            insertionVelocity = longWayTransferVelocities[1];
            ejectionDeltaV = longEjectionDeltaV;
            insertionDeltaV = longInsertionDeltaV;
          }
          transferOrbit = Orbit.fromPositionAndVelocity(referenceBody, departurePosition, ejectionVelocity, t0);
          totalDeltaV = ejectionDeltaV + insertionDeltaV;
          $('#departureTime').text(kerbalDateString(t0));
          $('#arrivalTime').text(kerbalDateString(t1));
          $('#timeOfFlight').text(durationString(t1 - t0));
          $('#transferPeriapsis').text(distanceString(transferOrbit.periapsis()));
          $('#transferApoapsis').text(distanceString(transferOrbit.apoapsis()));
          $('#transferAngle').text((transferAngle * 180 / Math.PI).toFixed() + String.fromCharCode(0x00b0));
          $('#ejectionAngle').text(String.fromCharCode(0x00b0));
          $('#ejectionInclination').text(String.fromCharCode(0x00b0));
          $('#ejectionDeltaV').text(numberWithCommas(ejectionDeltaV.toFixed()) + " m/s");
          $('#insertionDeltaV').text(numberWithCommas(insertionDeltaV.toFixed()) + " m/s");
          return $('#totalDeltaV').text(numberWithCommas(totalDeltaV.toFixed()) + " m/s");
        }
      }
    });
    $('#originSelect').change(function(event) {
      var k, origin, previousDestination, referenceBody, s, v, _ref;
      origin = CelestialBody[$(this).val()];
      referenceBody = origin.orbit.referenceBody;
      s = $('#destinationSelect');
      previousDestination = s.val();
      s.empty();
      for (k in CelestialBody) {
        v = CelestialBody[k];
        if (v !== origin && (v != null ? (_ref = v.orbit) != null ? _ref.referenceBody : void 0 : void 0) === referenceBody) {
          s.append($('<option>').text(k));
        }
      }
      s.val(previousDestination);
      if (s.val() == null) {
        s.val($('option:first', s).val());
      }
      return s.prop('disabled', s[0].childNodes.length === 0);
    });
    $('#originSelect').change();
    $('#destinationSelect').val('Duna');
    return $('#porkchopForm').submit(function(event) {
      var ctx, hohmannTransfer, _m, _n;
      event.preventDefault();
      $('#porkchopSubmit').prop('disabled', true);
      departureOrbit = CelestialBody[$('#originSelect').val()].orbit;
      destinationOrbit = CelestialBody[$('#destinationSelect').val()].orbit;
      earliestDeparture = ($('#earliestDepartureYear').val() - 1) * 365 + ($('#earliestDepartureDay').val() - 1);
      earliestDeparture *= 24 * 3600;
      earliestArrival = ($('#earliestArrivalYear').val() - 1) * 365 + ($('#earliestArrivalDay').val() - 1);
      earliestArrival *= 24 * 3600;
      hohmannTransfer = Orbit.fromApoapsisAndPeriapsis(departureOrbit.referenceBody, destinationOrbit.semiMajorAxis, departureOrbit.semiMajorAxis, 0, 0, 0, 0);
      earliestArrival = earliestDeparture + hohmannTransfer.period() / 4;
      xScale = 2 * Math.min(departureOrbit.period(), destinationOrbit.period());
      if (destinationOrbit.semiMajorAxis < departureOrbit.semiMajorAxis) {
        yScale = 2 * destinationOrbit.period();
      } else {
        yScale = hohmannTransfer.period();
      }
      ctx = canvasContext;
      ctx.clearRect(PLOT_X_OFFSET, 0, PLOT_WIDTH, PLOT_HEIGHT);
      ctx.clearRect(PLOT_X_OFFSET + PLOT_WIDTH + 85, 0, 65, PLOT_HEIGHT + 10);
      ctx.clearRect(20, 0, PLOT_X_OFFSET - TIC_LENGTH - 21, PLOT_HEIGHT + TIC_LENGTH);
      ctx.clearRect(PLOT_X_OFFSET - 40, PLOT_HEIGHT + TIC_LENGTH, PLOT_WIDTH + 80, 20);
      ctx.font = '10pt "Helvetic Neue",Helvetica,Arial,sans serif';
      ctx.fillStyle = 'black';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      for (i = _m = 0; 0 <= 1.0 ? _m <= 1.0 : _m >= 1.0; i = _m += 0.25) {
        if (i === 1.0) {
          ctx.textBaseline = 'top';
        }
        ctx.fillText(((earliestArrival + i * yScale) / 3600 / 24) | 0, PLOT_X_OFFSET - TIC_LENGTH - 3, (1.0 - i) * PLOT_HEIGHT);
      }
      ctx.textAlign = 'center';
      for (i = _n = 0; 0 <= 1.0 ? _n <= 1.0 : _n >= 1.0; i = _n += 0.25) {
        ctx.fillText(((earliestDeparture + i * xScale) / 3600 / 24) | 0, PLOT_X_OFFSET + i * PLOT_WIDTH, PLOT_HEIGHT + TIC_LENGTH + 3);
      }
      deltaVs = null;
      return worker.postMessage({
        departureOrbit: departureOrbit,
        destinationOrbit: destinationOrbit,
        earliestDeparture: earliestDeparture,
        xScale: xScale,
        earliestArrival: earliestArrival,
        yScale: yScale
      });
    });
  });

}).call(this);
