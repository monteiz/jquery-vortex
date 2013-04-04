/*! jQuery Vortex 1.0.3 | by Luca Fagioli - Montezuma Interactive | http://www.apache.org/licenses/LICENSE-2.0
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
		var originalKidsSize = [];
		var speedDelay = 0;

		var children = [];

		var positionsRadiants = [];

		var settings = $.extend({
			speed : 50,
			clockwise : true,
			manualAdvance : false,
			beforeAnimation : null,
			afterAnimation : null,
			easing : 'end',
			deepFactor : 0.5,
			initialPosition : 90
		}, options || {});

		var vortexHalfHeight = vortex.height() / 2;
		var vortexHalfWidth = vortex.width() / 2;

		kids = vortex.children().css("position", "absolute");

		var positionsCount = kids.length * 12;

		var stepLength = 1;

		var radiantFactor = (positionsCount / 2) / Math.PI;

		for ( var i = 0; i < positionsCount; i++) {

			positionsRadiants[i] = (Math.PI * 2) * i / positionsCount;

		}

		var offsetPosition = 0;

		switch (settings.initialPosition) {

		case 90:

			offsetPosition = Math.PI * 1.5;
			break;

		case 0:

			offsetPosition = 0;

			break;

		case 180:

			offsetPosition = Math.PI;
			break;

		case 270:

			offsetPosition = Math.PI * 0.5;
			break;

		}

		kids
				.each(function(i) {

					originalKidsSize[i] = {
						width : $(this).width(),
						height : $(this).height()
					};

					var kidHalfHeight = $(this).height() / 2;
					var kidHalfWidth = $(this).width() / 2;

					var kidPositions = [];

					for ( var j = 0; j < positionsCount; j += 1) {

						kidPositions.push({
							top : ((1 + Math.sin(offsetPosition
									+ (j / radiantFactor))) * vortexHalfHeight)
									- kidHalfHeight,
							left : vortexHalfWidth
									* (1 + Math.cos(offsetPosition
											+ (j / radiantFactor)))
									- kidHalfWidth
						});

					}

					var positionIndex = i
							* Math.round(positionsCount / kids.length);

					kidsPositionIndexes[i] = positionIndex;

					var radiantVariable = (Math.sin(offsetPosition
							+ positionsRadiants[positionIndex]) * settings.deepFactor);
					var resizeFactor = (1 + radiantVariable);

					var newWidth = originalKidsSize[i].width * resizeFactor;
					var newHeight = originalKidsSize[i].height * resizeFactor;

					$(this)
							.css(
									{
										"width" : newWidth,
										"height" : newHeight,
										"top" : kidPositions[positionIndex].top
												- ((newHeight - (originalKidsSize[i].height)) / 2),
										"left" : kidPositions[positionIndex].left
												- ((newWidth - (originalKidsSize[i].width)) / 2),
										"z-index" : 200 + Math
												.round(100 * (Math
														.sin(offsetPosition
																+ positionsRadiants[positionIndex])))
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

			speedDelay = 0;

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

				var resizeFactor = (1 + Math.sin(offsetPosition
						+ positionsRadiants[positionIndex])
						* settings.deepFactor);

				var newWidth = originalKidsSize[kidIndex].width * resizeFactor;
				
				
				var newHeight = originalKidsSize[kidIndex].height
						* resizeFactor;

				kid
						.animate(
								{
									"left" : kidPositions[positionIndex].left
											- ((newWidth - (originalKidsSize[kidIndex].width)) / 2),
									"top" : kidPositions[positionIndex].top
											- ((newHeight - (originalKidsSize[kidIndex].height)) / 2),
									"width" : newWidth,
									"height" : newHeight,
									"z-index" : 200 + Math
											.round(100 * (Math
													.sin(offsetPosition
															+ positionsRadiants[positionIndex])))
								},
								{
									duration: settings.speed + speedDelay,
									easing: "linear",
									queue: false,
									complete: function() {

										kidsPositionIndexes[kidIndex] = positionIndex;

										if (kidIndex == kids.length - 1) {

											stepCounter--;
											
											if (stepCounter == 3) {
												
												speedDelay = settings.speed * 2;
												
											}

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