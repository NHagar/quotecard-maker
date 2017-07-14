// DOM elements
var $save;
var $textColor;
var $font;
var $logo;
var $crop;
var $imageLoader;
var $canvas;
var canvas;
var $qualityQuestions;
var $dragHelp;
var $filename;
var $fileinput;
var $customFilename;
var $quote;
var $speaker;
var $quoteSize;
var $sourceSize;
var $overlay;
var $opacity;

// Constants
var IS_MOBILE = Modernizr.touch && Modernizr.mq('screen and max-width(700px)');
var MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

// state
var scaledImageHeight;
var scaledImageWidth;
var previewScale = IS_MOBILE ? 0.32 : 0.64;
var dy = 0;
var dx = 0;
var image;
var imageFilename = 'image';
var shallowImage = false;


// JS objects
var ctx;
var img = new Image();
var logo = new Image();


var onDocumentLoad = function(e) {
    $canvas = $('#imageCanvas');
    canvas = $canvas[0];
    $imageLoader = $('#imageLoader');
    ctx = canvas.getContext('2d');
    $save = $('.save-btn');
    $textColor = $('input[name="textColor"]');
    $crop = $('input[name="crop"]');
    $qualityQuestions = $('.quality-question');
    $dragHelp = $('.drag-help');
    $filename = $('.fileinput-filename');
    $fileinput = $('.fileinput');
    $customFilename = $('.custom-filename');
    $logosWrapper = $('.logos-wrapper');
    $quote = $('input[name="quote"]');
    $speaker = $('input[name="speaker"]');
    $quoteSize = $('input[name="quoteSize"]');
    $sourceSize = $('input[name="sourceSize"]');
    $overlay = $('input[name="overlayColor"]');
    $opacity = $('input[name="opacity"]');
    $font = $('input[name="font"]');

    img.src = defaultImage;
    img.onload = onImageLoad;
    logo.src = defaultLogo;
    logo.onload = renderCanvas;

    $imageLoader.on('change', handleImage);
    $save.on('click', onSaveClick);
    $textColor.on('change', onTextColorChange);
    $crop.on('change', onCropChange);
    $canvas.on('mousedown touchstart', onDrag);
    $customFilename.on('click', function(e) {
        e.stopPropagation();
    });
    $quote.on('keyup', renderCanvas);
    $speaker.on('keyup', renderCanvas);
    $quoteSize.on('input', renderCanvas);
    $sourceSize.on('input', renderCanvas);
    $overlay.on('keyup', renderCanvas);
    $opacity.on('input', renderCanvas);
    $font.on('change', onFontChange);

    $("body").on("contextmenu", "canvas", function(e) {
        return false;
    });

    $(window).on('resize', resizeCanvas);
    resizeCanvas();
    buildForm();
};

var resizeCanvas = function() {
    var scale = $('.canvas-cell').width() / canvasWidth;
    $canvas.css({
        'webkitTransform': 'scale(' + scale + ')',
        'MozTransform': 'scale(' + scale + ')',
        'msTransform': 'scale(' + scale + ')',
        'OTransform': 'scale(' + scale + ')',
        'transform': 'scale(' + scale + ')'
    });
    renderCanvas();
};

var buildForm = function() {
    var logoKeys = Object.keys(logos);

    if (logoKeys.length > 1) {
        $logosWrapper.append('<div class="btn-group btn-group-justified btn-group-sm logos" data-toggle="buttons"></div>');
        var $logos = $('.logos');
        for (var j = 0; j < logoKeys.length; j++) {
            var key = logoKeys[j];
            var display = logos[key].display;
            $logos.append('<label class="btn btn-primary"><input type="radio" name="logo" id="' + key + '" value="' + key + '">' + display + '</label>');
            if (key === currentLogo) {
                $('#' + key).attr('checked', true);
                $('#' + key).parent('.btn').addClass('active');
            }
        }
        $logo = $('input[name="logo"]');
        $logo.on('change', onLogoChange);
    } else {
        $logosWrapper.hide();
    }
};


