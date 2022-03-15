/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };
  
  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };
  
  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
  };
  
  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
  };
  
  class Product {
    constructor(id, data){
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
    }
    renderInMenu(){
      const thisProduct = this;
      // Generate a HTML code based on template
      const generatedHTML = templates.menuProduct(thisProduct.data);
      // Create element using utils.createElementFromHTML 
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      // Find a MENU container in the website.
      const menuContainer = document.querySelector(select.containerOf.menu);
      // add created DOM element to MENU container.
      menuContainer.appendChild(thisProduct.element);
    }
    getElements(){
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }

    initAccordion(){
      const thisProduct = this;
  
      /* find the clickable trigger (the element that should react to clicking) */

      //const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      //console.log('clicableTrigger: ',clickableTrigger);

      /* START: add event listener to clickable trigger on event click */

      // clickableTrigger.addEventListener('click', function(event) {

      thisProduct.accordionTrigger.addEventListener('click', function(event) {

        /* prevent default action for event */

        event.preventDefault();
  
        /* find active product (product that has active class) */

        const activeProducts = document.querySelectorAll(select.all.menuProductsActive);
  
        /* if there is active product and it's not thisProduct.element, remove class active from it */

        for(let activeProduct of activeProducts) {
          // console.log('activeProduct: ', activeProduct);
          if(activeProduct != thisProduct.element) {
            activeProduct.classList.remove('active');
          }
        } 
        /* toggle active class on thisProduct.element */

        thisProduct.element.classList.toggle('active');
      });
  
    }

    initOrderForm() {
      const thisProduct = this;
      // console.log('iOF: ', thisProduct);

      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
      
      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }
      
      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }
    processOrder() {
      const thisProduct = this;
      // console.log('pO: ', thisProduct);
      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
      //console.log('formData: ', formData);

      //set price to default price
      let price = thisProduct.data.price;

      //for every category (param)...
      for(let paramId in thisProduct.data.params){

        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        // console.log('paramId, param: ',paramId, param);

        // for every option in this category
        for(let optionId in param.options) {

          // Find image
          const image = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);
          //  console.log('iamge: ', image);

          // determine option value, e.g. optionId = 'olives', option = {label: 'Olives', price: 2, default: true}
          const option = param.options[optionId];
          //  console.log('optionId, option: ',optionId, option);

          const selected = formData.hasOwnProperty(paramId) && formData[paramId].includes(optionId);
          const defaultOption = (option.default == true) ;
          //
          if(selected) {
            //If option is checked add active class for img
            if(image !== null) {
              //   console.log(image.classList);
              image.classList.add(classNames.menuProduct.imageVisible);
            }
            // if option isn't default option and is checked add option price to the sum
            if(!defaultOption) {
              price = price + option.price;
            }
          //If option is not checked remove active class from img
          } else {
            if(image !== null) {
              image.classList.remove(classNames.menuProduct.imageVisible);
            }
            //If option is default and is not checked - decrease product price
            if (defaultOption) {
              price = price - option.price;
            }
          }
        }
      }
      thisProduct.priceSingle = price;

      thisProduct.priceMulti = price * thisProduct.amountWidget.value;

      price *= thisProduct.amountWidget.value;

      // update calculated price in the HTML
      thisProduct.priceElem.innerHTML = price;

      //console.log('price: ',price);
    }
    initAmountWidget(){
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

      thisProduct.amountWidgetElem.addEventListener('updated', function(){
        thisProduct.processOrder();
      });
    }
    addToCart(){
      const thisProduct = this;
  
      app.cart.add(thisProduct.prepareCartProduct());
    }
    prepareCartProduct(){
      const thisProduct = this;

      const productSummary = {
        id: thisProduct.id,
        name: thisProduct.data.name,
        amount: thisProduct.amountWidget.value,
        priceSingle: thisProduct.priceSingle,
        price: thisProduct.priceMulti,
        params: thisProduct.prepareCartProductParams(),
      };
      //console.log('pSum: ',productSummary);
      return productSummary;
    }
    prepareCartProductParams(){
      const thisProduct = this;
      // console.log('pO: ', thisProduct);
      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
      //console.log('formData: ', formData);

      const params = {};

      //for every category (param)...
      for(let paramId in thisProduct.data.params){

        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        // console.log('paramId, param: ',paramId, param);

        //create category param in params const eg. params = { ingredients: { name: 'Ingredients', options: {}}}

        params[paramId] = {
          label: param.label,
          options: {}
        };

        // for every option in this category
        for(let optionId in param.options) {

          // determine option value, e.g. optionId = 'olives', option = {label: 'Olives', price: 2, default: true}
          const option = param.options[optionId];
          //  console.log('optionId, option: ',optionId, option);

          const selected = formData.hasOwnProperty(paramId) && formData[paramId].includes(optionId);

          if(selected) {
            //If option is checked add params to object
            params[paramId].options[optionId] = option.label;
          }
        }
      }
      //console.log('params: ', params);
      return params;
    }
  }
  class AmountWidget {
    constructor(element){
      const thisWidget = this;

      thisWidget.getElements(element);

      thisWidget.setValue(settings.amountWidget.defaultValue);

      thisWidget.initActions();

      //console.log('AmountWidget ', thisWidget);
      //console.log('constructor arguments: ', element);
    }
    getElements(element){
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }
    setValue(value){
      const thisWidget = this;

      const newValue = parseInt(value);

      // TO DO: Add validation
      //console.log('not null? ',isNaN(newValue));
      if(thisWidget.value !== newValue && !isNaN(newValue) && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax){
        thisWidget.value = newValue;
      }
      thisWidget.input.value = thisWidget.value;
      thisWidget.announce();
    }
    initActions(){
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function(){

        thisWidget.setValue(thisWidget.input.value);
      });
      thisWidget.linkDecrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });
      thisWidget.linkIncrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });     
    }
    announce(){
      const thisWidget = this;

      const event = new CustomEvent('updated', {
        bubbles: true
      });
      thisWidget.element.dispatchEvent(event);
    }
  }

  class Cart{
    constructor(element){
      const thisCart = this;

      thisCart.products = [];

      thisCart.deliveryFee = settings.cart.defaultDeliveryFee;

      thisCart.getElements(element);

      thisCart.initActions();

      //console.log('new Cart', thisCart);
    }

    getElements(element){
      const thisCart = this;
      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
      thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
      thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
      thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
      thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
      //console.log(thisCart.dom.toggleTrigger);
    }
    initActions(){
      const thisCart = this;
      thisCart.dom.toggleTrigger.addEventListener('click', function(event){
        event.preventDefault();
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
        thisCart.dom.productList.addEventListener('updated', function(){
          thisCart.update();
        });
      });
    }
    add(menuProduct){
      const thisCart = this;
      //generate HTML code based on template
      const generatedHTML = templates.cartProduct(menuProduct);
      //create element using utild.createElementFromHTML
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);
      // add created DOM element to productList
      thisCart.dom.productList.appendChild(generatedDOM);
      //console.log('adding product', menuProduct);
      //push products from cart to products []
      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
      //console.log('thisCart.products: ', thisCart.products);
      thisCart.update();
    }
    update(){
      const thisCart = this;

      thisCart.totalNumber = 0;
      thisCart.subtotalPrice = 0;

      for(let product of thisCart.products) {
        thisCart.totalNumber += product.amount;
        thisCart.subtotalPrice += product.price;
      }
      if (thisCart.totalNumber > 0){
        thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
      } else {
        thisCart.totalPrice = thisCart.subtotalPrice;
      }
      thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
      thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
      thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
      for(let price of thisCart.dom.totalPrice){
        price.innerHTML = thisCart.totalPrice;
      }
      console.log('amount: ',thisCart.totalNumber,'Cost of products: ', thisCart.subtotalPrice,'Cost with a delivery', thisCart.totalPrice);
    }
  }

  class CartProduct {
    constructor(menuProduct, element){
      const thisCartProduct = this;
      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.params = menuProduct.params;

      thisCartProduct.getElements(element);
      //console.log('new CartProduct: ', thisCartProduct);
      thisCartProduct.initAmountWidget();
    }

    getElements(element){
      const thisCartProduct = this;
      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);

    }

    initAmountWidget(){
      const thisCartProduct = this;

      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);

      thisCartProduct.dom.amountWidget.addEventListener('updated', function() {
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price; 
      });

    }

  }

  const app = {
    initMenu: function(){
      const thisApp = this;

      // console.log('thisApp.data: ', thisApp.data);
      
      for(let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function(){
      const thisApp = this;

      thisApp.data = dataSource;
    },
    initCart: function(){
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },
    init: function(){
      const thisApp = this;
      // console.log('*** App starting ***');
      // console.log('thisApp:', thisApp);
      // console.log('classNames:', classNames);
      // console.log('settings:', settings);
      // console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
      app.initCart();
    },
  };
  app.init();
}

