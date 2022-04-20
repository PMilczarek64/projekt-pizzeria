import {settings, select} from '../settings.js';
import BaseWidget from './BaseWidgets.js';
class AmountWidget extends BaseWidget {
  constructor(element, value = settings.amountWidget.defaultValue){
    super(element, settings.amountWidget.defaultValue);
    const thisWidget = this;

    thisWidget.getElements(element);
    thisWidget.value = value;
    thisWidget.initActions();

    //console.log('AmountWidget ', thisWidget);
    //console.log('constructor arguments: ', element);
  }
  getElements(){
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }
  /*isvalid(value){
    return !isNaN(value)
    && value >= settings.amountWidget.defaultMin 
    && value <= settings.amountWidget.defaultMax;
  }*/
  maxAmount(value){  
    return value <= settings.amountWidget.defaultMax;
  }
  minAmount(value){
    return value >= settings.amountWidget.defaultMin;
  }
  renderValue(){
    const thisWidget = this;

    thisWidget.dom.input.value = thisWidget.value;    
  }
  initActions(){
    const thisWidget = this;

    thisWidget.dom.input.addEventListener('change', function(){

      thisWidget.setValue(thisWidget.dom.input.value);
    });
    thisWidget.dom.linkDecrease.addEventListener('click', function(event){
      event.preventDefault();   
      if(thisWidget.minAmount(thisWidget.dom.input.value)){
        thisWidget.setValue(thisWidget.value - 1);
      }
    });
    thisWidget.dom.linkIncrease.addEventListener('click', function(event){
      event.preventDefault();
      if(thisWidget.maxAmount(thisWidget.dom.input.value)){
        thisWidget.setValue(thisWidget.value + 1);
      }
    });     
  }
}

export default AmountWidget;