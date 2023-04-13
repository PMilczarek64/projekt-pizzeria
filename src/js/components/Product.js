import {select, classNames, templates} from '../settings.js';
import {utils} from '../utils.js';
import AmountWidget from './AmountWidget.js';

export class Product {
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

    //app.cart.add(thisProduct.prepareCartProduct());

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct.prepareCartProduct(),
      },
    });

    thisProduct.element.dispatchEvent(event);
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

export default Product;
