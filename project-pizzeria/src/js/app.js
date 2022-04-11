import { settings, select, classNames, } from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';
const app = {
  initPages: function () {
    const thisApp = this;
    thisApp.pages = document.querySelector(select.containerOf.pages).children;

    thisApp.navLinks = document.querySelectorAll(select.nav.links);

    const idFromHash = window.location.hash.replace('#/', '');

    let pageMatchingHash = thisApp.pages[0].id;

    for (let page of thisApp.pages) {
      if (page.id == idFromHash) {
        pageMatchingHash = page.id;
        break;
      }
    }

    thisApp.activatePage(pageMatchingHash);

    for (let link of thisApp.navLinks) {
      link.addEventListener('click', function (event) {
        const clickedElement = this;
        event.preventDefault();

        // get page id from href attribute
        const id = clickedElement.getAttribute('href').replace('#', '');
        //console.log(id);

        // run thisApp.activatePage with that id
        thisApp.activatePage(id);

        // change URL hash
        window.location.hash = '#/' + id;
      });
    }
    const clickForward = document.querySelectorAll('.image-button');

    for (let button of clickForward) {
      button.addEventListener('click', function () {
        //console.log('click click', button.id);
        for (let page of thisApp.pages) {
          //console.log(page);
          if(page.classList.contains('active')){
            //console.log('includes active');
            page.classList.remove('active');
          }
          if(page.id == button.id){
            //console.log('it has the same id');
            page.classList.add('active');
            thisApp.activatePage(page.id);
          }
        }
      });
    }
  },
  activatePage: function (pageId) {
    const thisApp = this;

    //add class 'active' to matching pages, remove from non-matching
    for (let page of thisApp.pages) {
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }
    //add class 'active' to matching links, remove from non-matching
    for (let link of thisApp.navLinks) {
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + pageId
      );
    }
  },
  initMenu: function () {
    const thisApp = this;

    // console.log('thisApp.data: ', thisApp.data);

    for (let productData in thisApp.data.products) {
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },
  initBooking: function () {
    const thisApp = this;
    const bookingWrapper = document.querySelector(select.containerOf.booking);
    thisApp.booking = new Booking(bookingWrapper);
  },
  initData: function () {
    const thisApp = this;

    thisApp.data = {};

    const url = settings.db.url + '/' + settings.db.products;

    fetch(url)
      .then(rawResponse => rawResponse.json())
      .then(parsedResponse => {
        console.log('parsedResponse', parsedResponse);

        //save parsedResponse as thisApp.data.products
        thisApp.data.products = parsedResponse;
        //execute initMenu method
        thisApp.initMenu();
      });

    console.log('thisApp.data', JSON.stringify(thisApp.data));
  },
  initCart: function () {
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', (event) => {
      app.cart.add(event.detail.product);
    });
  },
  init: function () {
    const thisApp = this;
    // console.log('*** App starting ***');
    // console.log('thisApp:', thisApp);
    // console.log('classNames:', classNames);
    // console.log('settings:', settings);
    // console.log('templates:', templates);


    thisApp.initPages();
    thisApp.initData();
    app.initCart();
    app.initBooking();
  },
};
app.init();

var slider = tns({
  container: '.my-slider',
  items: 1,
  controls: false,
  navPosition: 'bottom',
  autoplay: true,
  autoplayButtonOutput: false,
  responsive: {
    640: {
      mouseDrag: true,
    }
  }
});
