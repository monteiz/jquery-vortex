/*! jQuery Vortex 1.0.2 | by Luca Fagioli - Montezuma Interactive | http://www.apache.org/licenses/LICENSE-2.0
 */

(function($) {
	var Vortex = function(element, options) {
		var kids;
		var animationIntervalId = 0;
		var isAnimating = false;
		var vortex = $(element);
		var positions = [];
		var kidsPositionIndexes = [];
		var vortexInstance = this;
		var stepCounter = -1;
		var initialPositions = [];
		var reset = false;

		var children = [];

		var settings = $.extend({
			speed : 50,
			clockwise : true,
			manualAdvance : false,
			beforeAnimation : null,
			afterAnimation : null,
			easing : 'end',
		}, options || {});

		var vortexHalfHeight = vortex.height() / 2;
		var vortexHalfWidth = vortex.width() / 2;

		var vars = {
			currentChild : '',
			totalChildren : 0,
			checkRadians : new Array(),
			radians : 0
		};

		kids = vortex.children().css("position", "absolute");

		var positionsCount = kids.length * 4;

		var stepLength = 1;

		kids.each(function(i) {

			vars.totalChildren++;

		});

		vars.radians = (Math.PI * 2 / vars.totalChildren);

		var radiantFactor = (positionsCount / 2) / Math.PI;

		kids
				.each(function(i) {

					var kidHalfHeight = $(this).height() / 2;
					var kidHalfWidth = $(this).width() / 2;

					var kidPositions = [];

					for ( var j = 0; j < positionsCount; j += 1) {

						kidPositions
								.push({
									top : ((1 + Math.sin(Math.PI
											+ (j / radiantFactor))) * vortexHalfHeight)
											- kidHalfHeight,
									left : vortexHalfWidth
											* (1 + Math.cos(j / radiantFactor))
											- kidHalfWidth
								});

					}

					var positionIndex = i
							* Math.round(positionsCount / kids.length);

					kidsPositionIndexes[i] = positionIndex;

					$(this).css({
						top : kidPositions[positionIndex].top,
						left : kidPositions[positionIndex].left
					});

					initialPositions[i] = positionIndex;

					positions.push(kidPositions);

				});

		this.stop = function() {

			clearInterval(animationIntervalId);
			kids.stop();

			setAnimating(false);

		};

		this.setClockwise = function(clockwise) {

			settings.clockwise = clockwise;

			if (isAnimating) {
				this.start();
			}

		};

		var setAnimating = function(animating) {

			isAnimating = animating;

			if (isAnimating === true) {

				vortex.addClass("vortex-animating");

				if (settings.beforeAnimation) {
					if (settings.beforeAnimation.call() === false)
						return false;
				}

			} else {

				vortex.removeClass("vortex-animating");

				if (settings.afterAnimation)
					settings.afterAnimation.call(null, $(this));

			}

		};

		this.isAnimating = function() {

			return isAnimating;

		};

		this.reset = function() {

			if (kidsPositionIndexes[0] == initialPositions[0])
				return;

			reset = true;

			this.start();

		};

		this.start = function(repetitions) {

			this.stop();

			setAnimating(true);

			var positionStep;

			if (settings.clockwise === true) {
				positionStep = -stepLength;
			} else {
				positionStep = stepLength;
			}

			var startAnimation = function(kid, kidIndex) {

				var kidPositions = positions[kidIndex];

				var positionIndex = (kidsPositionIndexes[kidIndex] + positionStep);

				if (positionIndex < 0)
					positionIndex = positionsCount - Math.abs(positionStep);

				if (positionIndex > positionsCount - 1)
					positionIndex = 0;

				kid
						.animate(
								{
									"left" : kidPositions[positionIndex].left,
									"top" : kidPositions[positionIndex].top
								},
								settings.speed,
								"linear",
								function() {
									
									kidsPositionIndexes[kidIndex] = positionIndex;
									
									if (kidIndex == kids.length - 1) {

										stepCounter--;

									}

									if (vortexInstance.isAnimating()) {

										if (reset == false
												|| initialPositions[kidIndex] != positionIndex) {

											if (stepCounter == 0) {

												vortexInstance.stop();
												stepCounter = -1;
												return;

											}

											startAnimation(kid, kidIndex);

										} else {

											if (kidIndex == kids.length - 1) {

												vortexInstance.stop();
												reset = false;

											}

										}

									}

								});

				

			};

			kids.each(function(i) {
				startAnimation($(this), i);
			});

		};

		this.setSpeed = function(speed) {

			settings.speed = speed;

			if (isAnimating) {
				this.start();
			}

		};

		if (!settings.manualAdvance) {
			this.start();
		}

		this.step = function(steps) {

			stepCounter = (steps * positionsCount / kids.length);
			this.start();

			return;

		};

	};

	$.fn.vortex = function(options) {
		return this.each(function() {
			var element = $(this);

			if (element.data('vortex'))
				return;

			var vortex = new Vortex(this, options);

			element.data('vortex', vortex);
		});
	};
})(jQuery);