/*
* Draw the image, then the logo, then the text
*/
var renderCanvas = function() {
    // canvas is always the same width
    canvas.width = canvasWidth;

    // if we're cropping, use the aspect ratio for the height
    if (currentCrop !== 'original') {
        canvas.height = canvasWidth / (16/9);
    }

    // clear the canvas
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // determine height of canvas and scaled image, then draw the image
    var imageAspect = img.width / img.height;

    if (currentCrop === 'original') {
        canvas.height = canvasWidth / imageAspect;
        scaledImageHeight = canvas.height;
        ctx.drawImage(
            img,
            0,
            0,
            canvasWidth,
            scaledImageHeight
        );
    } else {
        if (img.width / img.height > canvas.width / canvas.height) {
            shallowImage = true;

            scaledImageHeight = canvasWidth / imageAspect;
            scaledImageWidth = canvas.height * (img.width / img.height);
            ctx.drawImage(
                img,
                0,
                0,
                img.width,
                img.height,
                dx,
                dy,
                scaledImageWidth,
                canvas.height
            );
        } else {
            shallowImage = false;

            scaledImageHeight = canvasWidth / imageAspect;
            ctx.drawImage(
                img,
                0,
                0,
                img.width,
                img.height,
                dx,
                dy,
                canvasWidth,
                scaledImageHeight
            );
        }
    }

    ctx.globalAlpha = $opacity.val();
    ctx.fillStyle = $overlay.val();
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // set alpha channel, draw the logo
    ctx.globalAlpha = 1;
    ctx.drawImage(
        logo,
        canvas.width - 130,
        canvas.height - 130,
        logos[currentLogo].w,
        logos[currentLogo].h
    );

    // reset alpha channel so text is not translucent
    ctx.globalAlpha = "1";

    // draw the text
    ctx.fillStyle = currentTextColor;

    /*if (currentTextColor === 'white') {
        ctx.shadowColor = fontShadow;
        ctx.shadowOffsetX = fontShadowOffsetX;
        ctx.shadowOffsetY = fontShadowOffsetY;
        ctx.shadowBlur = fontShadowBlur;
    }*/


    function drawtext(text, size, x, y, f, baseline, maxWidth) {
      ctx.font= size + "px " + f;
      ctx.textBaseline = baseline;
      var words = text.split(' ');
      var line = '';

      for(var n = 0; n < words.length; n++) {
        var testLine = line + words[n] + ' ';
        var metrics = ctx.measureText(testLine);
        var testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line, x, y);
          line = words[n] + ' ';
          y += size * 1.2;
        }
        else {
          line = testLine;
        }
      }
      ctx.fillText(line, x, y);
    }

    var qWidth = 70;
    var qHeight = 60;

    drawtext($quote.val(), $quoteSize.val(), qWidth, qHeight, currentFont, 'top', 850);
    drawtext($speaker.val(), $sourceSize.val(), qWidth, canvas.height - 70, currentFont, 'middle', 1000);
};





/*
* Handle dragging the image for crops when applicable
*/
var onDrag = function(e) {
    e.preventDefault();
    var originY = e.clientY||e.originalEvent.targetTouches[0].clientY;
    originY = originY/previewScale;

    var originX = e.clientX||e.originalEvent.targetTouches[0].clientX;
    originX = originX/previewScale;

    var startY = dy;
    var startX = dx;

    if (currentCrop === 'original') {
        return;
    }

    function update(e) {
        var dragY = e.clientY||e.originalEvent.targetTouches[0].clientY;
        dragY = dragY/previewScale;

        var dragX = e.clientX||e.originalEvent.targetTouches[0].clientX;
        dragX = dragX/previewScale;

        if (shallowImage === false) {
            if (Math.abs(dragY - originY) > 1) {
                dy = startY - (originY - dragY);

                // Prevent dragging image below upper bound
                if (dy > 0) {
                    dy = 0;
                    return;
                }

                // Prevent dragging image above lower bound
                if (dy < canvas.height - scaledImageHeight) {
                    dy = canvas.height - scaledImageHeight;
                    return;
                }
                renderCanvas();
            }
        } else {
            if (Math.abs(dragX - originX) > 1) {
                dx = startX - (originX - dragX);

                // Prevent dragging image below left bound
                if (dx > 0) {
                    dx = 0;
                    return;
                }

                // Prevent dragging image above right bound
                if (dx < canvas.width - scaledImageWidth) {
                    dx = canvas.width - scaledImageWidth;
                    return;
                }
                renderCanvas();
            }
        }


    }

    // Perform drag sequence:
    $(document).on('mousemove.drag touchmove', _.debounce(update, 5, true))
        .on('mouseup.drag touchend', function(e) {
            $(document).off('mouseup.drag touchmove mousemove.drag');
            update(e);
        });
};

