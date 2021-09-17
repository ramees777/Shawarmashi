odoo.define('pos_discount_limit.discount_limit', function(require) {
    'use strict';
    
    var field_utils = require('web.field_utils');
    const PosComponent = require('point_of_sale.PosComponent');
    var models = require('point_of_sale.models');
    const Registries = require('point_of_sale.Registries');
    const NumberBuffer = require('point_of_sale.NumberBuffer');
    const ProductScreen = require('point_of_sale.ProductScreen');
    const { Gui } = require('point_of_sale.Gui');
    const { _t } = require('web.core');
    
    models.load_fields("product.product", ["qty_available", "type", "stock_quant_ids"]);
    
    
    models.load_models({
        model: 'discount.categories',
        fields: ['discount_limit', 'category_id'],
    
        domain: function(self){ return [['id','=',self.config.available_categ_ids]]; },
        loaded: function(self,limits){
            self.limits = limits;
            var limit=   self.limits
            
            console.log("retrieval sucess",limit) 
    
        },    
    });
    
    models.load_models({
        model:  'pos.category',
        fields: ['id', 'name', 'parent_id', 'child_id', 'write_date'],
        domain: function(self) {
            return [['id','=',self.config.excluded_categ_id]];
        },
        loaded: function(self, categories){
            self.categories = categories;
            console.log("retrieval sucess product category",categories) 
    
        },  
        
    });     
   
   
    
    
    
    const ProductDiscount = (ProductScreen) =>
    class extends ProductScreen {
        _setValue(val) {
            console.log("pos SCreen function worked")    
            var parsed_discount = isNaN(parseFloat(val)) ? 0 : field_utils.parse.float('' + val);
            var disc = Math.min(Math.max(parsed_discount || 0, 0),100);    
            var available_categories =this.currentOrder.get_selected_orderline().product.pos_categ_id[0]
            var disc_available_categories = this.env.pos.limits
            var restricted_categories=this.env.pos.config.excluded_categ_id
            var restricte_cat_load=this.env.pos.categories
            
            console.log("discount restricted categories test",restricted_categories)
            console.log("discount entered",disc)
            console.log("Current Order",available_categories)
            console.log("discount categories",disc_available_categories)      
          
    
            if (this.currentOrder.get_selected_orderline()) {
                if (this.state.numpadMode === 'quantity') {
                    this.currentOrder.get_selected_orderline().set_quantity(val);
                } else if (this.state.numpadMode === 'discount') {
    
                    for(var i=0;i<restricte_cat_load.length;i++)
                    {
                        console.log("discount restricted categories loop",restricte_cat_load[i].id)  
                        if(restricte_cat_load[i].id == available_categories)
                        {
                            console.log("discount restricted category matched")
                            Gui.showPopup('ErrorPopup', {
                                title : _t("Discount Not Allowed"),
                                body  : _t("Discount not allowed for this category"),
                            });
                            return;                   
                        }  
    
                    }
                    for(var i=0;i<disc_available_categories.length;i++){
                        console.log("loop elements",disc_available_categories[i].category_id[0])
                        if(disc_available_categories[i].category_id[0] == available_categories)
                        {
                            console.log("catgories matched")
                            var disc_limit = disc_available_categories[i].discount_limit;
                            console.log("dicount limit of category",disc_limit)
                            if (disc_limit){
                                if (disc > disc_limit){                                   
                                    Gui.showPopup('ErrorPopup', {
                                        title : _t("Discount limit exceeded"),
                                        body  : _t("The maximum discount is " + disc_limit),
                                    });
                                    this.currentOrder.get_selected_orderline().set_discount(0);
                                    return;
                                 }
                            }
                        }
                        else
                        {
                            this.currentOrder.get_selected_orderline().set_discount(val);                         
                        }
    
                    }   
                     this.currentOrder.get_selected_orderline().set_discount(val);                      
    
                    
                } else if (this.state.numpadMode === 'price') {
                    var selected_orderline = this.currentOrder.get_selected_orderline();
                    selected_orderline.price_manually_set = true;
                    selected_orderline.set_unit_price(val);
                }
                if (this.env.pos.config.iface_customer_facing_display) {
                    this.env.pos.send_current_order_to_customer_facing_display();
                }
            }
        }
       
    };
    
    Registries.Component.extend(ProductScreen, ProductDiscount);
    
    return ProductScreen;   
    
    
    });