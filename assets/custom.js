// https://stackoverflow.com/questions/9899372/pure-javascript-equivalent-of-jquerys-ready-how-to-call-a-function-when-t
function documentReady(fn) {
  // see if DOM is already available
  if (document.readyState === "complete" || document.readyState === "interactive") {
      // call on next available tick
      setTimeout(fn, 1);
  } else {
      document.addEventListener("DOMContentLoaded", fn);
  }
}

var settings = {
  mobile: 768,
  tablet: 1024
};

var device = {
  isMobile: screen.width <= settings.mobile
};

function getQueryStringParameters() {
  var parameters = {}, hash;
  var q = document.URL.split('?')[1];
  if(q != undefined) {
    q = q.split('&');
    for(var i = 0; i < q.length; i++) {
      hash = q[i].split('=');
      parameters[hash[0]] = hash[1];
    }
  }
  return parameters;
}

documentReady(function() {
  try {
    var params = getQueryStringParameters();
    if (params.variant) {
      var variantId = params.variant;
      if (!variantInfo[variantId].availability) {
        var input = document.querySelector('input[data-variant-id="' + variantId + '"]');
        if (input != null) {
          input.checked = true;
        }
      }
    }
  } catch(err) {
    console.log('There is a problem with selecting a sold out variant on page load:');
    console.log(err);
  }

  // product variant changed
  try {
    document.addEventListener('variant:change', function(evt) {
      var variant = evt.detail.variant;
      var productTitleElem = document.querySelector('.product-single__title');
      var productTitle = variant.name.split(' - ')[0];
      var packInfo = variant.title == 'Variety' ? '6-Pack' : '4-Pack';
      
      productTitleElem.innerHTML = productTitle + '<br> ' + variant.title + ' • ' + packInfo;
      document.querySelector('[data-mf-main]').innerText = variantMetaData[variant.id].info_heading;
      document.querySelector('[data-mf-info]').innerText = variantMetaData[variant.id].info_text;
      document.querySelector('[data-product-description]').innerText = variantMetaData[variant.id].desc;
      document.querySelector('[data-product-ingredients]').innerText = variantMetaData[variant.id].ingredients;
    });
  } catch(err) {
    console.log("There is an error with the product variant change:");
    console.log(err);
  }
  // mobile menu trigger
  try {
    var mobileNavTrigger = document.querySelector('.mobile-nav-trigger');
    var menuDrawer = document.querySelector('.menu-drawer');
    var closeDrawerBtn = document.querySelector('.menu-drawer .drawer__close-button');
    if (mobileNavTrigger != null && menuDrawer != null && closeDrawerBtn != null) {
      mobileNavTrigger.addEventListener('click', function() {
        toggleMenuDrawer(menuDrawer);
      });
      closeDrawerBtn.addEventListener('click', function() {
        toggleMenuDrawer(menuDrawer);
      });
    }
  } catch(err) {
    console.log("There is an error with the mobile menu trigger system:");
    console.log(err);
  }

  // product item add to cart button
  try {
    var atcButtons;
    if (device.isMobile) {
      atcButtons = Array.from(document.querySelectorAll('button.grid-product__atc-mobile'));
    } else {
      atcButtons = Array.from(document.querySelectorAll('.grid-product__atc .btn:not(.sold--out)'));
    }
    if (atcButtons.length) {
      for (var x = 0; x < atcButtons.length; x++) {
        atcButtons[x].addEventListener('click', atcButtonEvent);
      }
    }
  } catch(err) {
    console.log("There is an error with the add to cart button for product items:");
    console.log(err);
  }

  // custom slick slider
  try {
    if (device.isMobile) {
      $('.custom-slick').slick({
        dots: true,
        arrows: false,
        infinite: false,
        variableWidth: true,
        centerPadding: '20px'
      });
    }
  } catch(err) {
    console.log("There is an error with the custom slick slider(s):");
    console.log(err);
  }

  // quantity selector buttons
  try {
    var quantityBtns = Array.from(document.querySelectorAll('.quantity-edit'));
    if (quantityBtns.length) {
      for (var x = 0; x < quantityBtns.length; x++) {
        quantityBtns[x].addEventListener('click', quantityButtonEvent);
      }
    }
  } catch(err) {
    console.log("There is an error with the quantity selector buttons:");
    console.log(err);
  }
});

function toggleMenuDrawer(drawer) {
  if (!drawer.classList.contains('menu--open')) {
    drawer.style.display = 'block';
    setTimeout(function() {
      drawer.classList.add('menu--open');
      document.body.classList.add('js-drawer-open');
    }, 100);
  } else {
    drawer.classList.remove('menu--open');
    document.body.classList.remove('js-drawer-open');
    setTimeout(function() {
      drawer.style.display = 'none';
    }, 250);
  }
}

function quantityButtonEvent(event) {
  var button = event.target;
  var inputId = button.dataset.controls;
  var input = document.getElementById(inputId);

  if (button.classList.contains('add-btn')) {
    input.value = Number(input.value) + 1;
  } else {
    if (Number(input.value) - 1 > 0) {
      input.value = Number(input.value) - 1;
    }
  }
}

function atcButtonEvent(event) {
  event.preventDefault();
  event.stopPropagation();
  var button = event.target;
  
  // 'tada' animation
  button.classList.add('animate__tada');
  setTimeout(function() {
    button.classList.remove('animate__tada');
  }, 1000);

  var productId = button.dataset.atcProductId;
  var variantId = button.dataset.atcVariantId;

  if (!device.isMobile) {
    button.classList.add('btn--loading');
  }

  $.ajax({
    data: "form_type=product&utf8=%E2%9C%93&data-product-id=" + productId + "&id=" + variantId,
    dataType: 'json',
    type: 'POST',
    url: theme.routes.cartAdd
  })
  .then(function(cart) {
    $('body').trigger('updateCart', cart);
  })
  .always(function() {
    if (!device.isMobile) {
      button.classList.remove('btn--loading');
    }
  });
}