/*
* Take an image from file input and load it
*/
var handleImage = function(e) {
    var reader = new FileReader();
    reader.onload = function(e){
        // reset dy value
        dy = 0;
        dx = 0;

        image = e.target.result;
        imageFilename = $('.fileinput-filename').text().split('.')[0];
        img.src = image;
        $customFilename.text(imageFilename);
        $customFilename.parents('.form-group').addClass('has-file');
    };
    reader.readAsDataURL(e.target.files[0]);
};

/*
* Set dragging status based on image aspect ratio and render canvas
*/
var onImageLoad = function(e) {
    renderCanvas();
    onCropChange();
};

/*
* Load the logo based on radio buttons
*/
var loadLogo = function() {
    logo.src = logos[currentLogo].path;
};



/*
* Download the image on save click
*/
var onSaveClick = function(e) {
    e.preventDefault();

    /// create an "off-screen" anchor tag
    var link = document.createElement('a');


    /// the key here is to set the download attribute of the a tag
    if ($customFilename.text()) {
        imageFilename = $customFilename.text();
    }

    link.download =  'quotecard-' + imageFilename + '.png';

    /// convert canvas content to data-uri for link. When download
    /// attribute is set the content pointed to by link will be
    /// pushed as "download" in HTML5 capable browsers
    link.href = canvas.toDataURL();
    link.target = "_blank";

    /// create a "fake" click-event to trigger the download
    if (document.createEvent) {

        e = document.createEvent("MouseEvents");
        e.initMouseEvent("click", true, true, window,
                         0, 0, 0, 0, 0, false, false, false,
                         false, 0, null);

        link.dispatchEvent(e);

    } else if (link.fireEvent) {
        link.fireEvent("onclick");
    }
};



/*
* Handle text color radio button clicks
*/
var onTextColorChange = function(e) {
    currentTextColor = $(this).val();
    renderCanvas();
};

/*
Handle font radio button clicks
*/
var onFontChange = function(e) {
  currentFont = $(this).val();
  renderCanvas();
};

/*
* Handle logo radio button clicks
*/
var onLogoChange = function(e) {
    currentLogo = $(this).val();

    loadLogo();
    renderCanvas();
};

/*
* Handle crop radio button clicks
*/
var onCropChange = function() {
    currentCrop = $crop.filter(':checked').val();

    if (currentCrop !== 'original') {
        var dragClass = shallowImage ? 'is-draggable shallow' : 'is-draggable';
        $canvas.addClass(dragClass);
        $dragHelp.show();
    } else {
        $canvas.removeClass('is-draggable shallow');
        $dragHelp.hide();
    }
    renderCanvas();
};

/*
* Show the appropriate fields based on the chosen copyright
*/
var onCopyrightChange = function() {
    currentCopyright = $copyrightHolder.val();
    $photographer.parents('.form-group').removeClass('has-warning');
    $source.parents('.form-group').removeClass('has-warning');

    if (copyrightOptions[currentCopyright]) {
        if (copyrightOptions[currentCopyright].showPhotographer) {
            $photographer.parents('.form-group').slideDown();
            if (copyrightOptions[currentCopyright].photographerRequired) {
                $photographer.parents('.form-group').addClass('has-warning required');
            } else {
                $photographer.parents('.form-group').removeClass('required');
            }
        } else {
            $photographer.parents('.form-group').slideUp();
        }

        if (copyrightOptions[currentCopyright].showSource) {
            $source.parents('.form-group').slideDown();
            if (copyrightOptions[currentCopyright].sourceRequired) {
                $source.parents('.form-group').addClass('has-warning required');
            } else {
                $source.parents('.form-group').removeClass('required');
            }
        } else {
            $source.parents('.form-group').slideUp();
        }
    } else {
        $photographer.parents('.form-group').slideUp();
        $source.parents('.form-group').slideUp();
        credit = '';
    }
    renderCanvas();
};

$(onDocumentLoad);


function isUrlValid(userInput) {
    var res = userInput.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    if(res == null)
        return false;
    else
        return true;
}

$('#urlsubmit').click(function() {
  var story = $('input[name="link"]').val();

  if (isUrlValid(story)) {
    console.log("good url");
    $.get('/stories?' + $.param({url: story}), function(response) {
      console.log("request sent");
      console.log(response);
    });
  } else {
    console.log("that's not a url");
  }
});
